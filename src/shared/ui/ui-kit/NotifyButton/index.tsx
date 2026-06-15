"use client";

import React from "react";

import clsx from "clsx";

import css from "./NotifyButton.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   count?: number;
   icon?: React.ReactNode;
   className?: string;
}

export const NotifyButton: React.FC<Props> = ({
   className,
   count = 0,
   icon,
   type = "button",
   ...props
}) => {
   const hasCount = count > 0;
   const visibleCount = count > 99 ? "99+" : count;

   return (
      <button {...props} type={type} className={clsx(css.notify_button, className)}>
         <span className={css.notify_button_icon}>{icon}</span>

         {hasCount && <span className={css.notify_button_count}>{visibleCount}</span>}
      </button>
   );
};
