"use client";

import React from "react";

import { Quantum } from "screens/04-Quantum";

import { Header } from "widgets/Header";
import { Sidebar } from "widgets/Sidebar";

import { AppLayout } from "shared/ui/templates/AppLayout";

export default function QuantumPage() {
   const [collapsed, setCollapsed] = React.useState(false);

   return (
      <AppLayout
         isSidebarCollapsed={collapsed}
         header={<Header />}
         sidebar={
            <Sidebar
               collapsed={collapsed}
               onToggleCollapsed={() => setCollapsed((prev) => !prev)}
            />
         }
         isComments={false}
         isPromptArea={false}
      >
         <Quantum />
      </AppLayout>
   );
}