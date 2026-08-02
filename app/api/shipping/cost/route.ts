import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { destination, weight, courier } = body

    if (!destination || !weight || !courier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get origin from SiteSetting
    let origin = "6158" // default Tangerang District ID
    const originSetting = await prisma.siteSetting.findUnique({
      where: { key: "store_district_id" }
    })
    
    if (originSetting && originSetting.value) {
      // Note: value is Json, so it could be "6158" stringified, so handle correctly
      origin = String(originSetting.value).replace(/\"/g, '')
    }

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY

    if (!RAJAONGKIR_API_KEY) {
      return NextResponse.json({ error: "Missing Rajaongkir config" }, { status: 500 })
    }

    const formData = new URLSearchParams()
    formData.append('origin', origin)
    formData.append('destination', destination)
    formData.append('weight', weight.toString())
    formData.append('courier', courier) // jne:sicepat:jnt
    formData.append('price', 'lowest') // Komerce specific param

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', {
        method: "POST",
        headers: {
          "key": RAJAONGKIR_API_KEY,
          "content-type": "application/x-www-form-urlencoded"
        },
        body: formData.toString(),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const data = await response.json()
      
      // Komerce structure mapping back to original if necessary, or pass through
      // Actually, since this is a new API, we just pass through and let the frontend handle it,
      // but wait, we need to know what the frontend expects!
      return NextResponse.json(data)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error("Error calling shipping API (timeout or network):", fetchError)
      // Fallback response for resilience
      return NextResponse.json({
        error: "Shipping calculation timeout",
        fallback: true
      }, { status: 504 })
    }

  } catch (error) {
    console.error("Error parsing request for shipping cost:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
