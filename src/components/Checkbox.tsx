import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  id: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-2 flex items-center">
      <input
        type="checkbox"
        id={id}
        className={clsx(
          "accent-primary-500 size-6 hover:cursor-pointer",
          className
        )}
        {...props}
      />
      <label className="px-3 hover:cursor-pointer" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
