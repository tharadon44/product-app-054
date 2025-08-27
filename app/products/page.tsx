'use client'
import { useEffect, useState } from 'react'

// ประเภทข้อมูล
type Category = {
  id: number
  name: string
}

type Product = {
  id: number
  name: string
  description: string
  price: number
  category?: Category | null
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        const productsRes = await fetch('/api/products')
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === null || product.category?.id === selectedCategory
    const matchesSearch =
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('th-TH')
  }

  // ✅ ฟังก์ชันคืนไอคอนตามชื่อหมวดหมู่
  const getCategoryIcon = (name?: string) => {
    if (!name) return '🍽️'
    const lower = name.toLowerCase()
    if (lower.includes('ของหวาน')) return '🍰'
    if (lower.includes('ผลไม้')) return '🍎'
    if (lower.includes('จานหลัก') || lower.includes('อาหาร')) return '🍛'
    return '🍽️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            <span className="ml-4 text-lg text-orange-700">🍴 กำลังโหลดเมนูอาหาร...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">🍽️</span>
            เมนูอาหาร
          </h1>
          <p className="text-orange-700">สั่งอาหารอร่อย ๆ ได้ทันที พร้อมเสิร์ฟความอิ่มอร่อยถึงมือคุณ!</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="ค้นหาเมนู เช่น ข้าวผัด ต้มยำ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-lg">🍲</span>
              <select
                value={selectedCategory || ''}
                onChange={(e) =>
                  handleCategoryFilter(e.target.value ? parseInt(e.target.value) : null)
                }
                className="border border-orange-300 rounded-md px-4 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {getCategoryIcon(category.name)} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  <span className="text-xs">{getCategoryIcon(categories.find(cat => cat.id === selectedCategory)?.name)}</span>
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <span className="text-xs">🔍</span>
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-orange-700">
            🍜 พบเมนูทั้งหมด <span className="font-semibold text-orange-800">{filteredProducts.length}</span> รายการ
            {selectedCategory && ` ในหมวดหมู่ "${categories.find(cat => cat.id === selectedCategory)?.name}"`}
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 mb-4">😢</div>
            <h3 className="text-xl font-semibold text-orange-600 mb-2">ไม่มีเมนูที่ตรงกับการค้นหา</h3>
            <p className="text-gray-500">ลองพิมพ์ชื่อใหม่หรือเปลี่ยนหมวดหมู่ดูนะ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <span className="text-6xl text-orange-300">{getCategoryIcon(product.category?.name)}</span>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-orange-800 mb-2 line-clamp-2">{product.name}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="mb-4">
                    {product.category ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                        <span className="text-xs">{getCategoryIcon(product.category.name)}</span>
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium italic">
                        <span className="text-xs">🏷️</span>
                        ไม่มีหมวดหมู่
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-red-600 font-bold text-lg">
                      <span className="text-lg">💵</span>
                      {formatPrice(product.price)} บาท
                    </div>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium">
                      🛒 สั่งเลย
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}