'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { YouTubeLandingContent } from './allset/landing-content/types'
import {
  ChannelHero,
  FeaturedVideos,
  PlaylistsSection,
  AboutSection,
  ChannelCta,
  ContactSection,
} from '../components/Main6'
import { useLandingContent } from '@/lib/useLandingContent'

const Main6 = () => {
  const { content, loading, error } = useLandingContent<YouTubeLandingContent>()
  if (loading) return null
  if (error || !content) return null
  const { channelInfo, featuredVideos, playlists, cta, about, contact, seo } = content

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 mix-blend-multiply blur-xl filter"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Channel Banner and Info */}
        <ChannelHero channelInfo={channelInfo} />

        {/* Featured Videos Section */}
        <FeaturedVideos videos={featuredVideos} />

        {/* Playlists Section */}
        {playlists && playlists.items.length > 0 && <PlaylistsSection playlists={playlists} />}

        {/* About Section */}
        {about && <AboutSection about={about} />}

        {/* Channel CTA Section */}
        <ChannelCta cta={cta} />

        {/* Contact Section */}
        {contact && <ContactSection contact={contact} />}
      </div>
    </div>
  )
}

export default Main6
