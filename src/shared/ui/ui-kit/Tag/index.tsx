"use client";

import React from "react";

import clsx from "clsx";

import css from "./Tag.module.scss";

interface Prop {
  className?: string;
  tag: string;
}

export const Tag: React.FC<Prop> = ({ className, tag }) => {
  return (
    <button className={clsx(css.tag, className)}>
      <div className={css.tag_hashtag}>#</div>

      <p>{tag}</p>
    </button>
  );
};
