import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Raizen Karate Attendance",
  description: "Attendance and student management for Raizen Karate Academy"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Ensure Supabase client initialization on the server at least once
  void createServerClient(cookies());

  return (
    <html lang="en">
      <body className="page">{children}</body>
    </html>
  );
}

