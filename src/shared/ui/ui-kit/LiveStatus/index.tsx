"use client";

import React from "react";

import clsx from "clsx";


import { LiveIcon } from "../LiveIcon";

import css from "./LiveStatus.module.scss";

interface Prop {
   className?: string;
}

export const LiveStatus: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.live_status, className)}>
         
         <LiveIcon /> Live
      </div>
   );
};
