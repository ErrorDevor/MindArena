"use client";

import React from "react";

import clsx from "clsx";

import { AccountButton } from "shared/ui/ui-kit/AccountButton";

import css from "./UserInfo.module.scss";

const fallbackAvatars = ["/images/avatar.png", "/images/avatar2.png", "/images/avatar3.png"];

const getFallbackAvatar = (userName: string) => {
   const index =
      userName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      fallbackAvatars.length;

   return fallbackAvatars[index];
};

interface Prop {
   className?: string;
   userName: string;
   userAvatar?: string;
   variant?: "full" | "simple";
   expert?: boolean;
   role?: string;
   inquiries?: number;
   withName?: boolean;
}

export const UserInfo: React.FC<Prop> = ({
   className,
   variant = "simple",
   userName,
   expert = false,
   userAvatar,
   role,
   inquiries,
   withName = true,
}) => {
   const avatar = userAvatar || getFallbackAvatar(userName);

   return (
      <div className={clsx(css.user_info, className)}>
         <AccountButton avatar={avatar} />

         {withName && (
            <div className={css.user_info_name}>
               <a>{userName}</a>

               {variant === "full" ? (
                  <div className={css.user_info_role}>
                     <h6>{role}</h6>

                     {inquiries && (
                        <>
                           <div className={css.dot} /> <h6>{inquiries} inquiries</h6>
                        </>
                     )}
                  </div>
               ) : (
                  <></>
               )}
            </div>
         )}
         {expert && <div className={css.expert}>Expert</div>}
      </div>
   );
};
