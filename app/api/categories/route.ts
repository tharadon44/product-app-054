import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'ชื่อหมวดหมู่ไม่สามารถว่างได้' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: name.trim() }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'ไม่สามารถสร้างหมวดหมู่ได้' }, { status: 500 })
  }
}