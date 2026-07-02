"use client";

import React from "react";

import { Comments } from "features/Comment";
import { Thesis } from "features/Thesis";
import { TabItem } from "shared/lib/types/types";
import { MainToolbar } from "shared/ui/components/MainToolbar";
import { UserInfo } from "shared/ui/components/UserInfo";
import { ArrowIcon } from "shared/ui/icons";
import { LiveStatus } from "shared/ui/ui-kit/LiveStatus";
import { Tag } from "shared/ui/ui-kit/Tag";
import { topicColors } from "shared/utils/helpers/useTopicColor";

import css from "./DebateLayout.module.scss";

type Props = {
   debate: any;
   tabs: TabItem[];
   children: React.ReactNode;
};

export const DebateLayout: React.FC<Props> = ({ debate, tabs, children }) => {
   const topicId = "Ai Labor";

   const color =
      topicColors[
         topicId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % topicColors.length
      ];

   return (
      <section className={css.content}>
         <div className={css.content_wrapper}>
            <div className={css.main_block}>
               <div className={css.main_block_top}>
                  <div className={css.top_info}>
                     <UserInfo
                        userName={debate?.user?.name ?? "@debater"}
                        userAvatar={debate?.user?.avatar ?? ""}
                     />

                     <span className={css.dot} />

                     <h6 className={css.user_date}>
                        {debate?.createdAt
                           ? new Date(debate.createdAt).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                             })
                           : "Loading..."}
                     </h6>

                     <span className={css.dot} />

                     <LiveStatus />
                  </div>

                  <button className={css.share_button} type="button">
                     <ArrowIcon />
                     Share
                  </button>
               </div>

               <h2 className={css.title}>{debate?.title}</h2>

               <ul className={css.tags_list}>
                  <li className={css.tags}>Tier 2</li>

                  <li className={css.tags}>
                     <div className={css.tags_color_block} style={{ background: color }} />
                     Ai Labor
                  </li>

                  <li className={css.tags}>
                     <Tag tag="management" className={css.tags_debate} />
                  </li>
               </ul>

               <MainToolbar tabs={tabs} />

               {children}
            </div>
         </div>

         <div className={css.thesis_block}>
            <Thesis />
         </div>

         <div className={css.comments_block}>
            <Comments />
         </div>
      </section>
   );
};
