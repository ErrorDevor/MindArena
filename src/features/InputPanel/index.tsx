"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import api from "shared/api/axiosInstance";
import { useData } from "shared/context/DataContext";
import { aiModels } from "shared/data/data";
import { login, saveTokens } from "shared/lib/auth/auth";
import { getDebate } from "shared/lib/debates";
import { saveDebateToStorage } from "shared/store/debatesStorage";
import { AiStack } from "shared/ui/components/AiStack";
import { Tooltip } from "shared/ui/components/Tooltip";
import { SendIcon, TokenIcon } from "shared/ui/icons";
import { Button } from "shared/ui/ui-kit/Button";

import css from "./InputPanel.module.scss";

interface Prop {
   className?: string;
   variant?: "main" | "debate";
}

export const InputPanel: React.FC<Prop> = ({ className, variant = "main" }) => {
   const { addDebatedId } = useData();
   const router = useRouter();
   const [inputValue, setInputValue] = useState("");

   const placeholder =
      variant !== "main"
         ? "Write your opinion, fact or example..."
         : "Write a thesis or open question — mode detected automatically….";

   const ensureAuth = async () => {
      const authData = await login({
         email: "user@example.com",
         password: "strongPass123",
      });

      const accessToken = authData.accessToken;

      if (!accessToken) {
         throw new Error("Access token not found");
      }

      localStorage.setItem("accessToken", accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax`;

      return accessToken;
   };

   const handleSend = async () => {
      const thesis = inputValue.trim();

      if (!thesis) return;

      try {
         await ensureAuth();

         setInputValue("");

         const token = await ensureAuth();

         const res = await api.post(
            "/debates",
            {
               thesis,
               mode: "CONVERGENT",
               visibility: "PUBLIC",
               models: ["GPT", "GEMINI"],
               maxRounds: 6,
               quietMode: false,
               sourceUrl: "https://www.linkedin.com",
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         const debateId = res.data.debateId;

         const debate = await getDebate(debateId);

         saveDebateToStorage(debate);

         addDebatedId(debateId);
         router.push(`/debate/${debateId}`);
      } catch (err: any) {
         console.error("Error:", err.response?.data ?? err.message);
      }
   };

   return (
      <div className={clsx(css.input_panel, className)}>
         <div className={css.input_panel_inner}>
            <AiStack items={[aiModels[0], aiModels[1], aiModels[2], aiModels[3]]} />

            <textarea
               placeholder={placeholder}
               className={css.input_panel_textarea}
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.ctrlKey) {
                     e.preventDefault();
                     handleSend();
                  }
               }}
            />

            <div className={css.button_block}>
               <ButtonSend variant={variant} onSend={handleSend} />
            </div>
         </div>

         <div className={css.gradient}>
            <span className={css.gradient_orb_1} />
            <span className={css.gradient_orb_2} />
            <span className={css.gradient_orb_3} />
         </div>
      </div>
   );
};

interface ButtonSendProp {
   variant?: "main" | "debate";
   onSend?: () => void;
}

const ButtonSend: React.FC<ButtonSendProp> = ({ variant = "main", onSend }) => {
   const sendTokenRef = React.useRef<HTMLDivElement | null>(null);
   const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

   return (
      <>
         {variant === "main" ? (
            <button className={css.send_button} onClick={onSend}>
               <SendIcon />

               <svg
                  className={css.star}
                  width="4"
                  height="4"
                  viewBox="0 0 4 4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M2 0C2.0679 1.07519 2.9248 1.9321 4 2C2.9248 2.0679 2.0679 2.9248 2 4C1.9321 2.9248 1.07519 2.0679 0 2C1.07519 1.9321 1.9321 1.07519 8 0Z"
                     fill="white"
                  />
               </svg>

               <svg
                  className={css.stars}
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M4 2C4.1358 4.15038 5.8496 5.86421 8 6C5.8496 6.1358 4.1358 7.8496 4 10C3.86421 7.8496 2.15038 6.1358 0 6C2.15038 5.86421 3.86421 4.15038 4 2Z"
                     fill="white"
                  />
                  <path
                     d="M8 0C8.0679 1.07519 8.9248 1.9321 10 2C8.9248 2.0679 8.0679 2.9248 8 4C7.9321 2.9248 7.07519 2.0679 6 2C7.07519 1.9321 7.9321 1.07519 8 0Z"
                     fill="white"
                  />
               </svg>
            </button>
         ) : (
            <div className={css.button_block}>
               <Button variant="black" className={css.post_button} onClick={onSend}>
                  <SendIcon />
                  Post
               </Button>

               <p>or</p>

               <div
                  ref={sendTokenRef}
                  onMouseEnter={() => setIsTooltipOpen(true)}
                  onMouseLeave={() => setIsTooltipOpen(false)}
               >
                  <Button variant="blue" className={css.send_token_button}>
                     Send - 5
                     <TokenIcon />
                  </Button>
               </div>

               <Tooltip
                  anchorRef={sendTokenRef}
                  isOpen={isTooltipOpen}
                  text="Your argument will enter the next round. AI will respond to it directly."
               />
            </div>
         )}
      </>
   );
};
