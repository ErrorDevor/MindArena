import React from "react";

import clsx from "clsx";

import Image from "shared/ui/base/Image";
import { UserInfo } from "shared/ui/components/UserInfo";
import { DropdownArrowIcon, MessageIcon } from "shared/ui/icons";
import { ActionLabelType } from "shared/ui/ui-kit/ActionLabel";
import { ActionLabel } from "shared/ui/ui-kit/ActionLabel";

import css from "./DebateCard.module.scss";

type DebateCardVariant = "red" | "blue" | "purple" | "orange" | "green" | "pink" | "cyan";

interface DebateCardProps {
   founder?: boolean;
   userName?: string;
   aiName?: string;
   aiAvatar?: string;
   messagesCount?: number;
   round: string;
   text: string;
   status?: React.ReactNode;
   variant?: DebateCardVariant;
   action: ActionLabelType;
   className?: string;
}

export const DebateCard: React.FC<DebateCardProps> = ({
   founder,
   userName,
   aiName,
   aiAvatar,
   messagesCount,
   round,
   text,
   status,
   variant = "red",
   action,
   className,
}) => {
   const textRef = React.useRef<HTMLParagraphElement | null>(null);
   const [isExpanded, setIsExpanded] = React.useState(false);
   const [hasOverflow, setHasOverflow] = React.useState(false);

   React.useEffect(() => {
      const el = textRef.current;

      if (!el) return;

      setHasOverflow(el.scrollHeight > el.clientHeight);
   }, [text]);

   return (
      <article className={clsx(css.card, css[variant], className ?? "")}>
         <header className={css.header}>
            <div className={css.ai}>
               {founder && userName ? (
                  <>
                     <UserInfo userName={userName} />{" "}
                     <p className={css.founder}>
                        <span>/</span> Founder
                     </p>
                  </>
               ) : (
                  <>
                     {aiAvatar && <Image.Default className={css.avatar} src={aiAvatar} />}
                     <span className={css.name}>{aiName}</span>
                  </>
               )}

               {!!messagesCount && (
                  <>
                     <div className={css.dot} />

                     <span className={css.messages}>
                        <MessageIcon />
                        {messagesCount}
                     </span>
                  </>
               )}
            </div>
            <ActionLabel type={action} className={css.action_type}/>
            <span className={css.round}>{round}</span>
         </header>

         <div className={css.body}>
            <p ref={textRef} className={`${css.text} ${isExpanded ? css.text_expanded : ""}`}>
               {text}
            </p>

            {hasOverflow && (
               <button
                  className={`${css.read_more} ${isExpanded ? css.read_more_active : ""}`}
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
               >
                  {isExpanded ? "Show Less" : "Read More"}
                  <DropdownArrowIcon />
               </button>
            )}

            {status && <div className={css.status}>{status}</div>}
         </div>
      </article>
   );
};
