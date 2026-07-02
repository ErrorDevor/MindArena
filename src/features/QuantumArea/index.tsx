"use client";

import React from "react";

import clsx from "clsx";

import { InputPanel } from "features/InputPanel";

import Image from "shared/ui/base/Image";

import css from "./QuantumArea.module.scss";

interface Prop {
   className?: string;
}

export const QuantumArea: React.FC<Prop> = ({ className }) => {
   return (
      <div className={clsx(css.quantum_area, className)}>
         <div className={css.quantum_area_top}>
            Add your hypothesis to the pool — evaluated equally
         </div>

         <InputPanel variant="quantum" className={css.quantum_input} />
      </div>
   );
};
