interface CustomerFormData {
  organization_name: string
  industry: string
  website: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
  address: string
  notes: string
}

interface CustomerFormModalProps {
  isOpen: boolean
  isEditing: boolean
  formData: CustomerFormData
  onSubmit: (e: React.FormEvent) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onClose: () => void
}

export default function CustomerFormModal({
  isOpen,
  isEditing,
  formData,
  onSubmit,
  onChange,
  onClose,
}: CustomerFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border max-w-3xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
            {isEditing ? 'Edit Customer Organization' : 'Add New Customer Organization'}
          </h3>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={onChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={onChange}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={onChange}
                  placeholder="https://example.com"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Primary Contact Email
                </label>
                <input
                  type="email"
                  name="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Primary Contact Phone
                </label>
                <input
                  type="tel"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onChange}
                rows={3}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export type { CustomerFormData }
