"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";

export interface AuditLogData {
  id: string;
  admin: { name: string; email: string };
  action: string;
  targetId: string;
  createdAt: Date;
}

const actionMap: Record<string, { label: string; color: string }> = {
  USER_APPROVED: { label: "User Disetujui", color: "bg-green-100 text-green-700 border-green-200" },
  USER_REJECTED: { label: "User Ditolak", color: "bg-red-100 text-red-700 border-red-200" },
  USER_SUSPENDED: { label: "User Ditangguhkan", color: "bg-orange-100 text-orange-700 border-orange-200" },
  USER_UNSUSPENDED: { label: "User Dipulihkan", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  USER_DELETED: { label: "User Dihapus", color: "bg-red-100 text-red-700 border-red-200" },
  ROLE_CHANGED: { label: "Role Diubah", color: "bg-blue-100 text-blue-700 border-blue-200" },
  DOCUMENT_VERIFIED: { label: "Dokumen Diverifikasi", color: "bg-green-100 text-green-700 border-green-200" },
  DOCUMENT_REJECTED: { label: "Dokumen Ditolak", color: "bg-red-100 text-red-700 border-red-200" },
};

export function AuditLogTable({ logs }: { logs: AuditLogData[] }) {
  return (
    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-indigo-950 font-bold">Aktivitas Sistem Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-500 font-semibold">Admin</TableHead>
              <TableHead className="text-slate-500 font-semibold">Aksi</TableHead>
              <TableHead className="text-right text-slate-500 font-semibold">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => {
                const actionInfo = actionMap[log.action] || { label: log.action, color: "bg-slate-100 text-slate-700 border-slate-200" };
                return (
                  <TableRow key={log.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell>
                      <div className="font-medium text-slate-900">{log.admin.name}</div>
                      <div className="text-xs text-slate-500">{log.admin.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${actionInfo.color} font-semibold`}>
                        {actionInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: localeID })}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-6 font-medium">
                  Belum ada log aktivitas sistem.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
