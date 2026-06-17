"use client";

import React from "react";

import clsx from "clsx";

import { Comments } from "features/Comment";
import { Thesis } from "features/Thesis";

import Image from "shared/ui/base/Image";
import { AiThinking } from "shared/ui/components/AiThinking";
import { SegmentProgress } from "shared/ui/components/SegmentProgress";
import { UserInfo } from "shared/ui/components/UserInfo";
import { ArrowIcon, ExchangeIcon } from "shared/ui/icons";
import { ActionLabel } from "shared/ui/ui-kit/ActionLabel";
import { Button } from "shared/ui/ui-kit/Button";
import { LiveStatus } from "shared/ui/ui-kit/LiveStatus";
import { RaundLabel } from "shared/ui/ui-kit/RaundLabel";
import { Tag } from "shared/ui/ui-kit/Tag";
import { topicColors } from "shared/utils/helpers/useTopicColor";

import { DebateCard } from "../DebateCard";
import RaundArrowIcon from "../RaundArrow";

import css from "./DebateScreen.module.scss";

const tabs = ["Attack Loop", "Quantum - 1247 paths"];

export const DebateScreen: React.FC = () => {
   const topicId = "Ai Labor";
   const color =
      topicColors[
         topicId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % topicColors.length
      ];
   const [activeTab, setActiveTab] = React.useState(tabs[0]);
   return (
      <section className={css.content}>
         <div className={css.content_wrapper}>
            <div className={css.main_block}>
               <div className={css.main_block_top}>
                  <div className={css.top_info}>
                     <UserInfo userName="@truthseeker" userAvatar="" />
                     <span className={css.dot} />
                     <h6 className={css.user_date}>14 Jun 2026</h6>
                     <span className={css.dot} />
                     <LiveStatus />
                  </div>

                  <button className={css.share_button} type="button">
                     <ArrowIcon />
                     Share
                  </button>
               </div>

               <h2 className={css.title}> Al will replace middle management within 3 years </h2>

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

               <div className={css.buttons_nav}>
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

               <div className={css.main_list}>
                  <div className={css.main_list_raunds}>
                     <RaundLabel raund={1} />

                     <ul className={css.main_list_ai_cards}>
                        <li className={css.main_list_card}>
                           <ActionLabel type="attack" />

                           <DebateCard
                              aiName="GPT-4o"
                              aiAvatar="/images/ai/chatgpt-icon.png"
                              messagesCount={2}
                              round="R1"
                              variant="red"
                              text="Thesis assumes linear replacement but management serves political functions: buffer between strategy and execution. Al has no accountability. Firing someone requires a human face with legal standing. Thesis assumes linear replacement but management serves political functions: buffer between strategy and execution. Al has no accountability. Firing someone requires a human face with legal standing."
                              status={
                                 <div className={css.statusLabel}>
                                    Gap: coordination # politics. Thesis conflates two roles.
                                 </div>
                              }
                           />
                        </li>

                        <li className={css.main_list_card}>
                           <ActionLabel type="improve" />

                           <DebateCard
                              aiName="Thesis V2"
                              aiAvatar="/images/ai/system.png"
                              round="R1"
                              variant="blue"
                              text="Coordination functions — yes, automated within 3 years. Political functions (buffer, accountability) - no, 10+ years. Scope: SaaS <50 first."
                              status={
                                 <div className={css.status_label}>
                                    <div className={css.status_label_item}>
                                       <Image.Default src="/icons/tick-circle.svg" /> Closed: roles
                                       conflation
                                    </div>

                                    <div className={css.status_label_item}>
                                       <Image.Default src="/icons/close-circle.svg" />
                                       Open: how to measure what remains
                                    </div>
                                 </div>
                              }
                           />
                        </li>
                     </ul>
                  </div>

                  <RaundArrowIcon style={{ width: "0.9rem", height: "3.5rem", margin: "0 auto" }} />

                  <div className={css.main_list_raunds}>
                     <RaundLabel raund={2} />

                     <ul className={css.main_list_ai_cards}>
                        <li className={css.main_list_card}>
                           <ActionLabel type="human" />

                           <DebateCard
                              founder
                              messagesCount={1}
                              userName="@mikhail_k"
                              round="R2"
                              variant="purple"
                              text="Valve and Zappos tried flat structures before Al — both had serious scaling issues at 200+ people. Direct counterexample your thesis must address"
                           />
                        </li>

                        <li className={css.main_list_card}>
                           <ActionLabel type="attack" />

                           <DebateCard
                              aiName="Claude"
                              aiAvatar="/images/ai/claude-ai-icon.png"
                              messagesCount={3}
                              round="R2"
                              variant="red"
                              text="McKinsey 2024: 62% of managers spend 50%+ time on coordination - Al-replaceable. But 38% is strategic judgment. Thesis needs to quantify 
which 38% survives and why that holds across org types. McKinsey 2024: 62% of managers spend 50%+ time on coordination - Al-replaceable. But 38% is strategic judgment. Thesis needs to quantify 
which 38% survives and why that holds across org types."
                           />
                        </li>

                        <li className={css.main_list_card}>
                           <ActionLabel type="research-gap" />

                           <DebateCard
                              aiName="System"
                              aiAvatar="/images/ai/system.png"
                              round="auto"
                              variant="orange"
                              text="No data exists on how organizational trust changes when human intermediary is replaced by Al agent. 3 inquiries blocked."
                              status={
                                 <div className={css.status_label}>
                                    <SegmentProgress value={41} max={100} segments={22} />
                                    <div className={css.status_label_progress}>
                                       <span>&nbsp;$340</span>&nbsp;of&nbsp;
                                       <span>&nbsp;$2000</span>
                                    </div>
                                    <div className={css.status_label_item}>
                                       <span className={css.dot} />
                                       <ExchangeIcon />
                                       <p>23&nbsp;Supporters</p>
                                    </div>
                                 </div>
                              }
                           />
                        </li>
                     </ul>
                  </div>
               </div>

               <AiThinking />
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
