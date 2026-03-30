import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const CustomDialog = ({ isOpen, onClose, title, description, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "-100%" }}
        transition={{ duration: 0.2 }}
        className="bg-background-paper text-text-primary rounded-xl shadow-xl max-w-md w-full p-6 relative border border-neutral-200 dark:border-neutral-700"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5 text-text-primary" />
        </button>

        {title && (
          <h2 className="text-lg font-semibold text-primary-700 dark:text-primary-400">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}

        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </motion.div>
    </div>
  );
};

export default CustomDialog;