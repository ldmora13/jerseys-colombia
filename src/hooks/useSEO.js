import { useMemo } from 'react';

const generarSlugOptimizado = (product, category) => {
  let team = product.team || '';
  let year = product.year || '';
  let type = product.type || product.category || '';

  team = team.replace(/\s+(FC|CF|AC|SC|United|City|Real|Club)\s*/gi, '');
  
  if (category === 'f1') {
    return `${team}-${year}`.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
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

export const useSEO = (producto, category, name) => {
  return useMemo(() => {
    if (!producto) return null;
    
    const baseUrl = window.location.origin;
    const slug = generarSlugOptimizado(producto, category);
    const currentUrl = `${baseUrl}/${category}/${slug}`;
    
    let title, description, keywords, brand;
    
    if (producto.sport === 'futbol') {
      const categoryName = producto.category === 'manga_larga' ? 'Manga Larga' : 
                          producto.category === 'home' ? 'Local' :
                          producto.category === 'away' ? 'Visitante' :
                          producto.category === 'third' ? 'Tercera' : 
                          producto.category;
      
      title = `Jersey ${producto.team} ${producto.year} ${categoryName}`;
      description = `Compra el jersey oficial de ${producto.team} temporada ${producto.year} (${categoryName}). ✅ Calidad Fan Premium ✅ Logos bordados ✅ Personalización disponible ✅ Envío gratis pedidos 5+ productos. Precio: $${producto.price} USD`;
      keywords = `jersey ${producto.team}, camiseta futbol ${producto.team}, ${producto.team} ${producto.year}, jerseys colombia, futbol ${categoryName}, comprar jersey ${producto.team}`;
      brand = producto.team;
    } else if (producto.sport === 'nba') {
      const categoryName = producto.category === 'Jersey' ? 'Jersey' : producto.category;
      title = `${categoryName} ${producto.team} ${producto.year} NBA`;
      description = `${categoryName} oficial ${producto.team} NBA temporada ${producto.year}. ✅ Calidad Premium ✅ Microperforaciones ✅ Logos termo-sellados ✅ Material ultra-ligero. Precio: $${producto.price} USD`;
      keywords = `${producto.team} jersey NBA, basketball ${producto.team}, NBA ${producto.year}, ${producto.team} ${categoryName}, comprar jersey NBA`;
      brand = producto.team;
    } else if (producto.sport === 'f1') {
      const typeName = producto.type || 'Camiseta';
      title = `${typeName} ${producto.team} F1 ${producto.year}`;
      description = `${typeName} oficial ${producto.team} Fórmula 1 temporada ${producto.year}. ✅ Material premium ✅ Logos bordados ✅ Patrocinadores oficiales ✅ Calidad Triple A+. Precio: $${producto.price} USD`;
      keywords = `F1 ${producto.team}, formula 1 ${producto.team}, ${producto.team} ${producto.year}, motorsport, ${typeName} F1, comprar camiseta F1`;
      brand = producto.team;
    }
    
    keywords += ', jerseys colombia, jerseys bogotá, camisetas deportivas colombia, tienda deportiva online';
    
    return {
      title,
      description,
      keywords,
      image: producto.img?.[producto.img.length - 1],
      url: currentUrl,
      type: 'product',
      price: producto.price,
      currency: 'USD',
      availability: 'in stock',
      brand,
      category: category,
      team: producto.team,
      year: producto.year,
      sport: producto.sport
    };
  }, [producto, category, name]);
};


export const useCategorySEO = (category, products) => {
  return useMemo(() => {
    if (!category) return null;
    
    const baseUrl = window.location.origin;
    const currentUrl = `${baseUrl}/${category}`;
    const productCount = products?.length || 0;
    
    let title, description, keywords;
    
    if (category === 'futbol') {
      title = `Jerseys de Fútbol Originales | ${productCount}+ Equipos Disponibles`;
      description = `Descubre nuestra colección de +${productCount} jerseys de fútbol originales. ✅ Equipos europeos y sudamericanos ✅ Temporadas 2023-2025 ✅ Calidad Fan Premium ✅ Personalización disponible ✅ Envío gratis pedidos 5+`;
      keywords = 'jerseys futbol, camisetas futbol, jerseys equipos europeos, jerseys liga colombiana, real madrid jersey, barcelona jersey, manchester united jersey, psg jersey, juventu jersey, milan jersey, chelsea jersey, arsenal jersey, liverpool jersey, bayern munich jersey, borussia dortmund jersey, atletico madrid jersey, valencia jersey, sevilla jersey, napoli jersey, inter milan jersey, roma jersey, lazio jersey, atalanta jersey, fiorentina jersey, tottenham jersey, manchester city jersey, leicester jersey, west ham jersey, everton jersey, leeds jersey, newcastle jersey, crystal palace jersey, brighton jersey, southampton jersey, burnley jersey, norwich jersey, watford jersey, brentford jersey, colombia jersey, argentina jersey, brasil jersey, peru jersey, ecuador jersey, chile jersey, uruguay jersey, mexico jersey, usa jersey, canada jersey';
    } else if (category === 'nba') {
      title = `Jerseys NBA Originales | ${productCount}+ Equipos y Jugadores`;
      description = `Colección completa de jerseys NBA oficiales con +${productCount} opciones. ✅ Lakers, Warriors, Bulls, Heat ✅ LeBron, Curry, Jordan ✅ Temporadas actuales ✅ Calidad Premium ✅ Material ultra-ligero`;
      keywords = 'jerseys NBA, camisetas baloncesto, lakers jersey, warriors jersey, bulls jersey, heat jersey, celtics jersey, nets jersey, knicks jersey, sixers jersey, bucks jersey, raptors jersey, pacers jersey, pistons jersey, cavaliers jersey, hawks jersey, hornets jersey, magic jersey, wizards jersey, clippers jersey, kings jersey, suns jersey, trail blazers jersey, jazz jersey, nuggets jersey, timberwolves jersey, thunder jersey, rockets jersey, mavericks jersey, spurs jersey, pelicans jersey, grizzlies jersey, lebron james jersey, stephen curry jersey, kevin durant jersey, kawhi leonard jersey, giannis jersey, luka doncic jersey, trae young jersey, ja morant jersey, zion williamson jersey, jayson tatum jersey';
    } else if (category === 'f1') {
      title = `Camisetas F1 Oficiales | ${productCount}+ Equipos de Fórmula 1`;
      description = `Camisetas oficiales de Fórmula 1 con +${productCount} diseños únicos. ✅ Ferrari, Mercedes, Red Bull ✅ Max Verstappen, Lewis Hamilton ✅ Temporada 2024-2025 ✅ Material premium ✅ Logos oficiales`;
      keywords = 'camisetas F1, formula 1 merchandise, ferrari camiseta, mercedes camiseta, red bull camiseta, mclaren camiseta, alpine camiseta, aston martin camiseta, williams camiseta, alfa romeo camiseta, haas camiseta, alphatauri camiseta, max verstappen camiseta, lewis hamilton camiseta, charles leclerc camiseta, lando norris camiseta, carlos sainz camiseta, george russell camiseta, fernando alonso camiseta, sebastian vettel camiseta, daniel ricciardo camiseta, pierre gasly camiseta';
    }
    
    keywords += ', colombia, bogotá, medellín, cali, barranquilla, cartagena, tienda deportiva, envío colombia';
    
    return {
      title,
      description,
      keywords,
      url: currentUrl,
      type: 'website',
      category
    };
  }, [category, products]);
};

export const useHomeSEO = (featuredProducts) => {
  return useMemo(() => {
    const baseUrl = window.location.origin;
    const productCount = featuredProducts?.length || 1500;
    
    return {
      title: 'Jerseys Colombia | Tienda #1 de Jerseys Originales en Colombia',
      description: `🏆 Tienda #1 de jerseys originales en Colombia con +${productCount} productos. ✅ Fútbol, NBA, F1 ✅ Equipos europeos y americanos ✅ Calidad Premium ✅ Personalización ✅ Envío gratis pedidos 5+ ✅ Pago contraentrega`,
      keywords: 'jerseys colombia, camisetas deportivas, jerseys originales, tienda jerseys bogotá, jerseys futbol, jerseys NBA, camisetas F1, real madrid, barcelona, lakers, warriors, ferrari, mercedes, envío colombia, pago contraentrega, jerseys baratos, jerseys premium, personalización jerseys, tienda deportiva online, camisetas equipos, jerseys jugadores, ropa deportiva',
      url: baseUrl,
      type: 'website',
      image: `${baseUrl}/og-home.jpg`
    };
  }, [featuredProducts]);
};