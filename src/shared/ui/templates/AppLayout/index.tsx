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
   isComments?: boolean;
   isPromptArea?: boolean;
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
         isComments = true,
         isPromptArea = true
      },
      ref
   ) => {
      return (
         <div
            ref={ref}
            className={clsx(
               css.app,
               isSidebarCollapsed && css.app_collapsed,
               !isComments && css.app_without_comments,
               className
            )}
         >
            {header}

            <div className={css.body}>
               {sidebar}

               <div className={clsx(css.center, !isComments && css.debate_center, !isPromptArea && css.debate_main)}>
                  <div className={css.main_content}>{children}</div>

                  {isPromptArea && <div className={css.prompt_area}>{promptArea}</div>}
               </div>

               {isComments && commentsSidebar}
            </div>
         </div>
      );
   }
);

AppLayout.displayName = "AppLayout";
