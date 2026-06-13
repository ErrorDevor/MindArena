"use client";

import React, { HTMLProps } from "react";

import Link, { LinkProps } from "next/link";
import { Url } from "url";

export type NextLinkProps = Omit<LinkProps, "href"> &
  Omit<HTMLProps<HTMLAnchorElement>, "classID"> & {
    href?: string | Url;
    disabled?: boolean;
  };

export const NextLink: React.FC<NextLinkProps> = ({ prefetch, disabled, ...props }) => {
  const handleClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(ev);
    if (disabled) {
      ev.preventDefault();
    }
  };
  if (props.href) {
    return (
      <Link
        {...(props as any)}
        href={props.href}
        onClick={handleClick}
        prefetch={prefetch || false}
      />
    );
  }
  return <a {...props} href={props.href} onClick={handleClick} />;
};
