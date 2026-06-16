"use client";

import React from "react";

import clsx from "clsx";

import { ArrowDotIcon } from "shared/ui/icons";

import css from "./ThesisCard.module.scss";

export type ThesisCardVariant = "before" | "after" | "original" | "current";

interface Prop {
   title: string;
   text: string;
   variant: ThesisCardVariant;
   className?: string;
}

export const ThesisCard: React.FC<Prop> = ({ title, text, variant, className }) => {
   return (
      <div className={clsx(css.thesis_card, css[`thesis_card_${variant}`], className)}>
         <div className={css.thesis_card_header}>
            <ArrowDotIcon className={css.left_arrow}/>
            <span>{title}</span>
            <ArrowDotIcon />
         </div>

         <div className={css.thesis_card_content}>{text}</div>
      </div>
   );
};
