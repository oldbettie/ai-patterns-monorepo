// @feature:configuration @domain:common @shared
// @summary: Configuration types and validation for the proxy family project

import { z } from 'zod'

// Basic proxy configuration schema
export const ProxyConfigSchema = z.object({
  listenPort: z.number().min(1).max(65535).default(8080),
  listenAddress: z.string().default('127.0.0.1'),
  enableHTTPS: z.boolean().default(true),
  certificatePath: z.string().optional(),
  privateKeyPath: z.string().optional()
})

// Routing rule validation schema (different from the database interface)
export const RoutingRuleInputSchema = z.object({
  id: z.string(),
  domain: z.string().min(1),
  action: z.enum(['DIRECT', 'PROXY', 'BLOCK']),
  region: z.string().optional(),
  priority: z.number().int().min(0).default(0),
  description: z.string().optional(),
  enabled: z.boolean().default(true)
})

// Proxy endpoint validation schema
export const ProxyEndpointInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(0).default(0)
})

// Family profile validation schema
export const FamilyProfileInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  userId: z.string(),
  restrictions: z.string().optional(),
  allowedDomains: z.string().optional(),
  blockedDomains: z.string().optional()
})

// Main configuration schema
export const ConfigurationSchema = z.object({
  proxySettings: ProxyConfigSchema,
  routingRules: z.array(RoutingRuleInputSchema).default([]),
  familyProfiles: z.array(FamilyProfileInputSchema).default([]),
  remoteProxies: z.array(ProxyEndpointInputSchema).default([]),
  lastUpdated: z.date().default(new Date())
})

// Export TypeScript types for validation schemas
export type ProxyConfig = z.infer<typeof ProxyConfigSchema>
export type RoutingRuleInput = z.infer<typeof RoutingRuleInputSchema>
export type ProxyEndpointInput = z.infer<typeof ProxyEndpointInputSchema>
export type FamilyProfileInput = z.infer<typeof FamilyProfileInputSchema>
export type Configuration = z.infer<typeof ConfigurationSchema>

// Validation helper functions
export const validateProxyConfig = (data: unknown): ProxyConfig => {
  return ProxyConfigSchema.parse(data)
}

export const validateRoutingRule = (data: unknown): RoutingRuleInput => {
  return RoutingRuleInputSchema.parse(data)
}

export const validateProxyEndpoint = (data: unknown): ProxyEndpointInput => {
  return ProxyEndpointInputSchema.parse(data)
}

export const validateFamilyProfile = (data: unknown): FamilyProfileInput => {
  return FamilyProfileInputSchema.parse(data)
}

export const validateConfiguration = (data: unknown): Configuration => {
  return ConfigurationSchema.parse(data)
}