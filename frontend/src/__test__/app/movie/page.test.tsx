/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import MovieDetailPage from '@/app/movie/[id]/page'
import { moviesAPI } from '@/lib/api'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '550' }),
}))

jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

jest.mock('@/lib/api', () => ({
  moviesAPI: {
    getDetail: jest.fn(),
    getReviews: jest.fn().mockResolvedValue({ results: [] }),
  },
  recommendationsAPI: {
    trackInteraction: jest.fn(),
  }
}))

describe('Movie Detail Page', () => {
  beforeEach(() => {
    (moviesAPI.getDetail as jest.Mock).mockResolvedValue({
      id: 550,
      title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      vote_average: 8.4,
      vote_count: 25000,
      runtime: 139,
      release_date: '1999-10-15',
      genres: [{ id: 18, name: 'Drama' }],
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/rr7E0NoGKxjmcfc0D5QGv0pP4j8.jpg',
      recommendations: { results: [] },
      similar: { results: [] }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the movie details successfully', async () => {
    render(<MovieDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Fight Club')).toBeInTheDocument()
      expect(screen.getByText(/A ticking-time-bomb insomniac/)).toBeInTheDocument()
    })
  })
})