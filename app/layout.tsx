import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Learning — SWE + ML",
  description: "15-min daily quiz + reads with spaced repetition. Self-hosted, no API keys.",
  manifest: "/manifest.webmanifest",
};

const NAV = [
  ["Today", "/"],
  ["Session", "/session"],
  ["Reads", "/reads"],
  ["Bank", "/bank"],
  ["Stats", "/stats"],
  ["Settings", "/settings"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-4xl gap-4 px-4 py-3 text-sm font-medium">
            {NAV.map(([label, href]) => (
              <Link key={href + label} href={href} className="hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
