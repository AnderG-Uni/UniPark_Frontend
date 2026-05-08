import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit, ShieldAlert, Trash2, Loader2, AlertCircle, Check, GraduationCap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import UserModal from './UserModal'; 

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
  const [toastMessage, setToastMessage] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const [resUsuarios, resPersonas] = await Promise.all([
        api.get('/usuarios'),
        api.get('/personas')
      ]); 

      const usuariosData = Array.isArray(resUsuarios.data) ? resUsuarios.data : (resUsuarios.data?.data || []);
      const personasData = Array.isArray(resPersonas.data) ? resPersonas.data : (resPersonas.data?.data || []);

      const dataCruzada = usuariosData.map(usuario => {
        const personaEncontrada = personasData.find(p => Number(p.id) === Number(usuario.persona_id));
        return {
          ...usuario,
          persona: personaEncontrada || null 
        };
      });

      setUsuarios(dataCruzada);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("No se pudo cargar la lista cruzada de usuarios y personas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
  };

  const handleUpdateSuccess = (mensaje) => {
    fetchUsuarios(); 
    setToastMessage(mensaje);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Estilos de los Roles
  const getRoleStyle = (rol) => {
    switch(rol) {
      case 'Administrador': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Guarda': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Docente': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200'; // Estudiante
    }
  };

  // 🪄 NUEVO: Estilos para los Estados (Basados en tu ENUM)
  const getStatusStyle = (estado) => {
    switch(estado) {
      case 'Activo': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inactivo': return 'bg-red-100 text-red-700 border-red-200';
      case 'Sancionado': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200'; 
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 h-full relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
            <Check size={18} strokeWidth={3} />
          </div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* MODAL INTELIGENTE */}
      <UserModal 
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        userData={modalState.data}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <UsersIcon className="text-accent" />
            Gestión de Usuarios
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Administra los roles, accesos y datos de toda la comunidad.
          </p>
        </div>
        <button 
          onClick={() => openModal('create')}
          className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-5 rounded-xl shadow-soft hover:shadow-hover transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL (Tabla) */}
      <div className="flex-1 bg-surface rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">

        {/* Tabla de Datos (Ajustada para usar todo el alto) */}
        <div className="overflow-y-auto flex-1 h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-primary gap-4 min-h-[300px]">
              <Loader2 size={40} className="animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                <AlertCircle size={20} /> <p>{error}</p>
              </div>
            </div>
          ) : usuarios.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[300px]">
                <UsersIcon size={48} className="mb-3 opacity-20" />
                <p>No hay usuarios registrados.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px] h-full">
              <thead>
                <tr className="border-b-2 border-slate-100 text-primary bg-white sticky top-0 z-10">
                  <th className="py-4 px-6 font-semibold text-sm">Nombre / Documento</th>
                  <th className="py-4 px-6 font-semibold text-sm">Institucional</th>
                  <th className="py-4 px-6 font-semibold text-sm">Contacto</th>
                  <th className="py-4 px-6 font-semibold text-sm">Rol</th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-sm align-top">
                {usuarios.map((u) => {
                  const nombre = u.persona?.nombres_completos || 'Sin nombre registrado';
                  const tipoDoc = u.persona?.tipo_documento || 'DOC';
                  const documento = u.persona?.numero_documento || '---';
                  const telefono = u.persona?.telefono || '---';
                  const carrera = u.persona?.carrera_dependencia || 'N/A';
                  const codigoUniv = u.persona?.codigo_universitario || '---';
                  const estado = u.persona?.estado || 'Inactivo'; 

                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex-shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${nombre}&background=0D8ABC&color=fff`} alt="Avatar" />
                          </div>
                          <div>
                            <p className="font-bold text-primary capitalize">{nombre}</p>
                            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                              {tipoDoc}: {documento}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-700 capitalize flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-slate-400" />
                          {carrera}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-[11px] text-slate-500 uppercase">
                            CÓD: <span className="font-semibold">{codigoUniv}</span>
                          </p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(estado)} uppercase tracking-wider`}>
                            {estado}
                          </span>
                        </div>
                      </td>

                      {/* 🪄 CORREO MÁS ANCHO: max-w ampliado */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-700 truncate max-w-[220px] lg:max-w-[280px] xl:max-w-[320px]" title={u.correo}>{u.correo}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">TEL: {telefono}</p>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleStyle(u.rol)}`}>
                          {u.rol}
                        </span>
                      </td>

                      {/* 🪄 NUEVO BOTÓN: Ojo (Ver) añadido */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                          
                          <Link 
                            to={`/users/${u.id}`} 
                            state={{ usuarioData: u }} 
                            className="p-2 text-slate-400 hover:text-white hover:bg-emerald-500 rounded-lg transition-all border border-slate-200 hover:border-emerald-500 shadow-sm" 
                            title="Ver Perfil Completo"
                            >
                            <Eye size={16} />
                          </Link>

                          <button onClick={() => openModal('edit', u)} className="p-2 text-slate-400 hover:text-white hover:bg-primary rounded-lg transition-all border border-slate-200 hover:border-primary shadow-sm" title="Editar Datos Personales">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => openModal('role', u)} className="p-2 text-slate-400 hover:text-white hover:bg-accent rounded-lg transition-all border border-slate-200 hover:border-accent shadow-sm" title="Actualizar datos usuario">
                            <ShieldAlert size={16} />
                          </button>
                          <button onClick={() => openModal('delete', u)} className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-red-100 hover:border-red-500 shadow-sm" title="Eliminar Usuario">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}