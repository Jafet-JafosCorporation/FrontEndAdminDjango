import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Search, MessageSquare, Star } from 'lucide-react';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  
  // Variables del Buscador
  const [busqueda, setBusqueda] = useState('');

  // Variables del Modal de Productos (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Variables del Modal de Reseñas
  const [isResenasModalOpen, setIsResenasModalOpen] = useState(false);
  const [resenasActivas, setResenasActivas] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  // 1. Cargar Productos
  const cargarProductos = async () => {
    try {
      const respuesta = await fetch('http://192.168.56.20:8000/api/productos/');
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(Array.isArray(datos) ? datos : (datos.productos || datos.data || []));
      }
    } catch (error) {
      console.error("Fallo la conexión:", error);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  // Lógica del Buscador en tiempo real
  const productosFiltrados = productos.filter(prod => 
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    prod.id.toString().includes(busqueda)
  );

  // Funciones Modal Productos
  const abrirModalCrear = () => {
    setProductoEnEdicion(null); setNuevoNombre(''); setNuevoPrecio(''); setNuevoStock('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (prod) => {
    setProductoEnEdicion(prod.id); setNuevoNombre(prod.nombre); setNuevoPrecio(prod.precio); setNuevoStock(prod.stock);
    setIsModalOpen(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    const paqueteDatos = { nombre: nuevoNombre, precio: parseFloat(nuevoPrecio), stock: parseInt(nuevoStock) };
    try {
      const url = productoEnEdicion ? `http://192.168.56.20:8000/api/admin/productos/${productoEnEdicion}/` : 'http://192.168.56.20:8000/api/admin/productos/';
      const metodo = productoEnEdicion ? 'PUT' : 'POST';
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` },
        body: JSON.stringify(paqueteDatos)
      });
      if (respuesta.ok) { setIsModalOpen(false); cargarProductos(); }
    } catch (error) { console.error(error); }
  };

  const borrarProducto = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        const respuesta = await fetch(`http://192.168.56.20:8000/api/admin/productos/${id}/`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
        });
        if (respuesta.ok) cargarProductos();
      } catch (error) { console.error(error); }
    }
  };

  // --- NUEVAS FUNCIONES DE RESEÑAS ---
  const abrirResenas = async (prod) => {
    setProductoSeleccionado(prod);
    setIsResenasModalOpen(true);
    setCargandoResenas(true);
    try {
      const respuesta = await fetch(`http://192.168.56.20:8000/api/productos/${prod.id}/reviews/`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setResenasActivas(datos.reviews || []);
      } else { setResenasActivas([]); }
    } catch (error) { console.error(error); } finally { setCargandoResenas(false); }
  };

  const borrarResena = async (idResena) => {
    if (window.confirm("¿Eliminar esta reseña por violar las normas?")) {
      try {
        const respuesta = await fetch(`http://192.168.56.20:8000/api/admin/reviews/${idResena}/`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
        });
        if (respuesta.ok) setResenasActivas(resenasActivas.filter(r => r.id !== idResena));
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* Cabecera con Buscador y Botón */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">Catálogo de Productos</h3>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          {/* El nuevo buscador */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          <button onClick={abrirModalCrear} className="flex shrink-0 items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium text-right">Precio</th>
              <th className="p-4 font-medium text-center">Stock</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron productos.</td></tr>
            ) : (
              productosFiltrados.map((prod) => (
                <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 text-sm">#{prod.id}</td>
                  <td className="p-4 font-medium text-gray-800">{prod.nombre}</td>
                  <td className="p-4 text-gray-600 text-right">${prod.precio}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {prod.stock}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    {/* Botón de Reseñas */}
                    <button onClick={() => abrirResenas(prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Ver Reseñas">
                      <MessageSquare size={18} />
                    </button>
                    {/* Botón Editar */}
                    <button onClick={() => abrirModalEditar(prod)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                    {/* Botón Borrar */}
                    <button onClick={() => borrarProducto(prod.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD (Crear/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">{productoEnEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={guardarProducto} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" required value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" required value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" required value={nuevoStock} onChange={(e) => setNuevoStock(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NUEVO: Modal de Reseñas */}
      {isResenasModalOpen && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabecera del modal de reseñas */}
            <div className="p-5 border-b border-gray-200 bg-white rounded-t-2xl flex justify-between items-center sticky top-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare size={20} className="text-indigo-600" /> Reseñas del Producto
                </h3>
                <p className="text-sm text-gray-500 mt-1">{productoSeleccionado.nombre}</p>
              </div>
              <button onClick={() => setIsResenasModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del modal (Lista de reseñas) */}
            <div className="p-6 overflow-y-auto flex-1">
              {cargandoResenas ? (
                <div className="text-center py-10 text-indigo-500 font-medium">Buscando reseñas...</div>
              ) : resenasActivas.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Nadie ha calificado este producto todavía.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resenasActivas.map((resena, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 relative group hover:border-indigo-200 transition-colors">
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
        </div>
      )}
    </div>
  );
}