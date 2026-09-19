import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://patrabus.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'PatraBus+ | Live bus arrivals and locations in Patras',
  description: 'Ζωντανές αφίξεις, θέσεις λεωφορείων, στάσεις και δρομολόγια για την Πάτρα. Live Patras bus tracking, arrivals and stop timetables.',
  keywords: ['λεωφορεία Πάτρα', 'ζωντανά λεωφορεία Πάτρα', 'τηλεματική Πάτρα', 'στάσεις λεωφορείων Πάτρα', 'δρομολόγια Πάτρα', 'Patras bus live', 'Patras bus tracker', 'Patras bus arrivals', 'Patras bus timetable'],
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  appleWebApp: { capable: true, title: 'PatraBus+', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] },
  openGraph: { type: 'website', locale: 'el_GR', url: '/', siteName: 'PatraBus+', title: 'PatraBus+ | Live bus arrivals and locations in Patras', description: 'Ζωντανές αφίξεις, θέσεις λεωφορείων, στάσεις και δρομολόγια για την Πάτρα.' },
  twitter: { card: 'summary', title: 'PatraBus+', description: 'Live Patras bus arrivals, locations and timetables.' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover', themeColor: '#171c20' };

const structuredData = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PatraBus+', url: siteUrl,
  applicationCategory: 'TravelApplication', operatingSystem: 'Web, iOS, Android', inLanguage: ['el', 'en'],
  areaServed: { '@type': 'City', name: 'Patras', address: { '@type': 'PostalAddress', addressLocality: 'Patras', addressCountry: 'GR' } },
  description: 'An independent web app for live bus arrivals, vehicle locations, stops and timetables in Patras, Greece.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="el" className="dark"><head><meta name="apple-mobile-web-app-capable" content="yes" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700;800&display=swap" /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></head><body>{children}</body></html>;
}
