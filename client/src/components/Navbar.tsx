/*
 * Design: Earth & Breath — Organic Modernism
 * Navbar: Warm cream background with forest green accents, organic feel
 * Typography: Fraunces for brand, Plus Jakarta Sans for nav items
 */
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
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

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleStartAssessment = () => {
    if (location === "/") {
      // Already on home — dispatch a custom event that Home listens for
      window.dispatchEvent(new CustomEvent("start-assessment"));
    }
    // If not on home, the Link will navigate there and the hero has the button
  };

  return (
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

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-sage-light transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden bg-cream/95 backdrop-blur-lg border-b border-border px-4 pb-4"
        >
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "bg-sage-light text-forest-dark"
                      : "text-muted-foreground hover:bg-sage-light/50"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link href="/" onClick={handleStartAssessment}>
            <span
              onClick={() => setMobileOpen(false)}
              className="block mt-2 px-4 py-3 bg-forest text-cream text-sm font-semibold rounded-xl text-center"
            >
              Start Assessment
            </span>
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
