import { NextResponse } from "next/server"

export async function GET() {
  try {
    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY

    if (!RAJAONGKIR_API_KEY) {
      return NextResponse.json({ error: "Missing Rajaongkir config" }, { status: 500 })
    }

    const response = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/province`, {
      headers: {
        "key": RAJAONGKIR_API_KEY
      }
    })

    const data = await response.json()
    if (data.meta?.status === "error" || data.meta?.code !== 200 || data.error) {
      // Mock data for development when API limit is reached
      return NextResponse.json({
        data: [
          { id: "6", name: "DKI Jakarta" },
          { id: "9", name: "Jawa Barat" },
          { id: "10", name: "Jawa Tengah" },
          { id: "11", name: "Jawa Timur" }
        ]
      })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching provinces:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
