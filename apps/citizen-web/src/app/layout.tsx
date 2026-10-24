import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';

export const metadata: Metadata = {
  title: 'CivicPulse — Citizen Issue Reporting & Government Accountability',
  description:
    'Report civic issues, track resolutions, and hold your government accountable. Transparent, verifiable governance for every citizen.',
  keywords: ['civic', 'issues', 'government', 'accountability', 'reporting', 'transparency'],
  icons: {
    icon: '/civicpulse-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
