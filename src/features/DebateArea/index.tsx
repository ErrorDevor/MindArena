"use client";

import React from "react";

import clsx from "clsx";

import { InputPanel } from "features/InputPanel";

import Image from "shared/ui/base/Image";
import { ArrowDotIcon } from "shared/ui/icons";

import css from "./DebateArea.module.scss";

interface Prop {
   className?: string;
}

export const DebateArea: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.debate_area, className)}>
         <InputPanel variant="debate" className={css.debate_input} />

         <div className={css.debate_area_bottom}>
            Verified experts free in their field <span className={css.dot} /> 5 supporters
            <svg
               className={css.eq}
               width="7"
               height="5"
               viewBox="0 0 7 5"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M0 1.08008V0H6.125V1.08008H0ZM0 4.01953V2.93945H6.125V4.01953H0Z"
                  fill="#0042A3"
                  fillOpacity="0.6"
               />
            </svg>
            Free <span className={css.dot} />
            or $0.20 immediately
            <div className={css.tokens_count}>
               <Image.Default src="/icons/flash-circle.svg" />
               <p>0 / 280</p>
               <span className={css.dot} />
               <p>5 tokens</p>
            </div>
         </div>
      </div>
   );
};
