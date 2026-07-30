"use client";

import { useState } from "react";
import { Package, FileText, DollarSign, AlertCircle, Building2, Bell, Check, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { markNotificationAsRead, markAllAdminNotificationsAsRead, generateDummyNotification } from "@/lib/actions/notifications";
import { NotificationType } from "@prisma/client";

// Format date nicely (e.g. "2 minutes ago", "1 hour ago", "yesterday")
function formatTimeAgo(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getIconForType(type: NotificationType) {
  switch (type) {
    case "NEW_ORDER":
      return <Package className="h-5 w-5 text-blue-600" />;
    case "NEW_QUOTE":
      return <FileText className="h-5 w-5 text-purple-600" />;
    case "PAYMENT_RECEIVED":
      return <DollarSign className="h-5 w-5 text-emerald-600" />;
    case "BUSINESS_VERIFICATION":
      return <Building2 className="h-5 w-5 text-amber-600" />;
    case "SYSTEM_ALERT":
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Bell className="h-5 w-5 text-slate-600" />;
  }
}

export function NotificationsClient({ 
  initialNotifications, 
  currentPage, 
  totalPages 
}: { 
  initialNotifications: any[],
  currentPage: number,
  totalPages: number
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasUnread = notifications.some(n => !n.isRead);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    
    await markNotificationAsRead(id);
    router.refresh(); // To update the topbar bell badge
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    await markAllAdminNotificationsAsRead();
    setIsMarkingAll(false);
    router.refresh(); // To update the topbar bell badge
  };

  const handlePageChange = (page: number) => {
    router.push(`/admin/notifications?page=${page}`);
  };

  const handleGenerateDummy = async () => {
    setIsGenerating(true);
    await generateDummyNotification();
    setIsGenerating(false);
    router.refresh();
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-medium text-slate-700">Semua Notifikasi</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            onClick={handleGenerateDummy}
            disabled={isGenerating}
          >
            {isGenerating ? "Membuat..." : "+ Simulasi Notifikasi"}
          </Button>
          {hasUnread && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? "Menandai..." : "Tandai Semua Dibaca"}
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-slate-500 space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-slate-900">Belum ada notifikasi</p>
              <p className="text-sm text-slate-500">Anda telah membaca semua pesan dan peringatan sistem.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div key={notification.id} className="relative group">
                {notification.linkUrl ? (
                  <Link 
                    href={notification.linkUrl}
                    onClick={() => {
                      if (!notification.isRead) handleMarkAsRead(notification.id);
                    }}
                    className={cn(
                      "flex items-start gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors",
                      !notification.isRead ? "bg-blue-50/30" : ""
                    )}
                  >
                    <div className={cn(
                      "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white shadow-sm",
                      !notification.isRead ? "bg-white" : "bg-slate-100"
                    )}>
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-12">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm sm:text-base line-clamp-1", 
                          !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 md:line-clamp-none">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                ) : (
                  <div className={cn(
                    "flex items-start gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors",
                    !notification.isRead ? "bg-blue-50/30" : ""
                  )}>
                    <div className={cn(
                      "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white shadow-sm",
                      !notification.isRead ? "bg-white" : "bg-slate-100"
                    )}>
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-12">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm sm:text-base", 
                          !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        title="Tandai dibaca"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Sebelumnya
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="bg-white"
            >
              Selanjutnya <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
