/*
 * Design: Earth & Breath — Organic Modernism
 * Navbar: Top bar for desktop, fixed bottom tab bar for mobile
 * Mobile bottom bar shows 5 key sections with icons for instant discoverability
 */
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";

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

// Bottom tab items — the 5 most important sections + "More" for the rest
const bottomTabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Asanas", href: "/explore", icon: Compass },
  { label: "Surya", href: "/surya-namaskar", icon: Sun },
  { label: "Flows", href: "/vinyasa", icon: Activity },
  { label: "More", href: "__more__", icon: MoreHorizontal },
];

// Items shown in the "More" sheet
const moreItems = [
  { label: "Pranayama", href: "/pranayama", icon: Wind },
  { label: "Meditation", href: "/meditation", icon: Brain },
  { label: "Safety Guide", href: "/safety", icon: Shield },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleStartAssessment = () => {
    if (location === "/") {
      window.dispatchEvent(new CustomEvent("start-assessment"));
    }
  };

  // Check if current location matches any of the "more" items
  const isMoreActive = moreItems.some((item) => location === item.href);

  return (
    <>
      {/* ===== TOP BAR (visible on all screens) ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center">
              <Leaf className="w-5 h-5 text-cream" />
            </div>
            <span className="font-serif text-xl font-semibold text-forest-dark tracking-tight">
              YogaPath
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
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
                </Link>
              );
            })}
          </div>

          <Link href="/" onClick={handleStartAssessment}>
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-forest text-cream text-sm font-semibold rounded-full hover:bg-forest-light transition-colors"
            >
              Start Assessment
            </motion.span>
          </Link>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-stretch justify-around px-1 h-16">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isMore = tab.href === "__more__";
            const isActive = isMore
              ? isMoreActive || moreOpen
              : location === tab.href;

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors rounded-lg mx-0.5 ${
                    isActive
                      ? "text-forest-dark"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-forest" />
                  )}
                </button>
              );
            }

            return (
              <Link key={tab.href} href={tab.href}>
                <button
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors rounded-lg mx-0.5 relative ${
                    isActive
                      ? "text-forest-dark"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-forest" />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== "MORE" BOTTOM SHEET ===== */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-cream rounded-t-2xl border-t border-border shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-forest-dark">More Sections</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-1.5 rounded-full hover:bg-sage-light transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-colors ${
                          isActive
                            ? "bg-sage-light text-forest-dark"
                            : "bg-card hover:bg-sage-light/50 text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5 text-forest" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>

              {/* Start Assessment button in More sheet */}
              <Link href="/" onClick={handleStartAssessment}>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-full mt-3 px-4 py-3 bg-forest text-cream text-sm font-semibold rounded-xl text-center"
                >
                  Start Assessment
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
