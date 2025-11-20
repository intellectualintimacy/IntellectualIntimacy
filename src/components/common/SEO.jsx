import { Helmet } from 'react-helmet-async'

export default function SEO({ 
  title = 'Intellectual Intimacy - Deep Conversations, Meaningful Connections',
  description = 'Join Intellectual Intimacy for profound conversations that foster genuine human connections through thoughtful dialogue, philosophy and shared inquiry.',
  keywords = 'intellectual intimacy, deep conversations, meaningful connections, philosophy discussions, human connection, dialogue community, thoughtful discussions',
  image = 'https://intellectualintimacy.co.za/og-image.jpg',
  url = 'https://intellectualintimacy.co.za',
  type = 'website',
  author = 'Intellectual Intimacy',
  published = '',
  modified = '',
  article = false
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Intellectual Intimacy",
    "url": "https://intellectualintimacy.co.za",
    "logo": "https://intellectualintimacy.com/II logo.png",
    "description": description,
    "sameAs": [
      "https://www.youtube.com/@Intellectual-Intimacy",
      "https://www.instagram.com/intellectualintimacy",
      "https://www.linkedin.com/company/intellectualintimacy"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "dlaminimpumelelo980@gmail.com",
      "contactType": "customer service"
    }
  }

  const articleStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Intellectual Intimacy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://intellectualintimacy.co.za/II logo.png"
      }
    },
    "datePublished": published,
    "dateModified": modified || published
  } : null

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Intellectual Intimacy" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@IntellectualIntimacy" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Mobile Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1c1917" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {article && articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Helmet>
  )
}