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

// FUNCIÓN PARA GENERAR SLUG DESDE PRODUCT.NAME (igual que en Product.jsx)
const generarSlugDesdeNombre = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/\s+/g, "-") // Espacios por guiones
    .replace(/[^a-z0-9-]/g, "") // Solo letras, números y guiones
    .replace(/-+/g, "-") // Múltiples guiones por uno solo
    .replace(/^-|-$/g, ""); // Remover guiones al inicio/final
};

async function getAllProducts() {
  try {
    console.log('🔌 Conectando a Supabase...');
    
    const [futbolRes, nbaRes, f1Res] = await Promise.all([
      supabase.from('futbol').select('name, team, year, category, index, price, img'),
      supabase.from('nba').select('name, team, year, category, index, price, img'),
      supabase.from('f1').select('name, team, year, type, category, index, price, img')
    ]);

    console.log('📊 Respuestas de la base de datos:');
    console.log('⚽ Fútbol:', futbolRes.error ? `❌ ${futbolRes.error.message}` : `✅ ${futbolRes.data?.length} productos`);
    console.log('🏀 NBA:', nbaRes.error ? `❌ ${nbaRes.error.message}` : `✅ ${nbaRes.data?.length} productos`);
    console.log('🏎️ F1:', f1Res.error ? `❌ ${f1Res.error.message}` : `✅ ${f1Res.data?.length} productos`);

    // Verificar errores
    if (futbolRes.error || nbaRes.error || f1Res.error) {
      console.log('\n❌ Errores encontrados:');
      if (futbolRes.error) console.log('- Fútbol:', futbolRes.error.message);
      if (nbaRes.error) console.log('- NBA:', nbaRes.error.message);
      if (f1Res.error) console.log('- F1:', f1Res.error.message);
      return [];
    }

    const products = [];

    // Procesar productos de fútbol
    if (futbolRes.data && futbolRes.data.length > 0) {
      futbolRes.data.forEach(product => {
        const slug = generarSlugDesdeNombre(product.name);
        if (slug) { 
          products.push({
            url: `${BASE_URL}/futbol/${slug}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: '0.8',
            category: 'futbol',
            name: product.name,
            team: product.team,
            year: product.year,
            price: product.price,
            image: product.img?.[-1]
          });
        }
      });
    }

    // Procesar productos de NBA
    if (nbaRes.data && nbaRes.data.length > 0) {
      nbaRes.data.forEach(product => {
        const slug = generarSlugDesdeNombre(product.name);
        if (slug) {
          products.push({
            url: `${BASE_URL}/nba/${slug}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: '0.8',
            category: 'nba',
            name: product.name,
            team: product.team,
            year: product.year,
            price: product.price,
            image: product.img?.[-1]
          });
        }
      });
    }

    // Procesar productos de F1
    if (f1Res.data && f1Res.data.length > 0) {
      f1Res.data.forEach(product => {
        const slug = generarSlugDesdeNombre(product.name);
        if (slug) {
          products.push({
            url: `${BASE_URL}/f1/${slug}`,
            lastmod: new Date().toISOString().split('T')[0],
            priority: '0.8',
            category: 'f1',
            name: product.name,
            team: product.team,
            year: product.year,
            price: product.price,
            image: product.img?.[-1]
          });
        }
      });
    }

    return products;
  } catch (error) {
    console.error('💥 Error crítico al obtener productos:', error.message);
    return [];
  }
}

// Función para generar el XML del sitemap con metadatos mejorados
function generateSitemapXML(products) {
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

  // Agregar rutas estáticas
  staticRoutes.forEach(route => {
    xml += `  <url>
    <loc>${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  // Agregar productos dinámicos con información de imagen
  products.forEach(product => {
    xml += `  <url>
    <loc>${product.url}</loc>
    <lastmod>${product.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${product.priority}</priority>`;
    
    // Agregar información de imagen si existe
    if (product.image) {
      xml += `
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>Jersey ${product.team} ${product.year} - $${product.price} USD</image:caption>
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  });

  xml += `</urlset>`;

  return xml;
}

// Función para crear robots.txt optimizado
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay para evitar sobrecarga del servidor
Crawl-delay: 1

# Bloquear archivos y rutas innecesarias
Disallow: /api/
Disallow: /_next/
Disallow: /build/
Disallow: /node_modules/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*
Disallow: /*?*ref=*
Disallow: /admin/
Disallow: /private/
Disallow: /checkout/
Disallow: /cart/

# Permitir específicamente URLs importantes
Allow: /futbol/
Allow: /nba/
Allow: /f1/
Allow: /soporte/
Allow: /politicas/

# Directrices específicas para diferentes bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: Slurp
Crawl-delay: 2

# Bloquear bots maliciosos
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /`;
}

// Función principal
async function generateSitemap() {
  console.log('🚀 Generando sitemap con slugs basados en product.name...\n');
  
  const products = await getAllProducts();
  
  if (products.length === 0) {
    console.log('\n❌ No se encontraron productos.');
    console.log('🔧 Posibles causas:');
    console.log('   1. Credenciales de Supabase incorrectas');
    console.log('   2. Tablas vacías o nombres incorrectos');
    console.log('   3. Permisos insuficientes (RLS activo sin políticas)');
    console.log('   4. URL de Supabase incorrecta\n');
    return;
  }

  // Verificar duplicados
  const urls = products.map(p => p.url);
  const duplicates = urls.filter((item, index) => urls.indexOf(item) !== index);
  
  if (duplicates.length > 0) {
    console.log('⚠️ URLs duplicadas encontradas:');
    duplicates.forEach(url => console.log(`   - ${url}`));
    console.log('');
  }

  const sitemapXML = generateSitemapXML(products);
  
  // Asegurar que existe la carpeta public
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Carpeta public/ creada');
  }
  
  // Escribir el sitemap
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
  
  // Escribir robots.txt
  const robotsPath = path.join(publicDir, 'robots.txt');
  const robotsContent = generateRobotsTxt();
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  
  console.log('\n🎉 ¡Sitemap y robots.txt generados exitosamente!');
  console.log(`📊 Total de URLs: ${products.length + 6} (${products.length} productos + 6 estáticas)`);
  console.log(`📁 Sitemap: ${sitemapPath}`);
  console.log(`📁 Robots: ${robotsPath}`);
  
  // Mostrar resumen por categoría
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 Productos por categoría:', categoryCounts);
  
  // Mostrar algunas URLs de ejemplo
  console.log('\n🔗 Ejemplo de URLs generadas:');
  products.slice(0, 5).forEach(product => {
    console.log(`   - ${product.url}`);
  });
  
  // Mostrar URLs de Mercedes como ejemplo
  const mercedesProducts = products.filter(p => p.team && p.team.toLowerCase().includes('mercedes'));
  if (mercedesProducts.length > 0) {
    console.log('\n🏎️ Ejemplo URLs Mercedes (diferentes variantes):');
    mercedesProducts.slice(0, 3).forEach(product => {
      console.log(`   - ${product.url} (${product.name})`);
    });
  }
  
  console.log(`\n✅ Sitemap disponible en: ${BASE_URL}/sitemap.xml`);
  console.log(`✅ Robots.txt disponible en: ${BASE_URL}/robots.txt`);
}

// Ejecutar
generateSitemap().catch(console.error);