"use client";

import React from "react";

import { useRouter } from "next/navigation";

import clsx from "clsx";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import Image from "shared/ui/base/Image";
import { ActionLabel } from "shared/ui/ui-kit/ActionLabel";

import css from "./DebateMessage.module.scss";

gsap.registerPlugin(ScrollToPlugin);

interface Prop {
   className?: string;
}

const sections = [
   {
      id: "attack-summary",
      label: "Attack Summary",
   },
   {
      id: "main-arguments",
      label: "Main Arguments",
      children: [
         {
            id: "management",
            label: "Management Is Not Just Coordination",
         },
         {
            id: "accountability",
            label: "Accountability Cannot Be Delegated",
         },
         {
            id: "trust",
            label: "Human Trust Remains Essential",
         },
      ],
   },
   {
      id: "gap-identified",
      label: "Gap Identified",
   },
   {
      id: "impact-on-thesis",
      label: "Impact on Thesis",
   },
   {
      id: "updated-thesis",
      label: "Updated Thesis",
   },
   {
      id: "what-changed",
      label: "What Changed",
   },
   {
      id: "confidence",
      label: "Confidence",
   },
];

export const DebateMessage: React.FC<Prop> = ({ className }) => {
   const router = useRouter();
   const [data, setData] = React.useState<any>(null);
   const [activeSectionId, setActiveSectionId] = React.useState(sections[0].id);
   const bodyRef = React.useRef<HTMLElement | null>(null);

   React.useEffect(() => {
      const saved = sessionStorage.getItem("debate-full-message");

      if (!saved) {
         router.push("/debate");
         return;
      }

      setData(JSON.parse(saved));
   }, [router]);

   const handleScrollTo = (id: string) => {
      const container = bodyRef.current;
      const section = document.getElementById(id);

      if (!container || !section) return;

      setActiveSectionId(id);

      gsap.to(container, {
         duration: 0.8,
         scrollTo: {
            y: section,
            offsetY: 24,
         },
         ease: "power3.out",
      });
   };

   if (!data) return null;

   const round = data.round === "R1" ? "Round 1" : data.round === "R2" ? "Round 2" : data.round;

   return (
      <div className={clsx(css.debate_message, className)}>
         <aside className={css.debate_message_list}>
            <nav className={css.nav}>
               {sections.map((section) => (
                  <div key={section.id} className={css.nav_group}>
                     <button
                        type="button"
                        className={clsx(
                           css.nav_link,
                           activeSectionId === section.id && css.nav_link_active
                        )}
                        onClick={() => handleScrollTo(section.id)}
                     >
                        {section.label}
                     </button>

                     {!!section.children?.length && (
                        <div className={css.nav_children}>
                           {section.children.map((child) => (
                              <button
                                 key={child.id}
                                 type="button"
                                 className={clsx(
                                    css.nav_child,
                                    activeSectionId === child.id && css.nav_child_active
                                 )}
                                 onClick={() => handleScrollTo(child.id)}
                              >
                                 {child.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               ))}
            </nav>
         </aside>

         <main className={css.debate_message_body} ref={bodyRef}>
            <header className={css.header}>
               <div className={css.meta}>
                  <span className={css.round}>{round} —</span>

                  <div className={css.ai}>
                     {data.aiAvatar && <Image.Default src={data.aiAvatar} className={css.avatar} />}
                     <span>{data.aiName}</span>
                  </div>

                  <ActionLabel type={data.action} />
               </div>

               <div className={css.title_block}>
                  <h6 className={css.thesis}>Thesis v1</h6>
                  <h5 className={css.title}>{data.title}</h5>
               </div>
            </header>

            <div className={css.divider} />

            <section id="attack-summary" className={css.section}>
               <h3>Attack Summary</h3>

               <p>
                  The thesis assumes that management is primarily a coordination function. However,
                  middle management also performs political, social, and accountability-related
                  roles that are difficult to automate.
               </p>

               <p>
                  AI can coordinate tasks, schedules, reporting, and workflows, but organizations
                  rely on managers for conflict resolution, performance discussions, trust building,
                  and legal accountability.
               </p>

               <p>
                  The claim therefore overestimates the portion of management that can realistically
                  be replaced by software.
               </p>
            </section>

            <div className={css.divider} />

            <section id="main-arguments" className={css.section}>
               <h3>Main Arguments</h3>

               <div id="management" className={css.subsection}>
                  <h4>1. Management Is Not Just Coordination</h4>
                  <p>
                     The thesis treats management as a collection of operational tasks. In practice,
                     managers act as intermediaries between leadership and execution teams.
                     <br />
                     <br />
                     They translate strategy into action, negotiate priorities, and absorb
                     organizational friction.
                  </p>
               </div>

               <div id="accountability" className={css.subsection}>
                  <h4>2. Accountability Cannot Be Delegated</h4>
                  <p>
                     When critical decisions affect employees, customers, or company outcomes,
                     organizations require a responsible human decision-maker.
                     <br />
                     <br />
                     An AI system cannot currently assume legal or organizational accountability.
                  </p>
               </div>

               <div id="trust" className={css.subsection}>
                  <h4>3. Human Trust Remains Essential</h4>
                  <p>
                     Employees are more willing to accept difficult decisions when those decisions
                     are communicated by a trusted human leader.
                     <br />
                     <br />
                     Replacing that layer entirely may reduce organizational cohesion and trust.
                  </p>
               </div>
            </section>

            <div className={css.divider} />

            <section id="gap-identified" className={css.section}>
               <h3>Gap Identified</h3>
               <h4>Coordination ≠ Management</h4>
               <p>
                  The thesis conflates operational coordination with political and accountability
                  functions.
               </p>
            </section>

            <div className={css.divider} />

            <section id="impact-on-thesis" className={css.section}>
               <h3>Impact on Thesis</h3>
               <p>The original claim appears too broad.</p>
               <p>The next version should distinguish between:</p>

               <ul className={css.dots_list}>
                  <li>Coordination functions</li>
                  <li>Political functions</li>
                  <li>Accountability functions</li>
               </ul>

               <p>
                  and define where AI replacement is realistic and where human involvement remains
                  necessary.
               </p>
            </section>

            <div className={css.divider} />

            <section id="updated-thesis" className={css.section}>
               <h3>Updated Thesis</h3>
               <p>
                  AI is likely to replace a significant portion of coordination-heavy management
                  tasks within the next three years, particularly in small and mid-sized SaaS
                  organizations. <br />
                  <br />
                  However, functions involving political influence, conflict mediation, trust
                  building, and organizational accountability are far less likely to be automated in
                  the same timeframe. <br />
                  <br />
                  Rather than replacing managers entirely, AI will separate management into two
                  layers:
               </p>

               <ol className={css.number_list}>
                  <li>Operational coordination — increasingly automated.</li>
                  <li>Human leadership and accountability — still required.</li>
               </ol>
            </section>

            <div className={css.divider} />

            <section id="what-changed" className={css.section}>
               <h3>What Changed</h3>
               <h4>Before</h4>
               <p>AI will replace middle management within 3 years.</p>

               <h4>After</h4>
               <p>
                  AI will automate coordination-heavy management functions within 3 years, while
                  political and accountability functions remain primarily human..
               </p>
            </section>

            <div className={css.divider} />

            <section id="confidence" className={css.section}>
               <h3>Confidence</h3>
               <p>Medium</p>
               <p>
                  The revised thesis addresses the strongest criticism identified in Round 1, but
                  several open questions remain regarding trust, organizational culture, and legal
                  accountability.
               </p>
            </section>
         </main>
      </div>
   );
};
