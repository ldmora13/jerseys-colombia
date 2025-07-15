import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import Loader from '../components/Loader';
import Filter from '../components/Filter';
import nba from '../assets/soccer-equipment.svg';

const NBA = () => {

  const [camisetasNBA, setCamisetasNBA] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [order, setOrder] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const handleOrderChange = (event) => {
    setOrder(event.target.value);
  }

  useEffect(() => {
    const fetchCamisetasNBA = async () => {
      try {
        const NBARes = await supabase
          .from('nba')
          .select('name, img, team, year, index, player')
          .order('year', { ascending: true })
          .limit(20);

        if (NBARes.error) {
          console.error('Error en NBA:', NBARes.error);
        } else {
          setCamisetasNBA(NBARes.data);
        }
      } catch (err) {
        console.error('Error al cargar camisetas NBA:', err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    fetchCamisetasNBA();
  }, []);


  return (
    <div className="flex overflow-hidden">
      <div className="flex-1">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
            <Loader />
          </div>
        )}
        <Filter filterVisible={filterVisible} setFilterVisible={setFilterVisible} />
        <Header />
        <main className="mt-20 flex flex-col items-center w-screen h-screen p-4 text-black overflow-hidden  ">
          <div className='flex flex-col items-center w-auto h-auto'>
            <img src={nba} alt="NBA Equipment" className='h-12' />
            <h1 className='font-bold text-2xl'>Jerseys de NBA</h1>
          </div>
          <div className='flex flex-row items-center justify-between w-[70%] h-auto p-4 mt-4'>
            <div onClick={() => setFilterVisible(true)} className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                <p>Filtrar</p>
            </div>
            <form  action="">
              <label className='mr-2'>Ordenar por</label>
              <select name="" id="" className='p-2 px-5 rounded-[12px] border-2 border-[#252525] text-black' value={order} onChange={handleOrderChange}>
                <option value="year">Relevantes</option>
                <option value="lowCost">Menor precio</option>
                <option value="highCost">Mayor precio</option>
              </select>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NBA;