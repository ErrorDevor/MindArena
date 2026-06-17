"use client";

import React from "react";

import clsx from "clsx";

import css from "./RaundLabel.module.scss";

interface Prop {
  className?: string;
  raund: number;
}

export const RaundLabel: React.FC<Prop> = ({ className, raund = 1 }) => {
  return (
    <div className={clsx(css.raund_label, className)}>
      <p>Round {raund}</p>
    </div>
  );
};
