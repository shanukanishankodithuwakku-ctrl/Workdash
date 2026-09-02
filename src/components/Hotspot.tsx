import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface HotspotProps {
  id: string;
  tip: string;
  actionText?: string;
  onActionClick?: () => void;
  // Position of the hotspot relative to the parent container
  className?: string; 
  // Preferred orientation of the tooltip relative to the hotspot dot
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  // To track dismiss state
  onDismiss: () => void;
}

export function Hotspot({
  id,
  tip,
  actionText = "Got it!",
  onActionClick,
  className = "absolute top-4 right-4",
  tooltipPosition = "bottom",
  onDismiss,
}: HotspotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isVisible = isHovered || isOpen;

  // Tooltip position classes
  const getTooltipClasses = () => {
    switch (tooltipPosition) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-3";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-3";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-3";
      case "bottom":
      default:
        return "top-full left-1/2 -translate-x-1/2 mt-3";
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick();
    }
    onDismiss();
  };

  const handleDismissOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  };

  return (
    <div 
      ref={containerRef}
      className={`z-30 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation(); // don't trigger parent card click immediately
        setIsOpen(!isOpen);
      }}
    >
      <div className="relative flex items-center justify-center cursor-pointer group">
        {/* Continuous pulsing ring */}
        <motion.div
          className="absolute w-7 h-7 rounded-full bg-[#00B388]/30 border border-[#00B388]/20"
          animate={{
            scale: [0.95, 1.8, 0.95],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Inner solid high-contrast dot */}
        <div className="relative w-3 h-3 rounded-full bg-[#00B388] border border-[#161C24] shadow-lg shadow-[#00B388]/60 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full animate-ping" />
        </div>

        {/* Ambient Tooltip Container with AnimatePresence */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: tooltipPosition === "bottom" ? -5 : 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`absolute w-[240px] p-3.5 rounded-xl border border-[#222C38] bg-[#161C24]/95 backdrop-blur-md shadow-2xl z-40 text-left pointer-events-auto ${getTooltipClasses()}`}
              onClick={(e) => e.stopPropagation()} // Prevent closing on clicking inside tooltip
            >
              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00B388]" />
                  <span className="text-[10px] font-bold tracking-wider text-[#00B388] uppercase font-mono">
                    Quick Discovery
                  </span>
                </div>
                <button 
                  onClick={handleDismissOnly}
                  className="p-0.5 rounded-md hover:bg-[#232D3B] text-[#8F9CA9] hover:text-[#F8FAFC] transition"
                  title="Dismiss help"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-[#F8FAFC] font-sans">
                {tip}
              </p>

              <div className="mt-2.5 pt-2 border-t border-[#222C38] flex items-center justify-between gap-2">
                <button
                  onClick={handleDismissOnly}
                  className="text-[9px] font-bold text-[#8F9CA9] hover:text-[#F8FAFC] font-mono transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleAction}
                  className="px-2.5 py-1 bg-[#00B388] hover:bg-[#009E78] text-white text-[9px] font-bold rounded-lg transition flex items-center gap-1 shadow-sm shadow-[#00B388]/10"
                >
                  <span>{actionText}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
