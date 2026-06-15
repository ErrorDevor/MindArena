"use client";

import React from "react";

import clsx from "clsx";

import Image from "shared/ui/base/Image";
import { NextLink } from "shared/ui/base/NextLink";
import { Search } from "shared/ui/components/Search";
import {
   FeedIcon,
   NotifyIcon,
   PlusIcon,
   ResearchIcon,
   RoomsIcon,
   WrenchIcon,
} from "shared/ui/icons";
import { AccountButton } from "shared/ui/ui-kit/AccountButton";
import { Button } from "shared/ui/ui-kit/Button";
import { NotifyButton } from "shared/ui/ui-kit/NotifyButton";

import css from "./Header.module.scss";

export const Header: React.FC = () => {
   return (
      <header className={css.header}>
         <div className={css.header_left_side}>
            <NextLink href="/" className={css.header_logo}>
               <Image.Default src="/images/Logo.svg" />
               Mind Arena
            </NextLink>

            <div className={css.divider} />

            <div className={css.header_action_buttons}>
               <Button variant="white" className={css.button_action} active>
                  <FeedIcon />
                  Feed
               </Button>
               <Button variant="white" className={css.button_action}>
                  <ResearchIcon />
                  Research
               </Button>
               <Button variant="white" className={css.button_action}>
                  <RoomsIcon />
                  Rooms
               </Button>
            </div>
         </div>

         <Search />

         <div className={css.header_right_side}>
            <div className={css.header_main_buttons}>
               <Button variant="blue" className={css.button_build}>
                  <WrenchIcon /> Build Room
               </Button>
               <Button variant="black" className={css.button_inquiry}>
                  <PlusIcon />
                  Inquiry
               </Button>
            </div>

            <div className={css.divider} />

            <div className={css.header_account_block}>
               <NotifyButton icon={<NotifyIcon />} count={2} />

               <AccountButton avatar={<Image.Default src="/images/avatar.png" />} />
            </div>
         </div>
      </header>
   );
};
