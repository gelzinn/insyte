'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ProdutoPageProps {
  params: {
    id: string
  }
}

export default function ProdutoPage({ params }: ProdutoPageProps) {
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
          title: `Produto ${params.id} - Demo Store`,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
          ip: '127.0.0.1',
          utmParams: {
            source: 'demo',
            medium: 'product_page',
            campaign: 'product_showcase'
          }
        })
      })

      if (response.ok) {
        console.log('Product page view tracked')
      }
    } catch (error) {
      console.error('Failed to track product page view:', error)
    }
  }

  useEffect(() => {
    // Track page view when component mounts
    trackPageView()

    // Track page exit when component unmounts
    return () => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackPageExit',
          sessionId: `session_${Date.now()}`,
          url: window.location.href,
          duration: 30 // Simulate 30 seconds on page
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:flex-shrink-0">
              <div className="h-96 w-full md:w-96 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
                Produto #{params.id}
              </div>
              <h1 className="mt-2 text-3xl leading-8 font-bold text-gray-900">
                Smartphone Premium {params.id}
              </h1>
              <p className="mt-4 text-gray-600">
                Este é um produto de demonstração para testar a biblioteca de analytics.
                A página atual está sendo rastreada automaticamente quando você a visita.
              </p>

              <div className="mt-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">R$ 2.999,00</span>
                  <span className="ml-3 text-sm text-gray-500 line-through">R$ 3.499,00</span>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(127 avaliações)</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📊</span>
                  <span>Dados de analytics sendo coletados automaticamente</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🎯</span>
                  <span>Parâmetros UTM incluídos na demonstração</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>Tempo na página sendo rastreado</span>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Adicionar ao Carrinho
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Lista de Desejos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Analytics em Tempo Real</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800">Dados Coletados:</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• URL da página atual</li>
                <li>• User Agent do navegador</li>
                <li>• Referrer (se aplicável)</li>
                <li>• Parâmetros UTM</li>
                <li>• Tempo na página</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Funcionalidades Demonstradas:</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Rastreamento automático de pageviews</li>
                <li>• Detecção de fonte de tráfego</li>
                <li>• Análise de campanhas UTM</li>
                <li>• Métricas de engajamento</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
