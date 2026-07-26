import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, MessageSquare } from 'lucide-react'; // <-- AGREGADO MessageSquare
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Login from './Login';
import Productos from './Productos';
import Usuarios from './Usuarios'; 
import Ordenes from './Ordenes';
import Resenas from './Resenas'; // <-- AGREGADO

function RutaProtegida({ children }) {
  const token = localStorage.getItem('tokenAdmin');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cerrarSesion = () => {
    localStorage.removeItem('tokenAdmin');
    navigate('/');
  };

  const navItemClass = (ruta) => {
    const activo = location.pathname === ruta;
    return `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      activo ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600">JafosCorporation</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate('/panel')} className={navItemClass('/panel')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => navigate('/panel/productos')} className={navItemClass('/panel/productos')}>
            <Package size={20} /> Productos
          </button>
          <button onClick={() => navigate('/panel/usuarios')} className={navItemClass('/panel/usuarios')}>
            <Users size={20} /> Usuarios
          </button>
          <button onClick={() => navigate('/panel/ordenes')} className={navItemClass('/panel/ordenes')}>
            <ShoppingCart size={20} /> Órdenes 
          </button>
          {/* NUEVO BOTÓN PARA RESEÑAS */}
          <button onClick={() => navigate('/panel/resenas')} className={navItemClass('/panel/resenas')}>
            <MessageSquare size={20} /> Reseñas 
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={cerrarSesion} 
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Panel de Administración</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JA</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Admin Jafet</p>
              <p className="text-xs text-gray-500">JafosCorporation</p>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [metricas, setMetricas] = useState({ total: 0, valorInventario: 0 });

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const token = localStorage.getItem('tokenAdmin');
        
        // 1. Traemos los Productos
        const resProd = await fetch('http://192.168.56.20:8000/api/productos/');
        let listaProductos = [];
        if (resProd.ok) {
          const datos = await resProd.json();
          listaProductos = Array.isArray(datos) ? datos : (datos.productos || []);
          setProductos(listaProductos);

          const valorTotal = listaProductos.reduce((suma, prod) => suma + (prod.precio * prod.stock), 0);
          setMetricas({ total: listaProductos.length, valorInventario: valorTotal });
        }

        // 2. Traemos las Órdenes para calcular ventas y usuarios
        const resOrd = await fetch('http://192.168.56.20:8000/api/admin/ordenes/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resOrd.ok) {
          const datosOrd = await resOrd.json();
          const listaPlana = [];
          if (datosOrd.ordenes) {
            Object.keys(datosOrd.ordenes).forEach(usuario => {
              datosOrd.ordenes[usuario].forEach(orden => {
                listaPlana.push({ usuario, ...orden });
              });
            });
          }
          setOrdenes(listaPlana);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };
    cargarDatosDashboard();
  }, []);

  // --- CÁLCULOS MATEMÁTICOS PARA TUS IDEAS ---

  // A) Productos con menos stock (Alerta: 5 o menos)
  const productosPocoStock = productos.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  // B) Top 5 Usuarios que más compran (Dinero gastado)
  const gastosPorUsuario = ordenes.reduce((acc, orden) => {
    acc[orden.usuario] = (acc[orden.usuario] || 0) + orden.total;
    return acc;
  }, {});
  
  const topUsuarios = Object.keys(gastosPorUsuario)
    .map(user => ({ nombre: user, gastado: gastosPorUsuario[user] }))
    .sort((a, b) => b.gastado - a.gastado)
    .slice(0, 5); // Tomamos solo los 5 primeros

  // C) Gráfica: Productos Más Vendidos (Cantidad de unidades)
  const ventasPorProducto = ordenes.reduce((acc, orden) => {
    acc[orden.nombre] = (acc[orden.nombre] || 0) + orden.quantity;
    return acc;
  }, {});

  const datosVendidos = Object.keys(ventasPorProducto)
    .map(prod => ({ nombre: prod, Vendidos: ventasPorProducto[prod] }))
    .sort((a, b) => b.Vendidos - a.Vendidos)
    .slice(0, 5); // Top 5 para la gráfica

  // D) Gráfica Original: Niveles de Stock
  const datosStock = productos.map(prod => ({ nombre: prod.nombre, Stock: prod.stock }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Package size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Productos</p><p className="text-2xl font-bold text-gray-800">{metricas.total}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><ShoppingCart size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Valor del Inventario</p><p className="text-2xl font-bold text-gray-800">${metricas.valorInventario.toLocaleString()}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Ventas Registradas</p><p className="text-2xl font-bold text-gray-800">{ordenes.length}</p></div>
        </div>
      </div>

      {/* SECCIÓN INTERMEDIA: GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica 1: Stock (La que no querías borrar) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Nivel de Stock Actual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosStock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="Stock" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Productos más vendidos (Nueva) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Productos Más Vendidos</h3>
          <div className="h-64">
            {datosVendidos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosVendidos} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis type="category" dataKey="nombre" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} width={120} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="Vendidos" fill="#10B981" radius={[0, 4, 4, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Aún no hay ventas para analizar.</div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TUS IDEAS DE LISTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lista 1: Top Usuarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🏅 Top 5 Clientes VIP</h3>
          <div className="space-y-3">
            {topUsuarios.length > 0 ? topUsuarios.map((user, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-400">#{idx + 1}</span>
                  <span className="font-medium text-gray-700">{user.nombre}</span>
                </div>
                <span className="font-bold text-green-600">${user.gastado.toLocaleString()}</span>
              </div>
            )) : <p className="text-gray-400 text-sm">Sin datos de clientes.</p>}
          </div>
        </div>

        {/* Lista 2: Alertas de Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-red-600">⚠️ Alertas de Inventario</h3>
          <div className="space-y-3">
            {productosPocoStock.length > 0 ? productosPocoStock.map((prod, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                <span className="font-medium text-red-800">{prod.nombre}</span>
                <span className="font-bold text-red-600 bg-white px-2 py-1 rounded-md text-sm">Stock: {prod.stock}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">Inventario estable. Ningún producto está por agotarse.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/panel" element={<RutaProtegida><AdminLayout><DashboardHome /></AdminLayout></RutaProtegida>} />
        <Route path="/panel/productos" element={<RutaProtegida><AdminLayout><Productos /></AdminLayout></RutaProtegida>} />
        <Route path="/panel/usuarios" element={<RutaProtegida><AdminLayout><Usuarios /></AdminLayout></RutaProtegida>} />
        <Route path="/panel/ordenes" element={<RutaProtegida><AdminLayout><Ordenes /></AdminLayout></RutaProtegida>} />
        {/* NUEVA RUTA PARA RESEÑAS */}
        <Route path="/panel/resenas" element={<RutaProtegida><AdminLayout><Resenas /></AdminLayout></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}