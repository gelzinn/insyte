'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BlogPage() {
  const trackPageView = async () => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackPageView',
          sessionId: `session_${Date.now()}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          url: window.location.href,
          title: 'Blog - Demo Store',
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
          ip: '127.0.0.1'
        })
      })

      if (response.ok) {
        console.log('Blog page view tracked')
      }
    } catch (error) {
      console.error('Failed to track blog page view:', error)
    }
  }

  useEffect(() => {
    trackPageView()

    // Track page exit
    return () => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackPageExit',
          sessionId: `session_${Date.now()}`,
          url: window.location.href,
          duration: 45 // Simulate 45 seconds reading
        })
      }).catch(console.error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Demo Store
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Demo Store Blog</h1>
          <p className="text-xl text-gray-600">
            Interesting content about technology, products, and tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Blog Post 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">Technology • 5 min read</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How to choose the ideal smartphone for you
              </h3>
              <p className="text-gray-600 mb-4">
                A complete guide to choosing the smartphone that best fits your needs...
              </p>
              <Link
                href="/product/1"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View related products →
              </Link>
            </div>
          </article>

          {/* Blog Post 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">Analytics • 3 min read</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                The importance of data in decision making
              </h3>
              <p className="text-gray-600 mb-4">
                How analytics data can transform your business and strategy...
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View dashboard →
              </Link>
            </div>
          </article>

          {/* Blog Post 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">E-commerce • 4 min read</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                E-commerce trends for 2024
              </h3>
              <p className="text-gray-600 mb-4">
                Discover the main trends that will revolutionize online commerce...
              </p>
              <Link
                href="/product/2"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Explore products →
              </Link>
            </div>
          </article>
        </div>

        {/* Analytics Info */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Blog Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Tracked content:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Page views</li>
                <li>• Estimated reading time</li>
                <li>• Bounce rate</li>
                <li>• Blog traffic sources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Benefits:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Content optimization</li>
                <li>• Engagement analysis</li>
                <li>• SEO strategies</li>
                <li>• Visitor conversion</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
