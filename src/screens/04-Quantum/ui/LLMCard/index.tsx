"use client";

import React from "react";

import clsx from "clsx";

import { QuantumLLMType } from "../../lib/data";

import css from "./LLMCard.module.scss";

interface Props {
   className?: string;
   data: QuantumLLMType;
}

export const LLMCard: React.FC<Props> = ({ className, data }) => {
   return (
      <article className={clsx(css.llm_card, className)}>
         <div className={css.llm_card_head}>
            <img src={data.icon} alt={data.model} />
            <h5>{data.model}</h5>
         </div>

         <div className={css.llm_card_body}>
            <div className={css.llm_card_value}>
               <strong>{data.value}</strong>

               {data.label && <span>{data.label}</span>}
            </div>

            <div className={css.llm_card_info}>
               <p>{data.description}</p>

               <div className={css.llm_card_progress}>
                  {Array.from({ length: data.total }).map((_, index) => (
                     <span
                        key={index}
                        className={clsx(index < data.progress && css.llm_card_progress_active)}
                     />
                  ))}
               </div>
            </div>
         </div>
      </article>
   );
};