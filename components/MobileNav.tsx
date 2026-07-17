"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "./Sidebar";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-40 flex h-10 w-10 flex-col items-center justify-center gap-1 rounded border border-line bg-panel"
      >
        <span className="h-0.5 w-5 bg-paper" />
        <span className="h-0.5 w-5 bg-paper" />
        <span className="h-0.5 w-5 bg-paper" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop — tap outside the panel to close */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="flex w-64 flex-col justify-between bg-ink px-6 py-8">
            <div>
              <div className="mb-10 flex items-start justify-between">
                <div>
                  <p className="font-display text-xl italic tracking-tight text-paper">
                    Logbook
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    daily record
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-muted"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded px-2 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-paper"
                  >
                    <span className="font-mono text-[11px] text-muted group-hover:text-amber">
                      {l.mark}
                    </span>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-muted/70">
              Entries persist to your
              <br />
              Neon Postgres database.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
