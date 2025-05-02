import React, {useEffect, useState} from 'react'
import logo from '../assets/football-jersey.svg' 
import { useNavigate } from 'react-router-dom'

const Policies = () => {

  const navigate = useNavigate();
  return (
    <div>
       <header className="p-4 relative w-full z-[1000] top-0 left-0 h-[70px] border-b-[2px] border-transparent">
            {/* Logo */}
            <div className="flex items-center justify-center ">
              <a href="/">
                <img src={logo} onClick={() => navigate("/")} alt="logo" className="h-[40px]"/>
              </a>
            </div>

          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
          </div>
        </header>
        <div>
          <div className="max-w-[1000px] mx-auto px-5 py-10">
            <h1 className='text-center text-[30px] font-bold'>Políticas de Jerseys Colombia</h1>
            <p className='text-center text-[16px]'>Última actualización: 2025-05-01</p>
            <div className='mt-10'>
              <h2 className='text-[20px] font-bold'>1. Introducción</h2>
              <p className='text-[16px]'>Al utilizar nuestro sitio web, aceptas cumplir con nuestras políticas y términos de servicio.</p>
            </div>
            <div className='mt-10'>
              <h2 className='text-[20px] font-bold'>2. Uso del Sitio</h2>
              <p className='text-[16px]'>El uso de nuestro sitio está sujeto a las siguientes condiciones:</p>
              <ul className='list-disc list-inside'>
                <li className='text-[16px]'>Debes proporcionar información precisa y actualizada.</li>
                <li className='text-[16px]'>No puedes usar el sitio para fines ilegales.</li>
                <li className='text-[16px]'>No puedes interferir con la seguridad del sitio.</li>
                <li className='text-[16px]'>No puedes usar el sitio para enviar spam o contenido no deseado.</li>
                <li className='text-[16px]'>No puedes intentar acceder a cuentas de otros usuarios.</li> 
              </ul>
            </div>
            <div className='mt-10'>
              <h2 className='text-[20px] font-bold'>3. Seguridad y privacidad </h2>
              <div className='mt-2 ml-5 '>
                <h3 className='text-[18px]'>3.1 Informacion personal</h3>
                <p className='text-[16px]'>
                    La información personal que usted envía a Jerseys Colombia a través de formularios o en los diversos elementos, se rige por el Aviso de privacidad de internacional, que describe cómo se recopila, procesa y divulga su información personal.
                </p>
                <h3 className='text-[18px] mt-2'>3.2 Cuenta de Miembro, Contraseña y Seguridad</h3>
                <p className='text-[16px]'>
                  El acceso a ciertos materiales y/o subsitios puede requerir que usted cree una cuenta de miembro y seleccione una contraseña. Es una condición que: 
                  </p>
                <ul className='list-disc list-inside'>
                  <li className='text-[16px]'>Toda la información que usted proporcione debe ser exacta, actual y completa.</li>
                  <li className='text-[16px]'>Sea responsable del mantenimiento y de la confidencialidad de su contraseña y de su cuenta. </li>
                  <li className='text-[16px]'>Sea responsable de toda actividad que se lleve a cabo en su cuenta.</li>
                  <li className='text-[16px]'>No permita que terceros usen su cuenta, así como que usted use la cuenta de alguien más en cualquier momento.</li>
                </ul>
                <h3 className='text-[18px] mt-2'>3.3 Desactivación o suspensión de la Cuenta</h3>
                <p className='text-[16px]'>Jerseys Colombia tiene el derecho de desactivar o suspender cualquier cuenta en cualquier momento a discreción única y absoluta, sin importar el motivo y sin previo aviso.</p>
              </div>
            </div>
            <div className='mt-10'>
              <h2 className='text-[20px] font-bold'>4. Politicas de cambio</h2>
              <p className='text-[16px]'>Todos los productos se pueden cambiar si han llegado defectuosos, errroneos o incompletos.</p>
              <p className='text-[16px]'>No se realizan devolviones de dinero, simplemente cambios de productos</p>
              <p className='text-[16px]'>Si el error fue del usuario al realizar la compra, NO se realizan devoluciones ni cambios.</p>
              <p className='text-[16px]'>Para iniciar el proceso de cambio, por favor contáctanos a través de nuestro formulario de contacto o en las compras de su perfil.</p>
              <div className='ml-5'>
                <h3 className='text-[18px] mt-2'>4.1 Condiciones para el cambio de productos</h3>
                <p className='text-[16px]'>Para que un producto sea elegible para un cambio, debe cumplir con las siguientes condiciones:</p>
                <ul className='list-disc list-inside'>
                  <li className='text-[16px]'>El producto debe estar en su estado original, sin usar y con todas las etiquetas y empaques originales.</li>
                  <li className='text-[16px]'>Los productos personalizados o hechos a medida no se cambian a excepción de que tengan defectos de fabrica</li>
                  <li className='text-[16px]'>Los productos en oferta o rebajados no son elegibles para cambios.</li>
                  <li className='text-[16px]'>Los productos deben ser devueltos dentro de los 30 días posteriores a la recepción.</li>
                  <li className='text-[16px]'>Los productos deben ser devueltos a la dirección proporcionada por nuestro equipo de atención al cliente.</li>
                  <li className='text-[16px]'>Los gastos de envío de la devolución son responsabilidad del cliente, a menos que el producto esté defectuoso o incorrecto.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Policies;