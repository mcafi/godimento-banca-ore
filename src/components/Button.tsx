import clsx from "clsx";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
};

const variantClasses = {
  primary: "bg-primary-600 hover:bg-primary-500",
  secondary: "bg-yellow-600 hover:bg-yellow-500",
  danger: "bg-red-600 hover:bg-red-500",
};

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", ...props }) => {
  return (
    <button
      type="button"
      className={clsx(
        "text-white px-4 py-2 rounded-lg hover:cursor-pointer transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950",
        variantClasses[variant],
        props.className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
