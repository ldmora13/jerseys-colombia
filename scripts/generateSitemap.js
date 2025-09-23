import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.jerseyscol.com';

// Función mejorada para generar URLs más cortas
const generarSlugOptimizado = (product, category) => {
  let team = product.team || '';
  let year = product.year || '';
  let type = product.type || product.category || '';
  
  // Limpiar y acortar nombres de equipos
  team = team.replace(/\s+(FC|CF|AC|SC|United|City|Real|Club)\s*/gi, '');
  
  
  if (category === 'f1') {
    return `${team}-${year}`.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
  // Para fútbol y NBA, team-year-type
  let parts = [team, year];
  if (type && !['fan', 'player', 'jersey'].includes(type.toLowerCase())) {
    parts.push(type);
  }
  
  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

async function getAllProductsOptimized() {
  try {
    console.log('🔌 Conectando a Supabase...');
    
    const [futbolRes, nbaRes, f1Res] = await Promise.all([
      supabase.from('futbol').select('name, team, year, category, index'),
      supabase.from('nba').select('name, team, year, category, index'),
      supabase.from('f1').select('name, team, year, category, index')
    ]);

    const products = [];

    // Procesar productos con URLs optimizadas
    if (futbolRes.data) {
      futbolRes.data.forEach(product => {
        const slug = generarSlugOptimizado(product, 'futbol');
        products.push({
          url: `${BASE_URL}/futbol/${slug}`,
          lastmod: new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'futbol',
          name: product.name,
          team: product.team,
          year: product.year
        });
      });
    }

    if (nbaRes.data) {
      nbaRes.data.forEach(product => {
        const slug = generarSlugOptimizado(product, 'nba');
        products.push({
          url: `${BASE_URL}/nba/${slug}`,
          lastmod: new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'nba',
          name: product.name,
          team: product.team,
          year: product.year
        });
      });
    }

    if (f1Res.data) {
      f1Res.data.forEach(product => {
        const slug = generarSlugOptimizado(product, 'f1');
        products.push({
          url: `${BASE_URL}/f1/${slug}`,
          lastmod: new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'f1',
          name: product.name,
          team: product.team,
          year: product.year
        });
      });
    }

    return products;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// 3. SITEMAP XML OPTIMIZADO CON MEJORES PRÁCTICAS
function generateOptimizedSitemapXML(products) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticRoutes = [
    { url: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${BASE_URL}/futbol`, priority: '0.9', changefreq: 'weekly' },
    { url: `${BASE_URL}/nba`, priority: '0.9', changefreq: 'weekly' },
    { url: `${BASE_URL}/f1`, priority: '0.9', changefreq: 'weekly' },
    { url: `${BASE_URL}/soporte`, priority: '0.5', changefreq: 'monthly' },
    { url: `${BASE_URL}/politicas`, priority: '0.3', changefreq: 'yearly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Rutas estáticas
  staticRoutes.forEach(route => {
    xml += `  <url>
    <loc>${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  // Productos con metadatos mejorados
  products.forEach(product => {
    xml += `  <url>
    <loc>${product.url}</loc>
    <lastmod>${product.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${product.priority}</priority>
  </url>
`;
  });

  xml += `</urlset>`;
  return xml;
}

// 4. FUNCIÓN PRINCIPAL ACTUALIZADA
async function generateOptimizedSitemap() {
  console.log('🚀 Generando sitemap optimizado para SEO...\n');
  
  const products = await getAllProductsOptimized();
  
  if (products.length === 0) {
    console.log('❌ No se encontraron productos');
    return;
  }

  const sitemapXML = generateOptimizedSitemapXML(products);
  
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
  
  console.log('✅ Sitemap SEO-optimizado generado!');
  console.log(`📊 ${products.length + 6} URLs totales`);
  console.log(`📁 ${sitemapPath}`);
  
  // Crear también robots.txt mejorado
  const robotsContent = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://www.jerseyscol.com/sitemap.xml

# Crawl-delay para evitar sobrecarga del servidor
Crawl-delay: 1

# Bloquear archivos innecesarios
Disallow: /api/
Disallow: /_next/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*
`;

  const robotsPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log('✅ robots.txt actualizado');
}

// Ejecutar
generateOptimizedSitemap().catch(console.error);