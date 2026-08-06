"use client";

import { useState, useTransition } from "react";
import {
  Package, FileText, DollarSign, AlertCircle, Building2, Bell, Check,
  Trash2, ArrowLeft, ArrowRight, TrendingDown, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  markNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "@/lib/actions/notifications";
import { NotificationType } from "@prisma/client/browser";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeAgo(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Baru saja";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getIconForType(type: NotificationType) {
  switch (type) {
    case "NEW_ORDER":         return <Package    className="h-5 w-5 text-red-600" />;
    case "NEW_QUOTE":         return <FileText   className="h-5 w-5 text-purple-600" />;
    case "PAYMENT_RECEIVED":  return <DollarSign className="h-5 w-5 text-emerald-600" />;
    case "BUSINESS_VERIFICATION": return <Building2  className="h-5 w-5 text-amber-600" />;
    case "LOW_STOCK_ALERT":   return <TrendingDown className="h-5 w-5 text-orange-600" />;
    case "SYSTEM_ALERT":      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:                  return <Bell       className="h-5 w-5 text-slate-600" />;
  }
}

function getIconBg(type: NotificationType, unread: boolean) {
  if (!unread) return "bg-slate-100";
  switch (type) {
    case "NEW_ORDER":         return "bg-red-50";
    case "NEW_QUOTE":         return "bg-purple-50";
    case "PAYMENT_RECEIVED":  return "bg-emerald-50";
    case "BUSINESS_VERIFICATION": return "bg-amber-50";
    case "LOW_STOCK_ALERT":   return "bg-orange-50";
    case "SYSTEM_ALERT":      return "bg-red-50";
    default:                  return "bg-slate-50";
  }
}

function getDotColor(type: NotificationType) {
  switch (type) {
    case "NEW_ORDER":         return "bg-red-600";
    case "NEW_QUOTE":         return "bg-purple-600";
    case "PAYMENT_RECEIVED":  return "bg-emerald-600";
    case "BUSINESS_VERIFICATION": return "bg-amber-500";
    case "LOW_STOCK_ALERT":   return "bg-orange-500";
    case "SYSTEM_ALERT":      return "bg-red-600";
    default:                  return "bg-slate-400";
  }
}

// ─── Filter tabs definition ───────────────────────────────────────────────────

const FILTER_TABS = [
  { value: "all",                   label: "Semua" },
  { value: "unread",                label: "Belum Dibaca" },
  { value: "NEW_ORDER",             label: "Pesanan" },
  { value: "NEW_QUOTE",             label: "RFQ" },
  { value: "PAYMENT_RECEIVED",      label: "Pembayaran" },
  { value: "BUSINESS_VERIFICATION", label: "Verifikasi" },
  { value: "sistem",                label: "Sistem" },
] as const;

type FilterValue = typeof FILTER_TABS[number]["value"];

const EMPTY_MESSAGES: Record<FilterValue, { title: string; desc: string }> = {
  all:                   { title: "Belum ada notifikasi",       desc: "Semua aktivitas sistem akan muncul di sini." },
  unread:                { title: "Tidak ada notifikasi baru",  desc: "Anda telah membaca semua pemberitahuan." },
  NEW_ORDER:             { title: "Belum ada pesanan baru",     desc: "Notifikasi pesanan baru akan muncul di sini." },
  NEW_QUOTE:             { title: "Belum ada permintaan RFQ",   desc: "Permintaan penawaran dari pelanggan B2B akan muncul di sini." },
  PAYMENT_RECEIVED:      { title: "Belum ada pembayaran",       desc: "Konfirmasi pembayaran akan muncul di sini." },
  BUSINESS_VERIFICATION: { title: "Tidak ada pengajuan baru",   desc: "Pendaftaran akun bisnis yang menunggu verifikasi akan muncul di sini." },
  sistem:                { title: "Tidak ada peringatan sistem", desc: "Peringatan stok rendah dan sistem akan muncul di sini." },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationsClient({
  initialNotifications,
  currentPage,
  totalPages,
  currentFilter,
}: {
  initialNotifications: any[];
  currentPage: number;
  totalPages: number;
  currentFilter: string;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasUnread = notifications.some(n => !n.isRead);
  const hasRead   = notifications.some(n =>  n.isRead);

  const activeFilter = (FILTER_TABS.find(t => t.value === currentFilter)?.value ?? "all") as FilterValue;
  const emptyMsg = EMPTY_MESSAGES[activeFilter];

  // ── Navigation helpers ────────────────────────────────────────────────────

  const buildUrl = (overrides: { page?: number; filter?: string }) => {
    const p = overrides.page   ?? currentPage;
    const f = overrides.filter ?? currentFilter;
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (f !== "all") params.set("filter", f);
    const qs = params.toString();
    return `/admin/notifications${qs ? `?${qs}` : ""}`;
  };

  const navigate = (url: string) => {
    startTransition(() => router.push(url));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
    router.refresh();
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAdminNotificationsAsRead();
    router.refresh();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id);
    setDeletingId(null);
    router.refresh();
  };

  const handleDeleteAllRead = async () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    await deleteAllReadNotifications();
    router.refresh();
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate(buildUrl({ filter: tab.value, page: 1 }))}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                activeFilter === tab.value
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            {FILTER_TABS.find(t => t.value === activeFilter)?.label ?? "Semua"}
          </span>
          <div className="flex gap-2">
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Tandai Semua Dibaca
              </Button>
            )}
            {hasRead && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200 hover:border-red-200"
                onClick={handleDeleteAllRead}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Hapus Terbaca
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900">{emptyMsg.title}</p>
              <p className="text-sm text-slate-500">{emptyMsg.desc}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {notifications.map((n) => {
              const content = (
                <>
                  {/* Icon */}
                  <div className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white shadow-sm",
                    getIconBg(n.type, !n.isRead)
                  )}>
                    {getIconForType(n.type)}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0 pr-16">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm sm:text-base line-clamp-1",
                        !n.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                      )}>
                        {n.title}
                      </p>
                      <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 md:line-clamp-none">{n.message}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className={cn("absolute right-10 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full", getDotColor(n.type))} />
                  )}

                  {/* Action buttons (hover) */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-white shadow-sm"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Tandai dibaca"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-white shadow-sm"
                      onClick={(e) => handleDelete(n.id, e)}
                      title="Hapus notifikasi"
                      disabled={deletingId === n.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              );

              return (
                <div key={n.id} className="relative group">
                  {n.linkUrl ? (
                    <Link
                      href={n.linkUrl}
                      onClick={() => { if (!n.isRead) handleMarkAsRead(n.id); }}
                      className={cn(
                        "flex items-start gap-4 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors",
                        !n.isRead ? "bg-red-50/20" : ""
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className={cn(
                      "flex items-start gap-4 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors",
                      !n.isRead ? "bg-red-50/20" : ""
                    )}>
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(buildUrl({ page: currentPage - 1 }))}
              disabled={currentPage <= 1 || isPending}
              className="bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(buildUrl({ page: currentPage + 1 }))}
              disabled={currentPage >= totalPages || isPending}
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
