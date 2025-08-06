import { useEffect, useState } from 'react'

interface Props {
  search: string
  setSearch: (value: string) => void
  delay?: number
}

export default function SearchBar({ search, setSearch, delay = 300 }: Props) {
  const [value, setValue] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => setSearch(value), delay)
    return () => clearTimeout(handler)
  }, [value, setSearch, delay])

  return (
    <input
      type="text"
      placeholder="Search by email or interest…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded mb-4"
    />
  )
}

