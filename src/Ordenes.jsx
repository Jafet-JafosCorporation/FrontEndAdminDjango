import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);

  // 1. GET: Leer Órdenes (Requiere Token de Admin)
  const cargarOrdenes = async () => {
    try {
      const respuesta = await fetch('http://192.168.56.20:8000/api/admin/ordenes/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
        }
      });
      
      if (respuesta.ok) {
        const datosReales = await respuesta.json();
        
        // 2. Modo Aplanadora: Desarmamos el objeto agrupado de Django 
        // para convertirlo en una lista plana que la tabla pueda leer.
        const listaPlana = [];
        if (datosReales.ordenes) {
          Object.keys(datosReales.ordenes).forEach(usuario => {
            datosReales.ordenes[usuario].forEach(orden => {
              listaPlana.push({
                usuario: usuario,
                producto: orden.nombre,
                cantidad: orden.quantity,
                total: orden.total,
                id_producto: orden.product_id
              });
            });
          });
        }
        setOrdenes(listaPlana);
      }
    } catch (error) {
      console.error("Fallo la conexión:", error);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
        <h3 className="text-lg font-semibold text-gray-800">Registro de Ventas</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Comprador</th>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium text-center">Cantidad</th>
              <th className="p-4 font-medium text-right">Total Pagado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay ventas registradas en el sistema.</td></tr>
            ) : (
              ordenes.map((orden, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-indigo-400" /> {orden.usuario}
                  </td>
                  <td className="p-4 text-gray-600">{orden.producto}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      x{orden.cantidad}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-green-700">${orden.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}