"use client";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import clsx from "clsx";

// import api from "shared/api/axiosInstance";
import { useData } from "shared/context/DataContext";
// import { contentArray } from "shared/data/data";
// import { login, saveTokens } from "shared/lib/auth/auth";
import { streamDebate } from "shared/lib/debate-stream";
import { getDebate } from "shared/lib/debates";
import { getStoredDebates } from "shared/store/debatesStorage";
import { Card } from "shared/ui/components/Card";
import { Button } from "shared/ui/ui-kit/Button";
import { Checkbox } from "shared/ui/ui-kit/Checkbox";

import css from "./Content.module.scss";

const tabs = ["For you", "Hot", "New", "Research Gaps", "Quantum"];

interface Prop {
   className?: string;
}

type Attack = { agent: string; role: string; content: string; roundNumber: number | null };

export const Content: React.FC<Prop> = ({ className }) => {
   const [activeTab, setActiveTab] = React.useState(tabs[0]);
   const [checkQuantum, setCheckQuantum] = React.useState(true);
   const { dataArray, addMyaData, addDebatedId, debateId } = useData();

   const [debate, setDebate] = useState<any>(null);
   const [attacks, setAttacks] = useState<Attack[]>([]);
   const [status, setStatus] = useState("");

   const router = useRouter();
   const [storedDebates, setStoredDebates] = useState<any[]>([]);

   useEffect(() => {
      setStoredDebates(getStoredDebates());
   }, []);

   useEffect(() => {
      if (!debateId) return;

      getDebate(debateId)
         .then((data) => {
            setDebate(data);
         })
         .catch((err) => {
            console.error("get debate error:", err.response?.data ?? err.message);
         });

      const close = streamDebate(debateId, {
         onEvent(eventName, data) {
            if (eventName === "debate.started") setStatus("Live");
            if (eventName === "debate.failed") setStatus("Failed");
            if (eventName === "debate.completed") setStatus("Completed");

            if (eventName === "agent.attack.created") {
               const attack = data as Attack;

               setAttacks((prev) => [
                  ...prev,
                  {
                     agent: attack.agent,
                     role: attack.role,
                     content: attack.content,
                     roundNumber: attack.roundNumber,
                  },
               ]);
            }

            if (eventName === "thesis.improved") {
               setDebate((prev: any) => (prev ? { ...prev, currentThesis: data.content } : prev));
            }
         },
      });

      return close;
   }, [debateId]);

   const isDebateLoading = debateId && !debate;

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
            {isDebateLoading && <p>Loading debate...</p>}

            {storedDebates.map((data) => (
               <Card key={data.id} data={data} onClick={() => router.push(`/debate/${data.id}`)} />
            ))}
         </div>
      </div>
   );
};
