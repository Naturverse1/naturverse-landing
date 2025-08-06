export interface Subscriber {
  id: string
  email: string
  interests: string | null
  created_at: string
  source: string | null
}

interface TableProps {
  subscribers: Subscriber[]
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
}

export default function AdminSubscriberTable({ subscribers, page, total, pageSize, onPageChange, onDelete }: TableProps) {
  if (subscribers.length === 0) {
    return <div>No subscribers found</div>
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Interest</th>
              <th className="border px-4 py-2 text-left">Created Date</th>
              <th className="border px-4 py-2 text-left">Source</th>
              {onDelete && <th className="border px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.email}</td>
                <td className="border px-4 py-2">{Array.isArray(s.interests) ? s.interests.join(', ') : s.interests || ''}</td>
                <td className="border px-4 py-2">{new Date(s.created_at).toLocaleString()}</td>
                <td className="border px-4 py-2">{s.source || ''}</td>
                {onDelete && (
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => onDelete(s.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / pageSize))} (Total: {total})
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page * pageSize >= total}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
