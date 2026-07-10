import React from "react";
import { X } from "lucide-react";
import { Card } from "./Card";
import { motion, AnimatePresence } from "motion/react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Dialog Card Spring Zoom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.15 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <Card className="p-6 shadow-2xl w-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
              {children}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
