import { beforeEach, vi } from 'vitest'

// Mock server-only module for tests
vi.mock('server-only', () => ({}))

// Mock the database connection
vi.mock('@quick-pdfs/database/src/database', () => ({
  db: {},
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'

// Mock crypto for Node.js test environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
  },
})

beforeEach(() => {
  // Reset any global state before each test
  vi.clearAllMocks()
})
