/**
 * Calcula el costo de envío basado en la cantidad total de productos
 * @param {Array} items - Array de items del carrito
 * @returns {number} - Costo de envío en USD
 */
export const calculateShippingCost = (items) => {
  const totalQuantity = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  // Lógica de envío:
  // 1 producto: $10
  // 2 productos: $8  
  // 3 productos: $6
  // 4 productos: $4
  // 5+ productos: $0
  
  if (totalQuantity >= 5) {
    return 0;
  } else if (totalQuantity === 4) {
    return 4;
  } else if (totalQuantity === 3) {
    return 6;
  } else if (totalQuantity === 2) {
    return 8;
  } else if (totalQuantity === 1) {
    return 10;
  } else {
    return 0; // Carrito vacío
  }
};