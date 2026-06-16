"use client";

import React from "react";

import clsx from "clsx";

import { CommentsType } from "shared/lib/types/types";
import Image from "shared/ui/base/Image";
import { AccountButton } from "shared/ui/ui-kit/AccountButton";

import css from "./CommentBlock.module.scss";

interface Prop {
   className?: string;
   comment: CommentsType;
}

export const CommentBlock: React.FC<Prop> = ({ className, comment }) => {
   return (
      <div className={clsx(css.comment_block, className)}>
         <AccountButton avatar={<Image.Default src={comment.user.userPhoto} />} />

         <div className={css.comment_block_main}>
            <div className={css.comment_block_user}>
               <div className={css.comment_block_user_title}>
                  <a>{comment.user.userName}</a>

                  {comment.user.expert && <div className={css.expert}>Expert</div>}
               </div>

               <div className={css.comment_block_user_role}>
                  <h6>{comment.user.role}</h6>

                  {comment.user.inquiries && (
                     <>
                        <div className={css.dot} /> <h6>{comment.user.inquiries} inquiries</h6>
                     </>
                  )}
               </div>
            </div>

            <p className={css.comment_block_text}>{comment.comment}</p>
         </div>
      </div>
   );
};
