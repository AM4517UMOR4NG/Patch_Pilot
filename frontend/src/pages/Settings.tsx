import { useNavigate } from 'react-router-dom'
import { removeToken } from '../utils/auth'

export default function Settings() {
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Username:</span> {localStorage.getItem('username') || 'admin'}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Role:</span> Administrator
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">API URL:</span> {import.meta.env.VITE_API_BASE_URL || '/api'}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Webhook URL:</span> /webhooks/github
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
