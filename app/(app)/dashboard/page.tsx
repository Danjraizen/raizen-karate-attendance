import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import { BottomTabs } from "@/components/BottomTabs";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ count: studentCount }, { count: batchCount }] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("batches")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
  ]);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Raizen Dashboard</h1>
      </header>
      <main className="page-content space-y-3">
        <section className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-slate-400">Active students</p>
            <p className="mt-1 text-2xl font-semibold">
              {studentCount ?? 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Active batches</p>
            <p className="mt-1 text-2xl font-semibold">
              {batchCount ?? 0}
            </p>
          </div>
        </section>
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <p className="text-xs text-slate-400">
            Use the tabs below to mark attendance, manage students, or check
            belt exam eligibility.
          </p>
        </section>
      </main>
      <BottomTabs />
    </>
  );
}

