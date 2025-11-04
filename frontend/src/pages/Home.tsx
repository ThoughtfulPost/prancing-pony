import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to The Prancing Pony
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Track customer relationships and meeting interactions with AI-powered insights.
        </p>

        <Link
          to="/customers"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          View Customers
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Customers
            </h3>
            <p className="text-gray-600 text-sm">
              Track B2B organizations with detailed contact information and history.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Record Meetings
            </h3>
            <p className="text-gray-600 text-sm">
              Log meeting transcripts and automatically extract participants.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Insights
            </h3>
            <p className="text-gray-600 text-sm">
              Get automated summaries, action items, and sentiment analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
