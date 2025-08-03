# AI Tags Reference

This file contains all current tags used in the project for AI-assisted development. Always check this file before creating new tags to maintain consistency.

## Current Tags

### Features

-   `@feature:proxy-routing` - Core proxy server and traffic routing
-   `@feature:rule-management` - Routing rule creation and management
-   `@feature:cert-management` - SSL/TLS certificate handling
-   `@feature:web-ui` - Web interface for configuration
-   `@feature:family-profiles` - Family member profile management
-   `@feature:analytics` - Usage monitoring and performance tracking
-   `@feature:system-integration` - OS proxy configuration
-   `@feature:config-management` - Configuration loading and hot reload

### Domains

-   `@domain:traffic` - Network traffic handling and routing
-   `@domain:security` - Certificate management and security
-   `@domain:config` - Configuration and settings management
-   `@domain:monitoring` - Analytics and performance monitoring
-   `@domain:system` - Operating system integration

### Layers

-   `@backend` - Server-side logic, databases, background jobs
-   `@api` - REST/GraphQL endpoints and API logic
-   `@frontend` - Client-side components and views

### Special Tags

-   `@reusable` - Components/utilities that can be reused across features
-   `@shared` - Code shared across multiple domains

## Tag Usage Examples

-   `@feature:user-profile @domain:users @frontend` - User profile editing form
-   `@feature:user-auth @domain:auth @api` - Login endpoint
-   `@feature:dashboard @domain:analytics @backend` - Data aggregation service
-   `@reusable @frontend` - Shared UI components
-   `@shared @backend` - Database connection utilities

## Guidelines

1. **Feature tags**: Use kebab-case for multi-word features (`@feature:user-profile`)
2. **Domain tags**: Keep domains broad but specific (`@domain:auth`, not `@domain:authentication-and-authorization`)
3. **Layer tags**: Use the most specific layer that applies
4. **Combine tags**: Most code should have 2-3 tags minimum (feature + domain + layer)
5. **Before creating new tags**: Check this file first to avoid duplicates

## Last Updated

_Update this date when adding new tags_
Date: [Current Date]
