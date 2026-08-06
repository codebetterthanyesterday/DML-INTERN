import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BusinessProfileClient from "./BusinessProfileClient";

export default async function BusinessProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      companyName: true,
      npwp: true,
      businessStatus: true,
      businessDocuments: { orderBy: { uploadedAt: "desc" } },
      addresses: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Perusahaan</h1>
        <p className="text-slate-500 mt-1">Kelola data perusahaan, kontak, dan dokumen legalitas Anda.</p>
      </div>

      <BusinessProfileClient
        companyName={user.companyName || ""}
        businessStatus={user.businessStatus}
        pic={{ name: user.name, email: user.email, phone: user.phone || "" }}
        address={
          defaultAddress
            ? {
                fullAddress: defaultAddress.fullAddress,
                city: defaultAddress.city,
                province: defaultAddress.province,
                postalCode: defaultAddress.postalCode,
              }
            : null
        }
        documents={user.businessDocuments.map((doc) => ({
          id: doc.id,
          docType: doc.docType,
          fileUrl: doc.fileUrl,
          status: doc.status,
        }))}
      />
    </div>
  );
}
