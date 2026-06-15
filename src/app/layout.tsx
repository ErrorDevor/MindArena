import "shared/styles/index.scss";

import { Metadata } from "next";
import { Inter_Tight } from "next/font/google";

const interTight = Inter_Tight({
   subsets: ["latin"],
   variable: "--font-inter-tight",
   display: "swap",
   preload: true,
});

export const metadata: Metadata = {
   title: "Mind Arena",
   description: "Mind Arena",
   icons: {
      icon: [{ url: "/favicon.png", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className={interTight.variable}>
         <body>{children}</body>
      </html>
   );
}
