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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog da Demo Store</h1>
          <p className="text-xl text-gray-600">
            Conteúdo interessante sobre tecnologia, produtos e dicas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Blog Post 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">Tecnologia • 5 min leitura</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Como escolher o smartphone ideal para você
              </h3>
              <p className="text-gray-600 mb-4">
                Guia completo para escolher o smartphone que melhor atende às suas necessidades...
              </p>
              <Link
                href="/produto/1"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver produtos relacionados →
              </Link>
            </div>
          </article>

          {/* Blog Post 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">Analytics • 3 min leitura</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                A importância dos dados na tomada de decisão
              </h3>
              <p className="text-gray-600 mb-4">
                Como os dados de analytics podem transformar seu negócio e estratégia...
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver dashboard →
              </Link>
            </div>
          </article>

          {/* Blog Post 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">E-commerce • 4 min leitura</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tendências de e-commerce para 2024
              </h3>
              <p className="text-gray-600 mb-4">
                Descubra as principais tendências que vão revolucionar o comércio eletrônico...
              </p>
              <Link
                href="/produto/2"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Explorar produtos →
              </Link>
            </div>
          </article>
        </div>

        {/* Analytics Info */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Analytics do Blog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Conteúdo Rastreado:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Visualizações de página</li>
                <li>• Tempo de leitura estimado</li>
                <li>• Taxa de rejeição</li>
                <li>• Fontes de tráfego para o blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Benefícios:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Otimização de conteúdo</li>
                <li>• Análise de engajamento</li>
                <li>• Estratégias de SEO</li>
                <li>• Conversão de visitantes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
