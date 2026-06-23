"use client";

import React, { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import clsx from "clsx";

import { Comments } from "features/Comment";
import { Thesis } from "features/Thesis";

import { useData } from "shared/context/DataContext";
import { streamDebate } from "shared/lib/debate-stream";
import { getDebate } from "shared/lib/debates";
import { DebateAttack } from "shared/lib/types/types";
// import Image from "shared/ui/base/Image";
import { AiThinking } from "shared/ui/components/AiThinking";
// import { SegmentProgress } from "shared/ui/components/SegmentProgress";
import { UserInfo } from "shared/ui/components/UserInfo";
import { ArrowIcon, ExchangeIcon } from "shared/ui/icons";
// import { ActionLabel } from "shared/ui/ui-kit/ActionLabel";
import { Button } from "shared/ui/ui-kit/Button";
import { LiveStatus } from "shared/ui/ui-kit/LiveStatus";
import { RaundLabel } from "shared/ui/ui-kit/RaundLabel";
import { Tag } from "shared/ui/ui-kit/Tag";
import { topicColors } from "shared/utils/helpers/useTopicColor";

import { DebateCard } from "../DebateCard";
import RaundArrowIcon from "../RaundArrow";

import css from "./DebateScreen.module.scss";

const tabs = ["Attack Loop", "Quantum - 1247 paths"];
const debateTitle = "Al will replace middle management within 3 years";

export const DebateScreen: React.FC = () => {
   const topicId = "Ai Labor";
   const color =
      topicColors[
         topicId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % topicColors.length
      ];
   const [activeTab, setActiveTab] = React.useState(tabs[0]);
   const [debate, setDebate] = useState<any>(null);
   const { debateId: contextDebateId } = useData();
   const params = useParams();

   const routeDebateId = params?.debateId as string | undefined;
   const currentDebateId = routeDebateId ?? contextDebateId;
   const [attacks, setAttacks] = useState<DebateAttack[]>([]);
   const [currentAgent, setCurrentAgent] = useState("");
   const [isCompleted, setIsCompleted] = useState(false);

   useEffect(() => {
      if (!currentDebateId) return;

      getDebate(currentDebateId)
         .then((data) => {
            console.log("GET debate data:", data);
            setDebate(data);
         })
         .catch((err: any) => {
            console.error("get debate error:", err.response?.data ?? err.message);
         });

      const close = streamDebate(currentDebateId, {
         onEvent(eventName: string, data: unknown) {
            console.log("SSE event:", eventName, data);

            if (eventName === "agent.attack.created") {
               const attack = data as DebateAttack;

               setCurrentAgent(attack.agent);
               setAttacks((prev) => [...prev, attack]);
            }

            if (eventName === "debate.completed") {
               setIsCompleted(true);
            }
         },
      });

      return close;
   }, [currentDebateId]);

   const attacksByRound = attacks.reduce<Record<number, DebateAttack[]>>((acc, attack) => {
      const round = attack.roundNumber ?? 0;

      if (!acc[round]) {
         acc[round] = [];
      }

      acc[round].push(attack);

      return acc;
   }, {});

   const roundNumbers = Object.keys(attacksByRound)
      .map(Number)
      .sort((a, b) => a - b);

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
                  {roundNumbers.map((roundNumber, index) => (
                     <React.Fragment key={roundNumber}>
                        {index > 0 && (
                           <RaundArrowIcon
                              style={{
                                 width: "0.9rem",
                                 height: "3.5rem",
                                 margin: "0 auto",
                              }}
                           />
                        )}

                        <div className={css.main_list_raunds}>
                           <RaundLabel raund={roundNumber} />

                           <ul className={css.main_list_ai_cards}>
                              {attacksByRound[roundNumber].map((attack, id) => (
                                 <li key={attack.eventId + id} className={css.main_list_card}>
                                    <DebateCard
                                       title={debate?.title ?? debateTitle}
                                       aiName={attack.agent}
                                       aiAvatar={
                                          attack.agent === "GPT"
                                             ? "/images/ai/chatgpt-icon.png"
                                             : "/images/ai/gemini-ai-icon.png"
                                       }
                                       round={`R${attack.roundNumber}`}
                                       variant="red"
                                       action="attack"
                                       text={attack.content}
                                    />
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </React.Fragment>
                  ))}
               </div>

               {currentDebateId && !isCompleted && <AiThinking ai={currentAgent} />}
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
