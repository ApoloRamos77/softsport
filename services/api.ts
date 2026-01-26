// API service for interacting with the C# backend
const API_BASE_URL = 'http://localhost:5081/api';

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
}

export interface PaymentMethod {
  id?: number;
  nombre: string;
  descripcion?: string;
  currency?: string;
  activo: boolean;
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
  createdAt?: string;
  updatedAt?: string;
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

class ApiService {
  // Generic CRUD operations
  async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
    return response.json();
  }

  async getById<T>(endpoint: string, id: number): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}/${id}`);
    return response.json();
  }

  async create<T>(endpoint: string, data: T): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error creating ${endpoint}`);
    return response.json();
  }

  async update<T>(endpoint: string, id: number, data: T): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error updating ${endpoint}/${id}`);
  }

  async delete(endpoint: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Error deleting ${endpoint}/${id}`);
  }

  // Specific methods for each entity
  getAlumnos() { return this.getAll<Alumno>('alumnos'); }
  getAlumno(id: number) { return this.getById<Alumno>('alumnos', id); }
  createAlumno(data: Alumno) { return this.create<Alumno>('alumnos', data); }
  updateAlumno(id: number, data: Alumno) { return this.update<Alumno>('alumnos', id, data); }
  deleteAlumno(id: number) { return this.delete('alumnos', id); }

  getRepresentantes() { return this.getAll<Representante>('representantes'); }
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

  getServicios() { return this.getAll<Servicio>('servicios'); }
  getServicio(id: number) { return this.getById<Servicio>('servicios', id); }
  createServicio(data: Servicio) { return this.create<Servicio>('servicios', data); }
  updateServicio(id: number, data: Servicio) { return this.update<Servicio>('servicios', id, data); }
  deleteServicio(id: number) { return this.delete('servicios', id); }

  getProductos() { return this.getAll<Producto>('productos'); }
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

  // Dashboard endpoints
  async getDashboardStats(seasonId?: number): Promise<any> {
    const url = seasonId 
      ? `${API_BASE_URL}/dashboard/stats?seasonId=${seasonId}`
      : `${API_BASE_URL}/dashboard/stats`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener estadísticas del dashboard');
    return response.json();
  }

  async getFinancialChart(seasonId?: number): Promise<any> {
    const url = seasonId 
      ? `${API_BASE_URL}/dashboard/financial-chart?seasonId=${seasonId}`
      : `${API_BASE_URL}/dashboard/financial-chart`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener datos del gráfico financiero');
    return response.json();
  }

  // Academy Config endpoints
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

  // Profile endpoints
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

  // Change password
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

  // Authentication
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
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();
