import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config'

interface Customer {
  id: number
  organization_name: string
}

interface MeetingFormData {
  customer_id: number
  timestamp: string
  location: string
  transcript: string
}

function AddEvent() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<MeetingFormData>({
    customer_id: parseInt(customerId || '0'),
    timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    location: '',
    transcript: '',
  })

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/customers/${customerId}`
      )
      setCustomer(response.data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Send the datetime as-is (naive datetime, no timezone conversion)
      // Backend will store it as naive datetime in SQLite
      const meetingData = {
        ...formData,
        timestamp: formData.timestamp + ':00', // Add seconds to make it valid ISO-like format
      }

      await axios.post(`${API_BASE_URL}/api/events/meetings`, meetingData)
      navigate(`/customers/${customerId}`)
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to create meeting. Please try again.')
      setSaving(false)
    }
  }

  if (!customer) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Back button */}
      <Link
        to={`/customers/${customerId}`}
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to {customer.organization_name}
      </Link>

      {/* Form Container */}
      <div className="bg-white shadow rounded-lg p-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Add Meeting Event
        </h1>
        <p className="text-gray-600 mb-6">
          Record a meeting with {customer.organization_name}. Participants will be automatically extracted from the transcript.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date and Time *
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleInputChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Conference Room A, Zoom (https://zoom.us/...), Office"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Meeting Transcript *
            </label>
            <textarea
              name="transcript"
              value={formData.transcript}
              onChange={handleInputChange}
              required
              rows={12}
              placeholder="Enter the full transcript of the meeting..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"
            />
            <p className="text-gray-500 text-xs mt-1">
              Paste or type the meeting transcript here. Participants will be automatically extracted.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              to={`/customers/${customerId}`}
              className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded ${
                saving ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving & Summarizing...' : 'Save Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEvent
