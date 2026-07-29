import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle, XCircle, CreditCard, Banknote } from 'lucide-react';
import { BASE_URL } from './config'; // <-- IMPORTACIÓN DE LA URL CENTRAL

const ESTADOS_DISPONIBLES = ['Pendiente', 'Pagada', 'Enviada', 'Entregada', 'Cancelada'];

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('Todas');

  const cargarOrdenes = async () => {
    try {
      // CONECTADO A BASE_URL EN LUGAR DE LA IP DURA
      const res = await fetch(`${BASE_URL}/api/admin/ordenes/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
      });
      if (res.ok) {
        const datos = await res.json();
        const listaPlana = [];
        if (datos.ordenes) {
          Object.keys(datos.ordenes).forEach(usuario => {
            datos.ordenes[usuario].forEach(orden => {
              listaPlana.push({ usuario, ...orden });
            });
          });
        }
        setOrdenes(listaPlana);
      }
    } catch (error) { console.error("Error al cargar órdenes:", error); }
  };

  useEffect(() => { cargarOrdenes(); }, []);

  // CAMBIO DE ESTADO EN VIVO
  const cambiarEstado = async (idOrden, nuevoEstado) => {
    try {
      // CONECTADO A BASE_URL EN LUGAR DE LA IP DURA
      const res = await fetch(`${BASE_URL}/api/admin/ordenes/${idOrden}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarOrdenes();
      } else {
        alert("No se pudo cambiar el estado del pedido.");
      }
    } catch (error) { console.error("Fallo la conexión:", error); }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const estado = orden.estado || 'Pagada';
    if (filtroActivo === 'Todas') return true;
    return estado === filtroActivo;
  });

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Pagada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Enviada': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Entregada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Cabecera y Pestañas por cada Estado */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-600" /> Logística y Envíos
          </h3>
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg mt-3">
            {['Todas', ...ESTADOS_DISPONIBLES].map((opcion) => (
              <button
                key={opcion}
                onClick={() => setFiltroActivo(opcion)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filtroActivo === opcion 
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabla con Selector de Estado */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID Pedido</th>
              <th className="p-4 font-medium">Comprador</th>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium text-center">Cant.</th>
              <th className="p-4 font-medium text-right">Total</th>
              <th className="p-4 font-medium text-center">Método de Pago</th> {/* NUEVA COLUMNA */}
              <th className="p-4 font-medium text-center">Gestión de Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay pedidos registrados en este estado.</td></tr>
            ) : (
              ordenesFiltradas.map((orden, index) => {
                const estadoActual = orden.estado || 'Pagada';
                // Lógica de protección para órdenes antiguas sin método de pago
                const metodoPago = orden.metodo_pago || 'Efectivo';
                const esTarjeta = metodoPago.toLowerCase() === 'tarjeta';
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 text-xs font-mono">#{orden.id}</td>
                    <td className="p-4 font-medium text-gray-800">{orden.usuario}</td>
                    <td className="p-4 text-gray-600 font-medium">{orden.nombre}</td>
                    <td className="p-4 text-center">{orden.quantity}</td>
                    <td className="p-4 text-right font-bold text-gray-800">${orden.total?.toLocaleString()}</td>
                    
                    {/* INDICADOR VISUAL DEL MÉTODO DE PAGO */}
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        esTarjeta 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {esTarjeta ? <CreditCard size={14} /> : <Banknote size={14} />}
                        {esTarjeta ? 'Tarjeta' : 'Efectivo'}
                      </div>
                    </td>
                    
                    {/* CONTROL DESPLEGABLE DE ESTADO */}
                    <td className="p-4 text-center">
                      <select
                        value={estadoActual}
                        onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer transition-all shadow-sm ${getBadgeStyle(estadoActual)}`}
                      >
                        {ESTADOS_DISPONIBLES.map((est) => (
                          <option key={est} value={est} className="bg-white text-gray-800 font-normal">
                            {est}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}