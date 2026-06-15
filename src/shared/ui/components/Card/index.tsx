"use client";

import React from "react";

import clsx from "clsx";

import { CardType } from "shared/lib/types/types";
import Image from "shared/ui/base/Image";
import { ClockIcon, ExchangeIcon } from "shared/ui/icons";
import { AccountButton } from "shared/ui/ui-kit/AccountButton";
import { LetterAvatar } from "shared/ui/ui-kit/LetterAvatar";
import { LiveIcon } from "shared/ui/ui-kit/LiveIcon";
import { topicColors } from "shared/utils/helpers/useTopicColor";

import { SegmentProgress } from "../SegmentProgress";

import css from "./Card.module.scss";

interface Prop {
   className?: string;
   data: CardType;
}

export const Card: React.FC<Prop> = ({ className, data }) => {
   return (
      <div className={clsx(css.card, className)}>
         <div className={css.card_header}>
            <div className={css.card_user_block}>
               <AccountButton avatar={<Image.Default src={data.user.avatar} />} />
               <a>{data.user.name}</a>
            </div>

            <div
               className={clsx(
                  css.status,
                  data.status.variant === "live" && css.status_live,
                  data.status.variant === "research" && css.status_research,
                  data.status.variant === "convergent" && css.status_convergent
               )}
            >
               {data.status.variant === "live" && <LiveIcon className={css.live_status} />}
               {data.status.variant === "research" && (
                  <Image.Default src="/icons/research-gap.svg" />
               )}
               {data.status.variant === "convergent" && (
                  <Image.Default src="/icons/convergent.svg" />
               )}
               {data.status.state}
            </div>
         </div>

         <div className={css.card_content}>
            <ul className={css.tags_list}>
               {data.tier?.status === true && <li className={css.tags}>{data.tier?.name}</li>}

               {data.tags.map((item) => {
                  const color =
                     topicColors[
                        item.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                           topicColors.length
                     ];

                  return (
                     <li className={css.tags} key={item.id}>
                        <div className={css.tags_color_block} style={{ background: color }} />
                        {item.name}
                     </li>
                  );
               })}
            </ul>

            <h4>{data.title}</h4>

            <div className={css.subtitle}>
               <span className={css.icon} />
               <p>{data.subtitle}</p>
            </div>

            {data.status.variant === "research" && <SegmentProgress value={45} />}
         </div>

         <div className={css.card_bottom}>
            <div className={css.card_bottom_left}>
               <div className={css.avatar_stack}>
                  <LetterAvatar letter="G" variant="blue" />
                  <LetterAvatar letter="C" variant="orange" />
                  <LetterAvatar letter="K" variant="green" />

                  {data.status.variant === "live" && <LetterAvatar letter="D" variant="purple" />}
               </div>

               {data.status.variant === "live" && <p>Trust measurement Power without buffer</p>}

               {data.status.variant === "research" && (
                  <p className={css.views}>{data.views.toLocaleString("ru-RU")} views</p>
               )}
            </div>

            <div className={css.card_bottom_right}>
               {data.status.variant === "live" && (
                  <div className={css.live_info}>
                     <p>4 rounds</p>

                     <span className={css.live_info_dot} />

                     <p className={css.views}>
                        <ExchangeIcon />
                        {data.views.toLocaleString("ru-RU")} views
                     </p>

                     <div className={css.divider} />

                     <button className={css.live_new} type="button">
                        +3 new
                     </button>
                  </div>
               )}

               {data.status.variant === "research" && (
                  <div className={css.research_info}>
                     <ClockIcon /> <p className={css.views}>18 Days left</p>
                  </div>
               )}

               {data.status.variant === "convergent" && (
                  <div className={css.convergent_info}>
                     <ExchangeIcon />
                     <p className={css.views}>{data.views.toLocaleString("ru-RU")} views</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
