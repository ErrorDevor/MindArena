"use client";

import React from "react";

import clsx from "clsx";

import { useTimeline } from "shared/lib/timeline";

import css from "./StartPage.module.scss";

export const StartPage: React.FC = () => {
   

   const rootRef = useTimeline(
      (timeline, ref) => {
         timeline(ref)
            .to(".aos-page-el", { opacity: 1 }, 0)
            .to(".aos-page", { opacity: 1, y: 0 }, 0.15);
      },
      { scope: "scope" }
   );
   return (
      <section className={css.page} ref={rootRef}>
         <></>
      </section>
   );
};
