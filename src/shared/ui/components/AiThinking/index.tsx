import React from "react";
import Lottie from "react-lottie-player";

import clsx from "clsx";

import css from "./AiThinking.module.scss";

interface Props {
   className?: string;
}

export const AiThinking: React.FC<Props> = ({ className }) => {
   return (
      <div className={clsx(css.ai_thinking, className)}>
         <Lottie className={css.ai_thinking_anim} path="/media/thinking.json" loop play />
         <span className={css.ai_thinking_span}>
            Gemini thinking
            <i>.</i>
            <i>.</i>
            <i>.</i>
         </span>
      </div>
   );
};
