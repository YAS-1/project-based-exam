import '@testing-library/jest-dom' // Import jest-dom for extended assertions

// Mock next/navigation
jest.mock('next/navigation', () => ({  // Mock the useRouter hook
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
  useParams: () => ({
    id: '550' // mock TMDB ID
  }),
})) // Mock the next/navigation module to prevent errors related to useRouter and useSearchParams in tests

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {  // Mock the matchMedia function
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),// Mock addEventListener for modern browsers
    removeEventListener: jest.fn(),// Mock removeEventListener for modern browsers
    dispatchEvent: jest.fn(),// Mock dispatchEvent for modern browsers
  })),
})