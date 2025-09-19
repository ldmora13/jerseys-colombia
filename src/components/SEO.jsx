import React from 'react';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  price,
  currency = 'USD',
  availability = 'in stock'
}) => {
  const siteName = 'Jerseys Colombia';
  const defaultImage = `${window.location.origin}/og-default.jpg`;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const ogImage = image || defaultImage;
  
  return (
    <>
      {/* Meta básico - React 19 los mueve automáticamente al <head> */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph (Facebook, WhatsApp) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Para productos - Schema.org JSON-LD */}
      {price && type === 'product' && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": title,
              "image": ogImage,
              "description": description,
              "brand": {
                "@type": "Brand",
                "name": siteName
              },
              "offers": {
                "@type": "Offer",
                "url": url,
                "priceCurrency": currency,
                "price": price,
                "availability": `https://schema.org/${availability.replace(' ', '')}`,
                "seller": {
                  "@type": "Organization",
                  "name": siteName
                }
              }
            })
          }}
        />
      )}
    </>
  );
};

export default SEO;
