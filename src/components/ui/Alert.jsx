import React from "react";

export const Alert = ({ variant = "default", children }) => {
  const variants = {
    default: "bg-blue-100 border-blue-400 text-blue-700",
    destructive: "bg-red-100 border-red-400 text-red-700",
  };

  return (
    <div className={`${variants[variant]} px-4 py-3 rounded relative mt-4 border`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <p className="text-sm">{children}</p>;
}; 