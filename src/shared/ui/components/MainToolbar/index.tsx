"use client";

import React from "react";

import { usePathname, useRouter } from "next/navigation";

import clsx from "clsx";

import { TabItem } from "shared/lib/types/types";
import { Button } from "shared/ui/ui-kit/Button";

import css from "./MainToolbar.module.scss";

interface Props {
   tabs: TabItem[];
   className?: string;
}

export const MainToolbar: React.FC<Props> = ({ tabs, className }) => {
   const router = useRouter();
   const pathname = usePathname();

   return (
      <div className={clsx(css.main_toolbar, className)}>
         {tabs.map((tab) => {
            const isActive = pathname === tab.href;

            return (
               <Button
                  key={tab.id}
                  variant="grey"
                  className={clsx(css.button_nav, isActive && css.button_nav_active)}
                  active={isActive}
                  onClick={() => router.push(tab.href)}
               >
                  {tab.tab}
               </Button>
            );
         })}
      </div>
   );
};
