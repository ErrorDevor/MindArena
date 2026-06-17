"use client";

import React from "react";

import clsx from "clsx";

import Image from "shared/ui/base/Image";
import { ThesisCard } from "shared/ui/components/ThesisCard";
import { Button } from "shared/ui/ui-kit/Button";

import css from "./Thesis.module.scss";

interface Prop {
   className?: string;
}

const tabs = ["30 Sec", "3 Min", "Read All"];

const models = [
   {
      id: 1,
      name: "Claude",
      background: "linear-gradient(180deg, #F7D6B2 0%, #FFAE52 100%)",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      price: 0.051,
   },
   {
      id: 2,
      name: "GPT-4O",
      background: "linear-gradient(180deg, #BAE7FF 0%, #94D9FF 100%)",
      border: "1px solid rgba(8, 110, 167, 0.2)",
      price: 0.042,
   },
   {
      id: 3,
      name: "Grok",
      background: "linear-gradient(180deg, #B9F3C4 0%, #A9F1B3 100%)",
      border: "1px solid rgba(15, 89, 25, 0.2)",
      price: 0.038,
   },
   {
      id: 4,
      name: "Gemini",
      background: "linear-gradient(180deg, #F0CCFF 0%, #E9B3FE 100%)",
      border: "1px solid rgba(131, 32, 177, 0.2)",
      price: 0.031,
   },
];

export const Thesis: React.FC<Prop> = ({ className }) => {
   const [activeTab, setActiveTab] = React.useState(tabs[1]);
   const totalPrice = models.reduce((sum, item) => sum + item.price, 0);

   return (
      <div className={clsx(css.thesis, className)}>
         <div className={css.thesis_blocks}>
            <h5>Thesis</h5>

            <div className={css.thesis_blocks_content}>
               <ThesisCard
                  simple
                  variant="original"
                  title="Original"
                  text="Al will replace middle management within 3 years"
               />

               <ThesisCard
                  simple
                  variant="current"
                  title="V2-Current"
                  text="Coordination: 3 yrs. Political buffer: 10+ yrs. Saas <50 first."
               />
            </div>
         </div>

         <div className={css.thesis_blocks}>
            <h5>Attacks</h5>

            <ul className={css.thesis_blocks_content}>
               <li className={css.attacks_list_item}>
                  <Image.Default src="/icons/tick-circle.svg" />
                  <p>Role conflation</p>
               </li>

               <li className={css.attacks_list_item}>
                  <Image.Default src="/icons/tick-circle.svg" />
                  <p>No seope</p>
               </li>

               <li className={clsx(css.attacks_list_item, css.close_list_item)}>
                  <Image.Default src="/icons/close-circle.svg" />
                  <p>Valve/Zappos counter</p>
               </li>

               <li className={clsx(css.attacks_list_item, css.close_list_item)}>
                  <Image.Default src="/icons/close-circle.svg" />
                  <p>Trust without human face</p>
               </li>
            </ul>
         </div>

         <div className={css.thesis_blocks}>
            <h5>Reading pedth</h5>

            <div className={css.thesis_blocks_content}>
               <div className={css.pedth_buttons_nav}>
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

               <p>3 min — all rounds, 2-3 sentences each</p>
            </div>
         </div>

         <div className={clsx(css.thesis_blocks, css.last_thesis_blocks)}>
            <h5>
               Cost <div className={css.dot} />
               No Narkup
            </h5>

            <div className={css.thesis_blocks_content}>
               <div className={css.cost_image_block}>
                  <Image.Default src="/images/cost.png" />

                  <div className={css.image_cost_total}>
                     <p>Total</p>
                     <h6>${totalPrice.toFixed(3)}</h6>
                  </div>
               </div>

               <div className={css.cost_info}>
                  <div className={css.cost_list}>
                     {models.map((item) => (
                        <div key={item.id} className={css.cost_item}>
                           <div className={css.cost_name}>
                              <span
                                 className={css.cost_dot}
                                 style={{
                                    background: item.background,
                                    border: item.border,
                                 }}
                              />
                              <span>{item.name}</span>
                           </div>

                           <span className={css.cost_value}>${item.price.toFixed(3)}</span>
                        </div>
                     ))}
                  </div>

                  <div className={css.cost_total}>
                     <p>Total</p>
                     <p>${totalPrice.toFixed(3)}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
