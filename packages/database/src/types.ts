// @feature:database-types @domain:database @shared
// @summary: TypeScript types derived from database schemas

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { 
  user, 
  session, 
  account, 
  verification,
} from './schemas'

// User types
export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

// Session types
export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>

// Account types
export type Account = InferSelectModel<typeof account>
export type NewAccount = InferInsertModel<typeof account>

// Verification types
export type Verification = InferSelectModel<typeof verification>
export type NewVerification = InferInsertModel<typeof verification>
