"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function NewStudentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [belt, setBelt] = useState("White");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: instructor } = await supabase
      .from("instructors")
      .select("primary_dojo_id")
      .maybeSingle();

    if (!instructor) {
      setError("No instructor record found for this user.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("students").insert({
      first_name: firstName,
      last_name: lastName || null,
      dojo_id: instructor.primary_dojo_id,
      current_belt: belt,
      status
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.replace("/students");
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">New Student</h1>
      </header>
      <main className="page-content space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="first_name">
              First name
            </label>
            <input
              id="first_name"
              className="input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="last_name">
              Last name
            </label>
            <input
              id="last_name"
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="belt">
              Current belt
            </label>
            <select
              id="belt"
              className="input"
              value={belt}
              onChange={(e) => setBelt(e.target.value)}
            >
              <option>White</option>
              <option>Yellow</option>
              <option>Orange</option>
              <option>Green</option>
              <option>Blue</option>
              <option>Brown</option>
              <option>Black</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="left">Left</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="primary-button w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </main>
    </>
  );
}

