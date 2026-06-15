"use client";

import React from "react";
import clsx from "clsx";

import css from "./SegmentProgress.module.scss";

interface Props {
   className?: string;
   value: number;
   max?: number;
   segments?: number;
}

export const SegmentProgress: React.FC<Props> = ({
   className,
   value,
   max = 100,
   segments = 70,
}) => {
   const activeCount = Math.round((value / max) * segments);

   return (
      <div className={clsx(css.progress, className)}>
         {Array.from({ length: segments }).map((_, index) => (
            <span
               key={index}
               className={clsx(
                  css.progress_segment,
                  index < activeCount && css.progress_segment_active
               )}
            />
         ))}
      </div>
   );
};