import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import CustomerFormModal, { CustomerFormData } from '../components/CustomerFormModal'

interface Customer {
  id: number
  organization_name: string
  industry: string | null
  website: string | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  address: string | null
  notes: string | null
  created_at: string
}

interface Event {
  id: number
  customer_id: number
  event_type: string
  timestamp: string
  participants: string | null
  transcript?: string | null
  location?: string | null
}

interface EventSummary {
  tldr: string
  action_items: string[]
  sentiment: 'green' | 'amber' | 'red'
  sentiment_explanation: string
}


function CustomerDetails() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null)
  const [eventSummaries, setEventSummaries] = useState<Record<number, EventSummary>>({})
  const [summaryNotFound, setSummaryNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [regeneratingSummary, setRegeneratingSummary] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    organization_name: '',
    industry: '',
    website: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    if (id) {
      fetchCustomerDetails()
      fetchCustomerEvents()
    }
  }, [id])

  const fetchCustomerDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${id}`)
      setCustomer(response.data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/events/customer/${id}`
      )
      const eventsData = response.data
      setEvents(eventsData)

      // Fetch summaries for all events
      const summariesMap: Record<number, EventSummary> = {}
      await Promise.all(
        eventsData.map(async (event: Event) => {
          try {
            const summaryResponse = await axios.get(
              `${API_BASE_URL}/api/events/${event.id}/summary`
            )
            summariesMap[event.id] = summaryResponse.data
          } catch (error) {
            // Summary doesn't exist, that's okay
          }
        })
      )
      setEventSummaries(summariesMap)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const formatDate = (dateString: string) => {
    // Parse the datetime string as-is without timezone interpretation
    // The backend stores naive datetime, so we display it as-is
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleEventClick = async (event: Event) => {
    setSelectedEvent(event)
    setEventSummary(null) // Reset summary
    setSummaryNotFound(false)

    // Fetch summary for this event
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/events/${event.id}/summary`
      )
      setEventSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummaryNotFound(true)
    }
  }

  const handleRegenerateSummary = async () => {
    if (!selectedEvent) return

    setRegeneratingSummary(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/events/${selectedEvent.id}/summary/regenerate`
      )
      setEventSummary(response.data)
      setSummaryNotFound(false)
      // Update the summaries map so the timeline shows the new sentiment
      setEventSummaries(prev => ({
        ...prev,
        [selectedEvent.id]: response.data
      }))
    } catch (error) {
      console.error('Error regenerating summary:', error)
      alert('Failed to regenerate summary. Please try again.')
    } finally {
      setRegeneratingSummary(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${selectedEvent.event_type}? This action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingEvent(true)
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${selectedEvent.id}`)
      // Remove from events list
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
      // Remove from summaries map
      setEventSummaries(prev => {
        const newSummaries = { ...prev }
        delete newSummaries[selectedEvent.id]
        return newSummaries
      })
      // Close the modal
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setDeletingEvent(false)
    }
  }

  const handleEditCustomer = () => {
    if (!customer) return

    setFormData({
      organization_name: customer.organization_name,
      industry: customer.industry || '',
      website: customer.website || '',
      primary_contact_name: customer.primary_contact_name || '',
      primary_contact_email: customer.primary_contact_email || '',
      primary_contact_phone: customer.primary_contact_phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
    })
    setShowEditModal(true)
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
    try {
      await axios.put(`${API_BASE_URL}/api/customers/${id}`, formData)
      setShowEditModal(false)
      fetchCustomerDetails() // Refresh customer data
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'amber':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading customer details...</div>
  }

  if (!customer) {
    return <div className="text-center py-8">Customer not found</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Back button */}
      <Link
        to="/customers"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {customer.organization_name}
          </h1>
          <button
            onClick={handleEditCustomer}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="text-gray-900">{customer.industry || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            {customer.website ? (
              <a
                href={customer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {customer.website}
              </a>
            ) : (
              <p className="text-gray-900">-</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Primary Contact</p>
            <p className="text-gray-900">
              {customer.primary_contact_name || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Email</p>
            <p className="text-gray-900">
              {customer.primary_contact_email || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Phone</p>
            <p className="text-gray-900">
              {customer.primary_contact_phone || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-gray-900">{customer.address || '-'}</p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Notes</p>
            <p className="text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Events Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Events Timeline</h2>
          <Link
            to={`/customers/${id}/add-event`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Meeting
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No events recorded yet for this customer.
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const summary = eventSummaries[event.id]
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                          {event.event_type.toUpperCase()}
                        </span>
                        {summary && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getSentimentColor(
                              summary.sentiment
                            )}`}
                          >
                            {summary.sentiment.toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {event.location}
                        </p>
                      )}
                      {event.participants && (
                        <p className="text-sm text-gray-600">
                          👥 Participants: {event.participants}
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600 text-sm">View Details →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedEvent.event_type.toUpperCase()} Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedEvent.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* AI Summary Section */}
                {summaryNotFound && (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-bold text-gray-900 mb-2">
                          📊 AI-Generated Summary
                        </h4>
                        <p className="text-gray-600 text-sm">
                          No summary available for this event.
                          {selectedEvent?.transcript && ' Click "Generate Summary" to create one.'}
                        </p>
                      </div>
                      {selectedEvent?.transcript && (
                        <button
                          onClick={handleRegenerateSummary}
                          disabled={regeneratingSummary}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {regeneratingSummary ? 'Generating...' : 'Generate Summary'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {eventSummary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-bold text-gray-900">
                        📊 AI-Generated Summary
                      </h4>
                      <button
                        onClick={handleRegenerateSummary}
                        disabled={regeneratingSummary}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {regeneratingSummary ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded border ${getSentimentColor(
                          eventSummary.sentiment
                        )}`}
                      >
                        Sentiment: {eventSummary.sentiment.toUpperCase()}
                      </span>
                    </div>

                    {/* TL;DR */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        TL;DR
                      </p>
                      <p className="text-gray-900">{eventSummary.tldr}</p>
                    </div>

                    {/* Sentiment Explanation */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Sentiment Analysis
                      </p>
                      <p className="text-gray-900">
                        {eventSummary.sentiment_explanation}
                      </p>
                    </div>

                    {/* Action Items */}
                    {eventSummary.action_items.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Action Items
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {eventSummary.action_items.map((item, index) => (
                            <li key={index} className="text-gray-900">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.location && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Location
                    </p>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.participants && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Participants
                    </p>
                    <p className="text-gray-900">{selectedEvent.participants}</p>
                  </div>
                )}

                {selectedEvent.transcript && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Transcript
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedEvent.transcript}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handleDeleteEvent}
                  disabled={deletingEvent}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deletingEvent ? 'Deleting...' : 'Delete Event'}
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  disabled={deletingEvent}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomerFormModal
        isOpen={showEditModal}
        isEditing={true}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default CustomerDetails
