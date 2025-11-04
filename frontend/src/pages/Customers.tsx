import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
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
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/`)
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
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
    try {
      if (editingCustomer) {
        // Update existing customer
        await axios.put(
          `${API_BASE_URL}/api/customers/${editingCustomer.id}`,
          formData
        )
      } else {
        // Create new customer
        await axios.post(`${API_BASE_URL}/api/customers/`, formData)
      }
      handleCloseModal()
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Failed to save customer. Please try again.')
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
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
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/customers/${id}`)
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCustomer(null)
    setFormData({
      organization_name: '',
      industry: '',
      website: '',
      primary_contact_name: '',
      primary_contact_email: '',
      primary_contact_phone: '',
      address: '',
      notes: '',
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading customers...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Customer
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No customers found. Add your first customer organization!
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.organization_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.industry || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.primary_contact_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.primary_contact_email || '-'}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerFormModal
        isOpen={showModal}
        isEditing={!!editingCustomer}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Customers
