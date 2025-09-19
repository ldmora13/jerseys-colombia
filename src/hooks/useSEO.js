import { useMemo } from 'react';

export const useSEO = (producto, category, name) => {
  return useMemo(() => {
    if (!producto) return null;
    
    const baseUrl = window.location.origin;
    const currentUrl = `${baseUrl}/${category}/${name}`;
    
    let title, description, keywords;
    
    if (producto.sport === 'futbol') {
      title = `Jersey ${producto.team} ${producto.year} - ${producto.category}`;
      description = `Compra el jersey oficial de ${producto.team} temporada ${producto.year}. Calidad Fan con tecnología de absorción de sudor y logos bordados. Personalización disponible. Envío gratis en pedidos de 5+ productos.`;
      keywords = `jersey ${producto.team}, camiseta futbol, ${producto.team} ${producto.year}, jerseys colombia, futbol`;
    } else if (producto.sport === 'nba') {
      title = `${producto.category} ${producto.team} ${producto.year}`;
      description = `${producto.category} oficial de ${producto.team} temporada ${producto.year}. Calidad premium con microperforaciones para máxima ventilación. Logos termo-sellados.`;
      keywords = `${producto.team} jersey, NBA, basketball, ${producto.year}, ${producto.team}`;
    } else if (producto.sport === 'f1') {
      title = `${producto.type} ${producto.team} ${producto.year}`;
      description = `${producto.type} oficial de ${producto.team} temporada ${producto.year} de Fórmula 1. Material premium con logos y patrocinadores bordados de alta precisión.`;
      keywords = `F1, formula 1, ${producto.team}, ${producto.year}, motorsport`;
    }
    
    return {
      title,
      description,
      keywords,
      image: producto.img?.[producto.img.length - 1],
      url: currentUrl,
      type: 'product',
      price: producto.price,
      currency: 'USD'
    };
  }, [producto, category, name]);
};
