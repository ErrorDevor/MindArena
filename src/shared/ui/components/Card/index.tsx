"use client";

import React, { useEffect } from "react";

import clsx from "clsx";

import api from "shared/api/axiosInstance";
import { useData } from "shared/context/DataContext";
import { aiModels } from "shared/data/data";
import { CardType } from "shared/lib/types/types";
import Image from "shared/ui/base/Image";
import { ClockIcon, ExchangeIcon, MessageIcon } from "shared/ui/icons";
// import { AccountButton } from "shared/ui/ui-kit/AccountButton";
import { LiveIcon } from "shared/ui/ui-kit/LiveIcon";
import { topicColors } from "shared/utils/helpers/useTopicColor";
import { UserInfo } from "shared/ui/components/UserInfo";
import { AiStack } from "../AiStack";
import { SegmentProgress } from "../SegmentProgress";
import { ThesisCard } from "../ThesisCard";

import css from "./Card.module.scss";

interface Prop {
   className?: string;
   data: any;
}

export const Card: React.FC<Prop> = ({ className, data }) => {
   const aiStack =
      data.status.variant === "live" || data.status.variant === "convergent"
         ? [aiModels[0], aiModels[2], aiModels[3]]
         : [aiModels[0], aiModels[1], aiModels[2], aiModels[3]];

   return (
      <div className={clsx(css.card, className)}>
         <div className={css.card_header}>
            <div className={css.card_top}>
               <UserInfo userName={data.user.name} userAvatar={data.user.avatar}/>
               

               <div className={css.divider} />

               <ul className={css.tags_list}>
                  {data.tier?.status === true && <li className={css.tags}>{data.tier?.name}</li>}

                  {data.tags.map((item: any) => {
                     const color =
                        topicColors[
                           item.id
                              .split("")
                              .reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0) %
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
            </div>

            <div
               className={clsx(
                  css.status,
                  data.status.variant === "live" && css.status_live,
                  data.status.variant === "research" && css.status_research,
                  data.status.variant === "convergent" && css.status_convergent,
                  data.status.variant === "quantum" && css.status_quantum,
                  data.status.variant === "divergent" && css.status_divergent
               )}
            >
               {data.status.variant === "live" && <LiveIcon className={css.live_status} />}
               {data.status.variant === "research" && (
                  <Image.Default src="/icons/research-gap.svg" />
               )}
               {data.status.variant === "convergent" && (
                  <Image.Default src="/icons/convergent.svg" />
               )}
               {data.status.variant === "quantum" && <Image.Default src="/icons/quantum.svg" />}
               {data.status.variant === "divergent" && <Image.Default src="/icons/divergent.svg" />}
               {data.status.state}
            </div>
         </div>

         <div className={css.card_content}>
            <h4>{data.title}</h4>

            {data.status.variant === "convergent" && (
               <div className={css.thesis_block}>
                  <ThesisCard
                     variant="before"
                     title="BEFORE"
                     text="Microplastics directly reduce IQ"
                  />

                  <ThesisCard
                     variant="after"
                     title="AFTER"
                     text="Coordination — yes. Politics — no"
                  />
               </div>
            )}

            {data.status.variant === "divergent" && (
               <div className={css.thesis_block}>
                  <ThesisCard variant="original" title="Original" text="AI should replace judges" />

                  <ThesisCard
                     variant="current"
                     title="V2-Current"
                     text="Judicial discretion must remain human"
                  />
               </div>
            )}

            <div className={css.subtitle}>
               <span className={css.icon} />

               {(() => {
                  switch (data.status.variant) {
                     case "quantum":
                        return (
                           <div className={css.quantum_subtitle}>
                              <span>1 247</span> explored <span className={css.dot} />
                              <span>843</span> rejected <span className={css.dot} />
                              <span>4</span> finalists <span>$6.40</span> compute
                           </div>
                        );

                     case "convergent":
                        return (
                           <div className={css.convergent_subtitle}>
                              <div className={css.convergent_subtitle_item}>
                                 <div className={css.convergent_subtitle_dot} />
                                 SaaS teams under 50 people
                              </div>

                              <div className={css.convergent_subtitle_item}>
                                 <div className={css.convergent_subtitle_dot} />
                                 Coordination and accountability separated
                              </div>
                              <div className={css.convergent_subtitle_item}>
                                 <div className={clsx(css.convergent_subtitle_dot, css.red_dot)} />
                                 Trust remains unresolved
                              </div>
                           </div>
                        );

                     default:
                        return <p>{data.subtitle}</p>;
                  }
               })()}
            </div>
         </div>

         <div className={css.card_bottom}>
            <div className={css.card_bottom_left}>
               {data.status.variant !== "research" && <AiStack items={aiStack} />}

               {data.status.variant === "live" && (
                  <p className={css.live_info}>
                     Trust Power dynamics
                     <span className={css.dot} />4 rounds
                  </p>
               )}

               {data.status.variant === "research" && (
                  <div className={css.research_progress}>
                     <h6>41%</h6>
                     <SegmentProgress value={41} max={100} segments={22} />
                     <div className={css.research_progress_raised}>
                        Raised <span>&nbsp;$820</span>&nbsp;/&nbsp;Goal <span>&nbsp;$2000</span>
                     </div>
                  </div>
               )}

               {data.status.variant === "convergent" && (
                  <p className={css.live_info}>
                     4 rounds
                     <span className={css.dot} /> 4 models <span className={css.dot} /> 3
                     improvements
                  </p>
               )}

               {data.status.variant === "divergent" && (
                  <p className={css.live_info}>Contradiction Map Complete</p>
               )}
            </div>

            <div className={css.card_bottom_right}>
               {data.status.variant === "live" && (
                  <div className={css.live_info}>
                     <p className={css.views}>
                        <ExchangeIcon />
                        {data.views.toLocaleString("ru-RU")} views
                     </p>

                     <span className={css.dot} />

                     <MessageIcon />

                     <p>42</p>

                     <div className={css.divider} />

                     <button className={css.live_new} type="button">
                        +3 new
                     </button>
                  </div>
               )}

               {data.status.variant === "research" && (
                  <div className={css.research_info}>
                     <ClockIcon /> <p className={css.views}>18 Days left</p>
                     <span className={css.dot} />
                     <ExchangeIcon />
                     <p className={css.views}>23 Supporters</p>
                     <span className={css.dot} />
                     <MessageIcon />
                     <p>42</p>
                  </div>
               )}

               {data.status.variant === "convergent" && (
                  <div className={css.convergent_info}>
                     <ExchangeIcon />
                     <p className={css.views}>{data.views.toLocaleString("ru-RU")} views</p>
                     <span className={css.dot} />
                     <MessageIcon />
                     <p>42</p>
                  </div>
               )}

               {data.status.variant === "quantum" && (
                  <div className={css.convergent_info}>
                     <ExchangeIcon />
                     <p className={css.views}>{data.views.toLocaleString("ru-RU")} views</p>
                     <span className={css.dot} />
                     <MessageIcon />
                     <p>42</p>
                  </div>
               )}

               {data.status.variant === "divergent" && (
                  <div className={css.convergent_info}>
                     <ExchangeIcon />
                     <p className={css.views}>{data.views.toLocaleString("ru-RU")} views</p>
                     <span className={css.dot} />
                     <MessageIcon />
                     <p>42</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
