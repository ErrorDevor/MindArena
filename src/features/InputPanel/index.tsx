"use client";

import React from "react";

import clsx from "clsx";

import { aiModels } from "shared/data/data";
import { AiStack } from "shared/ui/components/AiStack";
import { SendIcon } from "shared/ui/icons";

import css from "./InputPanel.module.scss";

interface Prop {
   className?: string;
}

export const InputPanel: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.input_panel, className)}>
         <div className={css.input_panel_inner}>
            <AiStack items={[aiModels[0], aiModels[1], aiModels[2], aiModels[3]]} />
            
            <textarea
               placeholder="Write a thesis or open question — mode detected automatically…."
               className={css.input_panel_textarea}
            />

            <button className={css.send_button}>
               <SendIcon />

               <svg
                  className={css.star}
                  width="4"
                  height="4"
                  viewBox="0 0 4 4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M2 0C2.0679 1.07519 2.9248 1.9321 4 2C2.9248 2.0679 2.0679 2.9248 2 4C1.9321 2.9248 1.07519 2.0679 0 2C1.07519 1.9321 1.9321 1.07519 2 0Z"
                     fill="white"
                  />
               </svg>

               <svg
                  className={css.stars}
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M4 2C4.1358 4.15038 5.8496 5.86421 8 6C5.8496 6.1358 4.1358 7.8496 4 10C3.86421 7.8496 2.15038 6.1358 0 6C2.15038 5.86421 3.86421 4.15038 4 2Z"
                     fill="white"
                  />
                  <path
                     d="M8 0C8.0679 1.07519 8.9248 1.9321 10 2C8.9248 2.0679 8.0679 2.9248 8 4C7.9321 2.9248 7.07519 2.0679 6 2C7.07519 1.9321 7.9321 1.07519 8 0Z"
                     fill="white"
                  />
               </svg>
            </button>
         </div>

         <div className={css.gradient}>
            <span className={css.gradient_orb_1} />
            <span className={css.gradient_orb_2} />
            <span className={css.gradient_orb_3} />
         </div>
      </div>
   );
};
