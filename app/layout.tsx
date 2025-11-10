import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Matrix & AI Blueprint Organizer",
  description: "Eisenhower Matrix Task Tracker and AI Model Blueprint Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
