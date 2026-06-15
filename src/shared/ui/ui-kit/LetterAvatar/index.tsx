"use client";

import React from "react";

import clsx from "clsx";

import css from "./LetterAvatar.module.scss";

export type LetterAvatarVariant = "blue" | "orange" | "green" | "purple";

interface Props {
   className?: string;
   letter: string;
   variant?: LetterAvatarVariant;
}

export const LetterAvatar: React.FC<Props> = ({ className, letter, variant = "blue" }) => {
   return <div
   className={clsx(
      css.avatar,
      css[`avatar_${variant}`],
      className
   )}
>
   <div className={css.avatar_border}>
      <div className={css.avatar_inner}>
         {letter}
      </div>
   </div>
</div>;
};
