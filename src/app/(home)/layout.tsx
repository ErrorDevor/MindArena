import React from "react";

import { Footer } from "widgets/Footer";
import { Header } from "widgets/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <Header />
         {children}
         <Footer />
      </>
   );
}
