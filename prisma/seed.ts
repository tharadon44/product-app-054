import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ✅ Seed หมวดหมู่
async function seedCategories() {
  const categories = [
    { name: "อาหารจานหลัก" },
    { name: "ของหวาน" },
    { name: "ผลไม้" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    })
  }

  console.log('✅ Seeded categories successfully.')
}

// ✅ Seed สินค้า
async function seedProduct() {
  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  const categories = await prisma.category.findMany()

  // หา category ที่ต้องการตามชื่อ
  const mainDishCategory = categories.find(c => c.name === "อาหารจานหลัก")
  const dessertCategory = categories.find(c => c.name === "ของหวาน")
  const fruitCategory = categories.find(c => c.name === "ผลไม้")

  // เช็คว่าหมวดหมู่ครบไหม
  if (!mainDishCategory || !dessertCategory || !fruitCategory) {
    throw new Error("❌ ไม่พบหมวดหมู่ที่ต้องการในฐานข้อมูล")
  }

  // ข้อมูลสินค้า
  const productsData = [
    {
      name: "ข้าวผัดกุ้ง",
      description: "ข้าวผัดรสชาติเข้มข้น พร้อมกุ้งสด",
      price: 50,
      categoryId: mainDishCategory.id,
    },
    {
      name: "ฝรั่งแช่อิ่ม",
      description: "ฝรั่งแช่อิ่มรสหวานกรอบ",
      price: 60,
      categoryId: fruitCategory.id,
    },
    {
      name: "ไอศกรีมวนิลา",
      description: "ไอศกรีมรสวนิลาเนียนนุ่ม",
      price: 40,
      categoryId: dessertCategory.id,
    },
    {
      name: "ส้มตำปูปลาร้า",
      description: "ส้มตำรสแซ่บ ปูปลาร้าสด",
      price: 35,
      categoryId: mainDishCategory.id,
    },
    {
      name: "ส้มตำไทย",
      description: "ส้มตำรสจัดจ้าน เผ็ดแซ่บ",
      price: 30,
      categoryId: mainDishCategory.id,
    },
    {
      name: "เค้กช็อกโกแลต",
      description: "เค้กนุ่ม รสช็อกโกแลตเข้มข้น",
      price: 80,
      categoryId: dessertCategory.id,
    },
    {
      name: "ส้มโอหวาน",
      description: "ส้มโอสด รสชาติหวานฉ่ำ",
      price: 30,
      categoryId: fruitCategory.id,
    },
    {
      name: "สปาเก็ตตี้คาโบนาร่า",
      description: "สปาเก็ตตี้ครีมซอสคาโบนาร่า",
      price: 70,
      categoryId: mainDishCategory.id,
    },
    {
      name: "สตอรเบอร์รี่สด",
      description: "สตอรเบอร์รี่หวานฉ่ำ สดใหม่",
      price: 80,
      categoryId: fruitCategory.id,
    },
  ]

  // ลบ product เก่าทิ้ง (ป้องกันซ้ำ - optional)
  await prisma.product.deleteMany()

  // สร้างสินค้าในฐานข้อมูล
  await prisma.product.createMany({
    data: productsData,
  })

  console.log('✅ Seeded products successfully.')
}

// ✅ Main function
async function main() {
  try {
    await seedCategories()
    await seedProduct()
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
