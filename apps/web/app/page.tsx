// File: /apps/web/app/page.tsx

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          UBM - Universal Booking Middleware
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          PWA Dashboard placeholder - to be implemented in PROMPT 6
        </p>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Status</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Monorepo structure created
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Core packages initialized
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              API implementation pending (PROMPT 2-5)
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              PWA features pending (PROMPT 6)
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
