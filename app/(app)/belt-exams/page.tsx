import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import { BottomTabs } from "@/components/BottomTabs";

export default async function BeltExamsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: exams } = await supabase
    .from("belt_exam_windows")
    .select("id, name, belt_level, start_date, end_date, min_attendance_percent")
    .order("start_date", { ascending: false });

  const { data: summaries } = await supabase
    .from("student_attendance_summary")
    .select(
      "student_id, first_name, last_name, current_belt, attendance_percent"
    );

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Belt Exams</h1>
      </header>
      <main className="page-content space-y-3">
        {!exams?.length && (
          <p className="text-sm text-slate-400">
            No belt exam windows configured yet. Create them in Supabase.
          </p>
        )}
        {exams?.map((exam) => {
          const eligible =
            summaries?.filter(
              (s) =>
                s.current_belt === exam.belt_level &&
                (s.attendance_percent ?? 0) >= exam.min_attendance_percent
            ) ?? [];

          return (
            <section key={exam.id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{exam.name}</p>
                  <p className="text-xs text-slate-400">
                    {exam.belt_level} • {exam.start_date} – {exam.end_date}
                  </p>
                </div>
                <span className="chip">
                  {eligible.length} eligible
                </span>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {eligible.map((s) => (
                  <p key={s.student_id} className="text-xs">
                    {s.first_name} {s.last_name ?? ""} –{" "}
                    {s.attendance_percent}% attendance
                  </p>
                ))}
                {!eligible.length && (
                  <p className="text-xs text-slate-500">
                    No students currently meet the{" "}
                    {exam.min_attendance_percent}% requirement.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </main>
      <BottomTabs />
    </>
  );
}

