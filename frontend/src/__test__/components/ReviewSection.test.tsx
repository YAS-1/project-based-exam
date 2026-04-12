/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import ReviewSection from '@/components/ReviewSection'
import { moviesAPI } from '@/lib/api'

// Mock the AuthContext
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

// Mock API calls
jest.mock('@/lib/api', () => ({
  moviesAPI: {
    getReviews: jest.fn(), // Mocked to return a sample review
    submitReview: jest.fn(), // Mocked to simulate successful review submission
  },
}))

// Mock next/navigation
describe('ReviewSection Component', () => {
  beforeEach(() => {
    (moviesAPI.getReviews as jest.Mock).mockResolvedValue({
      results: [
        {
          id: 1,
          username: 'TestUser',
          rating: 4,
          text: 'Great movie!',
          created_at: new Date().toISOString(),
        },
      ],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Test cases for rendering reviews and the review form
  it('renders reviews correctly after loading', async () => {
    render(<ReviewSection movieId={550} />)

    // Wait for the reviews to load
    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument()
      expect(screen.getByText('Great movie!')).toBeInTheDocument()
    })
  })

  it('renders the write review form when authenticated', async () => {
    render(<ReviewSection movieId={550} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Share your thoughts about this movie.../i)).toBeInTheDocument() // Check for the rating select
      expect(screen.getByText('Post Review')).toBeInTheDocument()
    })
  })
})