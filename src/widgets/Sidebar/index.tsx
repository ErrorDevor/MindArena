"use client";

import React from "react";

import clsx from "clsx";

import { sidebarData } from "shared/data/data";
import Accordion from "shared/ui/base/Accordion";
import Image from "shared/ui/base/Image";
import { DropdownArrowIcon } from "shared/ui/icons";
import { LiveLabel } from "shared/ui/ui-kit/LiveLabel";
import { Tag } from "shared/ui/ui-kit/Tag";
import { Topic } from "shared/ui/ui-kit/Topic";

import css from "./Sidebar.module.scss";

interface Props {
   collapsed: boolean;
   onToggleCollapsed: () => void;
   className?: string;
}

export const Sidebar: React.FC<Props> = ({ className, collapsed, onToggleCollapsed }) => {
   const [activeTopicId, setActiveTopicId] = React.useState(
   sidebarData.topics[0]?.id
);

   return (
      <aside className={clsx(css.sidebar, className)}>
         <div className={css.sidebar_top}>
            {!collapsed && <h5>MENU</h5>}

            <button
               className={clsx(css.sidebar_button, collapsed && css.sidebar_button_collapsed)}
               onClick={onToggleCollapsed}
            >
               <DropdownArrowIcon />
            </button>
         </div>

         <div className={css.sidebar_content}>
            <Accordion smooth initialOpen>
               {({ active }) => (
                  <>
                     <Accordion.Button>
                        <button className={css.nav_button}>
                           <DropdownArrowIcon
                              style={{ transform: active ? "rotate(90deg)" : undefined }}
                           />
                           All topics
                        </button>
                     </Accordion.Button>

                     <Accordion.Content>
                        <div className={css.nav_content}>
                           {sidebarData.topics.map((item, index) => (
   <Topic
      key={item.id}
      index={index}
      topic={item.topic}
      count={item.count}
      active={activeTopicId === item.id}
      onClick={() => setActiveTopicId(item.id)}
   />
))}
                        </div>
                     </Accordion.Content>
                  </>
               )}
            </Accordion>

            <Accordion smooth initialOpen>
               {({ active }) => (
                  <>
                     <Accordion.Button>
                        <button className={css.nav_button}>
                           <DropdownArrowIcon
                              style={{ transform: active ? "rotate(90deg)" : undefined }}
                           />
                           My Debates
                        </button>
                     </Accordion.Button>

                     <Accordion.Content>
                        <ul className={css.nav_content}>
                           <li className={css.debates_item}>
                              <Image.Default src="/icons/active.svg" />
                              <p>Active</p>
                           </li>
                           <li className={css.debates_item}>
                              <Image.Default src="/icons/done-check.svg" />
                              <p>Completed</p>
                           </li>
                           <li className={css.debates_item}>
                              <Image.Default src="/icons/eye-slash.svg" />
                              <p>Private</p>
                           </li>
                        </ul>
                     </Accordion.Content>
                  </>
               )}
            </Accordion>

            <Accordion smooth initialOpen>
               {({ active }) => (
                  <>
                     <Accordion.Button>
                        <button className={css.nav_button}>
                           <DropdownArrowIcon
                              style={{ transform: active ? "rotate(90deg)" : undefined }}
                           />
                           Live now
                        </button>
                     </Accordion.Button>

                     <Accordion.Content>
                        <div className={css.nav_content}>
                           {sidebarData.live.map((item) => (
                              <LiveLabel liveName={item.name} key={item.id} />
                           ))}
                        </div>
                     </Accordion.Content>
                  </>
               )}
            </Accordion>

            <Accordion smooth initialOpen>
               {({ active }) => (
                  <>
                     <Accordion.Button>
                        <button className={css.nav_button}>
                           <DropdownArrowIcon
                              style={{ transform: active ? "rotate(90deg)" : undefined }}
                           />
                           Tags
                        </button>
                     </Accordion.Button>

                     <Accordion.Content>
                        <div className={css.nav_content}>
                           {sidebarData.tags.map((item) => (
                              <Tag key={item.id} tag={item.tag} />
                           ))}
                        </div>
                     </Accordion.Content>
                  </>
               )}
            </Accordion>
         </div>
      </aside>
   );
};
