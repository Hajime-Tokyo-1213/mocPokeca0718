'use client'

import { useState } from 'react'
import { Card } from '@/types/card'

interface ManualAddFormProps {
  onAdd: (card: Card, quantity: number) => void
  onCancel: () => void
}

export default function ManualAddForm({ onAdd, onCancel }: ManualAddFormProps) {
  const [formData, setFormData] = useState({
    商品タイトル: '',
    商品型番: '',
    レアリティ: '',
    買取価格: '',
    数量: '1'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.商品タイトル.trim()) {
      newErrors.商品タイトル = '商品タイトルは必須です'
    }
    
    if (!formData.買取価格.trim()) {
      newErrors.買取価格 = '買取価格は必須です'
    } else if (isNaN(Number(formData.買取価格)) || Number(formData.買取価格) < 0) {
      newErrors.買取価格 = '0以上の数値を入力してください'
    }
    
    if (!formData.数量.trim()) {
      newErrors.数量 = '数量は必須です'
    } else if (isNaN(Number(formData.数量)) || Number(formData.数量) <= 0 || !Number.isInteger(Number(formData.数量))) {
      newErrors.数量 = '1以上の整数を入力してください'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    const card: Card = {
      cardId: `manual_${Date.now()}`,
      商品タイトル: formData.商品タイトル.trim(),
      商品型番: formData.商品型番.trim(),
      レアリティ: formData.レアリティ.trim(),
      買取価格: formData.買取価格.trim(),
      imageUrl: ''
    }
    
    onAdd(card, Number(formData.数量))
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">手動で商品を追加</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="商品タイトル" className="block text-sm font-medium text-gray-700 mb-1">
              商品タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="商品タイトル"
              name="商品タイトル"
              value={formData.商品タイトル}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.商品タイトル ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：ピカチュウ V"
            />
            {errors.商品タイトル && (
              <p className="mt-1 text-sm text-red-600">{errors.商品タイトル}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="商品型番" className="block text-sm font-medium text-gray-700 mb-1">
              商品型番
            </label>
            <input
              type="text"
              id="商品型番"
              name="商品型番"
              value={formData.商品型番}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：SV1 001/078"
            />
          </div>
          
          <div>
            <label htmlFor="レアリティ" className="block text-sm font-medium text-gray-700 mb-1">
              レアリティ
            </label>
            <input
              type="text"
              id="レアリティ"
              name="レアリティ"
              value={formData.レアリティ}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：RR"
            />
          </div>
          
          <div>
            <label htmlFor="買取価格" className="block text-sm font-medium text-gray-700 mb-1">
              買取価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="買取価格"
              name="買取価格"
              value={formData.買取価格}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.買取価格 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：500"
              min="0"
            />
            {errors.買取価格 && (
              <p className="mt-1 text-sm text-red-600">{errors.買取価格}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="数量" className="block text-sm font-medium text-gray-700 mb-1">
              数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="数量"
              name="数量"
              value={formData.数量}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.数量 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
              min="1"
            />
            {errors.数量 && (
              <p className="mt-1 text-sm text-red-600">{errors.数量}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            追加
          </button>
        </div>
      </form>
    </div>
  )
}