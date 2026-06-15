"use client";

import React from "react";

import clsx from "clsx";

import css from "./LiveIcon.module.scss";

interface Prop {
  className?: string;
}

export const LiveIcon: React.FC<Prop> = ({ className }) => {
  return (
    <div className={clsx(css.live_icon, className)}>
      <span/>
    </div>
  );
};
