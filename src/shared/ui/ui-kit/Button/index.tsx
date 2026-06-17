"use client";

import React from "react";

import clsx from "clsx";

import { NextLink, NextLinkProps } from "shared/ui/base/NextLink";

import css from "./Button.module.scss";

interface Prop {
   variant: "blue" | "black" | "grey" | "white";
   className?: string;
   disabled?: boolean;
   active?: boolean;
}

type ButtonComponent = {
   as?: "button";
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type AnchorComponent = {
   as?: "a";
} & NextLinkProps;

type ButtonProps = Prop & (ButtonComponent | AnchorComponent);

export const Button: React.FC<ButtonProps> = ({
   className,
   variant = "blue",
   disabled,
   active,
   children,
   as = "button",
   ...props
}) => {
   const buttonClassName = clsx(
      css.button,
      className,
      disabled && css["button--disabled"],
      variant && css["button--" + variant],
      active && css["button--active"]
   );

   const isBlack = variant === "black";

   const stars = Array.from({ length: 10 });

   const content = (
      <>
         {isBlack && (
            <span className={css.button_stars}>
               {stars.map((_, index) => (
                  <span
                     key={index}
                     className={css.button_star}
                     style={
                        {
                           "--delay": `${index * 0.3}s`,
                        } as React.CSSProperties
                     }
                  />
               ))}
            </span>
         )}

         <span className={css.button_content}>{children}</span>
      </>
   );

   if (as === "a") {
      return (
         <NextLink {...(props as any)} className={buttonClassName}>
            {content}
         </NextLink>
      );
   }

   return (
      <button
         className={buttonClassName}
         {...(props as any)}
         disabled={disabled}
         type={(props as any).type || "button"}
      >
         {content}
      </button>
   );
};
