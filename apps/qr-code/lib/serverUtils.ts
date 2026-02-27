import "server-only"
import { auth } from "@/lib/auth/auth"
import { getBaseUrl } from "@/lib/utils"
import { headers } from "next/headers"

/**
 * Secure fetch wrapper that automatically handles authentication and forwards cookies
 * @throws {Error} If user is not authenticated or if the request fails
 */
export async function secureFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    // Filter out headers that should not be forwarded or will be recalculated
    const headersToExclude = new Set([
        'content-length',
        'content-encoding',
        'transfer-encoding',
        'host',
    ])

    // If body is FormData, also exclude content-type to let fetch set the boundary
    if (init?.body instanceof FormData) {
        headersToExclude.add('content-type')
    }

    const filteredHeaders = Object.fromEntries(
        Array.from(headersList.entries()).filter(
            ([key]) => !headersToExclude.has(key.toLowerCase())
        )
    )

    const response = await fetch(`${getBaseUrl()}${input}`, {
        ...init,
        headers: {
            ...filteredHeaders,
            ...(init?.headers || {}),
        },
    })

    if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

/**
 * Public fetch wrapper that forwards cookies (for optional auth) but doesn't require a session
 * @throws {Error} If the request fails
 */
export async function publicFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const headersList = await headers()

    // Filter out headers that should not be forwarded or will be recalculated
    const headersToExclude = new Set([
        'content-length',
        'content-encoding',
        'transfer-encoding',
        'host',
    ])

    // If body is FormData, also exclude content-type to let fetch set the boundary
    if (init?.body instanceof FormData) {
        headersToExclude.add('content-type')
    }

    const filteredHeaders = Object.fromEntries(
        Array.from(headersList.entries()).filter(
            ([key]) => !headersToExclude.has(key.toLowerCase())
        )
    )

    const response = await fetch(`${getBaseUrl()}${input}`, {
        ...init,
        headers: {
            ...filteredHeaders,
            ...(init?.headers || {}),
        },
    })

    if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}
