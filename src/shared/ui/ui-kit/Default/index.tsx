"use client";

import React from "react";

import clsx from "clsx";

import css from "./Default.module.scss";

interface Prop {
  className?: string;
}

export const Default: React.FC<Prop> = ({ className }) => {
  return (
    <div className={clsx(css.default, className)}>
      <></>
    </div>
  );
};
