export const calculateItemPrice = (item) => {
  let basePrice = item.price;
  
  // Solo las camisetas de fútbol pueden tener customización
  const canBeCustomized = item.sport === 'futbol';
  
  // Si puede ser customizada Y tiene customName O customNumber, agregar $5
  if (canBeCustomized && (item.customName || item.customNumber)) {
    basePrice += 5;
  }
  
  return basePrice;
};

export const calculateSubtotal = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = calculateItemPrice(item);
    return total + (itemPrice * (item.quantity || 1));
  }, 0);
};