import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, XCircle, CheckCircle2 } from 'lucide-react';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  // NUEVO: Variable para el filtro
  const [filtroActivo, setFiltroActivo] = useState('Todas'); 

  const cargarOrdenes = async () => {
    try {
      const res = await fetch('http://192.168.56.20:8000/api/admin/ordenes/', {
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
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  useEffect(() => { cargarOrdenes(); }, []);

  const cancelarOrden = async (idOrden) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cancelar esta compra? El stock será devuelto al inventario.");
    if (confirmar) {
      try {
        const res = await fetch(`http://192.168.56.20:8000/api/admin/ordenes/${idOrden}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
        });
        if (res.ok) {
          cargarOrdenes();
        } else {
          alert("Error al cancelar la orden.");
        }
      } catch (error) {
        console.error("Fallo la conexión:", error);
      }
    }
  };

  // NUEVO: Lógica de filtrado
  const ordenesFiltradas = ordenes.filter(orden => {
    // Si la orden es vieja y no tiene estado, asumimos que es 'Activa'
    const estado = orden.estado || 'Activa'; 
    if (filtroActivo === 'Todas') return true;
    return estado === filtroActivo;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Cabecera y Filtros */}
      <div className="p-6 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingBag size={20} className="text-indigo-600" /> Registro de Ventas
        </h3>
        
        {/* Pestañas de Filtrado */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['Todas', 'Activas', 'Canceladas'].map((opcion) => (
            <button
              key={opcion}
              onClick={() => setFiltroActivo(opcion)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtroActivo === opcion 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID Pedido</th>
              <th className="p-4 font-medium">Comprador</th>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium text-center">Cantidad</th>
              <th className="p-4 font-medium text-right">Total</th>
              <th className="p-4 font-medium text-center">Estado</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay ventas que coincidan con este filtro.</td></tr>
            ) : (
              ordenesFiltradas.map((orden, index) => {
                const esCancelada = orden.estado === 'Cancelada';
                
                return (
                  <tr key={index} className={`border-b border-gray-100 transition-colors ${esCancelada ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-gray-500 text-sm">#{orden.id}</td>
                    <td className="p-4 font-medium text-gray-800">{orden.usuario}</td>
                    <td className="p-4 text-gray-600">{orden.nombre}</td>
                    <td className="p-4 text-center font-medium">{orden.quantity}</td>
                    <td className="p-4 text-right text-gray-800 font-bold">${orden.total?.toLocaleString()}</td>
                    
                    {/* Etiqueta Visual de Estado */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        esCancelada ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {esCancelada ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                        {orden.estado || 'Activa'}
                      </span>
                    </td>

                    {/* Botón de Acción (Se oculta si ya está cancelada) */}
                    <td className="p-4 flex justify-center">
                      {!esCancelada ? (
                        <button onClick={() => cancelarOrden(orden.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Cancelar Compra">
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Cancelada</span>
                      )}
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