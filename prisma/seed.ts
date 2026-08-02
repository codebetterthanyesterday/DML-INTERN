import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data (optional, but good for idempotent seeds)
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.quoteItem.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.businessDocument.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.siteSetting.deleteMany()

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@dml.com',
      passwordHash,
      role: 'ADMIN',
      phone: '08111111111',
    },
  })

  const customer = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'customer@test.com',
      passwordHash,
      role: 'CUSTOMER',
      phone: '08222222222',
      addresses: {
        create: {
          label: 'Rumah',
          recipientName: 'Budi Santoso',
          phone: '08222222222',
          fullAddress: 'Jl. Merdeka No. 1, Jakarta',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '10110',
          isDefault: true,
        },
      },
      cart: {
        create: {},
      },
    },
  })

  const business = await prisma.user.create({
    data: {
      name: 'CV. Maju Jaya',
      email: 'business@test.com',
      passwordHash,
      role: 'BUSINESS',
      companyName: 'CV. Maju Jaya',
      npwp: '12.345.678.9-012.000',
      businessStatus: 'APPROVED',
      phone: '08333333333',
      addresses: {
        create: {
          label: 'Kantor',
          recipientName: 'Agus',
          phone: '08333333333',
          fullAddress: 'Jl. Industri Raya No. 99, Bekasi',
          city: 'Bekasi',
          province: 'Jawa Barat',
          postalCode: '17111',
          isDefault: true,
        },
      },
      businessDocuments: {
        create: [
          {
            docType: 'NPWP',
            fileUrl: 'https://example.com/npwp.pdf',
            status: 'VERIFIED',
          },
          {
            docType: 'NIB',
            fileUrl: 'https://example.com/nib.pdf',
            status: 'VERIFIED',
          },
        ],
      },
      cart: {
        create: {},
      },
    },
  })

  // 2. Create Categories
  const categorySafety = await prisma.category.create({
    data: {
      name: 'Alat Keselamatan Kerja',
      slug: 'alat-keselamatan-kerja',
      iconUrl: 'https://example.com/icons/safety.png',
    },
  })

  const subCategoryHelm = await prisma.category.create({
    data: {
      name: 'Helm Proyek',
      slug: 'helm-proyek',
      parentId: categorySafety.id,
    },
  })

  const categoryPackaging = await prisma.category.create({
    data: {
      name: 'Packaging',
      slug: 'packaging',
      iconUrl: 'https://example.com/icons/packaging.png',
    },
  })

  // 3. Create Products
  const productRetail = await prisma.product.create({
    data: {
      categoryId: subCategoryHelm.id,
      name: 'Helm Keselamatan MSA',
      slug: 'helm-keselamatan-msa',
      sku: 'SAF-HLM-001',
      description: 'Helm proyek standar SNI untuk keselamatan kerja.',
      productType: 'RETAIL',
      price: 150000,
      unit: 'pcs',
      stock: 100,
      minOrderQty: 1,
      specifications: { color: 'Yellow', material: 'HDPE' },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&q=80', displayOrder: 1 },
        ],
      },
    },
  })

  const productB2B = await prisma.product.create({
    data: {
      categoryId: categoryPackaging.id,
      name: 'Custom Box Packaging',
      slug: 'custom-box-packaging',
      sku: 'PKG-BOX-001',
      description: 'Box packaging custom untuk kebutuhan industri Anda.',
      productType: 'INDUSTRIAL',
      price: null, // Custom price
      unit: 'pcs',
      stock: 5000,
      minOrderQty: 1000,
      specifications: { material: 'Corrugated Cardboard', customizable: true },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=500&q=80', displayOrder: 1 },
        ],
      },
    },
  })

  const productBoth = await prisma.product.create({
    data: {
      categoryId: categorySafety.id,
      name: 'Sarung Tangan Safety',
      slug: 'sarung-tangan-safety',
      sku: 'SAF-GLV-001',
      description: 'Sarung tangan pelindung untuk pekerja konstruksi.',
      productType: 'BOTH',
      price: 25000,
      unit: 'pasang',
      stock: 500,
      minOrderQty: 1,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&q=80', displayOrder: 1 },
        ],
      },
    },
  })

  // 4. Create Cart Items
  const customerCart = await prisma.cart.findUnique({ where: { userId: customer.id } })
  if (customerCart) {
    await prisma.cartItem.create({
      data: {
        cartId: customerCart.id,
        productId: productRetail.id,
        qty: 2,
      },
    })
  }

  // 5. Create Order (B2C)
  const customerAddress = await prisma.address.findFirst({ where: { userId: customer.id } })
  if (customerAddress) {
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: customerAddress.id,
        orderNumber: 'ORD-202607-0001',
        type: 'B2C',
        status: 'SHIPPED',
        totalAmount: 300000, // 2 * 150000
        paymentStatus: 'PAID',
        items: {
          create: [
            {
              productId: productRetail.id,
              qty: 2,
              priceAtOrder: 150000,
            },
          ],
        },
        payment: {
          create: {
            method: 'GATEWAY',
            amount: 300000,
            status: 'SUCCESS',
            gatewayRef: 'PAY-123456789',
            paidAt: new Date(),
          },
        },
      },
    })
  }

  // 6. Create Quote & Invoice (B2B)
  const quote = await prisma.quote.create({
    data: {
      userId: business.id,
      quoteNumber: 'QT-202607-0001',
      status: 'ACCEPTED',
      customerNotes: 'Mohon penawaran untuk box ukuran 20x20x10 cm.',
      adminNotes: 'Penawaran disetujui, harga khusus 4000/pcs.',
      items: {
        create: [
          {
            productId: productB2B.id,
            qtyRequested: 2000,
            notes: 'Ukuran 20x20x10 cm, logo cetak 1 warna',
            quotedPrice: 4000,
          },
        ],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      quoteId: quote.id,
      invoiceNumber: 'INV-202607-0001',
      amount: 8000000, // 2000 * 4000
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
      status: 'UNPAID',
    },
  })

  // 7. Create Review
  await prisma.review.create({
    data: {
      productId: productBoth.id,
      userId: customer.id,
      rating: 5,
      comment: 'Kualitas sangat baik, kuat dan nyaman dipakai.',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
