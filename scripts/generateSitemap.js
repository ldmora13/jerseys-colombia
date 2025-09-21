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

// URL base de tu sitio
const BASE_URL = 'https://www.jerseyscol.com';

// Función para generar slug (igual que en tu frontend)
const generarSlug = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
};

// Función para obtener todos los productos
async function getAllProducts() {
  try {
    console.log('🔌 Conectando a Supabase...');
    
    const [futbolRes, nbaRes, f1Res] = await Promise.all([
      supabase.from('futbol').select('name, category, index'),
      supabase.from('nba').select('name, deporte as category, index'),
      supabase.from('f1').select('name, category, index')
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
      console.log('\n🔧 Verifica tu configuración de Supabase y permisos de las tablas.');
    }

    const products = [];

    // Procesar productos de fútbol
    if (futbolRes.data && futbolRes.data.length > 0) {
      futbolRes.data.forEach(product => {
        products.push({
          url: `${BASE_URL}/futbol/${generarSlug(product.name)}`,
          lastmod: product.index ? new Date(product.index).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'futbol',
          name: product.name
        });
      });
    }

    // Procesar productos de NBA
    if (nbaRes.data && nbaRes.data.length > 0) {
      nbaRes.data.forEach(product => {
        products.push({
          url: `${BASE_URL}/nba/${generarSlug(product.name)}`,
          lastmod: product.index ? new Date(product.index).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'nba',
          name: product.name
        });
      });
    }

    // Procesar productos de F1
    if (f1Res.data && f1Res.data.length > 0) {
      f1Res.data.forEach(product => {
        products.push({
          url: `${BASE_URL}/${product.category.toLowerCase()}/${generarSlug(product.name)}`,
          lastmod: product.index ? new Date(product.index).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          priority: '0.8',
          category: 'f1',
          name: product.name
        });
      });
    }

    return products;
  } catch (error) {
    console.error('💥 Error crítico al obtener productos:', error.message);
    console.error('🔍 Detalles:', error);
    return [];
  }
}

// Función para generar el XML del sitemap
function generateSitemapXML(products) {
  const staticRoutes = [
    { url: `${BASE_URL}/`, priority: '1.0' },
    { url: `${BASE_URL}/futbol`, priority: '0.9' },
    { url: `${BASE_URL}/nba`, priority: '0.9' },
    { url: `${BASE_URL}/f1`, priority: '0.9' },
    { url: `${BASE_URL}/soporte`, priority: '0.7' },
    { url: `${BASE_URL}/politicas`, priority: '0.7' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
`;

  // Agregar rutas estáticas
  staticRoutes.forEach(route => {
    xml += `  <url>
    <loc>${route.url}</loc>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  xml += `
`;

  // Agregar productos dinámicos
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

// Función principal
async function generateSitemap() {
  console.log('🚀 Iniciando generación de sitemap...\n');
  
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

  const sitemapXML = generateSitemapXML(products);
  
  // Asegurarse de que existe la carpeta public
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Carpeta public/ creada');
  }
  
  // Escribir el sitemap
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
  
  console.log('\n🎉 ¡Sitemap generado exitosamente!');
  console.log(`📊 Total de URLs: ${products.length + 6} (${products.length} productos + 6 estáticas)`);
  console.log(`📁 Archivo guardado en: ${sitemapPath}`);
  
  // Mostrar resumen por categoría
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📈 Productos por categoría:', categoryCounts);
  
  // Mostrar algunas URLs de ejemplo
  console.log('\n🔗 Ejemplo de URLs generadas:');
  products.slice(0, 3).forEach(product => {
    console.log(`   - ${product.url}`);
  });
  
  console.log(`\n✅ Sitemap listo en: https://www.jerseyscol.com/sitemap.xml`);
}

// Ejecutar
generateSitemap().catch(console.error);