"use client";

import React, { forwardRef } from "react";

import clsx from "clsx";

import css from "./AppLayout.module.scss";

interface Props {
   children: React.ReactNode;
   header?: React.ReactNode;
   sidebar?: React.ReactNode;
   commentsSidebar?: React.ReactNode;
   promptArea?: React.ReactNode;
   isSidebarCollapsed?: boolean;
   className?: string;
}

export const AppLayout = forwardRef<HTMLDivElement, Props>(
   (
      {
         className,
         header,
         sidebar,
         commentsSidebar,
         promptArea,
         children,
         isSidebarCollapsed = false,
      },
      ref
   ) => {
      return (
         <div
            ref={ref}
            className={clsx(css.app, isSidebarCollapsed && css.app_collapsed, className)}
         >
            {header}

            <div className={css.body}>
               {sidebar}

               <div className={css.center}>
                  <div className={css.main_content}>{children}</div>

                  {promptArea && <div className={css.prompt_area}>{promptArea}</div>}
               </div>

               {commentsSidebar}
            </div>
         </div>
      );
   }
);

AppLayout.displayName = "AppLayout";
