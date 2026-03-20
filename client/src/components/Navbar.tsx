/*
 * Design: Earth & Breath — Organic Modernism
 * Navbar: Clean top bar + polished fixed bottom tab bar on mobile/tablet
 * Desktop (lg+): full horizontal nav in top bar, no bottom bar
 * Mobile/Tablet (<lg): logo + assess button in top bar, bottom tab bar for navigation
 */
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Home,
  Compass,
  Sun,
  Wind,
  Activity,
  Brain,
  Shield,
  BarChart3,
  Sparkles,
  Grid3X3,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Explore Asanas", href: "/explore" },
  { label: "Surya Namaskar", href: "/surya-namaskar" },
  { label: "Vinyasa Flows", href: "/vinyasa" },
  { label: "Pranayama", href: "/pranayama" },
  { label: "Meditation", href: "/meditation" },
  { label: "Safety Guide", href: "/safety" },
  { label: "Dashboard", href: "/dashboard" },
];

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bottomTabs: TabItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Asanas", href: "/explore", icon: Compass },
  { label: "Surya", href: "/surya-namaskar", icon: Sun },
  { label: "Flows", href: "/vinyasa", icon: Activity },
  { label: "Breathe", href: "/pranayama", icon: Wind },
];

const moreItems: TabItem[] = [
  { label: "Meditation", href: "/meditation", icon: Brain },
  { label: "Safety", href: "/safety", icon: Shield },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

/* Simple nav helper — avoids nesting <a> inside <a> */
function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [, navigate] = useLocation();
  return (
    <button
      onClick={() => {
        onClick?.();
        navigate(href);
      }}
      className={className}
    >
      {children}
    </button>
  );
}

export default function Navbar() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleStartAssessment = () => {
    if (location === "/") {
      window.dispatchEvent(new CustomEvent("start-assessment"));
    } else {
      navigate("/");
    }
  };

  const isMoreActive = moreItems.some((item) => location === item.href);

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <NavLink href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-forest flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 lg:w-5 lg:h-5 text-cream" />
            </div>
            <span className="font-serif text-lg lg:text-xl font-semibold text-forest-dark tracking-tight">
              YogaPath
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <NavLink key={item.href} href={item.href}>
                  <span
                    className={`relative px-2.5 py-2 text-[13px] font-medium rounded-full transition-colors ${
                      isActive
                        ? "text-forest-dark"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-sage-light rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartAssessment}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-forest text-cream text-sm font-semibold rounded-full hover:bg-forest-light transition-colors"
          >
            Start Assessment
          </motion.button>

          {/* Mobile: Assess button */}
          <button
            onClick={handleStartAssessment}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-forest text-cream text-xs font-semibold rounded-full active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Assess
          </button>
        </div>
      </nav>

      {/* ===== MOBILE / TABLET BOTTOM TAB BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        {/* "More" panel */}
        <AnimatePresence>
          {moreOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="more-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setMoreOpen(false)}
              />
              {/* Panel */}
              <motion.div
                key="more-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-50 mx-3 mb-2 bg-cream rounded-2xl border border-border shadow-lg overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-forest-dark uppercase tracking-wider">
                      More
                    </span>
                    <button
                      onClick={() => setMoreOpen(false)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-sage-light/80 hover:bg-sage-light transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-forest-dark" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {moreItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            setMoreOpen(false);
                            navigate(item.href);
                          }}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all ${
                            isActive
                              ? "bg-forest text-cream"
                              : "bg-sage-light/50 text-foreground hover:bg-sage-light"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-[11px] font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main tab row */}
        <div className="bg-cream border-t border-border">
          <div
            className="grid h-16"
            style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
          >
            {bottomTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location === tab.href;
              return (
                <button
                  key={tab.href}
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(tab.href);
                  }}
                  className="flex flex-col items-center justify-center gap-1 relative"
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-forest"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-forest-dark"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  </div>
                  <span
                    className={`text-[10px] leading-none transition-colors ${
                      isActive
                        ? "font-bold text-forest-dark"
                        : "font-medium text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* More tab */}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              {(isMoreActive && !moreOpen) && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-forest"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                  moreOpen || isMoreActive
                    ? "text-forest-dark"
                    : "text-muted-foreground"
                }`}
              >
                {moreOpen ? (
                  <X className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Grid3X3 className={`w-5 h-5 ${isMoreActive ? "stroke-[2.5]" : ""}`} />
                )}
              </div>
              <span
                className={`text-[10px] leading-none transition-colors ${
                  moreOpen || isMoreActive
                    ? "font-bold text-forest-dark"
                    : "font-medium text-muted-foreground"
                }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
