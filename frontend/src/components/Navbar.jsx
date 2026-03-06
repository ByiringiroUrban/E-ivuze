import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import NotificationBell from "./NotificationBell";
import MessageIcon from "./MessageIcon";
import AppBarSearch from "./AppBarSearch";
import { useTranslation } from "react-i18next";
import { FaRobot } from "react-icons/fa";
import LanguageSwitch from "./LanguageSwitch";

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);
  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/doctors", label: t("pages.doctors.allDoctors") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  if (token) {
    navLinks.push({ to: "/messages", label: t("nav.messages") || "Messages" });
    navLinks.push({
      to: "/ai-assistant",
      label: t("ai.helpCenter") || "AI Help Center",
    });
  }

  const userQuickLinks = [
    { label: t("nav.profile"), action: () => navigate("/my-profile") },
    { label: t("nav.appointments"), action: () => navigate("/my-appointments") },
    { label: "History", action: () => navigate("/history") },
    { label: "Lab Results", action: () => navigate("/lab-results") },
    { label: t("nav.prescriptions"), action: () => navigate("/my-prescriptions") },
    { label: t("nav.logout"), action: () => logout(), variant: "danger" }
  ];

  return (
    <header className="bg-[#006838] text-white border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 flex flex-wrap items-center gap-4 py-3.5">
        <div className="flex items-center bg-white p-1 rounded-sm cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => navigate("/")}>
          <img src={assets.logo} alt={t("navbar.logoAlt")} className="h-10 w-auto object-contain" />
        </div>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 text-[11px] font-bold tracking-wide text-white/70">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              target={link.to === '/ai-assistant' ? '_blank' : undefined}
              rel={link.to === '/ai-assistant' ? 'noopener noreferrer' : undefined}
              className={({ isActive }) =>
                `transition-all border-b-2 pb-1 ${isActive ? "text-white border-[#88C250]" : "border-transparent text-white/70 hover:text-white hover:border-white/30"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6 text-sm">
          <div className="text-white text-right hidden xl:block leading-tight">
            <div className="text-[12px] font-bold">{t("navbar.contactPhone") || "+250 788 000 000"}</div>
            <div className="text-white/60 text-[10px] tracking-[0.1em] font-medium">{t("navbar.contactEmail") || "support@E-ivuze.rw"}</div>
          </div>

          <LanguageSwitch variant="headerIcon" />

          {token ? (
            <button
              onClick={() => navigate("/my-appointments")}
              className="hidden md:inline-flex bg-[#88C250] text-white px-8 py-2.5 text-[11px] font-bold tracking-wide hover:bg-[#7db445] transition-all rounded-sm shadow-lg active:scale-95"
            >
              {t("buttons.appointment") || "Appointment"}
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="text-white px-4 py-2 text-[11px] font-bold tracking-wide border border-white/30 hover:bg-white/10 transition rounded-sm"
              >
                {t("buttons.signIn") || t("buttons.login")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-[#88C250] text-white px-6 py-2 text-[11px] font-bold tracking-wide hover:bg-[#7db445] transition rounded-sm shadow-lg active:scale-95"
              >
                {t("buttons.register")}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowMenu(true)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition"
            aria-label={t("navbar.menuOpen")}
          >
            <img src={assets.menu_icon} className="w-6 invert brightness-0" alt={t("navbar.menuOpen")} />
          </button>
        </div>
      </div>

      {token && (
        <div className="bg-[#004d2a] text-[11px] tracking-wide text-white shadow-inner border-t border-white/5">
          <div className="max-w-[90rem] mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-6 lg:px-12 py-3">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {userQuickLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`px-4 py-1.5 border text-[10px] font-bold tracking-wide rounded-sm transition-all ${link.variant === 'danger'
                    ? 'border-red-400/30 text-red-300 hover:bg-red-500/20 hover:text-white'
                    : 'border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-5">
              <AppBarSearch variant="dark" className="hidden xl:block" />
              <div className="flex items-center gap-4">
                <MessageIcon />
                <NotificationBell />
              </div>
              <div className="flex items-center gap-3 bg-white/5 pl-4 pr-1 py-1 rounded-sm border border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="font-bold text-[10px] leading-tight">{userData?.name || t("navbar.accountFallback")}</div>
                  <div className="text-white/40 text-[9px] lowercase tracking-normal">Verified Account</div>
                </div>
                <img
                  className="w-9 h-9 object-cover rounded-sm border border-white/20 shadow-sm"
                  src={
                    userData?.image ||
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Vc2VyPC90ZXh0Pjwvc3ZnPg=="
                  }
                  alt={t("navbar.profileAlt")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="fixed top-0 right-0 bottom-0 z-50 bg-white w-72 max-w-full border-l-4 border-primary-dark p-8 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-primary-dark pb-6">
              <img src={assets.logo} alt="Logo" className="h-10" />
              <button onClick={() => setShowMenu(false)} aria-label={t("navbar.menuClose")} className="hover:rotate-90 transition-transform duration-300">
                <img src={assets.cross_icon} alt={t("navbar.menuClose")} className="w-8" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 text-xs tracking-wide text-accent">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMenu(false)}
                  className="py-2 border-b border-light-bg"
                >
                  {link.label}
                </NavLink>
              ))}
              {!token && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate("/register");
                    }}
                    className="mt-6 bg-primary-dark text-white py-4   font-black text-[11px] tracking-widest hover:bg-accent hover:text-primary-dark transition-colors border-2 border-primary-dark"
                  >
                    {t("buttons.register")}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate("/login");
                    }}
                    className="border-2 border-primary-dark text-primary-dark py-4   font-black text-[11px] tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    {t("buttons.signIn") || t("buttons.login")}
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
