'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6">
      <label htmlFor="card-search" className="block text-sm font-medium text-gray-700 mb-2">
        カード型番検索（前半3桁）
      </label>
      <input
        id="card-search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: 100"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        maxLength={3}
      />
      <p className="mt-1 text-sm text-gray-500">
        ← → キーで数値を増減できます
      </p>
    </div>
  )
}