import type { Metadata } from 'next';
import './globals.css';

const title = "Lincoln is for Lovers — 50th Birthday Tweakend";
const description = 'January 15–18, 2027 at Cove Haven in the Poconos.';

export const metadata: Metadata = {
  metadataBase: new URL('https://lincolns-50th-tweakend.lincoln-neiger.chatgpt.site'),
  title,
  description,
  openGraph: { title, description, images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
