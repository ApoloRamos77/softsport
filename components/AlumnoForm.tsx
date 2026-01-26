
import React, { useState, useEffect } from 'react';
import { Representante, Alumno, apiService } from '../services/api';
import DatePicker from './DatePicker';

type Tab = 'basica' | 'medica' | 'administrativa';

interface AlumnoFormProps {
  alumno?: Alumno | null;
  onCancel: () => void;
  onSave?: (data: any) => void;
}

const AlumnoForm: React.FC<AlumnoFormProps> = ({ alumno, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('basica');
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    fechaNac: '',
    numeroCamiseta: '10',
    sexo: '',
    fotografia: null as File | null,
    codigoPais: '+58',
    telefono: '',
    email: '',
    direccion: '',
    colegio: '',
    segundoRepresentante: {
      nombreCompleto: '',
      parentesco: '',
      codigoPais: '+58',
      telefono: '',
      email: ''
    },
    posicion: 'Delantero',
    // Campos médicos
    tipoSangre: '',
    alergias: '',
    condicionesMedicas: '',
    medicamentos: '',
    contactoEmergencia: '',
    codigoPaisEmergencia: '+58',
    telefonoEmergencia: '',
    // Campos administrativos
    grupo: 'Básico',
    categoria: 'Sub-15',
    beca: '0%',
    notas: '',
    estado: 'Activo',
    fechaRegistro: new Date().toLocaleDateString(),
    representanteId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [repsData, gruposData, categoriasData, becasData] = await Promise.all([
          apiService.getAll<Representante>('representantes'),
          apiService.getAll('grupos'),
          apiService.getAll('categorias'),
          apiService.getAll('becas')
        ]);
        setRepresentantes(repsData);
        setGrupos(gruposData);
        setCategorias(categoriasData);
        setBecas(becasData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Cargar datos del alumno en modo edición
  useEffect(() => {
    if (alumno) {
      setFormData({
        nombre: alumno.nombre || '',
        apellido: alumno.apellido || '',
        documento: alumno.documento || '',
        fechaNac: alumno.fechaNacimiento ? alumno.fechaNacimiento.split('T')[0] : '',
        numeroCamiseta: alumno.numeroCamiseta?.toString() || '10',
        sexo: alumno.sexo || '',
        fotografia: null,
        codigoPais: alumno.codigoPais || '+58',
        telefono: alumno.telefono || '',
        email: alumno.email || '',
        direccion: alumno.direccion || '',
        colegio: alumno.colegio || '',
        segundoRepresentante: {
          nombreCompleto: alumno.segundoRepresentanteNombre || '',
          parentesco: alumno.segundoRepresentanteParentesco || '',
          codigoPais: alumno.segundoRepresentanteCodigo || '+58',
          telefono: alumno.segundoRepresentanteTelefono || '',
          email: alumno.segundoRepresentanteEmail || ''
        },
        posicion: alumno.posicion || 'Delantero',
        tipoSangre: alumno.tipoSangre || '',
        alergias: alumno.alergias || '',
        condicionesMedicas: alumno.condicionesMedicas || '',
        medicamentos: alumno.medicamentos || '',
        contactoEmergencia: alumno.contactoEmergencia || '',
        codigoPaisEmergencia: alumno.codigoPaisEmergencia || '+58',
        telefonoEmergencia: alumno.telefonoEmergencia || '',
        representanteId: alumno.representanteId?.toString() || '',
        grupo: alumno.grupo?.nombre || '',
        categoria: alumno.categoria?.nombre || '',
        beca: alumno.beca?.nombre || alumno.beca?.porcentaje?.toString() || '',
        estado: alumno.estado || 'Activo',
        notas: alumno.notas || ''
      });
    }
  }, [alumno]);

  const handleSave = async () => {
    // Buscar IDs basados en nombres
    const grupoId = grupos.find(g => g.nombre === formData.grupo)?.id || null;
    const categoriaId = categorias.find(c => c.nombre === formData.categoria)?.id || null;
    const becaId = becas.find(b => b.nombre === formData.beca || b.porcentaje === parseInt(formData.beca))?.id || null;
    
    // Mapear los datos del formulario al formato esperado por la API
    const alumnoData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      fechaNacimiento: formData.fechaNac || null,
      telefono: formData.telefono,
      email: formData.email,
      posicion: formData.posicion,
      numeroCamiseta: formData.numeroCamiseta ? parseInt(formData.numeroCamiseta) : null,
      estado: formData.estado,
      fechaRegistro: alumno?.fechaRegistro || new Date().toISOString(),
      representanteId: formData.representanteId ? parseInt(formData.representanteId) : null,
      // Campos adicionales
      sexo: formData.sexo || null,
      fotografia: formData.fotografia?.name || null,
      codigoPais: formData.codigoPais || null,
      direccion: formData.direccion || null,
      colegio: formData.colegio || null,
      // Segundo representante
      segundoRepresentanteNombre: formData.segundoRepresentante.nombreCompleto || null,
      segundoRepresentanteParentesco: formData.segundoRepresentante.parentesco || null,
      segundoRepresentanteCodigo: formData.segundoRepresentante.codigoPais || null,
      segundoRepresentanteTelefono: formData.segundoRepresentante.telefono || null,
      segundoRepresentanteEmail: formData.segundoRepresentante.email || null,
      // Campos médicos
      tipoSangre: formData.tipoSangre || null,
      alergias: formData.alergias || null,
      condicionesMedicas: formData.condicionesMedicas || null,
      medicamentos: formData.medicamentos || null,
      contactoEmergencia: formData.contactoEmergencia || null,
      codigoPaisEmergencia: formData.codigoPaisEmergencia || null,
      telefonoEmergencia: formData.telefonoEmergencia || null,
      // Campos administrativos
      notas: formData.notas || null,
      grupoId: grupoId,
      categoriaId: categoriaId,
      becaId: becaId
    };
    
    try {
      if (alumno?.id) {
        // Modo edición
        await apiService.update('alumnos', alumno.id, {
          ...alumnoData,
          id: alumno.id
        });
      } else {
        // Modo creación
        await apiService.create('alumnos', alumnoData);
      }
      if (onSave) onSave(alumnoData);
    } catch (error) {
      console.error('Error al guardar alumno:', error);
      alert('Error al guardar el alumno');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basica':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Representante *</label>
              <div className="flex gap-2">
                <select 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border flex-1 text-xs appearance-none"
                  value={formData.representanteId}
                  onChange={e => setFormData({...formData, representanteId: e.target.value})}
                  disabled={loading}
                >
                  <option value="">{loading ? 'Cargando representantes...' : 'Selecciona un representante'}</option>
                  {representantes.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre} {r.apellido} ({r.documento})</option>
                  ))}
                </select>
                <button 
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold whitespace-nowrap"
                >
                  Nuevo Representante
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Nombre *</label>
                <input 
                  type="text" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Apellido *</label>
                <input 
                  type="text" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.apellido}
                  onChange={e => setFormData({...formData, apellido: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Documento de Identidad</label>
                <input 
                  type="text" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.documento}
                  onChange={e => setFormData({...formData, documento: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Fecha de Nacimiento</label>
                <DatePicker 
                  value={formData.fechaNac}
                  onChange={(date) => setFormData({...formData, fechaNac: date})}
                  placeholder="Seleccionar fecha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Número de Camiseta</label>
                <input 
                  type="number" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.numeroCamiseta}
                  onChange={e => setFormData({...formData, numeroCamiseta: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Sexo</label>
                <select 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.sexo}
                  onChange={e => setFormData({...formData, sexo: e.target.value})}
                >
                  <option value="">Selecciona sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Fotografía</label>
                <div className="relative">
                  <input 
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="fotografia"
                    onChange={(e) => setFormData({...formData, fotografia: e.target.files?.[0] || null})}
                  />
                  <label 
                    htmlFor="fotografia"
                    className="bg-[#0d1117] border-slate-700 text-slate-400 p-2.5 rounded-md border w-full text-xs flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <span>{formData.fotografia ? formData.fotografia.name : 'Seleccionar archivo'}</span>
                    <span className="text-xs">{formData.fotografia ? '' : 'Sin archivos seleccionados'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Código *</label>
                <select 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.codigoPais}
                  onChange={e => setFormData({...formData, codigoPais: e.target.value})}
                >
                  <option value="+58">VE +58</option>
                  <option value="+57">CO +57</option>
                  <option value="+51">PE +51</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Teléfono</label>
                <input 
                  type="tel" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Email</label>
                <input 
                  type="email" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Dirección</label>
                <input 
                  type="text" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Colegio</label>
              <input 
                type="text" 
                placeholder="Nombre del colegio"
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.colegio}
                onChange={e => setFormData({...formData, colegio: e.target.value})}
              />
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Segundo Representante (Opcional)</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase">Nombre Completo</label>
                    <input 
                      type="text" 
                      placeholder="Nombre del segundo representante"
                      className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                      value={formData.segundoRepresentante.nombreCompleto}
                      onChange={e => setFormData({...formData, segundoRepresentante: {...formData.segundoRepresentante, nombreCompleto: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase">Parentesco</label>
                    <select 
                      className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                      value={formData.segundoRepresentante.parentesco}
                      onChange={e => setFormData({...formData, segundoRepresentante: {...formData.segundoRepresentante, parentesco: e.target.value}})}
                    >
                      <option value="">Selecciona parentesco</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Tío/a">Tío/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase">Código</label>
                    <select 
                      className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                      value={formData.segundoRepresentante.codigoPais}
                      onChange={e => setFormData({...formData, segundoRepresentante: {...formData.segundoRepresentante, codigoPais: e.target.value}})}
                    >
                      <option value="+58">VE +58</option>
                      <option value="+57">CO +57</option>
                      <option value="+51">PE +51</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase">Teléfono</label>
                    <input 
                      type="tel" 
                      className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                      value={formData.segundoRepresentante.telefono}
                      onChange={e => setFormData({...formData, segundoRepresentante: {...formData.segundoRepresentante, telefono: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">Email</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                    value={formData.segundoRepresentante.email}
                    onChange={e => setFormData({...formData, segundoRepresentante: {...formData.segundoRepresentante, email: e.target.value}})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Posición</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.posicion}
                onChange={e => setFormData({...formData, posicion: e.target.value})}
              >
                <option>Portero</option>
                <option>Defensa</option>
                <option>Medio</option>
                <option>Delantero</option>
              </select>
            </div>
          </div>
        );
      case 'medica':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Tipo de Sangre</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.tipoSangre}
                onChange={e => setFormData({...formData, tipoSangre: e.target.value})}
              >
                <option value="">Selecciona tipo de sangre</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Alergias</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.alergias}
                onChange={e => setFormData({...formData, alergias: e.target.value})}
              >
                <option value="">Selecciona alergia</option>
                <option value="Ninguna">Ninguna</option>
                <option value="Alimentaria">Alimentaria</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Polen">Polen</option>
                <option value="Polvo">Polvo</option>
                <option value="Otra">Otra</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Condiciones Médicas</label>
              <textarea 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs resize-none"
                rows={4}
                placeholder="Describe cualquier condición médica relevante..."
                value={formData.condicionesMedicas}
                onChange={e => setFormData({...formData, condicionesMedicas: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Medicamentos</label>
              <textarea 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs resize-none"
                rows={4}
                placeholder="Lista de medicamentos que toma regularmente..."
                value={formData.medicamentos}
                onChange={e => setFormData({...formData, medicamentos: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Contacto de Emergencia</label>
              <input 
                type="text" 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                placeholder="Nombre completo del contacto de emergencia"
                value={formData.contactoEmergencia}
                onChange={e => setFormData({...formData, contactoEmergencia: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Código</label>
                <select 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  value={formData.codigoPaisEmergencia}
                  onChange={e => setFormData({...formData, codigoPaisEmergencia: e.target.value})}
                >
                  <option value="+58">VE +58</option>
                  <option value="+57">CO +57</option>
                  <option value="+51">PE +51</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Teléfono de Emergencia</label>
                <input 
                  type="tel" 
                  className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                  placeholder="Máximo 10 dígitos"
                  maxLength={10}
                  value={formData.telefonoEmergencia}
                  onChange={e => setFormData({...formData, telefonoEmergencia: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      case 'administrativa':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Grupo</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.grupo}
                onChange={e => setFormData({...formData, grupo: e.target.value})}
              >
                <option value="">Selecciona un grupo</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.nombre}>{g.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Categoría</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Programa de Becas</label>
              <select 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs"
                value={formData.beca}
                onChange={e => setFormData({...formData, beca: e.target.value})}
              >
                <option value="">Selecciona un programa</option>
                {becas.map(b => (
                  <option key={b.id} value={b.nombre}>{b.nombre} ({b.porcentaje}%)</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Notas</label>
              <textarea 
                className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 rounded-md border w-full text-xs resize-none"
                rows={6}
                placeholder="Notas adicionales sobre el alumno..."
                value={formData.notas}
                onChange={e => setFormData({...formData, notas: e.target.value})}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#111827] rounded-lg shadow-xl border border-slate-800 p-8 max-w-4xl mx-auto animate-fadeIn mb-10">
      <h2 className="text-xl font-bold mb-6 text-white tracking-tight">
        {alumno ? 'Edición de Alumno' : 'Nuevo Alumno'}
      </h2>
      
      <div className="flex bg-[#0d1117] border border-slate-700 rounded-lg p-1.5 mb-8 gap-1">
        {['basica', 'medica', 'administrativa'].map((tab) => (
          <button 
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab === 'basica' ? 'Información Básica' : tab === 'medica' ? 'Información Médica' : 'Administrativa'}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {renderTabContent()}
      </div>

      <div className="flex justify-between items-center mt-10 pt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold text-xs">
          Cancelar
        </button>
        
        <div className="flex gap-4">
          {activeTab !== 'basica' && (
            <button 
              type="button" 
              onClick={() => setActiveTab(activeTab === 'administrativa' ? 'medica' : 'basica')}
              className="px-6 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-semibold text-xs"
            >
              Anterior
            </button>
          )}
          <button 
            type="button"
            className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-xs shadow-lg shadow-blue-500/20"
            onClick={() => {
               if (activeTab === 'basica') setActiveTab('medica');
               else if (activeTab === 'medica') setActiveTab('administrativa');
               else handleSave();
            }}
          >
            {activeTab === 'administrativa' ? (alumno ? 'Guardar Cambios' : 'Guardar Alumno') : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlumnoForm;
