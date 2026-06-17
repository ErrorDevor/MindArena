import React from "react";

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

export const ActionLabel: React.FC<ActionLabelProps> = ({ type, children }) => {
   return <div className={`${css.label} ${css[type]}`}>{children ?? labelText[type]}</div>;
};
