import { beforeEach, vi } from 'vitest'

// Mock server-only module for tests
vi.mock('server-only', () => ({}))

// Mock the database connection
vi.mock('@proxy-fam/database/src/database', () => ({
  db: vi.fn(),
}))

// Mock the repository functions
vi.mock('@proxy-fam/database/src/repositories/allowListRepository', () => ({
  createAllowListRepository: vi.fn(),
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock crypto for Node.js test environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
})

beforeEach(() => {
  // Reset any global state before each test
  vi.clearAllMocks()
})
