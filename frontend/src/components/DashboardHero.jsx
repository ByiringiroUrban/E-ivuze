import React from "react";
import IconTexture from "./IconTexture";

const DashboardHero = ({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  children,
}) => {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-8 relative overflow-hidden shadow-sm">
      <IconTexture
        opacity={0.06}
        size={22}
        className="text-[#064e3b] absolute inset-0 pointer-events-none"
      />
      <div
        className={`relative z-10 flex flex-col gap-4 ${align === "center" ? "text-center items-center" : ""
          }`}
      >
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.45em] text-[#064e3b]">
            {eyebrow}
          </p>
        )}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-500 max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default DashboardHero;

