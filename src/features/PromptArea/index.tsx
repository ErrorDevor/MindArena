"use client";

import React from "react";

import clsx from "clsx";

import { InputPanel } from "features/InputPanel";

import { ArrowDotIcon } from "shared/ui/icons";

import css from "./PromptArea.module.scss";

interface Prop {
   className?: string;
}

export const PromptArea: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.prompt_area, className)}>
         <InputPanel />

         <div className={css.prompt_area_bottom}>
            <a>Specific claim</a>
            <ArrowDotIcon />
            <a>
               Attack loop <span className={css.dot} />
               Open question{" "}
            </a>
            <ArrowDotIcon />
            <a>
               Quantum 1000+ paths <span className={css.dot} />
               Detected automatically
            </a>
         </div>
      </div>
   );
};
