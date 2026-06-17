"use client";

import React from "react";

import clsx from "clsx";

import Image from "shared/ui/base/Image";
import { UserInfo } from "shared/ui/components/UserInfo";
import { DropdownArrowIcon } from "shared/ui/icons";

import css from "./Comments.module.scss";

interface Prop {
   className?: string;
}

const tabs = ["Linked", "All (47)", "Q&A", "Entered (8)"];

const comments = [
   {
      id: 1,
      user: {
         userName: "@mikhail_k",
         variant: "full" as const,
         role: "Founder",
         inquiries: 5,
      },
      round: "R2",
      text: "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      thesis:
         "v2 → v3: limit added - companies under 200 people. New weakness: why 200 specifically?",
      response: {
         label: "Grok response",
         icon: "/images/ai/grok-icon.png",
         text: "Valley preserves coordination through Steam as infrastructure - this is a different type of management that AI can replicate...",
      },
   },
   {
      id: 2,
      user: {
         userName: "@dr.Anna",
         variant: "full" as const,
         role: "Oncologist",
         expert: true,
      },
      text: "40 patients took rapamycin off-label 3+ years — no immune markers change below 3mg/week.",
      thesis:
         "Scope narrowed to specific dosage threshold. New requirement: dose must be specified.",
      response: {
         label: "Claude response",
         icon: "/images/ai/claude-ai-icon.png",
         text: "Clinical data at 3mg/week supports the safety claim but this is observational...",
      },
   },
];

const ReadFull: React.FC<{ text: string }> = ({ text }) => {
   const [isExpanded, setIsExpanded] = React.useState(false);

   return (
      <>
         <p className={clsx(css.message_text, isExpanded && css.message_text_expanded)}>{text}</p>

         <button
            className={clsx(css.read_full, isExpanded && css.read_full_active)}
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
         >
            {isExpanded ? "Show Less" : "Read Full"}
            <DropdownArrowIcon />
         </button>
      </>
   );
};

export const Comments: React.FC<Prop> = ({ className }) => {
   const [activeTab, setActiveTab] = React.useState(tabs[3]);

   return (
      <div className={clsx(css.comments, className)}>
         <div className={css.comments_blocks}>
            <h5>Comments</h5>

            <div className={css.comments_blocks_content_nav}>
               {tabs.map((tab) => (
                  <button
                     key={tab}
                     type="button"
                     className={clsx(css.button_nav, activeTab === tab && css.button_nav_active)}
                     onClick={() => setActiveTab(tab)}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         <div className={css.comments_blocks}>
            <div className={css.comments_blocks_content}>
               <div className={css.raund_label}>
                  <p>Entered the round</p>
               </div>
               <p>8 arguments that changed the thesis</p>
            </div>
         </div>

         {comments.map((comment, index) => (
            <div
               key={comment.id}
               className={clsx(
                  css.comments_blocks,
                  index === comments.length - 1 && css.last_comments_blocks
               )}
            >
               <div className={css.comment_tree}>
                  <div className={css.comment_line} />

                  <div className={css.comment_header}>
                     <UserInfo {...comment.user} />

                     {comment.round && <span className={css.round_badge}>{comment.round}</span>}
                  </div>

                  <div className={css.comment_body}>
                     <p className={css.comment_text}>{comment.text}</p>

                     <div className={css.thesis_changed}>
                        <span>Changed the thesis</span>
                        <p>{comment.thesis}</p>
                     </div>

                     <div className={css.ai_response}>
                        <div className={css.ai_response_title}>
                           <Image.Default src={comment.response.icon} className={css.ai_icon} />
                           <p>{comment.response.label}</p>
                        </div>

                        <ReadFull text={comment.response.text} />
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
};
