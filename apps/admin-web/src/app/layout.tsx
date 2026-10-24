import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { AdminLanguageProvider } from "@/hooks/useAdminLanguage";
import AdminNavbar from "@/components/AdminNavbar";

export const metadata: Metadata = {
  title: "CivicPulse Admin — Zonal Magistrate & Municipal Control Console",
  description: "Official municipal governance, sector issue load-balancing, and resolution transparency broadcasting platform for Dehradun magistrates.",
  icons: {
    icon: "/ashok-stambh.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminLanguageProvider>
          <AdminAuthProvider>
            <AdminNavbar />
            {children}
          </AdminAuthProvider>
        </AdminLanguageProvider>
      </body>
    </html>
  );
}
