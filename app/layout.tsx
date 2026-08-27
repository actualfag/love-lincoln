import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: "Lincoln's 50th Birthday Tweakend", description: 'January 15–18, 2027 at Cove Haven in the Poconos.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
