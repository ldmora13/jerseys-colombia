import React, {useEffect, useRef, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import Loader from '../components/Loader';
import AlertGlobal from '../components/AlertGlobal';

import SizeRules from '../components/SizeRules';
import Footer from '../components/Footer';

import f1logo from '../assets/f1.png'

const ProductInfo = ({ category }) => {
    return (
        <div className='text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg'>
            {category === 'f1' && (
                <>
                    <p><span className='font-semibold'>Calidad:</span> Triple A+</p>
                    <p><span className='font-semibold'>Material:</span> Tela piqué de alta densidad, logos bordados y estampados de alta durabilidad.</p>
                </>
            )}
            {(category === 'nba' || category === 'futbol') && (
                <>
                    <p><span className='font-semibold'>Calidad:</span> Versión Jugador (Fit ajustado)</p>
                    <p><span className='font-semibold'>Material:</span> Poliéster con tecnología de absorción de sudor. Logos y escudos termo-sellados.</p>
                </>
            )}
        </div>
    );
};

// --- Panel de Personalización ---
const PersonalizationPanel = ({ setCustomName, setCustomNumber }) => {
    return (
        <div className='mt-5 p-4 border rounded-lg shadow-sm'>
            <h3 className='font-bold text-lg mb-3'>Personaliza tu Jersey</h3>
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                    <label htmlFor="customName" className='block text-sm font-medium text-gray-700'>Nombre (Opcional)</label>
                    <input
                        type="text"
                        id="customName"
                        placeholder='Ej: MESSI'
                        className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                        maxLength={12}
                    />
                </div>
                <div className='flex-1'>
                    <label htmlFor="customNumber" className='block text-sm font-medium text-gray-700'>Número (Opcional)</label>
                    <input
                        type="number"
                        id="customNumber"
                        placeholder='Ej: 10'
                        className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        onChange={(e) => setCustomNumber(e.target.value)}
                        onInput={(e) => { e.target.value = e.target.value.slice(0, 2) }} // Limita a 2 dígitos
                    />
                </div>
            </div>
        </div>
    );
};


const Product = ({ cartVisible, setCartVisible }) => {

    const { cartItems, setCartItems} = useCart();
    const { wishlistItems, setWishlistItems } = useWishlist();
    const Navigate = useNavigate();

    const { category, name } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tasaCOP, setTasaCOP] = useState(null);

    const [itemForPay, setItemForPay] = useState(null);

    const topRef = useRef(null);
    
    const [userUID, setUserUID] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');

    const [sizeRulesVisible, setSizeRulesVisible] = useState(false);
    
    const imagenes = producto?.img || [];
    const imagenPrincipal = imagenes[imagenes.length - 1];
    const miniaturas = imagenes.slice(0, -1);

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: '',
        title: ''
      });


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

    useEffect(() => {
        const fetchProducto = async () => {
            setLoading(true);

            let table = category.toLowerCase();

            const { data, error } = await supabase
                .from(table)
                .select('*');

            if (error) {
                console.error('Error al buscar el producto:', error);
                setProducto(null);
            } else {
                const encontrado = data.find(
                    (p) => generarSlug(p.name) === name
                );

                if (encontrado) {
                    const deporte = table === 'selecciones' ? 'futbol' : table;
                    setProducto({ ...encontrado, deporte: deporte });
                } else {
                    setProducto(null);
                }
            }
            
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };

        fetchProducto();
    }, [category, name]); 

    useEffect(() => {
        const fetchTasa = async () => {
            try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            setTasaCOP(data.rates.COP);
            } catch (err) {
            console.error('Error obteniendo tasa de cambio:', err);
            }
        };
        fetchTasa();
        const interval = setInterval(fetchTasa, 300000);
        return () => clearInterval(interval);
    }, []);
    
    {/* Verificar user */}
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUserUID(session.user.id); // ID de Supabase Auth
            } else {
                setUserUID(null);
                const savedCart = localStorage.getItem('guest_cart');
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                } else {
                    setCartItems([]);
                }
            }
        });

    return () => {
        authListener.subscription.unsubscribe();
        };
    }, []);

    {/* Guardar carrito !auth */}
    useEffect(() => {
        if (!userUID) {
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, userUID]);

    {/* Cargar carrito */}
    useEffect(() => {
        async function loadAndMergeCart() {
            try {
                const { data, error } = await supabase
                .from('carts')
                .select('items')
                .eq('user_uid', userUID)
                .maybeSingle();
            if (error) throw error;

            const supabaseCart = data?.items || [];
            const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');

            const mergedCart = [...supabaseCart];
            guestCart.forEach(item => {
                const existingIndex = mergedCart.findIndex(
                i =>
                    i.name === item.name &&
                    i.team === item.team &&
                    i.year === item.year &&
                    i.size === item.size
                );
                if (existingIndex !== -1) {
                mergedCart[existingIndex].quantity += item.quantity;
                } else {
                mergedCart.push(item);
                }
            });

        setCartItems(mergedCart);
        localStorage.removeItem('guest_cart');
        } catch (err) {
        console.error('Error cargando/fusionando carrito:', err.message);
        } finally {
        setLoading(false);
        }
    }

    if (userUID) {
        setLoading(true);
        loadAndMergeCart();
    }
    }, [userUID]);

    {/* Guardar carrito */}
    useEffect(() => {
    async function saveCart(items) {
        try {
        const { error } = await supabase
            .from('carts')
            .upsert([{ user_uid: userUID, items }], { onConflict: ['user_uid'] });

        if (error) throw error;
        } catch (err) {
        console.error('Error guardando carrito:', err.message);
        }
    }

    if (userUID && !loading) {
        saveCart(cartItems);
    }
    }, [cartItems, userUID, loading]);

    const addToCart = (product) => {
        const selectedSizeFinal = selectedSize;

        if (!selectedSizeFinal) {
            setAlert({
                show: true, message: "Selecciona una talla antes de agregar al carrito.", severity: "error", title: "Talla no seleccionada",
            });
            return;
        }

        setCartItems(prevCart => {
            // Un item es único si su nombre, talla y personalización son iguales.
            const index = prevCart.findIndex(
                item =>
                    item.name === product.name &&
                    item.size === selectedSizeFinal &&
                    (item.customName || '') === customName && // Comprobar nombre personalizado
                    (item.customNumber || '') === customNumber // Comprobar número personalizado
            );

            if (index !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[index].quantity += 1;
                return updatedCart;
            } else {
                // Añadir los nuevos datos de personalización al objeto del carrito
                return [...prevCart, {
                    ...product,
                    quantity: 1,
                    size: selectedSizeFinal,
                    customName: customName,
                    customNumber: customNumber
                }];
            }
        });

        let message = `${product.name} talla (${selectedSizeFinal}) se ha añadido al carrito.`;
        if (customName || customNumber) {
            message = `${product.name} (${selectedSizeFinal}) con personalización (${customName} ${customNumber}) añadido al carrito.`
        }

        setAlert({ show: true, message, severity: "success", title: '¡Añadido!' });
        setCartVisible(true);
    };

    const toggleWishlist = (product) => {
        const productName = product.name; 
        setWishlistItems(prevItems => {
        if (prevItems.includes(productName)) {
            return prevItems.filter(item => item !== productName);
        } else {
            return [...prevItems, productName];
        }
        });
    };
    
    const goToCheackout = (product) => {
        const selectedSizeFinal = selectedSize;

        if (!selectedSizeFinal) {
            setAlert({
                show: true, message: "Selecciona una talla antes ir al pago", severity: "error", title: "Talla no seleccionada",
            });
            return;
        }

        const itemForCheckout = {
            ...product,
            quantity: 1, 
            size: selectedSizeFinal,
            customName: customName,
            customNumber: customNumber,
        };
        
        Navigate('/checkout', { state: { items: [itemForCheckout] } }); 
    }
        
  return (    
    <div className='flex justify-center h-screen w-screen overflow-auto'>
        <div className='relative'>
            <AlertGlobal alert={alert} setAlert={setAlert} />
        </div>
        <div className="flex-1">
            {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
                <Loader />
            </div>
            )}

            <SizeRules
                sizeRulesVisible={sizeRulesVisible}
                setSizeRulesVisible={setSizeRulesVisible}
            />
        
            <div ref={topRef} className='h-20'></div>
            {producto && (
                <div className='flex flex-col md:flex-row items-start justify-center w-full max-w-6xl mx-auto gap-8 p-4'>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 items-center">
                        {/* ... (código de imágenes sin cambios) ... */}
                        {imagenPrincipal && (
                            <div className="overflow-hidden rounded-2xl shadow-2xl mb-4">
                                <img
                                    src={imagenPrincipal}
                                    alt={producto.name}
                                    className="max-w-[500px] max-h-[400px] lg:max-h-[60%] w-auto h-auto object-contain"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            {miniaturas.map((url, i) => (
                            <div key={i}
                                className={`overflow-hidden rounded shadow flex justify-center ${
                                i === miniaturas.length - 1 ? "col-span-2" : ""}`}>
                                <img src={url} alt={`${producto.name} miniatura ${i}`}
                                    className={`w-auto h-auto object-contain max-w-[250px] max-h-[200px]`}
                                />
                            </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 bg-white rounded-2xl p-5">
                        <div className='flex flex-row items-center justify-between'>
                            <img src={f1logo} alt='f1-logo' className='h-auto w-20 p-2'/>
                            <svg className='flex h-8 w-auto cursor-pointer mr-2 active:scale-110 transition' viewBox="0 0 24 24" 
                                onClick={() => toggleWishlist(producto)}>
                                <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" 
                                    fill={wishlistItems.includes(producto.name) ? '#FF0000' : '#292F36'}> 
                                </path>
                            </svg>
                        </div>
                        
                        <p className='text-2xl font-bold mt-3'>{producto.type} de {producto.team} {producto.year}</p>
                        <p className='text-2xl font-bold text-blue-500'>{producto.price} USD 
                            <span className='text-sm text-gray-500'> {tasaCOP
                          ? ` = ${(producto.price * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                          : ' (Cargando tasa...)'} COP</span>
                        </p>
                        <p className='text-lg text-gray-500 mt-5'>{producto.name}</p>
                        <div className='h-1 w-full border-0 bg-gradient-to-r from-transparent via-[#252525] to-transparent'/>
                        <div className='flex flex-row items-center justify-start gap-3'>
                            <svg className='h-auto w-5' fill="#000000" version="1.1" id="Capa_1" viewBox="0 0 46.136 46.136">
                                {/* ... (svg path) ... */}
                            </svg>
                            <p className='text-sm cursor-pointer' onClick={() => setSizeRulesVisible(true)}>Guia de tallas</p>
                        </div>
                        <div className='flex flex-row items-center justify-start gap-3'>
                            <ul className='flex flex-row items-center justify-start gap-2 list-none text-white'>
                                {/* ... (botones de tallas) ... */}
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <li key={size}>
                                    <button
                                    onClick={() => setSelectedSize(size)}
                                    className={`cursor-pointer p-2 px-4 rounded-sm border-2 transition-all duration-300 
                                        ${selectedSize === size 
                                        ? 'bg-[#E8E8E8] shadow-sm text-black border-white'
                                        : 'bg-[#252525] text-white hover:border-white'
                                        }`}
                                    >
                                    {size}
                                    </button>
                                </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* --- Renderizado Condicional --- */}
                        {(producto.category === 'nba' || producto.category === 'futbol' || producto.category === 'selecciones') && (
                            <PersonalizationPanel 
                                setCustomName={setCustomName} 
                                setCustomNumber={setCustomNumber} 
                            />
                        )}

                        <ProductInfo category={producto.category} />


                        <div className='flex flex-row items-center justify-center gap-3 mt-4'>
                           <button onClick={() => goToCheackout(producto)}
                                className='group relative w-[130px] h-10 flex items-center justify-center bg-[#252525] hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1
                                before:content-[""] before:absolute before:w-[130px] before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference
                                hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                <span className='relative z-10'>Pagar</span>
                                <svg className='relative z-10 h-3 ' viewBox="0 0 576 512">
                                    <path className='fill-white group-hover:fill-black transition-colors duration-200' 
                                        d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"></path>
                                </svg>
                            </button>
                            <button onClick={() => addToCart(producto)} 
                                className='group relative w-[250px] h-10 flex items-center justify-center bg-[#252525] hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1
                                before:content-[""] before:absolute before:w-[250px] before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference
                                hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                <span className='relative z-10'>Añadir al carrito</span>
                                <svg className='relative z-10 h-4' viewBox="0 0 24 24">
                                    <path className='group-hover:fill-black transition-colors duration-200' d="M2.08416 2.7512C2.22155 2.36044 2.6497 2.15503 3.04047 2.29242L3.34187 2.39838C3.95839 2.61511 4.48203 2.79919 4.89411 3.00139C5.33474 3.21759 5.71259 3.48393 5.99677 3.89979C6.27875 4.31243 6.39517 4.76515 6.4489 5.26153C6.47295 5.48373 6.48564 5.72967 6.49233 6H17.1305C18.8155 6 20.3323 6 20.7762 6.57708C21.2202 7.15417 21.0466 8.02369 20.6995 9.76275L20.1997 12.1875C19.8846 13.7164 19.727 14.4808 19.1753 14.9304C18.6236 15.38 17.8431 15.38 16.2821 15.38H10.9792C8.19028 15.38 6.79583 15.38 5.92943 14.4662C5.06302 13.5523 4.99979 12.5816 4.99979 9.64L4.99979 7.03832C4.99979 6.29837 4.99877 5.80316 4.95761 5.42295C4.91828 5.0596 4.84858 4.87818 4.75832 4.74609C4.67026 4.61723 4.53659 4.4968 4.23336 4.34802C3.91052 4.18961 3.47177 4.03406 2.80416 3.79934L2.54295 3.7075C2.15218 3.57012 1.94678 3.14197 2.08416 2.7512Z" fill="#ffffff"></path>
                                    <path className='group-hover:fill-black transition-colors duration-200' d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#ffffff"></path> 
                                    <path className='group-hover:fill-black transition-colors duration-200' d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#ffffff">
                                    </path> 
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default Product