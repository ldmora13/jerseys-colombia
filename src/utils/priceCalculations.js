/**
 * Calcula el precio de un item individual incluyendo personalizaciones y parches
 * @param {Object} item - El item del carrito
 * @returns {number} - Precio calculado
 */
export const calculateItemPrice = (item) => {
    let price = item.price || 0;
    
    // Agregar costo de personalización (nombre o número)
    if (item.customName || item.customNumber) {
        price += 5;
    }
    
    // Agregar costo de parche de competición
    if (item.competitionPatch) {
        price += 3;
    }
    
    return price;
};

/**
 * Calcula el subtotal del carrito
 * @param {Array} items - Array de items del carrito
 * @returns {number} - Subtotal calculado
 */
export const calculateSubtotal = (items) => {
    return items.reduce((total, item) => {
        const itemPrice = calculateItemPrice(item);
        return total + (itemPrice * (item.quantity || 1));
    }, 0);
};