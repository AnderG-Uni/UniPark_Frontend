import React from 'react';
import { Smartphone, Download } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen w-full flex font-sans bg-background overflow-hidden">
      
      {/* COLUMNA IZQUIERDA: Scroll nativo oculto y padding ajustado */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-surface z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Redujimos el py-12 a py-8 para que el contenido suba un poco más */}
        <div className="min-h-full flex flex-col justify-center items-center px-6 py-8 sm:px-12 sm:py-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Promocional Azul con Mockup Responsivo */}
      <div className="hidden lg:flex lg:w-1/2 h-full bg-[#009BFF] flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Fondo decorativo */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-4"> {/* mt-8 baja un poco el conjunto */}
          <h2 className="text-white text-2xl xl:text-3xl font-bold mb-6 text-center">¡Instala UniPark ahora mismo!</h2>
          
          {/* Botones de Tiendas */}
          <div className="flex gap-3 mb-8">
            <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
              <Download size={18} />
              <div className="text-left">
                <p className="text-[9px] text-gray-300 uppercase leading-none">GET IT ON</p>
                <p className="font-semibold text-xs leading-none mt-1">Google Play</p>
              </div>
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
              <div className="text-left">
                <p className="text-[9px] text-gray-300 uppercase leading-none">Download on the</p>
                <p className="font-semibold text-xs leading-none mt-1">App Store</p>
              </div>
            </button>
          </div>

          {/* Contenedor del Mockup del celular (Reducido drásticamente para evitar recortes) */}
          <div className="bg-[#008AE6] p-4 xl:p-6 rounded-3xl w-full max-w-[280px] flex justify-center shadow-xl border border-white/10 relative">
            
            {/* Celular más pequeño */}
            <div className="w-[180px] h-[360px] bg-primary rounded-[2rem] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
              {/* Notch */}
              <div className="w-20 h-4 bg-slate-800 absolute top-0 rounded-b-lg"></div>
              
              <Smartphone size={48} className="text-accent opacity-50 mb-2" />
              <p className="text-white text-center px-2 font-medium opacity-80 text-xs">UniPark Mobile App</p>
            </div>
            
            {/* Logo inferior */}
            <div className="absolute -bottom-4 bg-white px-4 py-1.5 rounded-lg shadow-lg font-bold text-base text-primary">
              Uni<span className="text-accent">Park</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}