"use client";

import React from "react";
import { createPortal } from "react-dom";

import css from "./Tooltip.module.scss";

interface TooltipProps {
   anchorRef: React.RefObject<HTMLElement | null>;
   text: string;
   isOpen: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ anchorRef, text, isOpen }) => {
   const [mounted, setMounted] = React.useState(false);
   const [position, setPosition] = React.useState({ top: 0, left: 0 });

   React.useEffect(() => {
      setMounted(true);
   }, []);

   React.useEffect(() => {
      if (!isOpen || !anchorRef.current) return;

      const rect = anchorRef.current.getBoundingClientRect();

      setPosition({
         top: rect.top + window.scrollY,
         left: rect.left + window.scrollX + rect.width / 2,
      });
   }, [isOpen, anchorRef]);

   if (!mounted) return null;

   return createPortal(
      <div
         className={`${css.tooltip} ${isOpen ? css.tooltip_visible : ""}`}
         style={{
            top: position.top,
            left: position.left,
         }}
      >
         {text}
      </div>,
      document.body
   );
};