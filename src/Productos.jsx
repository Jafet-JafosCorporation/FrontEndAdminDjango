import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Search, MessageSquare, Tag, Award, Image as ImageIcon } from 'lucide-react';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  // Formulario extendido para proyecto universitario pro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Laptops');
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  const cargarProductos = async () => {
    try {
      const res = await fetch('http://192.168.56.20:8000/api/productos/');
      if (res.ok) {
        const datos = await res.json();
        setProductos(Array.isArray(datos) ? datos : (datos.productos || []));
      }
    } catch (error) { console.error("Fallo la conexión:", error); }
  };

  useEffect(() => { cargarProductos(); }, []);

  // Extraer categorías únicas para las pestañas de filtrado
  const categoriasUnicas = ['Todas', ...new Set(productos.map(p => p.categoria || 'General'))];

  const productosFiltrados = productos.filter(prod => {
    const coincideTexto = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          (prod.marca && prod.marca.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCat = filtroCategoria === 'Todas' || (prod.categoria || 'General') === filtroCategoria;
    return coincideTexto && coincideCat;
  });

  const abrirModalCrear = () => {
    setProductoEnEdicion(null); setNuevoNombre(''); setNuevoPrecio(''); setNuevoStock('');
    setNuevaCategoria('Laptops'); setNuevaMarca(''); setNuevaImagen(''); setNuevaDescripcion('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (prod) => {
    setProductoEnEdicion(prod.id); setNuevoNombre(prod.nombre); setNuevoPrecio(prod.precio); setNuevoStock(prod.stock);
    setNuevaCategoria(prod.categoria || 'General'); setNuevaMarca(prod.marca || '');
    setNuevaImagen(prod.imagen || ''); setNuevaDescripcion(prod.descripcion || '');
    setIsModalOpen(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    const paqueteDatos = { 
      nombre: nuevoNombre, 
      precio: parseFloat(nuevoPrecio), 
      stock: parseInt(nuevoStock),
      categoria: nuevaCategoria,
      marca: nuevaMarca || 'Genérica',
      imagen: nuevaImagen || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
      descripcion: nuevaDescripcion || 'Producto de alta tecnología en el catálogo de JafosCorporation.'
    };
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
    if (window.confirm("¿Estás seguro de eliminar este producto del catálogo?")) {
      try {
        const res = await fetch(`http://192.168.56.20:8000/api/admin/productos/${id}/`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
        });
        if (res.ok) cargarProductos();
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* Cabecera con Buscador y Filtros de Categoría */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Catálogo General de Inventario</h3>
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg mt-3">
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filtroCategoria === cat ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Buscar por nombre o marca..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <button onClick={abrirModalCrear} className="flex shrink-0 items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>
      
      {/* Tabla Extendida */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Categoría / Marca</th>
              <th className="p-4 font-medium text-right">Precio</th>
              <th className="p-4 font-medium text-center">Stock</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay productos en esta vista.</td></tr>
            ) : (
              productosFiltrados.map((prod) => (
                <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  {/* Imagen y Nombre */}
                  <td className="p-4 flex items-center gap-3">
                    <img 
                      src={prod.imagen || 'https://via.placeholder.com/60'} 
                      alt="" 
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&q=80'; }}
                    />
                    <div>
                      <p className="font-bold text-gray-800">{prod.nombre}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{prod.descripcion || 'Sin descripción'}</p>
                    </div>
                  </td>

                  {/* Categoría y Marca con Iconos */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                        <Tag size={12} /> {prod.categoria || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Award size={12} /> {prod.marca || 'Genérica'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-gray-800 text-right">${prod.precio?.toLocaleString()}</td>
                  
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {prod.stock} uds.
                    </span>
                  </td>

                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => abrirModalEditar(prod)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
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

      {/* Modal CRUD Profesional */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">{productoEnEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
            </div>
            
            <form onSubmit={guardarProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                <input type="text" required value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Laptop Gamer Nitro 5" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="Laptops">Laptops & Computadoras</option>
                    <option value="Componentes">Componentes (Hardware)</option>
                    <option value="Periféricos">Periféricos y Accesorios</option>
                    <option value="Monitores">Monitores y Pantallas</option>
                    <option value="Redes">Redes y Conectividad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input type="text" required value={nuevaMarca} onChange={(e) => setNuevaMarca(e.target.value)} placeholder="Ej: NVIDIA, AMD, Dell..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (MXN) *</label>
                  <input type="number" step="0.01" required value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="0.00" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Disponible *</label>
                  <input type="number" required value={nuevoStock} onChange={(e) => setNuevoStock(e.target.value)} placeholder="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (Para App Móvil)</label>
                <div className="flex gap-2">
                  <input type="url" value={nuevaImagen} onChange={(e) => setNuevaImagen(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Especificaciones</label>
                <textarea rows="3" value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} placeholder="Describe procesador, RAM, almacenamiento, etc..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}