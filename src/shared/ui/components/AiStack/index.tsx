"use client";

import React from "react";

import clsx from "clsx";

import { AI } from "shared/lib/types/types";
import Image from "shared/ui/base/Image";

import css from "./AiStack.module.scss";

interface Prop {
   className?: string;
   items: AI[];
}

export const AiStack: React.FC<Prop> = ({ className, items }) => {
   return (
      <div className={clsx(css.ai_stack, className)}>
         {items.map((ai, index) => (
            <div key={ai.id} className={css.ai_image} style={{ zIndex: index + 1 }} title={ai.name}>
               <Image.Default src={ai.icon} alt={ai.name} />
            </div>
         ))}
      </div>
   );
};
