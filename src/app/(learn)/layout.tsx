"use client";

import Sidebar from "@/components/Sidebar";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row min-h-[calc(100vh-2rem)] gap-6 py-6">
      {/* Sidebar — hidden on mobile, shown from md breakpoint */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-6">
          <Sidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
