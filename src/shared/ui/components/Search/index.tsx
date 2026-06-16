"use client";

import React from "react";

import clsx from "clsx";

import { MacKeyIcon, SearchIcon } from "shared/ui/icons";

import css from "./Search.module.scss";

interface Prop {
   className?: string;
   placeholder?: string;
   withInfo?: boolean;
}

export const Search: React.FC<Prop> = ({
   className,
   placeholder = "Search inquiries, topics, tags...",
   withInfo = true,
}) => {
   return (
      <div className={clsx(css.search, className)}>
         <SearchIcon />

         <input type="text" placeholder={placeholder} className={css.input} />

         {withInfo && (
            <div className={css.search_info}>
               <MacKeyIcon /> + K
            </div>
         )}
      </div>
   );
};
