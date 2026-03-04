import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View className="absolute top-12 items-center mx-5 h-full">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type }: { message: string; type: ToastType }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        delay: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bg =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <Animated.View
      style={{ opacity }}
      className={`mb-2 rounded-2xl px-4 py-3 bg-red-300 shadow-md mx-5`}
    >
      <TouchableOpacity>
        <Text className="text-white text-center font-medium">{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
