import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function ToastNotification({
  message,
  isVisible,
  onClose,
  autoHideDuration = 3000,
}: ToastNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          onClose();
        }, 300); // Animation duration
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoHideDuration]);

  if (!isVisible && !isExiting) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 p-4 bg-white text-gray-800 rounded-lg shadow-lg flex items-center space-x-3 transform transition-transform duration-300",
        isExiting ? "translate-y-24" : "translate-y-0"
      )}
    >
      <i className="fas fa-check-circle text-secondary text-xl"></i>
      <span>{message}</span>
      <button
        className="ml-2 text-gray-500 hover:text-gray-700"
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        aria-label="Close notification"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
