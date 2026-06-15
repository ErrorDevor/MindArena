"use client";

import React from "react";

import clsx from "clsx";

import { MacKeyIcon, SearchIcon } from "shared/ui/icons";

import css from "./Search.module.scss";

interface Prop {
   className?: string;
}

export const Search: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.search, className)}>
         <SearchIcon />

<input
   type="text"
   placeholder="Search inquiries, topics, tags..."
   className={css.input}
/>
         <div className={css.search_info}>
            <MacKeyIcon /> + K
         </div>
      </div>
   );
};
