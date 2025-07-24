import React from 'react'
import { useNavigate } from 'react-router-dom'


const Footer = () => {

    const navigate = useNavigate()
    

  return (
    <div>
        <footer> 
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#2f3545] to-transparent"></div>
        <div className="bg-[#252525] flex items-center justify-center gap-4 p-4 text-white">
          <p className="text-sm ">© 2025 Jerseys Colombia</p>
          <a onClick={() => navigate("/politicas")} className="cursor-pointer text-sm text-white hover:text-gray-200">Políticas</a>
        </div>
      </footer>
    </div>
  )
}

export default Footer