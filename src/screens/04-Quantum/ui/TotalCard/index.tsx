"use client";

import React from "react";

import clsx from "clsx";
import { QuantumTotalType } from "screens/04-Quantum/lib/data";

import Image from "shared/ui/base/Image";

import css from "./TotalCard.module.scss";

interface Prop {
   className?: string;
   data: QuantumTotalType;
}

export const TotalCard: React.FC<Prop> = ({ className, data }) => {
   return (
      <div className={clsx(css.total_card, className)}>
         <div className={css.total_card_icon_block}>
            <div className={css.total_card_icon_wrapper}>
               <div className={css.total_card_icon_inner}>
                <Image.Default src={data.icon}/>
               </div>
            </div>
         </div>

         <div className={css.total_card_data}>
            <h3>{data.total}</h3>

            <p>{data.name}</p>
         </div>
      </div>
   );
};
