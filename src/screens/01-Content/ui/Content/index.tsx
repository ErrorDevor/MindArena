"use client";
import React, { useEffect, useState } from "react";

import clsx from "clsx";

import api from "shared/api/axiosInstance";
import { useData } from "shared/context/DataContext";
import { contentArray } from "shared/data/data";
import { login, saveTokens } from "shared/lib/auth/auth";
import { streamDebate } from "shared/lib/debate-stream";
import { createDebate, getDebate } from "shared/lib/debates";
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

   const [users, setUsers] = useState<any>([]);

   const [debate, setDebate] = useState<any>(null);
   const [attacks, setAttacks] = useState<Attack[]>([]);
   const [status, setStatus] = useState("");

   // useEffect(() => {
   //    if (!debateId) return;

   //    api.get(`/debates/${debateId}`)
   //       .then((res) => {
   //          addMyaData(res.data);
   //          console.log("Fetched debate data:", res.data);
   //       })
   //       .catch((err) =>
   //          console.error("Error fetching debate data:", err.response?.data ?? err.message)
   //       );
   // }, [debateId]);

   useEffect(() => {
      if (!debateId) return;
      // Завантажуємо початковий стан
      getDebate(debateId).then(setDebate);

      // Підписуємося на лайв-оновлення
      const close = streamDebate(debateId, {
         onEvent(eventName, data) {
            if (eventName === "debate.started") setStatus("Live");
            if (eventName === "debate.failed") setStatus("Failed");
            if (eventName === "debate.completed") setStatus("Completed");

            if (eventName === "agent.attack.created") {
               setAttacks((prev) => [
                  ...prev,
                  {
                     agent: data.agent as string,
                     role: data.role as string,
                     content: data.content as string,
                     roundNumber: data.roundNumber as number | null,
                  },
               ]);
            }

            if (eventName === "thesis.improved") {
               setDebate((prev: any) => (prev ? { ...prev, currentThesis: data.content } : prev));
            }
         },
      });

      return close; // закриваємо SSE при unmount
   }, [debateId]);

   const refactor = () => {
      attacks.map((a, i) => {
         return {};
      });
   };

   useEffect(() => {
      const init = async () => {
         try {
            const authData = await login({
               email: "user@example.com",
               password: "strongPass123",
            });

            console.log("authData:", authData);

            const accessToken = authData.accessToken;

            if (!accessToken) {
               throw new Error("Access token not found");
            }

            localStorage.setItem("accessToken", accessToken);
            document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax`;
            const debateRes = await createDebate("Test thesis");

            console.log("created debate:", debateRes.data);

            addDebatedId(debateRes.data.debateId);
         } catch (err: any) {
            console.error("init error:", err.response?.data ?? err.message);
         }
      };

      init();
   }, []);

   if (!debate) return <p>Loading...</p>;

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

         {attacks.map((a, i) => (
            <li key={i}>
               <strong>
                  [Round {a.roundNumber}] {a.agent} / {a.role}:
               </strong>
               <p>{a.content}</p>
            </li>
         ))}

         <div className={css.content_list}>
            {/* {dataArray.map((data) => (
               <Card key={data.id} data={data} />
            ))} */}
            {debate && <Card data={debate} />}
         </div>
      </div>
   );
};
