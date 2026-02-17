
import React, { useState, useEffect } from 'react';
import { Representante, Alumno, HistorialMedico, apiService } from '../services/api';
import DatePicker from './DatePicker';

type Tab = 'basica' | 'administrativa';

interface AlumnoFormProps {
  alumno?: Alumno | null;
  onCancel: () => void;
  onSave?: (data: any) => void;
}

const AlumnoForm: React.FC<AlumnoFormProps> = ({ alumno, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('basica');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historialMedico, setHistorialMedico] = useState<HistorialMedico[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotografiaUrl, setFotografiaUrl] = useState<string>('');
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
    alergiaCustom: '',
    condicionesMedicas: '',
    medicamentos: '',
    // Gestión Nutricional
    intolerancias: '',
    horasSueno: '',
    aguaDiaria: '',
    digestion: '',
    lesionesRecientes: '',
    // Medidas
    peso: '',
    talla: '',
    imc: '',
    fechaToma: new Date().toISOString().split('T')[0],
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
    fechaInscripcion: new Date().toISOString().split('T')[0],
    representanteId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [repsData, gruposData, categoriasData, becasData] = await Promise.all([
          apiService.getRepresentantes(),
          apiService.getAll('grupos'),
          apiService.getAll('categorias'),
          apiService.getAll('becas')
        ]);
        // Handle paginated response for representantes
        const representantesList = Array.isArray(repsData) ? repsData : (repsData.data || []);
        setRepresentantes(representantesList);
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
      // Check if allergy is a custom value (not in the predefined list)
      const predefinedAllergies = ['', 'Ninguna', 'Penicilina', 'Polen', 'Ácaros', 'Mariscos', 'Frutos secos', 'Látex', 'Picaduras de insectos'];
      const isCustomAllergy = alumno.alergias && !predefinedAllergies.includes(alumno.alergias);

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
        alergias: isCustomAllergy ? 'Otro' : (alumno.alergias || ''),
        alergiaCustom: isCustomAllergy ? alumno.alergias : '',
        condicionesMedicas: alumno.condicionesMedicas || '',
        medicamentos: alumno.medicamentos || '',
        // Nutricional
        intolerancias: alumno.intolerancias || '',
        horasSueno: alumno.horasSueno?.toString() || '',
        aguaDiaria: alumno.aguaDiaria || '',
        digestion: alumno.digestion || '',
        lesionesRecientes: alumno.lesionesRecientes || '',

        contactoEmergencia: alumno.contactoEmergencia || '',
        codigoPaisEmergencia: alumno.codigoPaisEmergencia || '+51',
        telefonoEmergencia: alumno.telefonoEmergencia || '',
        representanteId: alumno.representanteId?.toString() || '',
        grupo: alumno.grupo?.nombre || '',
        categoria: alumno.categoria?.nombre || '',
        beca: alumno.beca?.nombre || alumno.beca?.porcentaje?.toString() || '',
        estado: alumno.estado || 'Activo',
        notas: alumno.notas || '',
        fechaRegistro: alumno.fechaRegistro || new Date().toISOString(),
        fechaInscripcion: alumno.fechaInscripcion ? alumno.fechaInscripcion.split('T')[0] : new Date().toISOString().split('T')[0],
        peso: '',
        talla: '',
        imc: '',
        fechaToma: new Date().toISOString().split('T')[0]
      });
      setFotografiaUrl(alumno.fotografia || '');
    }
  }, [alumno]);

  // Cargar historial médico
  useEffect(() => {
    if (alumno?.id) {
      apiService.getHistorialByAlumno(alumno.id)
        .then(data => {
          setHistorialMedico(data);
          // Si hay historial, cargar el último registro en el formulario
          if (data.length > 0) {
            const latest = data[0];
            setFormData(prev => ({
              ...prev,
              peso: latest.peso?.toString() || '',
              talla: latest.talla?.toString() || '',
              imc: latest.imc?.toString() || '',
              fechaToma: latest.fechaToma.split('T')[0]
            }));
          }
        })
        .catch(console.error);
    }
  }, [alumno]);

  const calculateIMC = (peso: string, talla: string) => {
    const p = parseFloat(peso);
    const t = parseFloat(talla); // talla en metros
    if (p && t && t > 0) {
      const imcVal = p / (t * t);
      return imcVal.toFixed(2);
    }
    return '';
  };

  useEffect(() => {
    const imc = calculateIMC(formData.peso, formData.talla);
    setFormData(prev => ({ ...prev, imc }));
  }, [formData.peso, formData.talla]);

  const handleSave = async () => {
    // Upload photo if a new one was selected
    let photoUrl = fotografiaUrl; // Start with existing photo URL

    if (formData.fotografia) {
      try {
        photoUrl = await apiService.uploadFile(formData.fotografia, 'alumnos');
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error al subir la foto. Por favor, intenta de nuevo.');
        return;
      }
    }

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
      fotografia: photoUrl || null,
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
      alergias: formData.alergias === 'Otro' ? formData.alergiaCustom : formData.alergias || null,
      condicionesMedicas: formData.condicionesMedicas || null,
      medicamentos: formData.medicamentos || null,
      // Nutricional
      intolerancias: formData.intolerancias || null,
      horasSueno: formData.horasSueno ? parseFloat(formData.horasSueno) : null,
      aguaDiaria: formData.aguaDiaria || null,
      digestion: formData.digestion || null,
      lesionesRecientes: formData.lesionesRecientes || null,

      contactoEmergencia: formData.contactoEmergencia || null,
      codigoPaisEmergencia: formData.codigoPaisEmergencia || null,
      telefonoEmergencia: formData.telefonoEmergencia || null,
      // Campos administrativos
      notas: formData.notas || null,
      grupoId: grupoId,
      categoriaId: categoriaId,
      becaId: becaId,
      fechaInscripcion: formData.fechaInscripcion || null
    };

    try {
      let savedAlumnoId = alumno?.id;

      if (alumno?.id) {
        // Modo edición
        await apiService.update('alumnos', alumno.id, {
          ...alumnoData,
          id: alumno.id
        });
      } else {
        // Modo creación
        const response = await apiService.create('alumnos', alumnoData) as any;
        savedAlumnoId = response.id; // Get the new ID
      }

      // Handle Medical History
      if (savedAlumnoId && (formData.peso || formData.talla)) {
        // Check if data changed compared to latest record to avoid duplicates
        const latestInfo = historialMedico.length > 0 ? historialMedico[0] : null;
        const currentPeso = formData.peso ? parseFloat(formData.peso) : null;
        const currentTalla = formData.talla ? parseFloat(formData.talla) : null;
        const currentImc = formData.imc ? parseFloat(formData.imc) : null;
        const currentDate = formData.fechaToma;

        const hasChanges = !latestInfo ||
          latestInfo.peso !== currentPeso ||
          latestInfo.talla !== currentTalla ||
          latestInfo.fechaToma.split('T')[0] !== currentDate;

        if (hasChanges) {
          const historyData: HistorialMedico = {
            alumnoId: savedAlumnoId,
            peso: currentPeso || undefined,
            talla: currentTalla || undefined,
            imc: currentImc || undefined,
            fechaToma: new Date(currentDate).toISOString(),
            observaciones: 'Registro desde ficha principal'
          };

          // If editing the LATEST record on the SAME day, we might want to update instead of create?
          // But simpler is to always create if data changed, OR if date is same, update.
          // Let's rely on Create for now as it's cleaner for history.
          // Exception: If the user explicitly wants to correct the entry they just made.
          // Logic: If Latest exists AND Date is same, Update. Else Create.

          if (latestInfo && latestInfo.fechaToma.split('T')[0] === currentDate) {
            if (latestInfo.id) {
              await apiService.updateHistorial(latestInfo.id, { ...historyData, id: latestInfo.id });
            }
          } else {
            await apiService.createHistorial(historyData);
          }
        }
      }

      if (onSave) onSave(alumnoData);
    } catch (error) {
      console.error('Error al guardar alumno:', error);
      alert('Error al guardar el alumno o su historial médico');
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

              {/* Photo Upload Section */}
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label>Fotografía del Alumno</label>
                  <div className="d-flex gap-3 align-items-start">
                    {/* Photo Preview */}
                    <div className="border border-secondary p-2 rounded d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', backgroundColor: '#0d1117' }}>
                      {(fotografiaUrl || formData.fotografia) ? (
                        <img
                          src={formData.fotografia
                            ? URL.createObjectURL(formData.fotografia)
                            : fotografiaUrl
                          }
                          alt="Foto del alumno"
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <i className="bi bi-person-circle" style={{ fontSize: '80px', color: '#6c757d' }}></i>
                      )}
                    </div>
                    {/* File Upload */}
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, fotografia: file });
                          }
                        }}
                      />
                      <small className="text-muted d-block mt-1">
                        Formatos: JPG, PNG, WEBP. Máximo 5MB.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

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

            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Información de Inscripción</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-secondary small mb-2 d-block">Fecha de Inscripción *</label>
                  <DatePicker
                    value={formData.fechaInscripcion}
                    onChange={val => setFormData({ ...formData, fechaInscripcion: val })}
                    placeholder="Fecha de inscripción"
                  />
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    Se usa para calcular fechas de pago mensual
                  </small>
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
        {['basica', 'administrativa'].map((tab) => (
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
            {tab === 'basica' ? 'Información Básica' : 'Administrativa'}
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
              onClick={() => setActiveTab('basica')}
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
              if (activeTab === 'basica') setActiveTab('administrativa');
              else handleSave();
            }}
          >
            {activeTab === 'administrativa' ? (alumno ? 'Guardar Cambios' : 'Guardar Alumno') : 'Siguiente'}
          </button>
        </div>
      </div>
      {/* Modal de Historial Médico */}
      {showHistoryModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Historial Médico - {formData.nombre} {formData.apellido}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowHistoryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr className="text-secondary text-xs uppercase tracking-wider">
                        <th>Fecha</th>
                        <th>Peso (kg)</th>
                        <th>Talla (m)</th>
                        <th>IMC</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialMedico.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">No hay registros históricos</td>
                        </tr>
                      ) : (
                        historialMedico.map((record, index) => (
                          <tr key={record.id}>
                            <td>{new Date(record.fechaToma).toLocaleDateString()}</td>
                            <td>{record.peso}</td>
                            <td>{record.talla}</td>
                            <td>{record.imc}</td>
                            <td>
                              {index === 0 && (
                                <span className="badge bg-primary text-[10px]">Actual (Editable en ficha)</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnoForm;
