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
  return (
    <button
      type="button"
      className="text-white bg-lime-900 px-4 py-2 rounded-lg hover:cursor-pointer drop-shadow-[0_0_15px_rgba(25,46,3,0)] hover:drop-shadow-[0_0_15px_rgb(25,46,3)] transition-all"
      {...props}
    >
      {children}
    </button>
  );
};
