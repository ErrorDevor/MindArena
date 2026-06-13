import "shared/styles/index.scss";

import { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
   subsets: ["latin"],
   variable: "--font-plus-jakarta",
   display: "swap",
   preload: true,
});

export const metadata: Metadata = {
   title: "Mind Arena",
   description: "Mind Arena",
   icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className={plusJakarta.variable}>
         <head>
            <link
               rel="preload"
               href="/fonts/F37-Lineca-Cyrillic-VF/F37LinecaCyrillic-VF.woff2"
               as="font"
               type="font/woff2"
               crossOrigin="anonymous"
            />
         </head>
         <body>{children}</body>
      </html>
   );
}
