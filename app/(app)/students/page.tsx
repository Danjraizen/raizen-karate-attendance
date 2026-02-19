import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { BottomTabs } from "@/components/BottomTabs";

export default async function StudentsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, status, current_belt, join_date, left_date")
    .order("first_name");

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Students</h1>
        <Link href="/students/new" className="primary-button text-xs px-3 py-1">
          Add
        </Link>
      </header>
      <main className="page-content space-y-3">
        {!students?.length && (
          <p className="text-sm text-slate-400">
            No students yet. Tap “Add” to create the first student.
          </p>
        )}
        <div className="space-y-2">
          {students?.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="card flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {s.first_name} {s.last_name ?? ""}
                </p>
                <p className="text-xs text-slate-400">
                  {s.current_belt} • {s.status}
                </p>
              </div>
              {s.left_date && (
                <span className="chip text-red-300 border-red-500">Left</span>
              )}
            </Link>
          ))}
        </div>
      </main>
      <BottomTabs />
    </>
  );
}

