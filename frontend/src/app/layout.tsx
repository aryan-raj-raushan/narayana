import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Narayana eCommerce',
  description: 'Your one-stop shop for quality products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
