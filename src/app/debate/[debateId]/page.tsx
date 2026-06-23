"use client";

import React from "react";

import { DebateScreen } from "screens/02-Debate/ui/Content";

import { Header } from "widgets/Header";
import { Sidebar } from "widgets/Sidebar";

import { DebateArea } from "features/DebateArea";

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
         promptArea={<DebateArea />}
         isComments={false}
      >
         <DebateScreen />
      </AppLayout>
   );
}

// "use client";

// import React from "react";

// import { DebateMessage } from "screens/03-DebateMessage";

// import { Header } from "widgets/Header";
// import { Sidebar } from "widgets/Sidebar";

// import { AppLayout } from "shared/ui/templates/AppLayout";

// export default function DebateMessagePage() {
//    const [collapsed, setCollapsed] = React.useState(false);

//    return (
//       <AppLayout
//          isSidebarCollapsed={collapsed}
//          header={<Header />}
//          sidebar={
//             <Sidebar
//                collapsed={collapsed}
//                onToggleCollapsed={() => setCollapsed((prev) => !prev)}
//             />
//          }
//          isComments={false}
//          ispromptArea={false}
//       >
//          <DebateMessage />
//       </AppLayout>
//    );
// }
