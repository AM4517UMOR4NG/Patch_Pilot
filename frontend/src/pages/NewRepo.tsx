import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateRepo } from '../hooks/useApi'

export default function NewRepo() {
  const [name, setName] = useState('')
  const [cloneUrl, setCloneUrl] = useState('')
  const [defaultBranch, setDefaultBranch] = useState('main')
  const [webhookSecret, setWebhookSecret] = useState('')
  const navigate = useNavigate()
  const createRepoMutation = useCreateRepo()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRepoMutation.mutate(
      { name, cloneUrl, defaultBranch, webhookSecret },
      {
        onSuccess: () => {
          navigate('/dashboard')
        },
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Register New Repository</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Repository Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="owner/repository"
          />
        </div>

        <div>
          <label htmlFor="cloneUrl" className="block text-sm font-medium text-gray-700">
            Clone URL
          </label>
          <input
            type="text"
            id="cloneUrl"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={cloneUrl}
            onChange={(e) => setCloneUrl(e.target.value)}
            placeholder="https://github.com/owner/repository.git"
          />
        </div>

        <div>
          <label htmlFor="defaultBranch" className="block text-sm font-medium text-gray-700">
            Default Branch
          </label>
          <input
            type="text"
            id="defaultBranch"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
            Webhook Secret (optional)
          </label>
          <input
            type="text"
            id="webhookSecret"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Secret for webhook verification"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createRepoMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {createRepoMutation.isPending ? 'Registering...' : 'Register Repository'}
          </button>
        </div>
      </form>
    </div>
  )
}
