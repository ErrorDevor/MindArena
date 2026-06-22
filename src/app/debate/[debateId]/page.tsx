"use client";

import React from "react";

import { DebateMessage } from "screens/03-DebateMessage";

import { Header } from "widgets/Header";
import { Sidebar } from "widgets/Sidebar";

import { AppLayout } from "shared/ui/templates/AppLayout";

export default function DebateMessagePage() {
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
         ispromptArea={false}
      >
         <DebateMessage />
      </AppLayout>
   );
}
