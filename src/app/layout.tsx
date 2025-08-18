import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trench Crusade Combat Tracker",
  description: "Mobile-friendly combat tracker for Trench Crusade tabletop battles",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: "width=device-width, initial-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TC Tracker"
  }
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
