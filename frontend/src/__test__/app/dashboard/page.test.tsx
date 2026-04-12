import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { recommendationsAPI } from '@/lib/api'

// Mock the AuthContext
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

// Mock API
jest.mock('@/lib/api', () => ({
  recommendationsAPI: {
    getDashboard: jest.fn(),
    getWatchlist: jest.fn(),
  },
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Basic mock return values
    (recommendationsAPI.getDashboard as jest.Mock).mockResolvedValue({
      stats: {
        watchlist_count: 5,
        liked_movies: 10,
        disliked_movies: 2,
        reviews_count: 3
      },
      recent_interactions: []
    });

    (recommendationsAPI.getWatchlist as jest.Mock).mockResolvedValue([]);
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard metrics successfully', async () => {
    render(<DashboardPage />)

    // Wait for state to update after API call
    await waitFor(() => {
      // It should display the static skeleton initially or the layout, then the stats
      expect(screen.getByText(/Watchlist/i)).toBeInTheDocument()
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText(/Preference Scores/i)).toBeInTheDocument()
    })
  })
})