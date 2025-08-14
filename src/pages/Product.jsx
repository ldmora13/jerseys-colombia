import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/Loader';

const Product = () => {

    const { category, name } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);


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
            // Selecciona la tabla según la categoría
            let table = category;
            if (category.toLowerCase() === 'f1') table = 'f1';
            if (category.toLowerCase() === 'futbol') table = 'futbol';
            if (category.toLowerCase() === 'nba') table = 'nba';

            const { data, error } = await supabase
                .from(table)
                .select('*');
            if (!error) {
                data.forEach((p) => {
                    console.log(
                        "name:", generarSlug(p.name),
                        "vs name:", name
                    );
                });
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
    
    if (loading) {
        return <Loader />;
    }

    if (!producto) {
        return <div className="text-center mt-10 text-red-600 font-bold">Producto no encontrado</div>;
    }

  return (    
    <div>
      <h1>{producto.name}</h1>
      <img src={producto.img[0]} alt={producto.name} />
      <p>{producto.price} USD</p>
    </div>
  )
}

export default Product