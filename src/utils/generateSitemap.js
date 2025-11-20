// This will be a Node script to generate sitemap
import { supabase } from '../../lib/supabase.js'
import fs from 'fs'

async function generateSitemap() {
  const baseUrl = 'https://intellectualintimacy.co.za'
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.9', changefreq: 'monthly' },
    { url: '/events', priority: '0.9', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    // { url: '/values', priority: '0.7', changefreq: 'monthly' },
    // { url: '/philosophy', priority: '0.7', changefreq: 'monthly' }
  ]

  // Fetch dynamic blog posts
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, slug, updated_at')
    .eq('is_published', true)

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('id, slug, event_date')
    .eq('is_published', true)

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  })

  // Add blog posts
  blogs?.forEach(blog => {
    sitemap += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug || blog.id}</loc>
    <lastmod>${blog.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  // Add events
  events?.forEach(event => {
    sitemap += `
  <url>
    <loc>${baseUrl}/events/${event.slug || event.id}</loc>
    <lastmod>${new Date(event.event_date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  sitemap += '\n</urlset>'

  // Write to public folder
  fs.writeFileSync('public/sitemap.xml', sitemap)
  console.log('✅ Sitemap generated successfully!')
}

generateSitemap()