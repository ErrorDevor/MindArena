"use client";

import React from "react";

import clsx from "clsx";

import Image from "shared/ui/base/Image";

import css from "./AccountButton.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   avatar?: string;
   className?: string;
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   avatar?: string;
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
         <span className={css.account_button_inner}>
            {avatar && <Image.Default src={avatar} alt="" />}
         </span>
      </button>
   );
};
