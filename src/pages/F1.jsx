import React, { use } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate} from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getAuth } from 'firebase/auth';
import AlertGlobal from '../components/AlertGlobal';
import Header from '../components/Header';
import Loader from '../components/Loader';
import Filter from '../components/Filter';
import Cart from '../components/Cart';
import Footer from '../components/Footer';
import firebase from 'firebase/compat/app';


const F1 = () => {

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'success',
    title: ''
  });

  const topRef = useRef(null);
  const [camisetasF1, setCamisetasF1] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [order, setOrder] = useState('');
  const [liked, setLiked] = useState({});

  const [cartVisible, setCartVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [userUID, setUserUID] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const [search, setSearch] = useState('');
  const [stockSelected, setStockSelected] = useState('Todo');
  const [promoSelected, setPromoSelected] = useState('Todo');
  const [categorySelected, setCategorySelected] = useState('Todo');
  const [yearRange, setYearRange] = useState([1950, 2025]);



  const [tasaCOP, setTasaCOP] = useState(null);
  const categoryMap = {
  'Jerseys': 'Jersey',
  'Polos': 'Polo',
  'Hoodies': 'Hoodie',
  'Shorts': 'Short',
  'Fans': 'Fan',
  'Players': 'Player',
  'Chaquetas': 'Chaqueta'
  };


  const camisetasFiltradas = camisetasF1.filter((camiseta) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      (camiseta.name || '').toLowerCase().includes(searchLower) ||
      (camiseta.team || '').toLowerCase().includes(searchLower) ||
      (camiseta.driver || '').toLowerCase().includes(searchLower) ||
      (search && camiseta.year && camiseta.year.toString().includes(searchLower));

    let matchStock = true;
    if (stockSelected === 'En stock') matchStock = camiseta.stock === 'Disponible';
    else if (stockSelected === 'Agotado') matchStock = camiseta.stock !== 'Disponible';

    let matchPromo = true;
    if (promoSelected === 'En oferta') matchPromo = camiseta.year >= 2025;

    let matchYear = true;
    if (yearRange && yearRange.length === 2) {
      matchYear = camiseta.year >= yearRange[0] && camiseta.year <= yearRange[1];
    }
    let matchCat = true;
    if (categorySelected !== 'Todo') {
      const singular = categoryMap[categorySelected] || categorySelected;
      matchCat = camiseta.type === singular;
    }
    return matchSearch && matchStock && matchPromo && matchYear && matchCat;
  });


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        setCartItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadCart(uid) {
      const {data} = await supabase
        .from('carts')
        .select('items')
        .single();
      setCartItems(data?.items || []);
    }
    if (userUID) loadCart(userUID);
  }, [userUID]);

  useEffect(() => {
  async function saveCart(uid, items) {
    if (!uid || !Array.isArray(items)) return;
    if (items.length === 0) return;
    await supabase
      .from('carts')
      .upsert([{ firebase_uid: uid, items }], { onConflict: ['firebase_uid'] });
  }
  if (userUID) saveCart(userUID, cartItems);
}, [userUID, cartItems]);

const addToCart = (product) => {
  const selectedSize = selectedSizes[product.name];

  if (!selectedSize) {
    setAlert({
      show: true,
      message: "Selecciona una talla antes de agregar al carrito.",
      severity: "error",
    });
    return;
  }

  setCartItems(prevCart => {
    const index = prevCart.findIndex(
      item =>
        item.name === product.name &&
        item.team === product.team &&
        item.year === product.year &&
        item.size === selectedSize
    );

    if (index !== -1) {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity += 1;
      return updatedCart;
    } else {
      return [...prevCart, { ...product, quantity: 1, size: selectedSize }];
    }
  });

  setCartVisible(true);
};

  const totalPages = Math.ceil(camisetasFiltradas.length / itemsPerPage);
  const camisetasPagina = camisetasFiltradas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleOrderChange = (event) => {
    const value = event.target.value;
    setOrder(value);

    let sorted = [...camisetasF1];

    if (value === 'new') {
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0)); // Nuevas: mayor índice primero
    } else if (value === 'lowCost') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); // Menor precio primero
    } else if (value === 'highCost') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); // Mayor precio primero
    }

    setCamisetasF1(sorted);
  };

  useEffect(() => {
    const fetchCamisetasF1 = async () => {
      try {
        const f1Res = await supabase
          .from('f1')
          .select('name, img, team, year, index, driver, type, price, stock')
          .order('year', { ascending: false });
        if (f1Res.error) {
          console.error('Error en F1:', f1Res.error);
        } else {
          setCamisetasF1(f1Res.data);
        }
      } catch (err) {
        console.error('Error al cargar camisetas F1:', err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    fetchCamisetasF1();
  }, []);

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
    <div className="flex overflow-auto h-screen w-screen">
      <div className='relative'>
        <AlertGlobal alert={alert} setAlert={setAlert} />
      </div>
      <div className="flex-1">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
            <Loader />
          </div>
        )}
        
        <Filter
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          search={search}
          setSearch={setSearch}
          stockSelected={stockSelected}
          setStockSelected={setStockSelected}
          promoSelected={promoSelected}
          setPromoSelected={setPromoSelected}
          categorySelected={categorySelected}
          setCategorySelected={setCategorySelected}
          yearRange={yearRange}
          setYearRange={setYearRange}
        />
        
        <Cart 
        cartVisible={cartVisible}
        setCartVisible={setCartVisible}
        cartItems={cartItems}
        setCartItems={setCartItems}
        />
        <Header 
        setCartVisible={setCartVisible} 
        />
        <div ref={topRef} className='h-20'></div>
        <main className="flex flex-col items-center w-full p-4 text-black">
          <div className='flex flex-col items-center w-auto h-auto'>
            <svg className='h-12' fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier"> <g> <g> 
                <path d="M504.051,229.861c-1.533-5.722-5.203-10.502-10.331-13.461l-41.301-23.845l-19.808-11.436l4.37-7.57 c6.112-10.585,2.474-24.17-8.113-30.285l-41.301-23.844l-53.54-30.912l-46.575-26.888l5.402-9.357 c0.001-0.001,0.001-0.002,0.002-0.003c1.457,0.25,2.933,0.39,4.416,0.39c9.382,0,18.123-5.042,22.812-13.161 c7.257-12.568,2.934-28.698-9.637-35.961c-4-2.307-8.544-3.528-13.143-3.528c-9.382,0-18.124,5.043-22.812,13.163 c-3.514,6.091-4.447,13.183-2.628,19.974c1.203,4.49,3.533,8.474,6.72,11.686L126.075,308.969 c-9.567-2.77-20.167,1.18-25.369,10.185L10.15,476.005c-6.109,10.581-2.471,24.165,8.113,30.283l4.767,2.754 c3.48,2.005,7.282,2.958,11.037,2.958c7.67,0,15.141-3.976,19.242-11.078l54.95-95.173c2.22-3.845,0.903-8.762-2.942-10.982 c-3.845-2.218-8.762-0.904-10.982,2.942l-54.95,95.174c-1.679,2.906-5.412,3.909-8.318,2.233l-4.757-2.748 c-2.91-1.682-3.912-5.416-2.234-8.323l90.553-156.848c1.681-2.911,5.414-3.911,8.325-2.231l2.325,1.343 c0.017,0.01,0.032,0.021,0.049,0.032c0.013,0.008,0.027,0.012,0.04,0.019l2.341,1.352c1.411,0.815,2.419,2.129,2.841,3.7 c0.421,1.571,0.205,3.212-0.609,4.622l-22.914,39.689c-2.22,3.845-0.903,8.762,2.942,10.982c3.844,2.219,8.761,0.904,10.982-2.942 l22.914-39.689c2.962-5.128,3.748-11.103,2.215-16.823c-1.064-3.972-3.179-7.474-6.079-10.245l46.677-80.844l46.577,26.892 c0.001,0,0.002,0.001,0.003,0.002l53.539,30.907l19.805,11.435l-4.368,7.565c-6.113,10.587-2.475,24.174,8.111,30.289 l41.301,23.845l41.3,23.843c3.369,1.945,7.198,2.974,11.074,2.974c7.904,0,15.266-4.251,19.212-11.09l23.843-41.302l30.911-53.535 l23.849-41.302C504.796,241.555,505.581,235.58,504.051,229.861z M437.418,202.461l-10.398,18.011l-12.471,21.602l-7.296-4.213 l-5.549-3.204l9.304-16.117l13.567-23.496L437.418,202.461z M355.578,190.904l39.614,22.869l-11.437,19.806 c-0.002,0.003-0.003,0.006-0.005,0.01l-11.43,19.798l-39.615-22.871L355.578,190.904z M330.216,202.671l-11.437,19.805 l-39.609-22.869l22.868-39.615l39.196,22.63l0.419,0.242L330.216,202.671z M382.227,268.39l11.435-19.808l12.846,7.416 l-11.436,19.808l-11.436,19.806l-5.241-3.026l-7.604-4.39L382.227,268.39z M386.49,137.364l34.338,19.824 c2.909,1.681,3.91,5.413,2.23,8.322l-19.826,34.337l-19.808-11.434l-19.806-11.434l11.436-19.808L386.49,137.364z M332.95,106.453 l39.616,22.873l-11.436,19.807l-11.436,19.807l-19.807-11.436l-19.809-11.436l11.436-19.808L332.95,106.453z M288.418,21.201 c1.824-3.159,5.23-5.123,8.887-5.123c1.781,0,3.548,0.476,5.103,1.373c4.893,2.828,6.577,9.106,3.754,13.996 c-1.825,3.16-5.232,5.124-8.889,5.124c-1.78,0-3.546-0.476-5.105-1.377c-2.37-1.367-4.065-3.576-4.772-6.218 C286.687,26.332,287.049,23.571,288.418,21.201z M279.414,75.544l39.612,22.868L307.59,118.22l-11.436,19.807l-34.32-19.813 l-5.292-3.055L279.414,75.544z M248.501,129.085l39.613,22.869l-22.867,39.615l-17.45-10.074l-22.167-12.797L248.501,129.085z M194.72,222.236l22.871-39.614l39.617,22.871l-22.875,39.614L194.72,222.236z M248.257,253.146l22.875-39.614l20.615,11.902 l18.994,10.967l-22.868,39.615L248.257,253.146z M301.798,284.055l22.868-39.615l39.615,22.871l-11.435,19.806l-8.39,14.531 c-0.136,0.235-0.286,0.459-0.449,0.671c-1.145,1.484-2.935,2.379-4.839,2.379c-1.072,0-2.091-0.275-3.031-0.818l-14.532-8.391 c-0.008-0.004-0.016-0.008-0.024-0.012L301.798,284.055z M352.725,349.151l-34.338-19.825c-2.909-1.682-3.908-5.416-2.227-8.328 l4.368-7.565l7.571,4.371c2.399,1.385,5.033,2.295,7.749,2.71c0.144,0.023,0.287,0.053,0.431,0.072 c0.197,0.026,0.396,0.039,0.594,0.059c0.282,0.03,0.564,0.065,0.847,0.084c0.227,0.015,0.456,0.015,0.683,0.023 c0.255,0.009,0.51,0.026,0.766,0.026c0.001,0,0.001,0,0.002,0c5.432,0,10.611-2.009,14.599-5.487 c1.813-1.581,3.38-3.465,4.613-5.603l4.369-7.567l7.515,4.339l5.331,3.078l-11.436,19.806L352.725,349.151z M409.308,374.785 c-1.085,1.88-3.11,3.048-5.287,3.048c-1.072,0-2.091-0.275-3.033-0.82l-34.339-19.825l11.436-19.806l11.436-19.806l39.612,22.868 L409.308,374.785z M437.172,326.518l-19.805-11.434l-19.805-11.434l11.436-19.806l11.436-19.808l39.612,22.87L437.172,326.518z M487.911,238.644l-19.828,34.339l-39.612-22.87l12.393-21.467l10.477-18.147l34.342,19.828c1.407,0.812,2.415,2.123,2.835,3.694 C488.94,235.594,488.725,237.235,487.911,238.644z">
                  </path> </g> </g> </g>
              </svg>
            <h1 className='font-bold text-2xl'>Jerseys de Fórmula 1</h1>
          </div>
          <div className='flex flex-row items-center justify-center md:justify-between w-[80%] h-auto gap-4 p-4 mt-4'>
            <div onClick={() => setFilterVisible(true)} className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                <p>Filtrar</p>
            </div>
            <form className='-mt-5 ml-25 sm:ml-0 sm:mt-0' action="">
              <label className='mr-2 opacity-0 sm:opacity-100'>Ordenar por</label>
              <select name="" id="" className='p-2 px-5 h-11 sm:h-auto rounded-[12px] border-2 border-[#252525] text-black' value={order} onChange={handleOrderChange}>
                <option value="new">Nuevas</option>
                <option value="lowCost">Menor precio</option>
                <option value="highCost">Mayor precio</option>
              </select>
            </form>
          </div>
          <div className='md:ml-20 ml-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-[80%] h-full p-4'>
            {camisetasPagina.map((camiseta, index) => {
                const isLiked = liked[index];
                const imagenes = camiseta.img || []
                const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null
                const imagenSecundaria = imagenes.length > 1 ? imagenes[imagenes.length -2] : null;

                return (
                  <div key={index}
                    className="flex flex-col items-center justify-between w-[300px] h-[400px] rounded-2xl bg-white border-2 border-[#252525] mb-5 hover:scale-105 transition-transform "
                    style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
                    
                    <div className="w-full h-[300px] relative rounded-t-2xl overflow-hidden bg-[#f3f3f3] group border-b-2 border-b-[#252525]">
                      {imagenPrincipal && (
                        <img
                          src={imagenPrincipal}
                          alt={camiseta.name}
                          className="w-full h-full object-cover absolute top-0 left-0  opacity-100 group-hover:opacity-0 cursor-pointer"
                        />
                      )}
                      {imagenSecundaria && (
                        <img
                          src={imagenSecundaria}
                          alt={`${camiseta.name} alternativa`}
                          className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-start group w-full p-2">
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center w-auto bg-[#252525] text-white px-4 py-2 rounded-[12px]'>
                          <p className='text-[12px] text-center'>Nuevo</p>
                        </div>
                        <svg className='flex h-8 w-auto cursor-pointer mr-2 sm:opacity-0 group-hover:opacity-100 active:scale-110 transition' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => setLiked(prev => ({ ...prev, [index]: !prev[index] }))}>
                          <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" 
                            fill={isLiked ? '#FF0000' : '#292F36'}>
                          </path>
                      </svg>
                      </div>
                      
                      <p className='font-semibold cursor-pointer'>{camiseta.type} {camiseta.team} {camiseta.driver} {camiseta.year}</p>
                      <div className='flex flex-row items-center w-full gap-x-1'>
                        <p className='text-blue-500'>${camiseta.price} USD</p>
                        <p className='text-gray-500 italic text-[12px] ml-2'>{tasaCOP
                          ? ` = ${(camiseta.price * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
                          : ' (Cargando tasa...)'} COP</p>
                      </div>
                      
                      <div className='flex items-center w-full p-2 flex-row justify-between'>
                        <div className='flex items-center flex-row'>
                          <div className={`h-4 w-4 rounded-full -ml-2 ${camiseta.stock === 'Disponible' ? 'bg-green-500' : 'bg-red-500'}`}>
                          </div>
                          <p className='ml-2 text-[12px]'>{camiseta.stock}</p>
                        </div>
                        <form className='flex items-center justify-center' action="">
                          <select className='p-1 sm:p-2 px-5 h-8 sm:h-auto items-center rounded-[12px] border-2 border-[#252525] text-black'
                           value={selectedSizes[camiseta.name || '']} onChange={(e) => {setSelectedSizes(prev => ({ ...prev, [camiseta.name]: e.target.value }));
                           }}>
                            <option value="">Tallas</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </form> 
                        <svg onClick={() => addToCart(camiseta)}
                          className='h-8 w-auto cursor-pointer sm:opacity-0 group-hover:opacity-100' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.04047 2.29242C2.6497 2.15503 2.22155 2.36044 2.08416 2.7512C1.94678 3.14197 2.15218 3.57012 2.54295 3.7075L2.80416 3.79934C3.47177 4.03406 3.91052 4.18961 4.23336 4.34802C4.53659 4.4968 4.67026 4.61723 4.75832 4.74609C4.84858 4.87818 4.91828 5.0596 4.95761 5.42295C4.99877 5.80316 4.99979 6.29837 4.99979 7.03832L4.99979 9.64C4.99979 12.5816 5.06302 13.5523 5.92943 14.4662C6.79583 15.38 8.19028 15.38 10.9792 15.38H16.2821C17.8431 15.38 18.6236 15.38 19.1753 14.9304C19.727 14.4808 19.8846 13.7164 20.1997 12.1875L20.6995 9.76275C21.0466 8.02369 21.2202 7.15417 20.7762 6.57708C20.3323 6 18.8155 6 17.1305 6H6.49233C6.48564 5.72967 6.47295 5.48373 6.4489 5.26153C6.39517 4.76515 6.27875 4.31243 5.99677 3.89979C5.71259 3.48393 5.33474 3.21759 4.89411 3.00139C4.48203 2.79919 3.95839 2.61511 3.34187 2.39838L3.04047 2.29242ZM15.5172 8.4569C15.8172 8.74256 15.8288 9.21729 15.5431 9.51724L12.686 12.5172C12.5444 12.6659 12.3481 12.75 12.1429 12.75C11.9376 12.75 11.7413 12.6659 11.5998 12.5172L10.4569 11.3172C10.1712 11.0173 10.1828 10.5426 10.4828 10.2569C10.7827 9.97123 11.2574 9.98281 11.5431 10.2828L12.1429 10.9125L14.4569 8.48276C14.7426 8.18281 15.2173 8.17123 15.5172 8.4569Z" fill="#292F36"></path> 
                            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#292F36"></path>
                            <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#292F36"></path>
                        </svg>
                      </div>
                      

                    </div>
                </div>
                )
              })}
          </div>
            <div className="flex justify-center items-center gap-4 mt-6 text-white">
            <button
              className="px-4 py-2 rounded bg-[#292F36] hover:bg-[#252525] cursor-pointer hover:scale-110 transition"
              onClick={() => {
                setPage(page - 1);
                setTimeout(() => {
                  topRef.current?.scrollIntoView({ behavior: 'smooth' });
                },50);
              }}
              disabled={page === 1}>
              Anterior
            </button>
            <span className='text-black'>Página {page} de {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-[#292F36] hover:bg-[#252525] cursor-pointer hover:scale-110 transition"
              onClick={() => {
                setPage(page + 1)
                setTimeout(() => {
                  topRef.current?.scrollIntoView({ behavior: 'smooth' });
                },50);
              }}
              disabled={page === totalPages}>
              Siguiente
            </button>
          </div>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default F1;