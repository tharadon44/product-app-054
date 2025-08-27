'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [categoryInput, setCategoryInput] = useState('') // ช่องกรอกชื่อหมวดหมู่ (อาจเป็นหมวดที่เลือก หรือพิมพ์ใหม่)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [addingCategory, setAddingCategory] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // ปิด dropdown ถ้าคลิกนอกพื้นที่
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้')
      const data: Category[] = await res.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // ฟิลเตอร์หมวดหมู่ที่ตรงกับข้อความใน input
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categoryInput.toLowerCase())
  )

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryInput(e.target.value)
    setSelectedCategoryId(null) // reset เลือกหมวดหมู่ ถ้าพิมพ์ใหม่
    setErrors(prev => ({ ...prev, category: '' }))
    setDropdownOpen(true)
  }

  const handleSelectCategory = (cat: Category) => {
    setCategoryInput(cat.name)
    setSelectedCategoryId(cat.id)
    setErrors(prev => ({ ...prev, category: '' }))
    setDropdownOpen(false)
  }

  const handleAddCategory = async () => {
    const trimmedName = categoryInput.trim()
    if (!trimmedName) {
      alert('กรุณากรอกชื่อหมวดหมู่ก่อนเพิ่ม')
      return
    }
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('หมวดหมู่นี้มีอยู่แล้วในระบบ')
      return
    }

    setAddingCategory(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      })
      if (!res.ok) {
        alert('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่')
        setAddingCategory(false)
        return
      }
      const newCategory: Category = await res.json()
      setCategories(prev => [...prev, newCategory])
      setSelectedCategoryId(newCategory.id)
      setCategoryInput(newCategory.name)
      setErrors(prev => ({ ...prev, category: '' }))
      setDropdownOpen(false)
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่')
      console.error(error)
    } finally {
      setAddingCategory(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'กรุณากรอกชื่อสินค้า'
    else if (name.length < 3) newErrors.name = 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร'

    if (!description.trim()) newErrors.description = 'กรุณากรอกรายละเอียดสินค้า'
    else if (description.length < 10) newErrors.description = 'รายละเอียดสินค้าต้องมีอย่างน้อย 10 ตัวอักษร'

    if (!price) newErrors.price = 'กรุณากรอกราคาสินค้า'
    else if (parseFloat(price) <= 0) newErrors.price = 'ราคาสินค้าต้องมากกว่า 0'

    if (!selectedCategoryId) newErrors.category = 'กรุณาเลือกหรือเพิ่มหมวดหมู่สินค้า'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price: parseFloat(price), categoryId: selectedCategoryId }),
      })

      if (res.ok) {
        alert('✅ เพิ่มสินค้าสำเร็จ!')
        setName('')
        setDescription('')
        setPrice('')
        setSelectedCategoryId(null)
        setCategoryInput('')
        setErrors({})
        router.push('/products')
      } else {
        alert('❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า')
      }
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value)
      if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
            <span className="ml-4 text-lg text-black font-semibold">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="text-black hover:text-gray-800 text-2xl font-bold"
              title="กลับ"
            >
              ←
            </button>
            <h1 className="text-4xl font-extrabold text-black flex items-center gap-3">
              <span className="text-black text-4xl">➕</span>
              เพิ่มสินค้าใหม่
            </h1>
          </div>
          <p className="text-black font-medium">กรอกข้อมูลสินค้าที่ต้องการเพิ่มเข้าสู่ระบบ</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-visible">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-4">
            <h2 className="text-black text-xl font-semibold flex items-center gap-2">
              <span>📝</span>
              ข้อมูลสินค้า
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black flex items-center gap-2">
                <span>🏷️</span>
                ชื่อสินค้า
                <span className="text-black">*</span>
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อสินค้า (เช่น สมาร์ทโฟน iPhone 15)"
                value={name}
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 transition-colors shadow-sm ${
                  errors.name
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-orange-300 focus:ring-orange-400 focus:border-red-500'
                } text-black`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black flex items-center gap-2">
                <span>📄</span>
                รายละเอียดสินค้า
                <span className="text-black">*</span>
              </label>
              <textarea
                placeholder="อธิบายรายละเอียดสินค้า คุณสมบัติ และข้อมูลที่สำคัญ"
                value={description}
                onChange={handleDescriptionChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 resize-none transition-colors shadow-sm ${
                  errors.description
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-orange-300 focus:ring-orange-400 focus:border-red-500'
                } text-black`}
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Product Price */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black flex items-center gap-2">
                <span>💰</span>
                ราคา
                <span className="text-black">*</span>
              </label>
              <input
                type="text"
                placeholder="กรอกจำนวนเงิน"
                value={price}
                onChange={handlePriceChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 transition-colors shadow-sm ${
                  errors.price
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-orange-300 focus:ring-orange-400 focus:border-red-500'
                } text-black`}
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.price}
                </p>
              )}
            </div>

            {/* Category Selection with input + dropdown */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-black flex items-center gap-2">
                <span>📚</span>
                หมวดหมู่สินค้า
                <span className="text-black">*</span>
              </label>

              <input
                type="text"
                placeholder="พิมพ์หรือเลือกหมวดหมู่"
                value={categoryInput}
                onChange={handleCategoryInputChange}
                onFocus={() => setDropdownOpen(true)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-4 transition-colors shadow-sm ${
                  errors.category
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-orange-300 focus:ring-orange-400 focus:border-red-500'
                } text-black`}
                autoComplete="off"
                required
              />

              {/* Dropdown List */}
              {dropdownOpen && filteredCategories.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCategories.map(cat => (
                      <div
                        key={cat.id}
                        className="px-4 py-2 cursor-pointer hover:bg-red-100 text-black border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectCategory(cat)}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new category button */}
              <button
                onClick={handleAddCategory}
                disabled={addingCategory || categoryInput.trim() === ''}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
                type="button"
              >
                {addingCategory ? 'กำลังเพิ่มหมวดหมู่...' : 'เพิ่มหมวดหมู่ใหม่'}
              </button>

              {errors.category && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <span>⚠️</span>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600 transition-colors text-white rounded-lg py-3 px-6 text-xl font-bold shadow-md disabled:opacity-70"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสินค้า'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}