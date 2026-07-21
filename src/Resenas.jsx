import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Star } from 'lucide-react';

export default function Resenas() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      const res = await fetch('http://192.168.56.20:8000/api/productos/');
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
      const res = await fetch(`http://192.168.56.20:8000/api/productos/${productoSeleccionado}/reviews/`);
      if (res.ok) {
        const datos = await res.json();
        setResenas(datos.reviews || []);
      }
      setCargando(false);
    };
    cargarResenas();
  }, [productoSeleccionado]);

  const borrarResena = async (idResena) => {
    if (window.confirm("¿Eliminar esta reseña por violar las normas?")) {
      const res = await fetch(`http://192.168.56.20:8000/api/admin/reviews/${idResena}/`, {
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
      });
      if (res.ok) setResenas(resenas.filter(r => r.id !== idResena));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" /> Moderación de Reseñas
        </h3>
        
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un producto del catálogo:</label>
          <select 
            value={productoSeleccionado} 
            onChange={(e) => setProductoSeleccionado(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
          >
            <option value="">-- Elige un producto --</option>
            {productos.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 min-h-100">
        {cargando ? (
          <p className="text-center py-10 text-indigo-500 font-medium">Buscando opiniones...</p>
        ) : !productoSeleccionado ? (
          <p className="text-center py-10 text-gray-500">Selecciona un producto arriba para ver sus reseñas.</p>
        ) : resenas.length === 0 ? (
          <p className="text-center py-10 text-gray-500">Nadie ha calificado este producto todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resenas.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 relative group hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{r.username}</p>
                    <div className="flex text-yellow-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => borrarResena(r.id)} 
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar Reseña"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-2 italic">"{r.comment}"</p>
                <p className="text-xs text-gray-400 mt-3 border-t border-gray-50 pt-2">{r.fecha}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}