import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setMensajeError('');

    try {
      const respuesta = await fetch('http://192.168.56.20:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        // 🛑 CANDADO DE SEGURIDAD FRONTEND: Verificamos el rol
        if (datos.rol !== 'admin') {
          setMensajeError("Acceso denegado: Esta área es exclusiva para administradores.");
          return; // Expulsamos al usuario normal y detenemos la función
        }

        const token = datos.token || datos.access_token || datos.access; 
        
        if (token) {
          localStorage.setItem('tokenAdmin', token);
          navigate('/panel');
        } else {
          setMensajeError("El servidor no devolvió un token válido.");
        }
      } else {
        setMensajeError("Usuario o contraseña incorrectos.");
      }
    } catch (error) {
      setMensajeError("No hay conexión con el servidor de Ubuntu.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 m-4">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">JafosCorporation</h2>
          <p className="text-gray-500 text-sm mt-2">Ingresa tus credenciales de administrador</p>
        </div>

        <form onSubmit={iniciarSesion} className="space-y-5">
          {mensajeError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {mensajeError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="Escribe tu usuario" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            Entrar al Sistema
          </button>
        </form>

      </div>
    </div>
  );
}