"use client";

import React from "react";

import { QuantumPath } from "../../lib/data";
import clsx from "clsx";

import { ArrowIcon, WrenchIcon, CheckIcon, CloseIcon } from "shared/ui/icons";
import { Button } from "shared/ui/ui-kit/Button";

import css from "./PathItem.module.scss";

interface Props {
   className?: string;
   path: QuantumPath;
}

export const PathItem: React.FC<Props> = ({ className, path }) => {
   return (
      <div className={clsx(css.path_item, className)}>
         <div className={css.path_number}>{path.id}</div>

         <div className={css.path_content}>
            <h5>{path.title}</h5>

            <div className={css.path_info}>
               <div className={css.path_meta}>
                  <span>{path.rounds} rounds</span>
                  <span className={css.dot} />
                  <span>{path.generation}</span>
                  <span className={css.dot} />
                  <span>Score {path.score}</span>

                  <div className={css.progress}>
                     <span
                        className={clsx(css.progress_line, css[`progress_${path.progressColor}`])}
                        style={{ width: `${path.score}%` }}
                     />
                  </div>
               </div>

               <ul className={css.models_list}>
                  {path.models.map((model) => (
                     <li key={model.name}>
                        <button
                           type="button"
                           className={clsx(css.model_item, !model.passed && css.model_item_failed)}
                           onClick={() => {}}
                        >
                           <img src={model.icon} alt={model.name} />

                           <span>{model.name}</span>

                           {model.passed ? <CheckIcon /> : <CloseIcon />}
                        </button>
                     </li>
                  ))}
               </ul>
            </div>

            <div className={css.path_divider} />

            <div className={css.path_actions}>
               {path.actions.deepen && (
                  <Button className={css.path_button} type="button" variant="grey">
                     Deepen
                     <ArrowIcon />
                  </Button>
               )}

               {path.actions.research && (
                  <Button className={css.path_button} type="button" variant="grey">
                     Research Request
                  </Button>
               )}

               {path.actions.build && (
                  <Button variant="black" className={css.build_button}>
                     <WrenchIcon />
                     Build
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
};
