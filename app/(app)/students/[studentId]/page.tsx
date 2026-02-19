import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import { BottomTabs } from "@/components/BottomTabs";

interface Props {
  params: { studentId: string };
}

export default async function StudentDetailPage({ params }: Props) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, first_name, last_name, status, current_belt, join_date, left_date, notes"
    )
    .eq("id", params.studentId)
    .maybeSingle();

  if (!student) {
    redirect("/students");
  }

  const { data: enrollment } = await supabase
    .from("batch_enrollments")
    .select("batch_id")
    .eq("student_id", student.id)
    .is("end_date", null)
    .maybeSingle();

  const { data: batch } = enrollment?.batch_id
    ? await supabase
        .from("batches")
        .select("name")
        .eq("id", enrollment.batch_id)
        .maybeSingle()
    : { data: null };

  const { data: attendanceSummary } = await supabase
    .from("student_attendance_summary")
    .select("sessions_present, sessions_total, attendance_percent")
    .eq("student_id", student.id)
    .maybeSingle();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">
          {student.first_name} {student.last_name ?? ""}
        </h1>
      </header>
      <main className="page-content space-y-3">
        <section className="card space-y-1">
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-sm font-medium">{student.status}</p>
          <p className="text-xs text-slate-400 mt-2">Belt</p>
          <p className="text-sm font-medium">{student.current_belt}</p>
          <p className="text-xs text-slate-400 mt-2">Current batch</p>
          <p className="text-sm font-medium">
            {batch?.name ?? "Not assigned"}
          </p>
          <p className="text-xs text-slate-400 mt-2">Joined</p>
          <p className="text-sm font-medium">
            {student.join_date ?? "Unknown"}
          </p>
          {student.left_date && (
            <>
              <p className="text-xs text-slate-400 mt-2">Left dojo</p>
              <p className="text-sm font-medium">{student.left_date}</p>
            </>
          )}
        </section>
        <section className="card space-y-1">
          <p className="text-xs text-slate-400">Attendance summary</p>
          <p className="text-sm font-medium">
            {attendanceSummary
              ? `${attendanceSummary.attendance_percent}% (${attendanceSummary.sessions_present}/${attendanceSummary.sessions_total})`
              : "No attendance yet"}
          </p>
        </section>
        {student.notes && (
          <section className="card space-y-1">
            <p className="text-xs text-slate-400">Notes</p>
            <p className="text-sm">{student.notes}</p>
          </section>
        )}
      </main>
      <BottomTabs />
    </>
  );
}

