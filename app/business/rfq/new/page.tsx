import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import RfqFormClient from "./RfqFormClient";

export default async function NewRFQPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      companyName: true,
      npwp: true,
      name: true,
      phone: true,
      businessStatus: true,
    }
  });

  if (!user || user.businessStatus !== "APPROVED") {
    redirect("/business");
  }

  // Fetch industrial / both products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      productType: { in: ["INDUSTRIAL", "BOTH"] }
    },
    select: {
      id: true,
      name: true,
      unit: true,
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buat Request For Quote (RFQ)</h1>
        <p className="text-slate-500 mt-1">Ajukan penawaran harga khusus untuk kebutuhan industrial Anda.</p>
      </div>

      <RfqFormClient products={products} user={user} />
    </div>
  );
}
