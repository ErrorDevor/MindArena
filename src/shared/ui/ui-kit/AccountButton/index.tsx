"use client";

import React from "react";

import clsx from "clsx";

import css from "./AccountButton.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   avatar?: React.ReactNode;
   className?: string;
}

export const AccountButton: React.FC<Props> = ({
   className,
   avatar,
   type = "button",
   ...props
}) => {
   return (
      <button {...props} type={type} className={clsx(css.account_button, className)}>
         <span className={css.account_button_inner}>{avatar}</span>
      </button>
   );
};
