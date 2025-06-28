import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { notificationApi, Notification } from "@/services/notificationApi";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(user?.role || null);
    } catch {
      setUserRole(null);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notifications on component mount and set up auto-refresh
  useEffect(() => {
    fetchNotifications();
    
    // Set up auto-refresh every 5 seconds for faster updates
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // 5 seconds for more responsive updates

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Expose refresh function globally so other components can trigger it
  useEffect(() => {
    (window as any).refreshNotifications = fetchNotifications;
    return () => {
      delete (window as any).refreshNotifications;
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      // Immediately update the UI state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    // Only allow admins to delete notifications
    if (userRole !== 'admin') {
      toast.error("Only farm owners can delete notifications");
      return;
    }

    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(parseISO(notification.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            >
                              ✓
                            </Button>
                          )}
                          {/* Only show delete button for admins */}
                          {userRole === 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 