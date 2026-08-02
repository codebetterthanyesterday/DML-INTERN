import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)
  const email = `test.customer.${Date.now()}@test.com`

  const customer = await prisma.user.create({
    data: {
      name: 'Tester RajaOngkir',
      email: email,
      passwordHash,
      role: 'CUSTOMER',
      phone: '081234567890',
      addresses: {
        create: {
          label: 'Kantor',
          recipientName: 'Tester RajaOngkir',
          phone: '081234567890',
          fullAddress: 'Jl. Jendral Sudirman Kav. 21',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12920',
          provinceId: '6', // RajaOngkir DKI Jakarta
          cityId: '153', // RajaOngkir Jakarta Selatan
          isDefault: true,
        },
      },
      cart: {
        create: {},
      },
    },
    include: {
      addresses: true,
    }
  })

  console.log(`Seeded Test Customer!`)
  console.log(`Email: ${customer.email}`)
  console.log(`Password: password123`)
  console.log(`Address:`, customer.addresses[0])
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
