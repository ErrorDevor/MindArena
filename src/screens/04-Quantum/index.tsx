"use client";

import React, { useState } from "react";

import { useParams } from "next/navigation";

import { quantumLLM, quantumPaths, quantumTotal } from "./lib/data";
import { LLMCard } from "./ui/LLMCard";
import { PathItem } from "./ui/PathItem";
import { TotalCard } from "./ui/TotalCard";

import { useData } from "shared/context/DataContext";
import { TabItem } from "shared/lib/types/types";
import { ThesisCard } from "shared/ui/components/ThesisCard";
import { DebateLayout } from "shared/ui/templates/DebateLayout/DebateLayout";

import css from "./Quantum.module.scss";

export const Quantum: React.FC = () => {
   const [debate, setDebate] = useState<any>(null);
   const { debateId: contextDebateId } = useData();
   const params = useParams();
   const routeDebateId = params?.debateId as string | undefined;
   const currentDebateId = routeDebateId ?? contextDebateId;

   const tabs: TabItem[] = [
      {
         id: "debate",
         tab: "Attack Loop",
         href: `/debate/${currentDebateId}`,
      },
      {
         id: "quantum",
         tab: "Quantum - 1247 paths",
         href: `/quantum/${currentDebateId}`,
      },
   ];

   return (
      <DebateLayout debate={debate} tabs={tabs}>
         <div className={css.quantum_content}>
            <ul className={css.quantum_total}>
               {quantumTotal.map((item) => (
                  <li key={item.id}>
                     <TotalCard data={item} />
                  </li>
               ))}
            </ul>

            <ul className={css.quantum_llm}>
               {quantumLLM.map((item) => (
                  <li key={item.id}>
                     <LLMCard data={item} />
                  </li>
               ))}
            </ul>

            <div className={css.quantum_paths}>
               <h6>Surviving paths — passed all attack rounds</h6>

               <ul className={css.paths_list}>
                  {quantumPaths.map((path) => (
                     <li key={path.id}>
                        <PathItem path={path} />
                     </li>
                  ))}
               </ul>
            </div>

            <div className={css.divider} />

            <ThesisCard
               title="Cut paths — 843 total"
               variant="original"
               text={
                  <ul className={css.total_path_list}>
                     <li className={css.total_path_list_item}>Caloric restriction only</li>
                     <li className={css.total_path_list_item}>NAD+ alone</li>
                     <li className={css.total_path_list_item}>Senolytics only</li>
                     <li className={css.total_path_list_item}>+840 more</li>
                  </ul>
               }
               simple
            />
         </div>
      </DebateLayout>
   );
};
