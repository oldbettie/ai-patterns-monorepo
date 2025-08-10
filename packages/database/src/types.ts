// @feature:database-types @domain:database @shared
// @summary: TypeScript types derived from database schemas

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { 
  user, 
  session, 
  account, 
  verification,
  devices,
  clipboardItems,
  clipboardFiles,
  wsTokens,
  pendingDeviceRegistrations,
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

// Device types
export type Device = InferSelectModel<typeof devices>
export type NewDevice = InferInsertModel<typeof devices>

// Clipboard Item types
export type ClipboardItem = InferSelectModel<typeof clipboardItems>
export type NewClipboardItem = InferInsertModel<typeof clipboardItems>

// Clipboard File types
export type ClipboardFile = InferSelectModel<typeof clipboardFiles>
export type NewClipboardFile = InferInsertModel<typeof clipboardFiles>

// WebSocket Token types
export type WsToken = InferSelectModel<typeof wsTokens>
export type NewWsToken = InferInsertModel<typeof wsTokens>

// Pending Device Registration types
export type PendingDeviceRegistration = InferSelectModel<typeof pendingDeviceRegistrations>
export type NewPendingDeviceRegistration = InferInsertModel<typeof pendingDeviceRegistrations>
