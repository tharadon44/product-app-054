'use client'
import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-100 to-red-200 p-6">
            <h1 className="text-4xl font-bold text-red-900 mb-8 text-center">
                ยินดีต้อนรับเข้าสู่ระบบสินค้า
            </h1>

            <nav>
                <ul className="flex flex-col md:flex-row gap-4">
                    <li>
                        <Link
                            href="/products"
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 transition"
                        >
                            ดูรายการสินค้า
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/products/new"
                            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition"
                        >
                            เพิ่มสินค้าใหม่
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}