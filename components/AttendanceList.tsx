"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceStudent {
  id: string;
  first_name: string;
  last_name: string | null;
  status?: AttendanceStatus;
}

interface Props {
  batchId: string;
  date: string;
  initialStudents: AttendanceStudent[];
  initialRecords: { student_id: string; status: AttendanceStatus }[];
}

export function AttendanceList({
  batchId,
  date,
  initialStudents,
  initialRecords
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [students, setStudents] = useState<AttendanceStudent[]>(
    initialStudents.map((s) => {
      const existing = initialRecords.find((r) => r.student_id === s.id);
      return { ...s, status: existing?.status ?? "present" };
    })
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { data: instructor, error: instructorError } = await supabase
      .from("instructors")
      .select("id")
      .maybeSingle();

    if (instructorError || !instructor) {
      setSaving(false);
      setMessage(
        instructorError?.message ??
          "No instructor record found for this user."
      );
      return;
    }

    const payload = students.map((s) => ({
      student_id: s.id,
      batch_id: batchId,
      date,
      status: s.status ?? "present",
      marked_by_instructor_id: instructor.id
    }));

    const { error } = await supabase
      .from("attendance_records")
      .upsert(payload, { onConflict: "student_id,batch_id,date" });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Attendance saved.");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {students.length} students • {date}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            className="chip"
            onClick={() => markAll("present")}
          >
            All present
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => markAll("absent")}
          >
            All absent
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {students.map((s) => (
          <div
            key={s.id}
            className="card flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium">
                {s.first_name} {s.last_name ?? ""}
              </p>
            </div>
            <div className="flex gap-1">
              {(["present", "absent", "excused"] as AttendanceStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(s.id, st)}
                    className={`px-2 py-1 rounded text-xs ${
                      s.status === st
                        ? st === "present"
                          ? "bg-emerald-500 text-white"
                          : st === "absent"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-slate-900"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {st[0].toUpperCase() + st.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {message && <p className="text-xs text-emerald-400">{message}</p>}
      <button
        type="button"
        className="primary-button w-full"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save attendance"}
      </button>
    </div>
  );
}

