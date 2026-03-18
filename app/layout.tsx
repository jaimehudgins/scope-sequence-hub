import type { Metadata } from "next";
import "./globals.css";
import { CalendarProvider } from "@/hooks/useCalendarContext";

export const metadata: Metadata = {
  title: "Willow – Scope & Sequence Calendar",
  description: "Scope & Sequence Calendar for Willow Education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CalendarProvider>{children}</CalendarProvider>
      </body>
    </html>
  );
}
