import { Metadata } from "next";
import { getAdminProfileData } from "@/lib/actions/admin/profile";
import { ProfileHeader } from "@/components/admin/profile/ProfileHeader";
import { EditProfileForm } from "@/components/admin/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/admin/profile/ChangePasswordForm";
import { AdminActivityLog } from "@/components/admin/profile/AdminActivityLog";

export const metadata: Metadata = {
  title: "Profil Admin | DML",
  description: "Kelola profil dan keamanan akun admin Anda.",
};

export default async function AdminProfilePage() {
  const { user, recentLogs } = await getAdminProfileData();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <ProfileHeader
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        }}
        stats={{
          totalActions: recentLogs.length, // Realistically we might count all from DB, but this works for demo
        }}
      />

      {/* Main Content: Two Columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <EditProfileForm
            initialData={{
              name: user.name,
              phone: user.phone,
            }}
          />
          <ChangePasswordForm />
        </div>

        {/* Right Column: Activity Log */}
        <div className="lg:col-span-1">
          <AdminActivityLog logs={recentLogs} />
        </div>
      </div>
    </div>
  );
}
