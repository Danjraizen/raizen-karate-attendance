"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/batches", label: "Batches" },
  { href: "/students", label: "Students" },
  { href: "/belt-exams", label: "Exams" }
];

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="bottom-tabs">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-tab ${active ? "bottom-tab-active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

