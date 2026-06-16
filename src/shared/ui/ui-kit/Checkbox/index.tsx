"use client";

import React from "react";

import clsx from "clsx";

import css from "./Checkbox.module.scss";

interface CheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "alt";
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  variant = "default",
}) => {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        css.checkbox,
        checked && css.checked,
        disabled && css.disabled,
        className,
        css[`variant_${variant}`]
      )}
    >
      <div className={clsx(css.checkbox_border, checked && css.checked_border)}>
        <span className={css.checkmark} />
      </div>
    </button>
  );
};
