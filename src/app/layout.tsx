import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Accounts',
  description: 'A premium, secure financial management dashboard for project tracking.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0B0710',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
