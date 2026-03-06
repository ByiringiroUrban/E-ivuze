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
    <section className="bg-[#14324f] text-white border border-white/10 roun-2xl p-8 relative overflow-hidden">
      <IconTexture
        opacity={0.08}
        size={22}
        className="text-white absolute inset-0 pointer-events-none"
      />
      <div
        className={`relative z-10 flex flex-col gap-4 ${align === "center" ? "text-center items-center" : ""
          }`}
      >
        {eyebrow && (
          <p className="text-[11px]   tracking-[0.45em] text-white/70">
            {eyebrow}
          </p>
        )}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">
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

