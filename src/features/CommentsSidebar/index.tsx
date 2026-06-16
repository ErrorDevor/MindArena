"use client";

import React from "react";

import clsx from "clsx";

import { CommentBlock } from "features/CommentBlock";

import { commentsData } from "shared/data/data";

import css from "./CommentsSidebar.module.scss";

interface Props {
   className?: string;
}

export const CommentsSidebar: React.FC<Props> = ({ className }) => {
   return (
      <aside className={clsx(css.comments_sidebar, className)}>
         <div className={css.comments_sidebar_content}>
            {commentsData.map((data) => (
               <CommentBlock comment={data} key={data.id} />
            ))}
         </div>
      </aside>
   );
};
