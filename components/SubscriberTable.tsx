interface Subscriber {
  email: string
  interest?: string | null
  created_at: string
}

interface Props {
  subscribers: Subscriber[]
  page: number
  setPage: (p: number) => void
  perPage: number
}

export default function SubscriberTable({ subscribers, page, setPage, perPage }: Props) {
  const totalPages = Math.ceil(subscribers.length / perPage)

  const visible = subscribers.slice((page - 1) * perPage, page * perPage)

  return (
    <>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left p-2 border-b">Email</th>
            <th className="text-left p-2 border-b">Interest</th>
            <th className="text-left p-2 border-b">Created</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center p-4">
                No subscribers found
              </td>
            </tr>
          ) : (
            visible.map((sub, i) => (
              <tr key={i}>
                <td className="p-2 border-b">{sub.email}</td>
                <td className="p-2 border-b">{sub.interest}</td>
                <td className="p-2 border-b">{new Date(sub.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex gap-2 mb-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}

