/**
 * Calcula el costo de envío basado en la cantidad total de productos
 * @param {Array} items - Array de items del carrito
 * @returns {number} - Costo de envío en USD
 */
export const calculateShippingCost = (items) => {
  const totalQuantity = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  // Lógica de envío:
  // 1 producto: $5
  // 2 productos: $4  
  // 3 productos: $2
  // 4 productos: $0
  // 5+ productos: $0
  
  if (totalQuantity >= 5) {
    return 0;
  } else if (totalQuantity === 4) {
    return 0;
  } else if (totalQuantity === 3) {
    return 2;
  } else if (totalQuantity === 2) {
    return 4;
  } else if (totalQuantity === 1) {
    return 5;
  } else {
    return 0; 
  }
};