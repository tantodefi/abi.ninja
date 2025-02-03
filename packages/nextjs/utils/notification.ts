import { toast } from "react-hot-toast";

type NotificationProps = {
  message: string;
  type: "success" | "error" | "loading" | "info";
  duration?: number;
};

export const notification = {
  success: (message: string, duration = 4000) =>
    toast.success(message, {
      duration,
      position: "bottom-right",
    }),
  error: (message: string, duration = 4000) =>
    toast.error(message, {
      duration,
      position: "bottom-right",
    }),
  info: (message: string, duration = 4000) =>
    toast(message, {
      duration,
      position: "bottom-right",
    }),
  loading: (message: string) =>
    toast.loading(message, {
      position: "bottom-right",
    }),
}; 