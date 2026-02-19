import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import { BottomTabs } from "@/components/BottomTabs";
import { AttendanceList } from "@/components/AttendanceList";

interface Props {
  params: { batchId: string };
  searchParams: { date?: string };
}

export default async function BatchAttendancePage({
  params,
  searchParams
}: Props) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const date =
    searchParams.date ?? new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const { data: batch } = await supabase
    .from("batches")
    .select("id, name")
    .eq("id", params.batchId)
    .maybeSingle();

  if (!batch) {
    redirect("/batches");
  }

  const { data: students } = await supabase
    .from("batch_enrollments")
    .select("student:students(id, first_name, last_name)")
    .eq("batch_id", batch.id)
    .is("end_date", null);

  const { data: records } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .eq("batch_id", batch.id)
    .eq("date", date);

  const normalizedStudents =
    students?.map((row) => ({
      id: row.student.id,
      first_name: row.student.first_name,
      last_name: row.student.last_name
    })) ?? [];

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{batch.name}</h1>
      </header>
      <main className="page-content space-y-3">
        <AttendanceList
          batchId={batch.id}
          date={date}
          initialStudents={normalizedStudents}
          initialRecords={records ?? []}
        />
      </main>
      <BottomTabs />
    </>
  );
}

