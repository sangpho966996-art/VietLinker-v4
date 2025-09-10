import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "VietLinker - Cộng đồng Việt Nam tại Mỹ",
  description: "Nền tảng kết nối cộng đồng Việt Nam tại Mỹ - Marketplace, Việc làm, Bất động sản, Nhà hàng và Dịch vụ",
  keywords: "Vietnamese community, marketplace, jobs, real estate, restaurants, services, Việt Nam, cộng đồng",
  authors: [{ name: "VietLinker Team" }],
  creator: "VietLinker",
  publisher: "VietLinker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "VietLinker - Cộng đồng Việt Nam tại Mỹ",
    description: "Nền tảng kết nối cộng đồng Việt Nam tại Mỹ - Marketplace, Việc làm, Bất động sản, Nhà hàng và Dịch vụ",
    url: "/",
    siteName: "VietLinker",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VietLinker - Cộng đồng Việt Nam tại Mỹ",
    description: "Nền tảng kết nối cộng đồng Việt Nam tại Mỹ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
