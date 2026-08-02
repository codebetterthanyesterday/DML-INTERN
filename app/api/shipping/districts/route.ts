import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("cityId")

    if (!cityId) {
      return NextResponse.json({ error: "Missing cityId" }, { status: 400 })
    }

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY

    if (!RAJAONGKIR_API_KEY) {
      return NextResponse.json({ error: "Missing Rajaongkir config" }, { status: 500 })
    }

    const response = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/district/${cityId}`, {
      headers: {
        "key": RAJAONGKIR_API_KEY
      }
    })

    const data = await response.json()
    if (data.meta?.status === "error" || data.meta?.code !== 200 || data.error) {
      // Mock data for development when API limit is reached
      return NextResponse.json({
        data: [
          { id: "2168", name: "Kebayoran Baru" },
          { id: "2169", name: "Kebayoran Lama" },
          { id: "2170", name: "Pesanggrahan" },
          { id: "2171", name: "Cilandak" },
          { id: "2172", name: "Pasar Minggu" },
          { id: "2173", name: "Jagakarsa" },
          { id: "2174", name: "Mampang Prapatan" },
          { id: "2175", name: "Pancoran" },
          { id: "2176", name: "Tebet" },
          { id: "2177", name: "Setiabudi" }
        ]
      })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching districts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
