import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { notificationApi } from "@/services/notificationApi";

interface NotificationContextValue {
  unreadCount: number;
  notifications: NotificationItem[];
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
  connected: boolean;
}

export interface NotificationItem {
  recipient_id: number;
  id: number;
  type: string;
  type_display: string;
  title: string;
  message: string;
  priority: string;
  priority_display: string;
  read_status: string;
  read_at: string | null;
  delivery_status: string;
  sender: string | null;
  created_at: string;
  expires_at: string | null;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: () => {},
  refreshUnreadCount: async () => {},
  connected: false,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.unreadCount();
      setUnreadCount(res.count);
    } catch {
      // silent fail
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setConnected(false);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    refreshUnreadCount();

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = "localhost:8000";
      const ws = new WebSocket(`${protocol}//${host}/ws/notifications/?token=${token}`);

      ws.onopen = () => {
        setConnected(true);
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "unread_count") {
            setUnreadCount(msg.data.count);
          } else if (msg.type === "notification") {
            setNotifications(prev => [msg.data, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
          }
        } catch {
          // silent
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, setUnreadCount, refreshUnreadCount, connected }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}