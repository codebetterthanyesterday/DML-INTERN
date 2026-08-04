export const metadata = {
  title: "Kelola Admin | Super Admin DML",
  description: "Manajemen akun Admin",
};

import prisma from "@/lib/prisma";
import { ManageAdminsClient } from "@/components/superadmin/ManageAdminsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminAdminsPage() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isSuspended: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-950">Kelola Admin</h1>
        <p className="text-slate-600 mt-2">
          Tambah, perbarui, atau tangguhkan akun administrator sistem.
        </p>
      </div>

      <ManageAdminsClient admins={admins} />
    </div>
  );
}
