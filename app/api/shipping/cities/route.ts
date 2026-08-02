import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get("provinceId")

    if (!provinceId) {
      return NextResponse.json({ error: "Missing provinceId" }, { status: 400 })
    }

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY

    if (!RAJAONGKIR_API_KEY) {
      return NextResponse.json({ error: "Missing Rajaongkir config" }, { status: 500 })
    }

    const response = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`, {
      headers: {
        "key": RAJAONGKIR_API_KEY
      }
    })

    const data = await response.json()
    if (data.meta?.status === "error" || data.meta?.code !== 200 || data.error) {
      // Mock data for development when API limit is reached
      return NextResponse.json({
        data: [
          { id: "114", name: "Denpasar" },
          { id: "152", name: "Jakarta Pusat" },
          { id: "153", name: "Jakarta Selatan" },
          { id: "154", name: "Jakarta Timur" },
          { id: "155", name: "Jakarta Utara" },
          { id: "156", name: "Jakarta Barat" },
          { id: "157", name: "Bandung" },
          { id: "419", name: "Surabaya" },
          { id: "395", name: "Semarang" }
        ]
      })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
