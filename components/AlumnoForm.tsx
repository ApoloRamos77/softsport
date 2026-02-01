
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
    codigoPais: '+51',
    telefono: '',
    email: '',
    direccion: '',
    colegio: '',
    segundoRepresentante: {
      nombreCompleto: '',
      parentesco: '',
      codigoPais: '+51',
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
    codigoPaisEmergencia: '+51',
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
        codigoPais: alumno.codigoPais || '+51',
        telefono: alumno.telefono || '',
        email: alumno.email || '',
        direccion: alumno.direccion || '',
        colegio: alumno.colegio || '',
        segundoRepresentante: {
          nombreCompleto: alumno.segundoRepresentanteNombre || '',
          parentesco: alumno.segundoRepresentanteParentesco || '',
          codigoPais: alumno.segundoRepresentanteCodigo || '+51',
          telefono: alumno.segundoRepresentanteTelefono || '',
          email: alumno.segundoRepresentanteEmail || ''
        },
        posicion: alumno.posicion || 'Delantero',
        tipoSangre: alumno.tipoSangre || '',
        alergias: alumno.alergias || '',
        condicionesMedicas: alumno.condicionesMedicas || '',
        medicamentos: alumno.medicamentos || '',
        contactoEmergencia: alumno.contactoEmergencia || '',
        codigoPaisEmergencia: alumno.codigoPaisEmergencia || '+51',
        telefonoEmergencia: alumno.telefonoEmergencia || '',
        representanteId: alumno.representanteId?.toString() || '',
        grupo: alumno.grupo?.nombre || '',
        categoria: alumno.categoria?.nombre || '',
        beca: alumno.beca?.nombre || alumno.beca?.porcentaje?.toString() || '',
        estado: alumno.estado || 'Activo',
        notas: alumno.notas || '',
        fechaRegistro: alumno.fechaRegistro || new Date().toISOString()
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
            {/* Vínculo Familiar Section */}
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Vínculo Familiar</label>
              <div className="row g-4 align-items-end">
                <div className="col-md-8">
                  <label>Representante Principal *</label>
                  <select
                    className="form-select"
                    value={formData.representanteId}
                    onChange={e => setFormData({ ...formData, representanteId: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">{loading ? 'Cargando representantes...' : 'Selecciona un representante'}</option>
                    {representantes.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre} {r.apellido} ({r.documento})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-full justify-content-center text-[11px] fw-bold"
                    style={{ height: '38px' }}
                  >
                    <i className="bi bi-plus-circle"></i> NUEVO REPRESENTANTE
                  </button>
                </div>
              </div>
            </div>

            {/* Datos Personales Section */}
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Información Personal</label>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.apellido}
                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label>Documento ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.documento}
                    onChange={e => setFormData({ ...formData, documento: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label>Fecha Nacimiento</label>
                  <DatePicker
                    value={formData.fechaNac}
                    onChange={(date) => setFormData({ ...formData, fechaNac: date })}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="col-md-4">
                  <label>Sexo</label>
                  <select
                    className="form-select"
                    value={formData.sexo}
                    onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Nro. Camiseta</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.numeroCamiseta}
                    onChange={e => setFormData({ ...formData, numeroCamiseta: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contacto & Ubicación */}
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Contacto y Ubicación</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Email del Alumno</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label>Cod. Pais</label>
                  <select
                    className="form-select"
                    value={formData.codigoPais}
                    onChange={e => setFormData({ ...formData, codigoPais: e.target.value })}
                  >
                    <option value="+51">PE +51</option>
                    <option value="+58">VE +58</option>
                    <option value="+57">CO +57</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Dirección Residencial</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.direccion}
                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Colegio / Institución</label>
                  <input
                    type="text"
                    placeholder="Nombre del colegio"
                    className="form-control"
                    value={formData.colegio}
                    onChange={e => setFormData({ ...formData, colegio: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Segundo Representante Opcional */}
            <div className="p-4 rounded-lg border border-warning border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-warning uppercase tracking-widest mb-4 d-block border-bottom border-warning border-opacity-30 pb-2">Segundo Representante (Opcional)</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.segundoRepresentante.nombreCompleto}
                    onChange={e => setFormData({ ...formData, segundoRepresentante: { ...formData.segundoRepresentante, nombreCompleto: e.target.value } })}
                  />
                </div>
                <div className="col-md-3">
                  <label>Parentesco</label>
                  <select
                    className="form-select"
                    value={formData.segundoRepresentante.parentesco}
                    onChange={e => setFormData({ ...formData, segundoRepresentante: { ...formData.segundoRepresentante, parentesco: e.target.value } })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tío/a">Tío/a</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label>Teléfono / Email</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.segundoRepresentante.email}
                    onChange={e => setFormData({ ...formData, segundoRepresentante: { ...formData.segundoRepresentante, email: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'medica':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4 d-block border-bottom border-red-900 border-opacity-30 pb-2">Información de Salud</label>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Tipo de Sangre</label>
                  <select
                    className="form-select"
                    value={formData.tipoSangre}
                    onChange={e => setFormData({ ...formData, tipoSangre: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-8">
                  <label>Alergias</label>
                  <select
                    className="form-select"
                    value={formData.alergias}
                    onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                  >
                    <option value="">Selecciona alergia</option>
                    <option value="Ninguna">Ninguna</option>
                    <option value="Penicilina">Penicilina</option>
                    <option value="Polen">Polen</option>
                    <option value="Ácaros">Ácaros</option>
                    <option value="Mariscos">Mariscos</option>
                    <option value="Frutos secos">Frutos secos</option>
                    <option value="Látex">Látex</option>
                    <option value="Picaduras de insectos">Picaduras de insectos</option>
                    <option value="Otro">Otro (escribir manualmente)</option>
                  </select>
                  {formData.alergias === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Especifique alergia..."
                      className="form-control mt-2"
                      onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <label>Condiciones Médicas</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describa condiciones relevantes..."
                    value={formData.condicionesMedicas}
                    onChange={e => setFormData({ ...formData, condicionesMedicas: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Medicamentos</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Medicamentos de uso regular..."
                    value={formData.medicamentos}
                    onChange={e => setFormData({ ...formData, medicamentos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-danger border-opacity-10 bg-danger bg-opacity-5">
              <label className="text-[10px] font-bold text-danger uppercase tracking-widest mb-4 d-block border-bottom border-danger border-opacity-20 pb-2">Emergencia</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Nombre del Contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.contactoEmergencia}
                    onChange={e => setFormData({ ...formData, contactoEmergencia: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <label>Cód.</label>
                  <select
                    className="form-select"
                    value={formData.codigoPaisEmergencia}
                    onChange={e => setFormData({ ...formData, codigoPaisEmergencia: e.target.value })}
                  >
                    <option value="+51">+51 (PE)</option>
                    <option value="+58">+58 (VE)</option>
                    <option value="+57">+57 (CO)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Teléfono Emergencia</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.telefonoEmergencia}
                    onChange={e => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'administrativa':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Asignación de Alumno</label>
              <div className="row g-3">
                <div className="col-md-3">
                  <label>Grupo</label>
                  <select
                    className="form-select"
                    value={formData.grupo}
                    onChange={e => setFormData({ ...formData, grupo: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {grupos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label>Categoría</label>
                  <select
                    className="form-select"
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label>Posición</label>
                  <select
                    className="form-select"
                    value={formData.posicion}
                    onChange={e => setFormData({ ...formData, posicion: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Mediocampista">Mediocampista</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label>Beca Aplicada</label>
                  <select
                    className="form-select"
                    value={formData.beca}
                    onChange={e => setFormData({ ...formData, beca: e.target.value })}
                  >
                    <option value="">Sin Beca</option>
                    {becas.map(b => <option key={b.id} value={b.nombre}>{b.nombre} ({b.porcentaje}%)</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-8">
                <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30 h-100">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 d-block">Notas Administrativas</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    placeholder="Detalles sobre pagos, comportamiento, etc."
                    value={formData.notas}
                    onChange={e => setFormData({ ...formData, notas: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-4 rounded-lg border border-success border-opacity-10 bg-success bg-opacity-5 h-100">
                  <label className="text-[10px] font-bold text-success uppercase tracking-widest mb-4 d-block">Estado de Matrícula</label>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={formData.estado === 'Activo'}
                      onChange={() => setFormData({ ...formData, estado: formData.estado === 'Activo' ? 'Inactivo' : 'Activo' })}
                    />
                    <label className="form-check-label ms-2 text-white fw-bold">Alumno Activo</label>
                  </div>
                  <div className="p-3 rounded bg-black bg-opacity-30 border border-success border-opacity-10">
                    <p className="text-[11px] text-slate-400 mb-0 leading-relaxed italic">
                      <i className="bi bi-info-circle me-1"></i>
                      Un alumno inactivo no aparecerá en las listas de asistencia ni convocatorias, pero conservará su historial contable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (

    <div className="rounded-lg shadow-xl border border-secondary border-opacity-25 p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn mb-10" style={{ backgroundColor: '#161b22' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight mb-0">
          {alumno ? 'Edición de Alumno' : 'Nuevo Alumno'}
        </h2>
        <button onClick={onCancel} className="btn-close btn-close-white"></button>
      </div>

      <div className="d-flex p-1 rounded mb-4" style={{ backgroundColor: '#0d1117', gap: '4px' }}>
        {['basica', 'medica', 'administrativa'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex-fill btn border-0 py-2 px-3 rounded transition-all fw-bold text-uppercase tracking-wide`}
            style={{
              backgroundColor: activeTab === tab ? '#1f6feb' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#8b949e',
              fontSize: '11px'
            }}
          >
            {tab === 'basica' ? 'Información Básica' : tab === 'medica' ? 'Información Médica' : 'Administrativa'}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]" style={{ color: '#c9d1d9' }}>
        {renderTabContent()}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary border-opacity-25">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
          style={{ fontSize: '13px', fontWeight: '600' }}
        >
          Cancelar
        </button>

        <div className="d-flex gap-3">
          {activeTab !== 'basica' && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'administrativa' ? 'medica' : 'basica')}
              className="btn btn-sm px-4 btn-outline-secondary text-white border-secondary border-opacity-50"
              style={{ fontSize: '13px', fontWeight: '600' }}
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm px-5 btn-primary fw-bold"
            style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontSize: '13px' }}
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
