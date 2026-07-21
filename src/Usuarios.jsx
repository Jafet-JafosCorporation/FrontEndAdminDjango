import { useState, useEffect } from 'react';
import { Ban, Plus, X, User, Search } from 'lucide-react';

export default function Usuarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  
  const [busqueda, setBusqueda] = useState('');

  const [nuevoUsername, setNuevoUsername] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoRole, setNuevoRole] = useState('usuario');

  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch('http://192.168.56.20:8000/api/admin/usuarios/', {
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
    const nombreCoincide = user.username.toLowerCase().includes(termino);
    const correoCoincide = user.email ? user.email.toLowerCase().includes(termino) : false;
    return nombreCoincide || correoCoincide;
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
      const respuesta = await fetch('http://192.168.56.20:8000/api/admin/usuarios/', {
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

  // MODIFICADO: Inactivar Usuario
  const inactivarUsuario = async (username) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas INACTIVAR al usuario ${username}? Perderá el acceso al sistema.`);
    if (confirmar) {
      try {
        const respuesta = await fetch(`http://192.168.56.20:8000/api/admin/usuarios/${username}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
          }
        });
        if (respuesta.ok) {
          cargarUsuarios();
        } else {
          const errorData = await respuesta.json();
          alert(errorData.error || "No se pudo inactivar el usuario");
        }
      } catch (error) {
        console.error("Fallo la conexión:", error);
      }
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">Directorio de Usuarios</h3>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuario o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button onClick={abrirModalCrear} className="flex shrink-0 items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Registrar Usuario
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Usuario</th>
              <th className="p-4 font-medium">Correo</th>
              <th className="p-4 font-medium text-center">Rol</th>
              <th className="p-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron usuarios que coincidan con la búsqueda.</td></tr>
            ) : (
              usuariosFiltrados.map((user, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> {user.username}
                  </td>
                  <td className="p-4 text-gray-600">{user.email || 'Sin correo'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center">
                    {/* BOTÓN MODIFICADO */}
                    <button onClick={() => inactivarUsuario(user.username)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Inactivar Usuario">
                      <Ban size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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