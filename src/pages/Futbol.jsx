import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import {supabase, getSupabaseClient } from '../lib/supabaseClient';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import AlertGlobal from '../components/AlertGlobal';
import Loader from '../components/Loader';
import Filter from '../components/Filter';
import Footer from '../components/Footer';


const Futbol = ({cartVisible, setCartVisible}) => {

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'success',
    title: ''
  });

  const { cartItems, setCartItems} = useCart();
  const { wishlistItems, setWishlistItems } = useWishlist();


  const topRef = useRef(null);
  const [camisetasFutbol, setCamisetasFutbol] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [order, setOrder] = useState('');

  const [filterVisible, setFilterVisible] = useState(false);

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
  'Fan': 'fan',
  'Player': 'player',
  'Windbreaker': 'windbreaker'
  };


  const camisetasFiltradas = camisetasFutbol.filter((camiseta) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      (camiseta.name || '').toLowerCase().includes(searchLower) ||
      (camiseta.country || '').toLowerCase().includes(searchLower) ||
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
      matchCat = camiseta.category === singular;
    }
    return matchSearch && matchStock && matchPromo && matchYear && matchCat;
  });

  {/* Añadir elementos al carrito */}
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

  {/* Añadir a favoritos */}
  const toggleWishlist = (product) => {
    const productName = product.name; 

    setWishlistItems(prevItems => {
      // Comprobar si el item ya existe
      if (prevItems.includes(productName)) {
        // Si existe, lo eliminamos (devuelve un nuevo array sin ese item)
        return prevItems.filter(item => item !== productName);
      } else {
        // Si no existe, lo añadimos
        return [...prevItems, productName];
      }
    });
  };

  const totalPages = Math.ceil(camisetasFiltradas.length / itemsPerPage);
  const camisetasPagina = camisetasFiltradas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleOrderChange = (event) => {
    const value = event.target.value;
    setOrder(value);

    let sorted = [...camisetasFutbol];

    if (value === 'new') {
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (value === 'lowCost') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (value === 'highCost') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setCamisetasFutbol(sorted);
  };

  useEffect(() => { 
    const fetchCamisetasFutbol = async () => {
      try {
        const futbolRes = await supabase
          .from('selecciones')
          .select('name, img, country, category, type, year, index, price, stock')
          .order('year', { ascending: true });
        if (futbolRes.error) {
          console.error('Error en Futbol:', futbolRes.error);
        } else {
          setCamisetasFutbol(futbolRes.data);
        }
      } catch (err) {
        console.error('Error al cargar camisetas Futbol:', err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    fetchCamisetasFutbol();
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

  const generarSlug = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD") // elimina acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") // espacios a guiones
      .replace(/[^a-z0-9-]/g, "") // elimina caracteres raros
      .replace(/-+/g, "-") // quita guiones repetidos
      .trim();
  };


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
        
        <div ref={topRef} className='h-20'></div>
        <main className="flex flex-col items-center w-full p-4 text-black">
          <div className='flex flex-col items-center w-auto h-auto'>
            <svg className='h-12' fill="#000000" height="200px" width="200px" viewBox="0 0 500.152 500.152" xml:space="preserve">
              <path d="M463.776,116.236c-9.688-30.68-32.52-54.76-62.656-66.056l-79.048-29.648V2.076h-144v18.456l-79.048,29.64 c-30.136,11.304-52.968,35.376-62.656,66.056L0,231.412l95.44,28.632l18.632-62.128v300.16h272v-300.16l18.64,62.12l95.44-28.632 L463.776,116.236z M306.072,18.076v6.112L292.4,51.532l-23.752,7.92l25.856-41.376H306.072z M275.632,18.076l-25.56,40.904 l-25.568-40.904H275.632z M194.072,18.076h11.568l25.856,41.376l-23.752-7.92l-13.672-27.344V18.076z M130.072,482.076v-185.56 c12.52,9.52,21.88,22.864,26.336,38.144l43,147.416H130.072z M171.768,330.188c-6.504-22.32-21.616-41.232-41.696-52.76v-73.96 l6.928,5.936c21.68,18.584,36.056,44.36,40.464,72.584l22.792,145.864L171.768,330.188z M370.072,482.076h-69.336l43-147.416 c4.456-15.28,13.816-28.624,26.336-38.144V482.076z M370.072,277.428c-20.08,11.52-35.184,30.432-41.696,52.76l-28.488,97.664 l22.792-145.864c4.408-28.216,18.784-54,40.464-72.584l6.928-5.936V277.428z M392.024,162.076h-21.952v20.32l-17.336,14.864 c-24.576,21.064-40.856,50.28-45.856,82.264l-31.656,202.552h-50.312l-31.648-202.56c-5-31.984-21.28-61.192-45.856-82.264 l-17.336-14.856v-20.32H108.12l-23.408,78.04l-64.56-19.368l5.808-18.384l53.92,15.408l4.4-15.384L30.776,187.1l20.856-66.048 c8.192-25.96,27.52-46.336,53.016-55.896l77.496-29.064l14.264,28.52l53.664,17.896l53.672-17.888l14.264-28.52l77.496,29.064 C421,74.724,440.328,95.1,448.52,121.06l20.856,66.048l-53.504,15.288l4.4,15.384l53.92-15.408L480,220.756l-64.56,19.368 L392.024,162.076z">
              </path>
            </svg>
            <h1 className='font-bold text-2xl'>Jerseys de Selecciones de Fútbol</h1>
          </div>
          <div className='flex flex-row items-center justify-center md:justify-between sm:w-[80%] w-5 h-auto sm:gap-4 p-4 mt-4'>
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
          <div className='-ml-5 sm:ml-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-[80%] h-full p-2'>
            {camisetasPagina.map((camiseta, index) => {
                const categoria = camiseta.category
                const slug = generarSlug(camiseta.name)
                const imagenes = camiseta.img || []
                const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null;
                const imagenSecundaria = imagenes.length > 1 ? imagenes[imagenes.length -2] : null;

                return (
                  <div key={index}
                    className="flex flex-col items-center justify-center sm:justify-between w-[300px] h-[450px] rounded-2xl bg-white border-2 border-[#252525] mb-5 hover:scale-105 transition-transform "
                    style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
                    <Link to={`/futbol/${slug}`} className="w-full">
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
                    </Link>
                    <div className="flex flex-col items-start group w-full p-2">
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center w-auto bg-[#252525] text-white px-4 py-2 rounded-[12px]'>
                          <p className='text-[12px] text-center'>Nuevo</p>
                        </div>
                        <svg className='flex h-8 w-auto cursor-pointer mr-2 sm:opacity-0 group-hover:opacity-100 active:scale-110 transition' viewBox="0 0 24 24" 
                          onClick={() => toggleWishlist(camiseta)}>
                          <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" 
                          fill={wishlistItems.includes(camiseta.name) ? '#FF0000' : '#292F36'}> 
                          </path>
                        </svg>
                      </div>
                      
                      <p className='font-semibold cursor-pointer capitalize'>{camiseta.category} edition {camiseta.country} {camiseta.year}</p>
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
                        <form className='flex items-center justify-center sm:opacity-0 group-hover:opacity-100'>
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
                            <path d="M3.04047 2.29242C2.6497 2.15503 2.22155 2.36044 2.08416 2.7512C1.94678 3.14197 2.15218 3.57012 2.54295 3.7075L2.80416 3.79934C3.47177 4.03406 3.91052 4.18961 4.23336 4.34802C4.53659 4.4968 4.67026 4.61723 4.75832 4.74609C4.84858 4.87818 4.91828 5.0596 4.95761 5.42295C4.99877 5.80316 4.99979 6.29837 4.99979 7.03832L4.99979 9.64C4.99979 12.5816 5.06302 13.5523 5.92943 14.4662C6.79583 15.38 8.19028 15.38 10.9792 15.38H16.2821C17.8431 15.38 18.6236 15.38 19.1753 14.9304C19.727 14.4808 19.8846 13.7164 20.1997 12.1875L20.6995 9.76275C21.0466 8.02369 21.2202 7.15417 20.7762 6.57708C20.3323 6 18.8155 6 17.1305 6H6.49233C6.48564 5.72967 6.47295 5.48373 6.4489 5.26153C6.39517 4.76515 6.27875 4.31243 5.99677 3.89979C5.71259 3.48393 5.33474 3.21759 4.89411 3.00139C4.48203 2.79919 3.95839 2.61511 3.34187 2.39838L3.04047 2.29242ZM15.5172 8.4569C15.8172 8.74256 15.8288 9.21729 15.5431 9.51724L12.686 12.5172C12.5444 12.6659 12.3481 12.75 12.1429 12.75C11.9376 12.75 11.7413 12.6659 11.5998 12.5172L10.4569 11.3172C10.1712 11.0173 10.1828 10.5426 10.4828 10.2569C10.7827 9.97123 11.2574 9.98281 11.5431 10.2828L12.1429 10.9125L14.4569 8.48276C14.7426 8.18281 15.2173 8.17123 15.5172 8.4569Z" fill="#292F36"></path> 
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

export default Futbol;