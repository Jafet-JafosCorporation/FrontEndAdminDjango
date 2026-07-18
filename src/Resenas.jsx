import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Star } from 'lucide-react';

export default function Resenas() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(false);

  // 1. Cargar la lista de productos para llenar el menú desplegable
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const respuesta = await fetch('http://192.168.56.20:8000/api/productos/');
        if (respuesta.ok) {
          const datos = await respuesta.json();
          const lista = Array.isArray(datos) ? datos : (datos.productos || []);
          setProductos(lista);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };
    cargarProductos();
  }, []);

  // 2. Cargar las reseñas cada vez que elijamos un producto distinto
  useEffect(() => {
    if (!productoSeleccionado) {
      setResenas([]);
      return;
    }

    const cargarResenas = async () => {
      setCargando(true);
      try {
        const respuesta = await fetch(`http://192.168.56.20:8000/api/productos/${productoSeleccionado}/reviews/`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setResenas(datos.reviews || []);
        } else {
          setResenas([]);
        }
      } catch (error) {
        console.error("Error cargando reseñas:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarResenas();
  }, [productoSeleccionado]);

  // 3. Eliminar reseña (Requiere permisos de Admin)
  const borrarResena = async (idResena) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar esta reseña por violar las normas de la comunidad?");
    if (confirmar) {
      try {
        const respuesta = await fetch(`http://192.168.56.20:8000/api/admin/reviews/${idResena}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
          }
        });
        
        if (respuesta.ok) {
          // Si Ubuntu la borra, la quitamos de la pantalla
          setResenas(resenas.filter(r => r.id !== idResena));
        } else {
          alert("Error al eliminar la reseña.");
        }
      } catch (error) {
        console.error("Fallo la conexión:", error);
      }
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50"
          >
            <option value="">-- Elige un producto --</option>
            {productos.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 bg-gray-50 min-h-75">
        {!productoSeleccionado ? (
          <div className="flex justify-center items-center h-full text-gray-400 py-12">
            Selecciona un producto en el menú de arriba para ver qué opinan los clientes.
          </div>
        ) : cargando ? (
          <div className="flex justify-center items-center h-full text-indigo-500 py-12">
            Buscando reseñas en la base de datos...
          </div>
        ) : resenas.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 py-12">
            Nadie ha calificado este producto todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resenas.map((resena, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{resena.username}</p>
                    <div className="flex text-yellow-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < resena.rating ? "currentColor" : "none"} className={i < resena.rating ? "" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => borrarResena(resena.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar Reseña"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-2 italic">"{resena.comment}"</p>
                <p className="text-xs text-gray-400 mt-3 border-t border-gray-50 pt-2">{resena.fecha}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}