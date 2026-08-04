import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)
  const email = `test.customer.10address.${Date.now()}@test.com`

  const customer = await prisma.user.create({
    data: {
      name: 'Tester 10 Addresses',
      email: email,
      passwordHash,
      role: 'CUSTOMER',
      phone: '089999999999',
      cart: {
        create: {},
      },
    },
  })

  const addressesToCreate = [
    {
      label: 'Rumah Utama',
      recipientName: 'Budi (Rumah)',
      phone: '089999999999',
      fullAddress: 'Jl. Merdeka Selatan No. 10',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10110',
      provinceId: '6',
      cityId: '152',
      isDefault: true,
    },
    {
      label: 'Kantor Pusat',
      recipientName: 'Resepsionis',
      phone: '081112223334',
      fullAddress: 'Gedung Sate Jl. Diponegoro No. 22',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40115',
      provinceId: '9',
      cityId: '22',
      isDefault: false,
    },
    {
      label: 'Gudang Logistik',
      recipientName: 'Pak Yanto',
      phone: '082233334444',
      fullAddress: 'Kawasan Industri Rungkut',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60293',
      provinceId: '11',
      cityId: '444',
      isDefault: false,
    },
    {
      label: 'Toko Cabang Bali',
      recipientName: 'Wayan',
      phone: '085566667777',
      fullAddress: 'Jl. Legian Kaja No. 99',
      city: 'Denpasar',
      province: 'Bali',
      postalCode: '80361',
      provinceId: '5',
      cityId: '114',
      isDefault: false,
    },
    {
      label: 'Rumah Mertua',
      recipientName: 'Ibu Ratna',
      phone: '087788889999',
      fullAddress: 'Jl. Malioboro No. 5',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55271',
      provinceId: '4',
      cityId: '501',
      isDefault: false,
    },
    {
      label: 'Cabang Sumatera',
      recipientName: 'Sitorus',
      phone: '081234567891',
      fullAddress: 'Jl. Sisingamangaraja XII',
      city: 'Medan',
      province: 'Sumatera Utara',
      postalCode: '20217',
      provinceId: '34',
      cityId: '278',
      isDefault: false,
    },
    {
      label: 'Cabang Sulawesi',
      recipientName: 'Andi',
      phone: '082345678912',
      fullAddress: 'Jl. Pantai Losari',
      city: 'Makassar',
      province: 'Sulawesi Selatan',
      postalCode: '90111',
      provinceId: '28',
      cityId: '254',
      isDefault: false,
    },
    {
      label: 'Rumah Bekasi',
      recipientName: 'Agus',
      phone: '083456789123',
      fullAddress: 'Perumahan Harapan Indah',
      city: 'Bekasi',
      province: 'Jawa Barat',
      postalCode: '17131',
      provinceId: '9',
      cityId: '54',
      isDefault: false,
    },
    {
      label: 'Pabrik Tangerang',
      recipientName: 'Security',
      phone: '084567891234',
      fullAddress: 'Kawasan Industri Cikupa',
      city: 'Tangerang',
      province: 'Banten',
      postalCode: '15710',
      provinceId: '3',
      cityId: '456',
      isDefault: false,
    },
    {
      label: 'Vila Pegunungan',
      recipientName: 'Mang Ujang',
      phone: '085678912345',
      fullAddress: 'Jl. Raya Puncak Km. 84',
      city: 'Bogor',
      province: 'Jawa Barat',
      postalCode: '16750',
      provinceId: '9',
      cityId: '78',
      isDefault: false,
    },
  ]

  for (const addr of addressesToCreate) {
    await prisma.address.create({
      data: {
        ...addr,
        userId: customer.id,
      },
    })
  }

  console.log(`Seeded Test Customer with 10 variations!`)
  console.log(`Email: ${email}`)
  console.log(`Password: password123`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
