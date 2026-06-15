"use client";

import React from "react";

import clsx from "clsx";
import { LiveIcon } from "../LiveIcon";
import css from "./LiveLabel.module.scss";

interface Prop {
  className?: string;
  liveName?: string;
}

export const LiveLabel: React.FC<Prop> = ({ className, liveName }) => {
  return (
    <div className={clsx(css.live_label, className)}>
      <LiveIcon/>

      <p><span className={css.gradient_text}>{liveName}</span></p>
    </div>
  );
};
