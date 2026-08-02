"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Activity, UserCheck, UserX, FileCheck, FileX, RefreshCw, AlertCircle } from "lucide-react";
import { AuditAction } from "@prisma/client";

interface LogEntry {
  id: string;
  action: AuditAction;
  targetId: string;
  details: string | null;
  createdAt: Date;
}

interface AdminActivityLogProps {
  logs: LogEntry[];
}

function getActionDetails(action: AuditAction) {
  switch (action) {
    case "USER_APPROVED":
      return { icon: UserCheck, color: "text-green-500", bg: "bg-green-50", label: "Menerima User" };
    case "USER_REJECTED":
      return { icon: UserX, color: "text-red-500", bg: "bg-red-50", label: "Menolak User" };
    case "DOCUMENT_VERIFIED":
      return { icon: FileCheck, color: "text-blue-500", bg: "bg-blue-50", label: "Verifikasi Dokumen" };
    case "DOCUMENT_REJECTED":
      return { icon: FileX, color: "text-red-500", bg: "bg-red-50", label: "Tolak Dokumen" };
    case "USER_SUSPENDED":
      return { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50", label: "Suspend User" };
    case "USER_UNSUSPENDED":
      return { icon: RefreshCw, color: "text-teal-500", bg: "bg-teal-50", label: "Unsuspend User" };
    case "ROLE_CHANGED":
      return { icon: RefreshCw, color: "text-indigo-500", bg: "bg-indigo-50", label: "Ubah Role User" };
    default:
      return { icon: Activity, color: "text-slate-500", bg: "bg-slate-50", label: "Aktivitas" };
  }
}

export function AdminActivityLog({ logs }: AdminActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Aktivitas Terakhir</CardTitle>
          <CardDescription>Catatan tindakan yang Anda lakukan dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Activity className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Belum ada aktivitas tercatat</p>
          <p className="text-sm text-slate-400 mt-1">Aktivitas Anda seperti menyetujui akun atau dokumen akan muncul di sini.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Aktivitas Terakhir</CardTitle>
        <CardDescription>Riwayat tindakan administratif terbaru Anda.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 p-0">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const { icon: Icon, color, bg, label } = getActionDetails(log.action);
            
            return (
              <div key={log.id} className="p-4 sm:p-5 flex gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={`mt-0.5 shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center ring-1 ring-inset ring-slate-900/5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {label}
                    </p>
                    <time className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: id })}
                    </time>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {log.details || `Tindakan dilakukan pada ID: ${log.targetId.substring(0, 8)}...`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
