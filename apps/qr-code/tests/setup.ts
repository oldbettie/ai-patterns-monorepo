import { beforeEach, vi } from 'vitest'

// Mock server-only module for tests
vi.mock('server-only', () => ({}))

// Mock the database connection
vi.mock('@quick-pdfs/database/src/database', () => ({
  db: {},
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.POLAR_ACCESS_TOKEN = 'pat_test_mock'
process.env.POLAR_WEBHOOK_SECRET = 'whsec_test_mock'
process.env.POLAR_PRODUCT_ID_SUPPORTER = 'prod_test_supporter'
process.env.POLAR_PRODUCT_ID_PLUS = 'prod_test_plus'
process.env.POLAR_PRODUCT_ID_PRO = 'prod_test_pro'

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
