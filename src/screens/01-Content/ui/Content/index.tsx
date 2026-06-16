"use client";

import React from "react";

import clsx from "clsx";

import { contentArray } from "shared/data/data";
import { Card } from "shared/ui/components/Card";
import { Button } from "shared/ui/ui-kit/Button";
import { Checkbox } from "shared/ui/ui-kit/Checkbox";

import css from "./Content.module.scss";

const tabs = ["For you", "Hot", "New", "Research Gaps", "Quantum"];

interface Prop {
   className?: string;
}

export const Content: React.FC<Prop> = ({ className }) => {
   const [activeTab, setActiveTab] = React.useState(tabs[0]);
   const [checkQuantum, setCheckQuantum] = React.useState(true);

   return (
      <div className={clsx(css.content, className)}>
         <div className={css.content_top}>
            <h2>Feed</h2>

            <div className={css.divider} />

            <div className={css.content_buttons_nav}>
               {tabs.map((tab) => (
                  <Button
                     key={tab}
                     variant="grey"
                     className={clsx(css.button_nav, activeTab === tab && css.button_nav_active)}
                     active={activeTab === tab}
                     onClick={() => setActiveTab(tab)}
                  >
                     {tab}
                  </Button>
               ))}
            </div>

            <label className={css.check_quantum}>
               <Checkbox checked={checkQuantum} onChange={() => setCheckQuantum((prev) => !prev)} />
               <p>Quantum</p>
            </label>
         </div>

         <div className={css.content_list}>
            {contentArray.map((data) => (
               <Card key={data.id} data={data} />
            ))}
         </div>
      </div>
   );
};
