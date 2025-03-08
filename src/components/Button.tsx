import clsx from "clsx";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  ...props
}) => {
  const buttonClass =
    variant === "primary" ? "bg-primary-600" : "bg-yellow-600";
  return (
    <button
      type="button"
      className={clsx(
        "text-white px-4 py-2 rounded-lg hover:cursor-pointer transition-all",
        buttonClass
      )}
      {...props}
    >
      {children}
    </button>
  );
};
