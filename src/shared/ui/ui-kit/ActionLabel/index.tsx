import React from "react";

import clsx from "clsx";

import css from "./ActionLabel.module.scss";

export type ActionLabelType =
   | "attack"
   | "improve"
   | "human"
   | "research-gap"
   | "convergent"
   | "quantum"
   | "divergent";

interface ActionLabelProps {
   type: ActionLabelType;
   children?: React.ReactNode;
   className?: string;
}

const labelText: Record<ActionLabelType, string> = {
   attack: "Attack",
   improve: "Improve",
   human: "Human",
   "research-gap": "Research Gap",
   convergent: "Convergent",
   quantum: "Quantum",
   divergent: "Divergent",
};

export const ActionLabel: React.FC<ActionLabelProps> = ({ type, children, className }) => {
   return (
      <div className={clsx(css.label, css[type], className)}>{children ?? labelText[type]}</div>
   );
};
