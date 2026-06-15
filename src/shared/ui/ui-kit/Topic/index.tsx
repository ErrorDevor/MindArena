"use client";

import React from "react";

import clsx from "clsx";

import { useTopicColor } from "shared/utils/helpers/useTopicColor";

import css from "./Topic.module.scss";

interface Prop {
   className?: string;
   topic: string;
   count: number;
   active?: boolean;
   index: number;
   onClick?: () => void;
}

export const Topic: React.FC<Prop> = ({ className, topic, count, active, index, onClick }) => {
   const color = useTopicColor(index);

   return (
      <button className={clsx(css.topic, className, active && css.topic_active)} onClick={onClick}>
         <div className={css.color_block} style={{ background: color }} />

         <p>{topic}</p>

         <div className={css.topic_count}>{count}</div>
      </button>
   );
};
