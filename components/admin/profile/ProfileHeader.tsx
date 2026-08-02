"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ShieldCheck, Mail, Calendar, Activity } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  };
  stats: {
    totalActions: number;
  };
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="relative overflow-hidden border-0 shadow-md">
      {/* Background Gradient */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900" />

      <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          {/* Avatar Profile */}
          <div className="rounded-full bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-inner">
              <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
              <AvatarFallback className="bg-slate-100 text-blue-950 font-bold text-3xl sm:text-5xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200 shadow-sm w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {user.role}
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {user.email}
              </div>
              <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Bergabung sejak {format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}
              </div>
              <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-blue-600">
                <Activity className="h-4 w-4" />
                {stats.totalActions} Aktivitas Tercatat
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
