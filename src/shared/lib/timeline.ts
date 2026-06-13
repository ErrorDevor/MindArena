"use client";

import React from "react";

import { ReactRef, useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Options {
    scroll?: ScrollTrigger.Vars;
    defaults?: gsap.TweenVars | undefined | false;
}

type UseTimelineAnimation = (
    tweens: (tween: typeof timeline, ref: HTMLElement | null) => any,
    options?: {
        scope?: "scope" | Element | ReactRef | undefined | (string & {});
        dependencies?: unknown[] | undefined;
        revertOnUpdate?: boolean;
    }
) => any;

export const timeline = (trigger?: gsap.DOMTarget | undefined | false, options: Options = {}) => {
    const scrollTrigger =
        trigger !== false
            ? {
                  trigger,
                  start: "top 80%",
                  once: true,
                  
                  invalidateOnRefresh: true,
                  ...(options.scroll || {}),
              }
            : undefined;

    const defaults =
        options.defaults !== false
            ? {
                  duration: 1,
                  ease: "power2.inOut",
                  ...(options.defaults || {}),
              }
            : undefined;

    return gsap.timeline({
        scrollTrigger,
        defaults,
    });
};

export const useTimeline: UseTimelineAnimation = (tweens, options = {}) => {
    const scopeRef = React.useRef<HTMLElement>(null);

    useGSAP(
        () => {
            tweens(timeline, scopeRef.current);
        },
        { ...options, scope: options.scope === "scope" ? scopeRef : options.scope }
    );

    return scopeRef;
};
