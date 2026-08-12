import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate
  },
  description: siteConfig.description,
  verification: {
  google: "B1xw0hxtqrvCg5GTTNMQWB8OcmMMHsyiaD8R6kYaWEs",
  },
  applicationName: siteConfig.siteName,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.siteName,
  openGraph: {
    type: "website",
    siteName: siteConfig.siteName,
    locale: siteConfig.locale,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.socialImage.openGraph,
        width: siteConfig.socialImage.width,
        height: siteConfig.socialImage.height,
        alt: siteConfig.socialImage.alt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.socialImage.twitter,
        alt: siteConfig.socialImage.alt
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/brand/favicon.ico?v=2", sizes: "any" },
      { url: "/brand/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png?v=2", sizes: "48x48", type: "image/png" },
      { url: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
