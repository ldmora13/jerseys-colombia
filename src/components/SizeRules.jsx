import React, {useState, useEffect, useRef} from 'react'

const SizeRules = ({
  sizeRulesVisible, 
  setSizeRulesVisible
}) => {

  const sizesRef = useRef(null) 

  useEffect(() => {
    function handleClickOutside(event) {
        if (
            sizeRulesVisible &&
            sizesRef.current &&
            !sizesRef.current.contains(event.target)
        ) {
            setSizeRulesVisible(false);
        }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sizeRulesVisible, setSizeRulesVisible]);

  if (!sizeRulesVisible) return null;

  return (  
   <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-lg">
      <div
        ref={sizesRef}
        className="bg-white rounded-xl shadow-xl p-4 max-w-xl w-full relative max-h-[90vh] flex flex-col"
      >
        {/* Botón cerrar */}
        <button
          className="absolute top-0 right-1 text-lg font-bold text-gray-500 hover:text-black"
          onClick={() => setSizeRulesVisible(false)}>
          ×
        </button>
        <div className="overflow-y-auto flex-1 space-y-6 pr-2">
          {/* Tabla Versión Jugador */}
          <div>
            <h2 className="text-base font-bold mb-2 text-center">
              Versión Player (Hombres)
            </h2>
            <div className="grid grid-cols-4 text-center font-semibold bg-gray-200 rounded-t-xl text-xs">
              <div className="p-1">Talla</div>
              <div className="p-1">Largo</div>
              <div className="p-1">Ancho</div>
              <div className="p-1">Altura</div>
            </div>
            {[
              ["S", "69-69", "49-51", "162-170"],
              ["M", "69-71", "51-53", "170-176"],
              ["L", "71-73", "53-55", "176-182"],
              ["XL", "73-75", "55-57", "182-190"],
              ["XXL", "75-77", "57-59", "190-195"]
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 text-center border-b border-gray-300 text-xs"
              >
                {row.map((cell, i) => (
                  <div key={i} className="p-1">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Tabla Versión Fan */}
          <div>
            <h2 className="text-base font-bold mb-2 text-center">
              Versión Fan (Hombres)
            </h2>
            <div className="grid grid-cols-4 text-center font-semibold bg-gray-200 rounded-t-xl text-xs">
              <div className="p-1">Talla</div>
              <div className="p-1">Largo</div>
              <div className="p-1">Ancho</div>
              <div className="p-1">Altura</div>
            </div>
            {[
              ["S", "69-71", "53-55", "162-170"],
              ["M", "71-73", "55-57", "170-176"],
              ["L", "73-75", "57-58", "176-182"],
              ["XL", "75-78", "58-60", "182-190"],
              ["XXL", "78-81", "60-62", "190-195"]
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 text-center border-b border-gray-300 text-xs"
              >
                {row.map((cell, i) => (
                  <div key={i} className="p-1">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Tabla Mujeres */}
          <div>
            <h2 className="text-base font-bold mb-2 text-center">Mujeres</h2>
            <div className="grid grid-cols-4 text-center font-semibold bg-gray-200 rounded-t-xl text-xs">
              <div className="p-1">Talla</div>
              <div className="p-1">Largo</div>
              <div className="p-1">Ancho</div>
              <div className="p-1">Altura</div>
            </div>
            {[
              ["S", "61-63", "40-41", "150-160"],
              ["M", "63-66", "41-44", "160-165"],
              ["L", "66-69", "44-47", "165-170"],
              ["XL", "69-71", "47-50", "170-175"],
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 text-center border-b border-gray-300 text-xs"
              >
                {row.map((cell, i) => (
                  <div key={i} className="p-1">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Tabla NBA Silk */}
          <div>
            <h2 className="text-base font-bold mb-2 text-center">
              NBA (Hombres)
            </h2>
            <div className="grid grid-cols-5 text-center font-semibold bg-gray-200 rounded-t-xl text-xs">
              <div className="p-1">Talla</div>
              <div className="p-1">Largo</div>
              <div className="p-1">Pecho</div>
              <div className="p-1">Hombros</div>
              <div className="p-1">Altura</div>
            </div>
            {[
              ["S", "70", "98", "35", "160-170cm"],
              ["M", "72", "106", "37", "168-175cm"],
              ["L", "75", "112", "39", "172-180cm"],
              ["XL", "77", "120", "41", "178-185cm"],
              ["XXL", "80", "130", "44", "183-200cm"],
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 text-center border-b border-gray-300 text-xs"
              >
                {row.map((cell, i) => (
                  <div key={i} className="p-1">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SizeRules