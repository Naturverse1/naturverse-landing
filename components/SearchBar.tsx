interface Props {
  search: string
  setSearch: (value: string) => void
}

export default function SearchBar({ search, setSearch }: Props) {
  return (
    <input
      type="text"
      placeholder="Search by email or interest…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded mb-4"
    />
  )
}

