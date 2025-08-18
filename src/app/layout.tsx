import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
 title: "Trench Crusade Combat Tracker",
  description: "Mobile-friendly combat tracker for Trench Crusade tabletop battles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 <html lang="en" className="dark">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
