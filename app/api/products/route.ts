import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ดึง product พร้อมข้อมูล category ด้วย
    const products = await prisma.product.findMany({
      include: { category: true }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลสินค้าได้' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, price, categoryId } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'ชื่อสินค้าต้องไม่ว่าง' }, { status: 400 })
    }
    if (price == null || isNaN(price)) {
      return NextResponse.json({ error: 'ราคาสินค้าต้องเป็นตัวเลข' }, { status: 400 })
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!categoryExists) {
        return NextResponse.json({ error: 'หมวดหมู่สินค้านี้ไม่มีในระบบ' }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: Number(price),
        categoryId: categoryId || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'ไม่สามารถสร้างสินค้าได้' }, { status: 500 })
  }
}
