import { useState, useEffect } from 'react';
import { Ban, UserCheck, Plus, X, User, Search } from 'lucide-react';
import { BASE_URL } from './config'; // <-- IMPORTACIÓN DE LA URL CENTRAL

export default function Usuarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const [nuevoUsername, setNuevoUsername] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoRole, setNuevoRole] = useState('usuario');

  const cargarUsuarios = async () => {
    try {
      // CONECTADO A BASE_URL
      const respuesta = await fetch(`${BASE_URL}/api/admin/usuarios/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
        }
      });
      if (respuesta.ok) {
        const datosReales = await respuesta.json();
        setUsuarios(datosReales.usuarios || []);
      }
    } catch (error) {
      console.error("Fallo la conexión:", error);
    }
  };

  const usuariosFiltrados = usuarios.filter(user => {
    const termino = busqueda.toLowerCase();
    const coincideBusqueda = 
      user.username.toLowerCase().includes(termino) || 
      (user.email && user.email.toLowerCase().includes(termino));

    if (!coincideBusqueda) return false;

    const estaActivo = user.is_active !== false && user.estado !== 'Inactivo';

    if (filtroActivo === 'Todos') return true;
    if (filtroActivo === 'Activos') return estaActivo;
    if (filtroActivo === 'Inactivos') return !estaActivo;

    return true;
  });

  const abrirModalCrear = () => {
    setNuevoUsername('');
    setNuevoPassword('');
    setNuevoEmail('');
    setNuevoRole('usuario');
    setIsModalOpen(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    const paqueteDatos = { 
      username: nuevoUsername, 
      password: nuevoPassword, 
      email: nuevoEmail,
      role: nuevoRole 
    };

    try {
      // CONECTADO A BASE_URL
      const respuesta = await fetch(`${BASE_URL}/api/admin/usuarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` 
        },
        body: JSON.stringify(paqueteDatos)
      });

      if (respuesta.ok) {
        setIsModalOpen(false);
        cargarUsuarios();
      } else {
        const errorData = await respuesta.json();
        alert(errorData.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error("Fallo la conexión:", error);
    }
  };

  const inactivarUsuario = async (username) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas INACTIVAR al usuario ${username}? Perderá el acceso al sistema.`);
    if (confirmar) {
      try {
        // CONECTADO A BASE_URL
        const respuesta = await fetch(`${BASE_URL}/api/admin/usuarios/${username}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` }
        });
        if (respuesta.ok) cargarUsuarios();
        else alert("No se pudo inactivar el usuario");
      } catch (error) { console.error("Fallo la conexión:", error); }
    }
  };

  const reactivarUsuario = async (username) => {
    const confirmar = window.confirm(`¿Deseas REACTIVAR al usuario ${username}? Volverá a tener permisos de acceso.`);
    if (confirmar) {
      try {
        // CONECTADO A BASE_URL
        const respuesta = await fetch(`${BASE_URL}/api/admin/usuarios/${username}/`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}` 
          },
          body: JSON.stringify({ estado: 'Activo', is_active: true })
        });
        if (respuesta.ok) cargarUsuarios();
        else alert("No se pudo reactivar el usuario");
      } catch (error) { console.error("Fallo la conexión:", error); }
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* Cabecera, Buscador y Botón Registro */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Directorio de Usuarios</h3>
          
          <div className="flex bg-gray-100 p-1 rounded-lg mt-3">
            {['Todos', 'Activos', 'Inactivos'].map((opcion) => (
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
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuario o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <button onClick={abrirModalCrear} className="flex shrink-0 items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Registrar Usuario
          </button>
        </div>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Usuario</th>
              <th className="p-4 font-medium">Correo</th>
              <th className="p-4 font-medium text-center">Rol</th>
              <th className="p-4 font-medium text-center">Estado</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron usuarios en esta vista.</td></tr>
            ) : (
              usuariosFiltrados.map((user, index) => {
                const estaActivo = user.is_active !== false && user.estado !== 'Inactivo';

                return (
                  <tr key={index} className={`border-b border-gray-100 transition-colors ${!estaActivo ? 'bg-red-50/20' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                      <User size={16} className={estaActivo ? "text-indigo-500" : "text-gray-400"} /> 
                      <span className={!estaActivo ? "line-through text-gray-400" : ""}>{user.username}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{user.email || 'Sin correo'}</td>
                    
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        estaActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {estaActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="p-4 flex justify-center">
                      {estaActivo ? (
                        <button 
                          onClick={() => inactivarUsuario(user.username)} 
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-md transition-colors" 
                          title="Inactivar Usuario (Bloquear)"
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => reactivarUsuario(user.username)} 
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors" 
                          title="Reactivar Usuario (Restaurar Acceso)"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Registrar Usuario</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={guardarUsuario} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <input type="text" required value={nuevoUsername} onChange={(e) => setNuevoUsername(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" required value={nuevoPassword} onChange={(e) => setNuevoPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol del Sistema</label>
                  <select value={nuevoRole} onChange={(e) => setNuevoRole(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white">
                    <option value="usuario">Usuario Estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}