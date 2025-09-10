import React, { Suspense } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedBusinesses from '@/components/FeaturedBusinesses'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <main>
        <Suspense fallback={<div className="h-96 bg-gradient-to-r from-red-600 to-red-700"></div>}>
          <HeroSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-50"></div>}>
          <CategoryGrid />
        </Suspense>
        
        <Suspense fallback={<div className="h-96 bg-white"></div>}>
          <FeaturedBusinesses />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  )
}
