"use client";

import React from "react";
import { ReactNode } from "react";
import clsx from "clsx";

import { ArrowDotIcon } from "shared/ui/icons";

import css from "./ThesisCard.module.scss";

export type ThesisCardVariant = "before" | "after" | "original" | "current";

interface Prop {
   title: string;
   text: string | ReactNode;
   variant: ThesisCardVariant;
   className?: string;
   simple?: boolean;
}

export const ThesisCard: React.FC<Prop> = ({ title, text, variant, className, simple=false }) => {
   return (
      <div className={clsx(css.thesis_card, css[`thesis_card_${variant}`], className)}>
         <div className={clsx(css.thesis_card_header, simple && css.thesis_card_header_simple)}>
            {!simple && <ArrowDotIcon className={css.left_arrow}/>}
            <span>{title}</span>
             {!simple && <ArrowDotIcon />}
         </div>

         <div className={clsx(css.thesis_card_content, simple && css.thesis_simple_content)}>{text}</div>
      </div>
   );
};
