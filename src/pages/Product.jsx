import React, {useEffect, useRef, useState, useMemo} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';
import { useSEO } from '../hooks/useSEO';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import Loader from '../components/Loader';
import AlertGlobal from '../components/AlertGlobal';
import SEO from '../components/SEO';
import SizeRules from '../components/SizeRules';

import f1logo from '../assets/f1.png';
import nbasuit from '../assets/basketball-suit.svg';
import futbolsuit from '../assets/soccer-equipment.svg';

const qualityDescriptions = {
    'fan': 'Poliéster con tecnología de absorción de sudor. Logos y escudos bordados para mayor durabilidad.',
    'player': 'Poliéster ultra-ligero con microperforaciones para máxima ventilación (Fit ajustado). Logos y escudos termo-sellados.',
    'windbreaker': 'Material rompevientos impermeable, ideal para entrenamiento en climas adversos.',
    'jersey': 'Malla de poliéster transpirable con números y logos estampados de alta calidad, idéntico al que usan los profesionales.',
    'short': 'Tela ligera y flexible para máximo rango de movimiento, con cintura elástica y bolsillos.',
    'f1': 'Tela piqué de alta densidad (Triple A+), logos y patrocinadores bordados y estampados con precisión.'
};

const ProductInfo = ({ producto }) => {
    if (!producto) return null;

    let qualityType = '';
    let descriptionKey = '';

    if (producto.sport === 'f1') {
        qualityType = 'Fan';
        descriptionKey = 'f1';
    } else if (producto.sport === 'nba') {
        qualityType = producto.category;
        descriptionKey = producto.category.toLowerCase();
    } else if (producto.sport === 'futbol') {
        qualityType = 'Fan';
        descriptionKey = 'fan'
    }
    const qualityDescription = qualityDescriptions[descriptionKey] || 'Descripción detallada no disponible.';

    return (
        <div className='w-full text-sm text-black mt-2 p-1 md:p-3 bg-blue-50 rounded-lg'>
            <p><span className='font-semibold'>Calidad:</span> <span className='capitalize'>{qualityType}</span></p>
            <p><span className='font-semibold'>Descripción:</span> {qualityDescription}</p>
        </div>
    );
};


const PersonalizationPanel = ({ setCustomName, setCustomNumber }) => {
    return (
        <div className='mt-2 p-2 sm:p-4 border rounded-lg shadow-sm'>
            <h3 className='font-bold text-lg mb-3'>Personaliza tu Jersey <span className='text-sm text-gray-500'>+5 USD</span></h3>
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                    <label htmlFor="customName" className='block text-sm font-medium text-gray-700'>Nombre (Opcional)</label>
                    <input type="text" id="customName" placeholder='Ej: MESSI' className='mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500' onChange={(e) => setCustomName(e.target.value.toUpperCase())} maxLength={12} />
                </div>
                <div className='flex-1'>
                    <label htmlFor="customNumber" className='block text-sm font-medium text-gray-700'>Número (Opcional)</label>
                    <input type="number" id="customNumber" placeholder='Ej: 10' className='mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500' onChange={(e) => setCustomNumber(e.target.value)} onInput={(e) => { e.target.value = e.target.value.slice(0, 2) }} />
                </div>
            </div>
        </div>
    );
};

const Product = ({ cartVisible, setCartVisible }) => {

    const { cartItems, setCartItems } = useCart();
    const { wishlistItems, setWishlistItems } = useWishlist();
    const { category, name } = useParams();
    const seoData = useSEO(producto, category, name);
    
    const Navigate = useNavigate();
    
    const [producto, setProducto] = useState(null);

    const [loading, setLoading] = useState(true);

    const [sizeRulesVisible, setSizeRulesVisible] = useState(false);

    const [tasaCOP, setTasaCOP] = useState(null);
    const topRef = useRef(null);

    const [selectedSize, setSelectedSize] = useState(null);
    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');
    
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [miniaturas, setMiniaturas] = useState([]);
    
    const [alert, setAlert] = useState({
        show: false,
        message: '', 
        severity: '', 
        title: '' 
    });

    const generarSlug = (str) => {
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").trim();
    };

    useEffect(() => {
        if (producto && producto.img && producto.img.length > 0) {
            setImagenPrincipal(producto.img[producto.img.length - 1]); 
            setMiniaturas(producto.img); 
        }
    }, [producto]);

    useEffect(() => {
        const fetchProducto = async () => {
            setLoading(true);
            let table = category.toLowerCase();
            if (table === 'futbol') {
                table = 'futbol';
            }
            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.error('Error al buscar el producto:', error);
                setProducto(null);
            } else {
                const encontrado = data.find((p) => generarSlug(p.name) === name);
                if (encontrado) {
                    let sportIdentifier;
                    if (encontrado.deporte) {
                        sportIdentifier = encontrado.deporte;
                    } else {
                        sportIdentifier = encontrado.category;
                    }
                    setProducto({ ...encontrado, sport: sportIdentifier.toLowerCase() });
                } else {
                    setProducto(null);
                }
            }
            setTimeout(() => { setLoading(false); }, 500);
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

    const addToCart = (product) => {
        const selectedSizeFinal = selectedSize;
        if (!selectedSizeFinal) {
            setAlert({ show: true, message: "Selecciona una talla antes de agregar al carrito.", severity: "error", title: "Talla no seleccionada" });
            return;
        }
        setCartItems(prevCart => {
            const index = prevCart.findIndex(item => item.name === product.name && item.size === selectedSizeFinal && (item.customName || '') === customName && (item.customNumber || '') === customNumber);
            if (index !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[index].quantity += 1;
                return updatedCart;
            } else {
                return [...prevCart, { ...product, quantity: 1, size: selectedSizeFinal, customName: customName, customNumber: customNumber }];
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
            setAlert({ show: true, message: "Selecciona una talla antes ir al pago", severity: "error", title: "Talla no seleccionada" });
            return;
        }
        const itemForCheckout = { ...product, quantity: 1, size: selectedSizeFinal, customName: customName, customNumber: customNumber, };
        Navigate('/checkout', { state: { items: [itemForCheckout] } });
    }
        
  return (    
    <div className='flex justify-center w-full min-h-screen'>
        {seoData && <SEO {...seoData} />}
        <div className='relative'>
            <AlertGlobal alert={alert} setAlert={setAlert} />
        </div>
        <div className="flex-1">
            {loading && ( 
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-90 z-[2000] bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Loader />
                </div> 
            )}
            <SizeRules sizeRulesVisible={sizeRulesVisible} setSizeRulesVisible={setSizeRulesVisible} />
            <div ref={topRef} className='h-20'></div>
            
            {producto && (
                <div className='flex flex-col md:flex-row items-start justify-center w-full max-w-6xl mx-auto gap-8 p-4'>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 items-center">

                        {/* ===== IMAGEN PRINCIPAL ===== */}
                        <div className="overflow-hidden rounded-2xl shadow-2xl mb-2">
                            <img 
                                src={imagenPrincipal} 
                                alt={producto.name} 
                                className="w-full max-w-[500px] max-h-[500px] h-auto object-contain mx-auto transition-opacity duration-300" 
                            />
                        </div>

                        {/* ===== FILA DE MINIATURAS INTERACTIVAS ===== */}
                        {miniaturas.length > 1 && (
                            <div className="w-full hidden md:flex overflow-x-auto pb-2">
                                <div className="flex flex-row flex-nowrap gap-3 px-2">
                                    {miniaturas.map((url, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setImagenPrincipal(url)}
                                            className={`
                                                flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 
                                                rounded-lg overflow-hidden cursor-pointer 
                                                border-2 transition-all duration-200
                                                ${imagenPrincipal === url ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300'}
                                            `}>
                                            <img 
                                                src={url} 
                                                alt={`${producto.name} - Miniatura ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-5">
                        {(() => {
                            let logoSrc, title;
                            const sport = producto.sport;
                            
                            if (sport === 'f1') {
                                logoSrc = f1logo;
                                title = `${producto.type} de ${producto.team} ${producto.year}`;
                            } else if (sport === 'nba') {
                                logoSrc = nbasuit;
                                title = `${producto.category} de ${producto.team} ${producto.year}`;
                            } else if (sport === 'futbol') {
                                logoSrc = futbolsuit;
                                title = `Jersey de ${producto.team} ${producto.year} ${producto.category === 'manga_larga' ? 'Manga Larga' : producto.category}`;
                            }

                            return (
                                <div className='flex flex-col items-center justify-start'>
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <img src={logoSrc} alt={`${sport}-logo`} className='h-auto w-20 p-2'/>
                                        <svg className='flex h-8 w-auto cursor-pointer mr-2 active:scale-110 transition' viewBox="0 0 24 24" onClick={() => toggleWishlist(producto)}>
                                            <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill={wishlistItems.includes(producto.name) ? '#FF0000' : '#292F36'} />
                                        </svg>
                                    </div>
                                    <div className='flex items-center justify-start w-full'>
                                        <h1 className='text-2xl font-bold mt-3 capitalize'>{title}</h1>
                                    </div>
                                    
                                </div>
                            );
                        })()}
                        <div className='flex flex-row items-center justify-between'>
                            <p className='text-2xl font-bold text-blue-500'>{producto.price} USD 
                                <span className='text-sm text-gray-500'> {tasaCOP ? ` = ${(producto.price * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}` : ' (Cargando tasa...)'} COP</span>
                            </p>
                        </div>
                        <div className='h-1 w-full border-0 bg-gradient-to-r from-transparent via-[#252525] to-transparent'/>
                        
                        <div className='flex flex-row items-center justify-start gap-3 p-2'>
                            <svg className='h-auto w-5' fill="#000000" viewBox="0 0 46.136 46.136">
                                <path d="M45.935,32.097L33.265,9.731c-0.369-0.526-1.184-1.091-1.802-1.257L17.765,4.805c-0.622-0.167-1.264,0.206-1.429,0.827 l-0.341,1.259c-0.867-0.486-1.773-0.969-2.741-1.439c-4.531-2.196-9-3.616-11.379-3.616c-0.862,0-1.438,0.191-1.707,0.569 C0.05,2.567-0.063,2.847,0.042,3.261c0.425,1.67,4.429,4.637,9.74,7.21c1.609,0.78,3.212,1.46,4.719,2.013l-1.834,6.844 c-0.163,0.62-0.081,1.605,0.189,2.189l13.038,22.158c0.27,0.584,0.942,0.794,1.503,0.475l18.203-10.512 C46.153,33.315,46.302,32.624,45.935,32.097z M21.017,12.09c0.266-0.154,0.558-0.221,0.845-0.285 c0.323,0.381,0.546,0.724,0.62,0.991c0.044,0.174,0.031,0.31-0.049,0.416c-0.156,0.224-0.612,0.345-1.273,0.345 c-0.374,0-0.822-0.048-1.299-0.121C20.105,12.898,20.466,12.408,21.017,12.09z M10.013,9.992c-5.779-2.8-9.129-5.57-9.461-6.862 C0.51,2.955,0.525,2.819,0.601,2.715c0.16-0.225,0.615-0.346,1.276-0.346c2.305,0,6.683,1.398,11.146,3.562 c1.028,0.5,1.957,0.997,2.831,1.487l-1.217,4.556C13.161,11.427,11.594,10.759,10.013,9.992z M23.937,17.145 c-1.395,0.804-3.182,0.33-3.989-1.07c-0.388-0.675-0.463-1.438-0.294-2.142c0.553,0.091,1.077,0.151,1.509,0.151 c0.862,0,1.436-0.19,1.705-0.569c0.116-0.165,0.234-0.441,0.129-0.855c-0.068-0.271-0.26-0.584-0.512-0.918 c1.005,0.007,1.986,0.481,2.521,1.411C25.812,14.555,25.331,16.344,23.937,17.145z" /></svg>
                            <p className='text-sm cursor-pointer' onClick={() => setSizeRulesVisible(true)}>Guia de tallas</p>
                        </div>
                        <ul className='flex flex-row flex-wrap items-center justify-start gap-2 list-none text-white -mt-2'>
                            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <li key={size}>
                                    <button onClick={() => setSelectedSize(size)} 
                                        className={`cursor-pointer p-2 px-4 rounded-sm border-2 transition-all duration-300 ${selectedSize === size ? 'bg-blue-50 shadow-sm text-black border-white' : 'bg-[#252525] text-white hover:border-white'}`}>{size}

                                    </button>
                                </li>
                            ))}
                        </ul>

                        {producto.sport === 'futbol'  && (
                            <PersonalizationPanel setCustomName={setCustomName} setCustomNumber={setCustomNumber} />
                        )}

                        <ProductInfo producto={producto} />

                        <div className='flex flex-col md:flex-row items-center justify-center gap-3 mt-2'>
                           <button onClick={() => goToCheackout(producto)} className='group relative w-full md:w-[130px] h-10 flex items-center justify-center bg-black hover:text-white md:hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-[130px] before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                <span className='relative z-10'>Pagar</span>
                                <svg className='relative z-10 h-3 ' viewBox="0 0 576 512"><path className='fill-white group-hover:fill-white  md:group-hover:fill-black transition-colors duration-200' d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"/></svg>
                            </button>
                            <button onClick={() => addToCart(producto)} className='group relative w-full md:w-[250px] h-10 flex items-center justify-center bg-black hover:text-white md:hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-[250px] before:h-[130px] before:top-0 before:left-[-100%] before:bg-black md:before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                <span className='relative z-10'>Añadir al carrito</span>
                                <svg className='relative z-10 h-4' viewBox="0 0 24 24"><path className='md:group-hover:fill-black group-hover:fill-white transition-colors duration-200' d="M2.08416 2.7512C2.22155 2.36044 2.6497 2.15503 3.04047 2.29242L3.34187 2.39838C3.95839 2.61511 4.48203 2.79919 4.89411 3.00139C5.33474 3.21759 5.71259 3.48393 5.99677 3.89979C6.27875 4.31243 6.39517 4.76515 6.4489 5.26153C6.47295 5.48373 6.48564 5.72967 6.49233 6H17.1305C18.8155 6 20.3323 6 20.7762 6.57708C21.2202 7.15417 21.0466 8.02369 20.6995 9.76275L20.1997 12.1875C19.8846 13.7164 19.727 14.4808 19.1753 14.9304C18.6236 15.38 17.8431 15.38 16.2821 15.38H10.9792C8.19028 15.38 6.79583 15.38 5.92943 14.4662C5.06302 13.5523 4.99979 12.5816 4.99979 9.64L4.99979 7.03832C4.99979 6.29837 4.99877 5.80316 4.95761 5.42295C4.91828 5.0596 4.84858 4.87818 4.75832 4.74609C4.67026 4.61723 4.53659 4.4968 4.23336 4.34802C3.91052 4.18961 3.47177 4.03406 2.80416 3.79934L2.54295 3.7075C2.15218 3.57012 1.94678 3.14197 2.08416 2.7512Z" fill="#ffffff" /><path className='group-hover:fill-black transition-colors duration-200' d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#ffffff" /> <path className='group-hover:fill-black transition-colors duration-200' d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#ffffff" /></svg>
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