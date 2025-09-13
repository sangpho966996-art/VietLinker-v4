'use client'

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Lỗi Doanh Nghiệp!</h2>
      <p className="text-gray-600 mb-4">Có lỗi xảy ra trong trang doanh nghiệp.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Thử lại
      </button>
    </div>
  )
}
