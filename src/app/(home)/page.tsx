"use client";

import React from "react";

import { Content } from "screens/01-Content/ui/Content";

import { Header } from "widgets/Header";
import { Sidebar } from "widgets/Sidebar";

import { CommentsSidebar } from "features/CommentsSidebar";
import { PromptArea } from "features/PromptArea";

import { AppLayout } from "shared/ui/templates/AppLayout";

export const dynamic = "force-dynamic";

export default function Home() {
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
         commentsSidebar={<CommentsSidebar />}
         promptArea={<PromptArea />}
      >
         <Content />
      </AppLayout>
   );
}
