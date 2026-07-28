import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Star, Search, Package, AlertCircle } from 'lucide-react';
import { BASE_URL } from './config'; // <-- IMPORTACIÓN DE LA URL CENTRAL

export default function Resenas() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarProductos = async () => {
      // CONECTADO A BASE_URL
      const res = await fetch(`${BASE_URL}/api/productos/`);
      if (res.ok) {
        const datos = await res.json();
        setProductos(Array.isArray(datos) ? datos : (datos.productos || []));
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    if (!productoSeleccionado) {
      setResenas([]);
      return;
    }
    const cargarResenas = async () => {
      setCargando(true);
      // CONECTADO A BASE_URL
      const res = await fetch(`${BASE_URL}/api/productos/${productoSeleccionado.id}/reviews/`);
      if (res.ok) {
        const datos = await res.json();
        setResenas(datos.reviews || []);
      }
      setCargando(false);
    };
    cargarResenas();
  }, [productoSeleccionado]);

  const borrarResena = async (idResena) => {
    if (window.confirm("¿Eliminar esta reseña por violar las normas de la comunidad?")) {
      // CONECTADO A BASE_URL
      const res = await fetch(`${BASE_URL}/api/admin/reviews/${idResena}/`, {
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
      });
      if (res.ok) setResenas(resenas.filter(r => r.id !== idResena));
    }
  };

  // FILTRADO INTELIGENTE EN TIEMPO REAL
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.marca && p.marca.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABECERA PRINCIPAL */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" /> Moderación y Control de Reseñas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un equipo del inventario para supervisar y moderar las opiniones de los clientes.
          </p>
        </div>
      </div>

      {/* DISEÑO MAESTRO - DETALLE (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: BUSCADOR Y LISTA CON SCROLL INTERNO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o marca..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* LISTA COMPACTA CON CLASE CANÓNICA DE TAILWIND (max-h-125) */}
          <div className="max-h-125 overflow-y-auto divide-y divide-gray-100">
            {productosFiltrados.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No se encontraron productos.</p>
            ) : (
              productosFiltrados.map(prod => {
                const activo = productoSeleccionado?.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setProductoSeleccionado(prod)}
                    className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                      activo ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="pr-2">
                      <p className={`text-sm font-semibold truncate ${activo ? 'text-indigo-900' : 'text-gray-800'}`}>
                        {prod.nombre}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {prod.marca || 'Genérica'} • Stock: {prod.stock}
                      </p>
                    </div>
                    {/* CORREGIDO A shrink-0 */}
                    <Package size={16} className={activo ? 'text-indigo-600 shrink-0' : 'text-gray-300 shrink-0'} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA CON CLASE CANÓNICA DE TAILWIND (min-h-125) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 min-h-125 flex flex-col justify-center">
          {!productoSeleccionado ? (
            <div className="text-center py-16 text-gray-400 space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <MessageSquare size={32} />
              </div>
              <p className="font-medium text-gray-600">Ningún producto seleccionado</p>
              <p className="text-sm max-w-sm mx-auto">
                Haz clic en cualquier producto de la columna izquierda para ver, evaluar o eliminar sus opiniones.
              </p>
            </div>
          ) : cargando ? (
            <div className="text-center py-16 text-indigo-500 font-medium animate-pulse">
              Cargando opiniones de {productoSeleccionado.nombre}...
            </div>
          ) : resenas.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <AlertCircle size={32} className="mx-auto text-amber-400 mb-2" />
              <p className="font-medium text-gray-600">Sin reseñas registradas</p>
              <p className="text-sm">Los clientes aún no han calificado el equipo <span className="font-semibold text-gray-700">"{productoSeleccionado.nombre}"</span>.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-2">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{productoSeleccionado.nombre}</h4>
                  <p className="text-xs text-gray-500">Mostrando {resenas.length} opinión(es) de usuarios</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  ID: #{productoSeleccionado.id}
                </span>
              </div>

              {/* CORREGIDO A max-h-105 */}
              <div className="grid grid-cols-1 gap-4 max-h-105 overflow-y-auto pr-1">
                {resenas.map(r => (
                  <div key={r.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200/80 flex flex-col gap-2 relative group hover:border-indigo-200 transition-all shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{r.username}</span>
                        <div className="flex text-yellow-400 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => borrarResena(r.id)} 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar Reseña por Incumplimiento"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                    
                    <p className="text-gray-700 text-sm mt-1 bg-white p-3 rounded-lg border border-gray-100 italic">
                      "{r.comment}"
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-400">
                      <span>Fecha de publicación:</span>
                      <span className="font-mono">{r.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}