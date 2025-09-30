import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X,
  Sparkles
} from "lucide-react";

const AlertGlobal = ({ alert, setAlert, autoHideDuration = 4000 }) => {
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [alert.show, autoHideDuration, setAlert]);

  if (!alert.show) return null;

  const alertConfig = {
    success: {
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-800",
      icon: CheckCircle,
      ringColor: "ring-green-200"
    },
    error: {
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      textColor: "text-red-800",
      icon: AlertCircle,
      ringColor: "ring-red-200"
    },
    warning: {
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-800",
      icon: AlertTriangle,
      ringColor: "ring-yellow-200"
    },
    info: {
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
      icon: Info,
      ringColor: "ring-blue-200"
    }
  };

  const config = alertConfig[alert.severity] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-md pointer-events-none">
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
            className="pointer-events-auto"
          >
            {/* Main Alert Card */}
            <div className={`relative bg-gradient-to-r ${config.bgGradient} backdrop-blur-xl rounded-3xl shadow-2xl border-2 ${config.borderColor} overflow-hidden`}>
              
              {/* Animated Top Border */}
              <motion.div 
                className={`h-1 bg-gradient-to-r ${config.gradient}`}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoHideDuration / 1000, ease: "linear" }}
              />

              {/* Content */}
              <div className="p-4 flex items-start gap-4">
                {/* Icon Container */}
                <motion.div 
                  className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.1 
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-1">
                  {alert.title && (
                    <motion.h3 
                      className={`text-lg font-bold ${config.textColor} mb-1`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {alert.title}
                    </motion.h3>
                  )}
                  <motion.p 
                    className={`text-sm ${config.textColor} leading-relaxed`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {alert.message}
                  </motion.p>
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={() => setAlert((prev) => ({ ...prev, show: false }))}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl bg-white/50 hover:bg-white flex items-center justify-center transition-all duration-300 group ${config.ringColor} hover:ring-2`}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className={`w-4 h-4 ${config.iconColor}`} />
                </motion.button>
              </div>

              {/* Sparkle Effect for Success */}
              {alert.severity === 'success' && (
                <>
                  <motion.div
                    className="absolute top-2 right-12"
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-2 right-20"
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      rotate: [0, -180, -360]
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </motion.div>
                </>
              )}

              {/* Pulse Effect for Error */}
              {alert.severity === 'error' && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20 rounded-3xl`}
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>

            {/* Shadow Effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-xl opacity-30 -z-10 rounded-3xl`}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertGlobal;