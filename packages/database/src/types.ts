// @feature:database-types @domain:database @shared
// @summary: TypeScript types derived from database schemas

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { 
  user, 
  session, 
  account, 
  verification, 
  routingRules, 
  proxyEndpoints, 
  familyProfiles, 
  deviceConfigs, 
  analyticsData,
  familyAllowLists,
  presetAllowLists
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

// Routing rule types
export type RoutingRule = InferSelectModel<typeof routingRules>
export type NewRoutingRule = InferInsertModel<typeof routingRules>

// Proxy endpoint types
export type ProxyEndpoint = InferSelectModel<typeof proxyEndpoints>
export type NewProxyEndpoint = InferInsertModel<typeof proxyEndpoints>

// Family profile types
export type FamilyProfile = InferSelectModel<typeof familyProfiles>
export type NewFamilyProfile = InferInsertModel<typeof familyProfiles>

// Device config types
export type DeviceConfig = InferSelectModel<typeof deviceConfigs>
export type NewDeviceConfig = InferInsertModel<typeof deviceConfigs>

// Analytics data types
export type AnalyticsData = InferSelectModel<typeof analyticsData>
export type NewAnalyticsData = InferInsertModel<typeof analyticsData>

// Family allow list types
export type FamilyAllowList = InferSelectModel<typeof familyAllowLists>
export type NewFamilyAllowList = InferInsertModel<typeof familyAllowLists>

// Preset allow list types
export type PresetAllowList = InferSelectModel<typeof presetAllowLists>
export type NewPresetAllowList = InferInsertModel<typeof presetAllowLists>

// Re-export for backward compatibility
export type UserTable = User
export type RoutingRuleTable = RoutingRule
export type ProxyEndpointTable = ProxyEndpoint
export type FamilyProfileTable = FamilyProfile