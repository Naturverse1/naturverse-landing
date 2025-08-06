import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
}

export default function SearchBar({ onSearch, placeholder = 'Search...', delay = 300 }: SearchBarProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => onSearch(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay, onSearch])

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="px-2 py-1 border rounded w-full md:w-64"
    />
  )
}
