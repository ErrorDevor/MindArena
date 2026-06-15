"use client";

import React from "react";

import clsx from "clsx";

import { useClickOutside } from "shared/utils/hooks/useClickOutside";

import css from "./Accordion.module.scss";

enum DisplayNames {
   BUTTON = "ACCORDEON_BUTTON",
   CONTENT = "ACCORDEON_CONTENT",
}

interface SubChildren {
   children: React.ReactNode;
}

const Button: React.FC<SubChildren> = ({ children }) => {
   return children;
};

const Content: React.FC<SubChildren> = ({ children }) => {
   return children;
};

Button.displayName = DisplayNames.BUTTON;
Content.displayName = DisplayNames.CONTENT;

/* Accordion */
type AccordionChildrenProps = {
   active: boolean;
   toggle: () => void;
};

type AccordionChildren = ((props: AccordionChildrenProps) => React.ReactNode) | React.ReactNode;

interface AccordionProps {
   children: AccordionChildren;
   initialOpen?: boolean;
   closeOnClickOut?: boolean;
   clickableRoot?: boolean;
   smooth?: boolean;
   disabled?: boolean;
   className?: string;
   classNameActive?: string;
   duration?: number;
   controllerActive?: boolean;
   setConrollerActive?: (bool: boolean) => void;
}

const Accordion: React.FC<AccordionProps> = ({
   children,
   initialOpen = false,
   smooth = false,
   disabled = false,
   closeOnClickOut = false,
   clickableRoot = false,
   duration = 200,
   className,
   classNameActive,
   controllerActive,
   setConrollerActive,
}) => {
   const [active, setActive] = React.useState(initialOpen);
   const [isRenderedOpen, setIsRenderedOpen] = React.useState(initialOpen);

   const firstRenderRef = React.useRef(true);
   const contentRef = React.useRef<HTMLDivElement>(null);
   const rootRef = useClickOutside(() => closeOnClickOut && setActive(false));

   const stateActive = React.useMemo(() => {
      if (typeof controllerActive !== "undefined") {
         return controllerActive;
      }

      return active;
   }, [active, controllerActive]);

   const setStateActive = React.useCallback(
      (bool: boolean) => {
         if (typeof setConrollerActive !== "undefined") {
            setConrollerActive(bool);
         } else {
            setActive(bool);
         }
      },
      [setConrollerActive]
   );

   const toggle = (ev?: React.MouseEvent<HTMLDivElement>) => {
      if (ev && (ev.target as HTMLDivElement).closest("[data-accordion-prevent-toggle]")) {
         return;
      }

      if (!disabled) {
         setStateActive(!stateActive);
      }
   };

   const toggleRoot = (ev: React.MouseEvent<HTMLDivElement>) => {
      if (clickableRoot) {
         toggle(ev);
      }
   };

   React.useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      if (!smooth) {
         el.style.height = stateActive ? "auto" : "0px";
         setIsRenderedOpen(stateActive);
         firstRenderRef.current = false;
         return;
      }

      if (firstRenderRef.current) {
         el.style.height = stateActive ? "auto" : "0px";
         setIsRenderedOpen(stateActive);
         firstRenderRef.current = false;
         return;
      }

      if (stateActive) {
         setIsRenderedOpen(true);

         if (el.style.height === "auto") {
            el.style.height = `${el.scrollHeight}px`;
         } else {
            el.style.height = "0px";

            requestAnimationFrame(() => {
               el.style.height = `${el.scrollHeight}px`;
            });
         }
      } else {
         const currentHeight = el.scrollHeight;
         el.style.height = `${currentHeight}px`;

         requestAnimationFrame(() => {
            el.style.height = "0px";
         });

         setIsRenderedOpen(false);
      }
   }, [stateActive, smooth]);

   React.useEffect(() => {
      if (!smooth || !stateActive) return;

      const el = contentRef.current;
      if (!el) return;

      const observer = new ResizeObserver(() => {
         if (el.style.height !== "auto") {
            el.style.height = `${el.scrollHeight}px`;
         }
      });

      observer.observe(el);

      return () => observer.disconnect();
   }, [stateActive, smooth]);

   const handleTransitionEnd = React.useCallback(
      (event: React.TransitionEvent<HTMLDivElement>) => {
         if (event.propertyName !== "height") return;

         const el = contentRef.current;
         if (!el) return;

         if (stateActive) {
            el.style.height = "auto";
         }
      },
      [stateActive]
   );

   const childrenArray = React.Children.toArray(
      typeof children === "function"
         ? (children({ active: stateActive, toggle }) as any).props.children
         : children
   );

   const button = childrenArray.find(
      (child: any) => child.type && child.type.displayName === DisplayNames.BUTTON
   );

   const content = childrenArray.find(
      (child: any) => child.type && child.type.displayName === DisplayNames.CONTENT
   );

   const rest = childrenArray.find(
      (child: any) =>
         child.type &&
         child.type.displayName !== DisplayNames.CONTENT &&
         child.type.displayName !== DisplayNames.BUTTON
   );

   return (
      <div
         className={clsx(
            css.accordeon,
            disabled && css.accordeon_disabled,
            smooth && css.accordeon_smooth,
            stateActive && ["accordeon-active", classNameActive],
            className
         )}
         onClick={toggleRoot}
         ref={rootRef}
      >
         <div className={css.button} onClick={toggle}>
            {button}
         </div>

         <div
            className={css.content}
            style={{ transitionDuration: smooth ? `${duration}ms` : undefined }}
            data-initial-open={firstRenderRef.current && active}
            ref={contentRef}
            onTransitionEnd={handleTransitionEnd}
         >
            {content}
         </div>

         {rest}
      </div>
   );
};

export default Object.assign(Accordion, { Button, Content });
