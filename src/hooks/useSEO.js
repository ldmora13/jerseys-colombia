import { useMemo } from 'react';

const generarSlugOptimizado = (product, category) => {
  let team = product.team || '';
  let year = product.year || '';
  let type = product.type || product.category || '';

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
      
      const teamName = producto.team && /colombia/i.test(producto.team) ? 'Selección Colombia' : producto.team || 'Selección Colombia';
      title = `Camiseta ${teamName} ${producto.year} ${categoryName}`;
      description = `Compra la camiseta oficial de la ${teamName} temporada ${producto.year} (${categoryName}). Calidad premium, logos bordados y personalización disponible. Envíos a toda Colombia.`;
      keywords = `camiseta seleccion colombia, camiseta colombia ${producto.year}, camiseta colombia ${categoryName}, camiseta colombia retro, camiseta colombia oficial`;
      brand = teamName;
    }
    
    keywords += ', camisetas seleccion colombia, tienda camisetas colombia, camisetas retro colombia';
    
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
      title = `Camisetas de la Selección Colombia | Retro, Actual y Histórica`;
      description = `Explora nuestra colección de camisetas de la Selección Colombia: ediciones retro, actuales y míticas. Calidad premium y personalización disponible.`;
      keywords = 'camisetas seleccion colombia, camiseta colombia retro, camiseta colombia oficial, camiseta colombia historica';
    }
    keywords += ', colombia, bogotá, medellín, cali, barranquilla, tienda camisetas colombia';
    
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
      title: 'Jerseys Colombia | Camisetas de la Selección Colombia',
      description: `🏆 Tienda especializada en camisetas de la Selección Colombia con +${productCount} referencias. Retro, actuales y ediciones históricas con la mejor calidad.`,
      keywords: 'camisetas seleccion colombia, camiseta colombia retro, camiseta colombia oficial, camisetas colombia tienda',
      url: baseUrl,
      type: 'website',
      image: `${baseUrl}/og-home.jpg`
    };
  }, [featuredProducts]);
};