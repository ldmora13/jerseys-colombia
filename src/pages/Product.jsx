import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

import Header from '../components/Header';
import Loader from '../components/Loader';
import AlertGlobal from '../components/AlertGlobal';
import Wishlist from '../components/Wishlist';
import Cart from '../components/Cart';
import SizeRules from '../components/SizeRules';
import Footer from '../components/Footer';

import f1logo from '../assets/f1.png'

const Product = ({ cartVisible, setCartVisible }) => {

    const { cartItems, setCartItems} = useCart();
    const { category, name } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tasaCOP, setTasaCOP] = useState(null);

    const topRef = useRef(null)
    
    const [sizeRulesVisible, setSizeRulesVisible] = useState(false);
    const [wishlistVisible, setWishlistVisible] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    
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
            let table = category;
            if (category.toLowerCase() === 'f1') table = 'f1';
            if (category.toLowerCase() === 'futbol') table = 'futbol';
            if (category.toLowerCase() === 'nba') table = 'nba';

            const { data, error } = await supabase
                .from(table)
                .select('*');
            if (!error) {
                const encontrado = data.find(
                    (p) => generarSlug(p.name) === name
                );
                setProducto(encontrado || null);
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

            <Wishlist 
            wishlistVisible={wishlistVisible}
            setWishlistVisible={setWishlistVisible}
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems}
            />

            <SizeRules
                sizeRulesVisible={sizeRulesVisible}
                setSizeRulesVisible={setSizeRulesVisible}
            />
        
            <div ref={topRef} className='h-20'></div>
            {producto && (
                <div className='flex flex-col md:flex-row items-start justify-center w-full max-w-6xl mx-auto gap-8 p-4'>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 items-center">
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
                        <img src={f1logo} alt='f1-logo' className='h-auto w-20 p-2'/>
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
                                <path d="M45.935,32.097L33.265,9.731c-0.369-0.526-1.184-1.091-1.802-1.257L17.765,4.805c-0.622-0.167-1.264,0.206-1.429,0.827 l-0.341,1.259c-0.867-0.486-1.773-0.969-2.741-1.439c-4.531-2.196-9-3.616-11.379-3.616c-0.862,0-1.438,0.191-1.707,0.569 C0.05,2.567-0.063,2.847,0.042,3.261c0.425,1.67,4.429,4.637,9.74,7.21c1.609,0.78,3.212,1.46,4.719,2.013l-1.834,6.844 c-0.163,0.62-0.081,1.605,0.189,2.189l13.038,22.158c0.27,0.584,0.942,0.794,1.503,0.475l18.203-10.512 C46.153,33.315,46.302,32.624,45.935,32.097z M21.017,12.09c0.266-0.154,0.558-0.221,0.845-0.285 c0.323,0.381,0.546,0.724,0.62,0.991c0.044,0.174,0.031,0.31-0.049,0.416c-0.156,0.224-0.612,0.345-1.273,0.345 c-0.374,0-0.822-0.048-1.299-0.121C20.105,12.898,20.466,12.408,21.017,12.09z M10.013,9.992c-5.779-2.8-9.129-5.57-9.461-6.862 C0.51,2.955,0.525,2.819,0.601,2.715c0.16-0.225,0.615-0.346,1.276-0.346c2.305,0,6.683,1.398,11.146,3.562 c1.028,0.5,1.957,0.997,2.831,1.487l-1.217,4.556C13.161,11.427,11.594,10.759,10.013,9.992z M23.937,17.145 c-1.395,0.804-3.182,0.33-3.989-1.07c-0.388-0.675-0.463-1.438-0.294-2.142c0.553,0.091,1.077,0.151,1.509,0.151 c0.862,0,1.436-0.19,1.705-0.569c0.116-0.165,0.234-0.441,0.129-0.855c-0.068-0.271-0.26-0.584-0.512-0.918 c1.005,0.007,1.986,0.481,2.521,1.411C25.812,14.555,25.331,16.344,23.937,17.145z">
                                </path>
                            </svg>
                            <p className='text-sm cursor-pointer' onClick={() => setSizeRulesVisible(true)}>Guia de tallas</p>
                        </div>
                        
                        
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default Product