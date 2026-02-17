// API service for interacting with the C# backend
// Usar URL absoluta en producción para evitar error 405 por falta de proxy en Nginx
const API_BASE_URL = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/api'
  : 'https://softsport77-api.scuiaw.easypanel.host/api';

export interface Alumno {
  id?: number;
  nombre: string;
  apellido: string;
  documento?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  posicion?: string;
  numeroCamiseta?: number;
  grupoId?: number;
  categoriaId?: number;
  becaId?: number;
  estado: string;
  fechaRegistro: string;
  fechaInscripcion?: string;
  representanteId?: number;
  representante?: Representante;
  grupo?: Grupo;
  categoria?: Categoria;
  beca?: Beca;
  // Campos adicionales
  sexo?: string;
  fotografia?: string;
  codigoPais?: string;
  direccion?: string;
  colegio?: string;
  // Segundo representante
  segundoRepresentanteNombre?: string;
  segundoRepresentanteParentesco?: string;
  segundoRepresentanteCodigo?: string;
  segundoRepresentanteTelefono?: string;
  segundoRepresentanteEmail?: string;
  // Campos médicos
  tipoSangre?: string;
  alergias?: string;
  condicionesMedicas?: string;
  medicamentos?: string;
  contactoEmergencia?: string;
  codigoPaisEmergencia?: string;
  telefonoEmergencia?: string;
  // Campos administrativos
  notas?: string;
  usuarioAnulacion?: string;
  fechaAnulacion?: string;

  // Campos de Gestión Nutricional
  horarioEntrenamiento?: string;
  intolerancias?: string;
  horasSueno?: number;
  aguaDiaria?: string;
  digestion?: string;
  lesionesRecientes?: string;
}

export interface Personal {
  id?: number;
  nombres: string;
  apellidos: string;
  dni?: string;
  celular?: string;
  fechaNacimiento?: string;
  cargo?: string; // Administrativo, Nutricionista, Terapeuta, Paramedico, Entrenador
  estado?: string;
}

export interface HistorialMedico {
  id?: number;
  alumnoId: number;
  peso?: number;
  talla?: number;
  imc?: number;
  fechaToma: string;
  observaciones?: string;

  // Datos de Composición Corporal
  porcentajeGrasa?: number;
  porcentajeMusculo?: number;
  grasaVisceral?: number;

  // Perímetros (en cm)
  cintura?: number;
  cadera?: number;
  brazoRelajado?: number;
  brazoContraido?: number;
  muslo?: number;

  createdAt?: string;
  createdBy?: string;
}

export interface Representante {
  id?: number;
  nombre: string;
  apellido: string;
  documento?: string;
  email?: string;
  telefono?: string;
  parentesco?: string;
  direccion?: string;
  createdAt?: string;
  // Campos de auditoría
  fechaCreacion?: string;
  usuarioCreacion?: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacion?: string;
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  edadMin?: number;
  edadMax?: number;
}

export interface Grupo {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Beca {
  id?: number;
  nombre: string;
  porcentaje: number;
  descripcion?: string;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  prontoPago?: number;
  recurrenteMensual: boolean;
  activo: boolean;
}

export interface Producto {
  id?: number;
  nombre: string;
  sku?: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
  activo: boolean;
}

export interface LandingGallery {
  id?: number;
  tipo: 'Entrenamiento' | 'Torneo';
  imageUrl: string;
  titulo?: string;
  descripcion?: string;
  fecha?: string;
}

export interface ContactMessage {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  mensaje?: string;
  fechaCreacion?: string;
}

export interface Training {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  ubicacion?: string;
  categoriaId?: number;
  categoria?: Categoria;
  tipo?: string;
  estado: string;
  entrenadorId?: number;
  trainingScheduleId?: number;
  trainingCategorias?: TrainingCategoria[];
}

export interface TrainingCategoria {
  id: number;
  trainingId: number;
  categoriaId: number;
  categoria?: Categoria;
}

export interface TrainingSchedule {
  id: number;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  categoria?: Categoria;
  entrenadorId?: number;
  diasSemana: string; // "1,3,5"
  horaInicio: string;
  horaFin: string;
  ubicacion?: string;
  temporada?: string;
  estado: string;
}

export interface Game {
  id?: number;
  titulo?: string;
  fecha?: string;
  horaInicio?: string;
  categoriaId?: number;
  categoriaNombre?: string;
  esLocal: boolean;
  equipoLocal?: string;
  equipoVisitante?: string;
  ubicacion?: string;
  competicion?: string;
  observaciones?: string;
  scoreLocal?: number;
  scoreVisitante?: number;
  alumnosConvocados?: any[];
}

export interface User {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash?: string;
  telefono?: string;
  role: string;
  active: boolean;
  personalId?: number; // Link to Personal
  createdAt?: string;
  updatedAt?: string;
  permissions?: Permission[];
}

export interface Season {
  id?: number;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo: boolean;
  fechaCreacion?: string;
  usuarioCreacion?: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacion?: string;
}

export interface Role {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  academia?: string;
  permissions?: Permission[];
}

export interface PaymentMethod {
  id?: number;
  nombre: string;
  descripcion: string;
  moneda: string;
  estado: string;
}

export interface Permission {
  moduloId: number;
  moduloKey?: string;
  moduloNombre: string;
  ver: boolean;
  crear: boolean;
  modificar: boolean;
  eliminar: boolean;
}

export interface Modulo {
  id: number;
  nombre: string;
  key: string;
  grupo: string;
  orden: number;
  activo: boolean;
}

export interface Abono {
  id?: number;
  reciboId: number;
  monto: number;
  fecha: string;
  paymentMethodId: number;
  referencia: string;
  recibo?: {
    id: number;
    alumno?: {
      nombre: string;
      apellido: string;
    };
    items?: Array<{
      nombre?: string;
      descripcion?: string;
    }>;
  };
}

export interface Expense {
  id?: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria?: string;
  referencia?: string;
  estado?: string;
}

export interface TacticalBoard {
  id?: number;
  nombre: string;
  data: string;
  createdBy?: number;
  createdAt?: string;
}

export interface AcademyConfig {
  id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  logoUrl?: string;
  colorMenu: string;
  colorBotones: string;
  whatsAppActivado: boolean;
  partidasActivado: boolean;
  fechaActualizacion?: string;
}

export interface Bioquimica {
  id?: number;
  alumnoId: number;
  fechaToma: string;
  hemoglobina?: number;
  hematocrito?: number;
  glucosaBasal?: number;
  colesterolTotal?: number;
  trigliceridos?: number;
  vitaminaD?: number;
  ferritina?: number;
  observaciones?: string;
}

export interface PlanNutricional {
  id?: number;
  alumnoId: number;
  fechaInicio: string;
  fechaFin?: string;
  objetivo?: string;
  tmb?: number;
  gastoEnergeticoTotal?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
  observaciones?: string;
  archivoRuta?: string;
  suplementaciones?: Suplementacion[];
}

export interface Suplementacion {
  id?: number;
  planNutricionalId: number;
  producto: string;
  dosis?: string;
  momento?: string;
  observaciones?: string;
}

class ApiService {
  // Generic paginated GET
  async getPaginated<T>(endpoint: string, params: Record<string, any> = {}): Promise<{ totalCount: number, data: T[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value.toString());
      }
    });

    const queryString = query.toString();
    const url = queryString ? `${API_BASE_URL}/${endpoint}?${queryString}` : `${API_BASE_URL}/${endpoint}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);

    const result = await response.json();
    // Support both old (array) and new (object with data/totalCount) formats
    if (Array.isArray(result)) {
      return { totalCount: result.length, data: result };
    }
    return result;
  }

  async getById<T>(endpoint: string, id: number): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}/${id}`);
    return response.json();
  }

  async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
    return response.json();
  }

  async create<T>(endpoint: string, data: T): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errorMessage = `Error creating ${endpoint}`;
      try {
        const errorText = await response.text();
        // Try to parse JSON if possible, otherwise use text
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.title || errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errorMessage = `Error posting to ${endpoint}`;
      try {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.title || errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async update<T>(endpoint: string, id: number, data: T): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errorMessage = `Error updating ${endpoint}/${id}`;
      try {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.title || errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }
  }

  async delete(endpoint: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      let errorMessage = `Error deleting ${endpoint}/${id}`;
      try {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.title || errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }
  }

  // Specific methods
  getAlumnos(params: any = {}) { return this.getPaginated<Alumno>('alumnos', params); }
  getAlumno(id: number) { return this.getById<Alumno>('alumnos', id); }
  createAlumno(data: Alumno) { return this.create<Alumno>('alumnos', data); }
  updateAlumno(id: number, data: Alumno) { return this.update<Alumno>('alumnos', id, data); }
  deleteAlumno(id: number) { return this.delete('alumnos', id); }

  getPersonal(params: any = {}) { return this.getAll<Personal>(`personal?${new URLSearchParams(params)}`); }
  getPersonalById(id: number) { return this.getById<Personal>('personal', id); }
  createPersonal(data: Personal) { return this.create<Personal>('personal', data); }
  updatePersonal(id: number, data: Personal) { return this.update<Personal>('personal', id, data); }
  deletePersonal(id: number) { return this.delete('personal', id); }

  getHistorialByAlumno(alumnoId: number) { return this.getAll<HistorialMedico>(`historialmedico/alumno/${alumnoId}`); }
  createHistorial(data: HistorialMedico) { return this.create<HistorialMedico>('historialmedico', data); }
  updateHistorial(id: number, data: HistorialMedico) { return this.update<HistorialMedico>('historialmedico', id, data); }
  deleteHistorial(id: number) { return this.delete('historialmedico', id); }

  getRepresentantes(params: any = {}) { return this.getPaginated<Representante>('representantes', params); }
  getRepresentante(id: number) { return this.getById<Representante>('representantes', id); }
  createRepresentante(data: Representante) { return this.create<Representante>('representantes', data); }
  updateRepresentante(id: number, data: Representante) { return this.update<Representante>('representantes', id, data); }
  deleteRepresentante(id: number) { return this.delete('representantes', id); }

  getCategorias() { return this.getAll<Categoria>('categorias'); }
  getCategoria(id: number) { return this.getById<Categoria>('categorias', id); }
  createCategoria(data: Categoria) { return this.create<Categoria>('categorias', data); }
  updateCategoria(id: number, data: Categoria) { return this.update<Categoria>('categorias', id, data); }
  deleteCategoria(id: number) { return this.delete('categorias', id); }

  getGrupos() { return this.getAll<Grupo>('grupos'); }
  getGrupo(id: number) { return this.getById<Grupo>('grupos', id); }
  createGrupo(data: Grupo) { return this.create<Grupo>('grupos', data); }
  updateGrupo(id: number, data: Grupo) { return this.update<Grupo>('grupos', id, data); }
  deleteGrupo(id: number) { return this.delete('grupos', id); }

  getBecas() { return this.getAll<Beca>('becas'); }
  getBeca(id: number) { return this.getById<Beca>('becas', id); }
  createBeca(data: Beca) { return this.create<Beca>('becas', data); }
  updateBeca(id: number, data: Beca) { return this.update<Beca>('becas', id, data); }
  deleteBeca(id: number) { return this.delete('becas', id); }

  getServicios(params: any = {}) { return this.getPaginated<Servicio>('servicios', params); }
  getServicio(id: number) { return this.getById<Servicio>('servicios', id); }
  createServicio(data: Servicio) { return this.create<Servicio>('servicios', data); }
  updateServicio(id: number, data: Servicio) { return this.update<Servicio>('servicios', id, data); }
  deleteServicio(id: number) { return this.delete('servicios', id); }

  getProductos(params: any = {}) { return this.getPaginated<Producto>('productos', params); }
  getProducto(id: number) { return this.getById<Producto>('productos', id); }
  createProducto(data: Producto) { return this.create<Producto>('productos', data); }
  updateProducto(id: number, data: Producto) { return this.update<Producto>('productos', id, data); }
  deleteProducto(id: number) { return this.delete('productos', id); }

  getPaymentMethods() { return this.getAll<PaymentMethod>('paymentmethods'); }
  getPaymentMethod(id: number) { return this.getById<PaymentMethod>('paymentmethods', id); }
  createPaymentMethod(data: PaymentMethod) { return this.create<PaymentMethod>('paymentmethods', data); }
  updatePaymentMethod(id: number, data: PaymentMethod) { return this.update<PaymentMethod>('paymentmethods', id, data); }
  deletePaymentMethod(id: number) { return this.delete('paymentmethods', id); }

  getUsers() { return this.getAll<User>('users'); }
  getUser(id: number) { return this.getById<User>('users', id); }
  createUser(data: User) { return this.create<User>('users', data); }
  updateUser(id: number, data: User) { return this.update<User>('users', id, data); }
  deleteUser(id: number) { return this.delete('users', id); }

  getRoles() { return this.getAll<Role>('roles'); }
  getRole(id: number) { return this.getById<Role>('roles', id); }
  createRole(data: Role) { return this.create<Role>('roles', data); }
  updateRole(id: number, data: Role) { return this.update<Role>('roles', id, data); }
  deleteRole(id: number) { return this.delete('roles', id); }
  getRolePermissions(id: number) { return this.getAll<Permission>(`roles/${id}/permissions`); }
  getModules() { return this.getAll<Modulo>('modules'); }

  getAbonos(params: any = {}) { return this.getPaginated<Abono>('abonos', params); }
  getAbono(id: number) { return this.getById<Abono>('abonos', id); }
  createAbono(data: Abono) { return this.create<Abono>('abonos', data); }
  updateAbono(id: number, data: Abono) { return this.update<Abono>('abonos', id, data); }
  deleteAbono(id: number) { return this.delete('abonos', id); }

  getRecibos(params: any = {}) { return this.getPaginated<any>('recibos', params); }
  getRecibo(id: number) { return this.getById<any>('recibos', id); }
  createRecibo(data: any) { return this.create<any>('recibos', data); }
  updateRecibo(id: number, data: any) { return this.update<any>('recibos', id, data); }
  deleteRecibo(id: number) { return this.delete('recibos', id); }

  getExpenses(params: any = {}) { return this.getPaginated<Expense>('expenses', params); }
  getExpense(id: number) { return this.getById<Expense>('expenses', id); }
  createExpense(data: Expense) { return this.create<Expense>('expenses', data); }
  updateExpense(id: number, data: Expense) { return this.update<Expense>('expenses', id, data); }
  deleteExpense(id: number) { return this.delete('expenses', id); }

  getSeasons() { return this.getAll<Season>('seasons'); }
  getSeason(id: number) { return this.getById<Season>('seasons', id); }
  createSeason(data: Season) { return this.create<Season>('seasons', data); }
  updateSeason(id: number, data: Season) { return this.update<Season>('seasons', id, data); }
  deleteSeason(id: number) { return this.delete('seasons', id); }

  getTacticalBoards() { return this.getAll<TacticalBoard>('tacticalboards'); }
  getTacticalBoard(id: number) { return this.getById<TacticalBoard>('tacticalboards', id); }
  createTacticalBoard(data: TacticalBoard) { return this.create<TacticalBoard>('tacticalboards', data); }
  updateTacticalBoard(id: number, data: TacticalBoard) { return this.update<TacticalBoard>('tacticalboards', id, data); }
  deleteTacticalBoard(id: number) { return this.delete('tacticalboards', id); }

  getGalleries() { return this.getAll<LandingGallery>('gallery'); }
  getGallery(id: number) { return this.getById<LandingGallery>('gallery', id); }
  createGallery(data: LandingGallery) { return this.create<LandingGallery>('gallery', data); }
  updateGallery(id: number, data: LandingGallery) { return this.update<LandingGallery>('gallery', id, data); }
  deleteGallery(id: number) { return this.delete('gallery', id); }

  getContactMessages() { return this.getAll<ContactMessage>('contact'); }
  createContactMessage(data: ContactMessage) { return this.create<ContactMessage>('contact', data); }
  deleteContactMessage(id: number) { return this.delete('contact', id); }

  async uploadFile(file: File, type: string = 'general'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/files/upload?type=${type}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error subiendo imagen: ${errorText}`);
    }
    const data = await response.json();
    return data.url;
  }

  // Bioquimica
  getBioquimicaByAlumno(alumnoId: number) { return this.getAll<Bioquimica>(`bioquimica/alumno/${alumnoId}`); }
  createBioquimica(data: Bioquimica) { return this.create<Bioquimica>('bioquimica', data); }
  updateBioquimica(id: number, data: Bioquimica) { return this.update<Bioquimica>('bioquimica', id, data); }
  deleteBioquimica(id: number) { return this.delete('bioquimica', id); }

  // Plan Nutricional
  getPlanesByAlumno(alumnoId: number) { return this.getAll<PlanNutricional>(`plannutricional/alumno/${alumnoId}`); }
  getPlanNutricional(id: number) { return this.getById<PlanNutricional>('plannutricional', id); }
  createPlanNutricional(data: PlanNutricional) { return this.create<PlanNutricional>('plannutricional', data); }
  updatePlanNutricional(id: number, data: PlanNutricional) { return this.update<PlanNutricional>('plannutricional', id, data); }
  deletePlanNutricional(id: number) { return this.delete('plannutricional', id); }

  async getDashboardStats(seasonId?: number): Promise<any> {
    const url = seasonId ? `${API_BASE_URL}/dashboard/stats?seasonId=${seasonId}` : `${API_BASE_URL}/dashboard/stats`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener estadísticas del dashboard');
    return response.json();
  }

  async getFinancialChart(seasonId?: number): Promise<any> {
    const url = seasonId ? `${API_BASE_URL}/dashboard/financial-chart?seasonId=${seasonId}` : `${API_BASE_URL}/dashboard/financial-chart`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener datos del gráfico financiero');
    return response.json();
  }

  async getAcademyConfig(): Promise<AcademyConfig> {
    const response = await fetch(`${API_BASE_URL}/academyconfig`);
    if (!response.ok) throw new Error('Error al obtener configuración de la academia');
    return response.json();
  }

  async updateAcademyConfig(data: AcademyConfig): Promise<AcademyConfig> {
    const response = await fetch(`${API_BASE_URL}/academyconfig`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar configuración de la academia');
    return response.json();
  }

  async getUserProfile(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile/${id}`);
    if (!response.ok) throw new Error('Error al obtener perfil de usuario');
    return response.json();
  }

  async updateUserProfile(id: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar perfil de usuario');
    return response.json();
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/change-password/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cambiar contraseña');
    }
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  }
}

export const apiService = new ApiService();
