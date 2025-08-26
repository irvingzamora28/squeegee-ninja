'use client'

import { useEffect, useState } from 'react'

/**
 * Generic hook to load landing content from the DB via API.
 * Returns { content, loading, error }.
 *
 * Usage:
 *   const { content, loading, error } = useLandingContent<ProductSaaSLandingContent>()
 */
export function useLandingContent<T = unknown>() {
  const [content, setContent] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/allset/landing-content', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })
        if (!res.ok) {
          throw new Error(`Failed to load landing content: ${res.status}`)
        }
        const data = await res.json()
        // The route returns either the content object directly or an envelope
        const value = (data && (data.landing_content ?? data)) as T
        if (!cancelled) setContent(value)
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) setError(e.message)
          else setError('Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { content, loading, error }
}
