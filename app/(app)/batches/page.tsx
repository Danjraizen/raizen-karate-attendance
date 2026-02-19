import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { BottomTabs } from "@/components/BottomTabs";

export default async function BatchesPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .maybeSingle();

  const { data: batchLinks } = await supabase
    .from("batch_instructors")
    .select("batch_id")
    .eq("instructor_id", instructor?.id ?? "")
    .order("created_at", { ascending: true });

  const batchIds = batchLinks?.map((bl) => bl.batch_id) ?? [];

  const { data: batchesData } = await supabase
    .from("batches")
    .select("id, name, days_of_week, start_time, end_time")
    .in("id", batchIds)
    .eq("is_active", true)
    .order("name");

  const batches =
    batchesData?.map((b) => ({
      id: b.id,
      name: b.name,
      days_of_week: b.days_of_week,
      start_time: b.start_time,
      end_time: b.end_time
    })) ?? [];

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">My Batches</h1>
      </header>
      <main className="page-content space-y-3">
        {(!batches || batches.length === 0) && (
          <p className="text-sm text-slate-400">
            No assigned batches found for your instructor account.
          </p>
        )}
        <div className="space-y-2">
          {batches?.map((batch) => (
            <Link
              key={batch.id}
              href={`/batches/${batch.id}/attendance`}
              className="card flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">{batch.name}</p>
                <p className="text-xs text-slate-400">
                  {batch.days_of_week} • {batch.start_time}–{batch.end_time}
                </p>
              </div>
              <span className="chip">Mark attendance</span>
            </Link>
          ))}
        </div>
      </main>
      <BottomTabs />
    </>
  );
}

