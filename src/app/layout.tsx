import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoBn = Noto_Sans_Bengali({
  variable: "--font-bn",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AKASH — শিশুদের মহাকাশ বন্ধু | Bengali Space Tutor for Kids",
  description:
    "AKASH is a bilingual (Bangla + English) offline-first AI space tutor for kids aged 7-14, powered by fine-tuned Gemma-2. Built for 37 million Bangladeshi children. Mohakasher Golpo, Banglay Shikhi.",
  keywords: [
    "AKASH", "Gemma", "Bengali Space Tutor", "Bangla AI", "Kids Education",
    "Bangladesh", "Space Education", "QLoRA", "Kaggle", "Build with Gemma",
  ],
  authors: [{ name: "AKASH Team" }],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "AKASH — Bengali Space Tutor for Kids",
    description: "Mohakasher Golpo, Banglay Shikhi — Built with Gemma",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AKASH — Bengali Space Tutor for Kids",
    description: "Powered by fine-tuned Gemma-2. For 37 million Bangladeshi kids.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${notoBn.variable} font-sans antialiased bg-akash-night text-akash-star min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
