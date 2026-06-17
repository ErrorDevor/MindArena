"use client";

import React from "react";

import clsx from "clsx";

import { CommentsType } from "shared/lib/types/types";
import Image from "shared/ui/base/Image";
import { UserInfo } from "shared/ui/components/UserInfo";
import { AccountButton } from "shared/ui/ui-kit/AccountButton";

import css from "./CommentBlock.module.scss";

interface Prop {
   className?: string;
   comment: CommentsType;
}

export const CommentBlock: React.FC<Prop> = ({ className, comment }) => {
   return (
      <div className={clsx(css.comment_block, className)}>
         <UserInfo
            userName={comment.user.userName}
            expert={comment.user.expert}
            userAvatar={comment.user.userPhoto}
            variant="full"
            role={comment.user.role}
            inquiries={comment.user.inquiries}
         />

         <p className={css.comment_block_text}>{comment.comment}</p>
      </div>
   );
};
