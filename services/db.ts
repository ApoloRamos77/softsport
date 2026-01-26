import { apiService, Alumno as ApiAlumno, Representante as ApiRepresentante, Season as ApiSeason, Servicio as ApiServicio } from './api';

// Re-export types for backward compatibility
export type Alumno = ApiAlumno;
export type Representante = ApiRepresentante;
export type Season = ApiSeason;
export type Servicio = ApiServicio;

// Legacy wrapper for backward compatibility with existing components
class DB {
  // Alumnos
  async getAlumnos(): Promise<Alumno[]> {
    try {
      return await apiService.getAlumnos();
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      return [];
    }
  }

  async addAlumno(alumno: Omit<Alumno, 'id'>): Promise<Alumno> {
    try {
      return await apiService.createAlumno(alumno as Alumno);
    } catch (error) {
      console.error('Error adding alumno:', error);
      throw error;
    }
  }

  async deleteAlumno(id: number): Promise<void> {
    try {
      await apiService.deleteAlumno(id);
    } catch (error) {
      console.error('Error deleting alumno:', error);
      throw error;
    }
  }

  // Representantes
  async getRepresentantes(): Promise<Representante[]> {
    try {
      return await apiService.getRepresentantes();
    } catch (error) {
      console.error('Error fetching representantes:', error);
      return [];
    }
  }

  async addRepresentante(rep: Omit<Representante, 'id'>): Promise<Representante> {
    try {
      return await apiService.createRepresentante(rep as Representante);
    } catch (error) {
      console.error('Error adding representante:', error);
      throw error;
    }
  }

  async deleteRepresentante(id: number): Promise<void> {
    try {
      await apiService.deleteRepresentante(id);
    } catch (error) {
      console.error('Error deleting representante:', error);
      throw error;
    }
  }

  // Seasons
  async getSeasons(): Promise<Season[]> {
    try {
      return await apiService.getSeasons();
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  }

  async addSeason(season: Omit<Season, 'id'>): Promise<Season> {
    try {
      return await apiService.createSeason(season as Season);
    } catch (error) {
      console.error('Error adding season:', error);
      throw error;
    }
  }

  async updateSeason(id: number, season: Season): Promise<void> {
    try {
      await apiService.updateSeason(id, season);
    } catch (error) {
      console.error('Error updating season:', error);
      throw error;
    }
  }

  async deleteSeason(id: number): Promise<void> {
    try {
      await apiService.deleteSeason(id);
    } catch (error) {
      console.error('Error deleting season:', error);
      throw error;
    }
  }

  // Servicios
  async getServicios(): Promise<Servicio[]> {
    try {
      return await apiService.getServicios();
    } catch (error) {
      console.error('Error fetching servicios:', error);
      return [];
    }
  }

  async getServicio(id: number): Promise<Servicio> {
    try {
      return await apiService.getServicio(id);
    } catch (error) {
      console.error('Error fetching servicio:', error);
      throw error;
    }
  }

  async createServicio(servicio: Omit<Servicio, 'id'>): Promise<Servicio> {
    try {
      return await apiService.createServicio(servicio as Servicio);
    } catch (error) {
      console.error('Error creating servicio:', error);
      throw error;
    }
  }

  async updateServicio(id: number, servicio: Servicio): Promise<void> {
    try {
      await apiService.updateServicio(id, servicio);
    } catch (error) {
      console.error('Error updating servicio:', error);
      throw error;
    }
  }

  async deleteServicio(id: number): Promise<void> {
    try {
      await apiService.deleteServicio(id);
    } catch (error) {
      console.error('Error deleting servicio:', error);
      throw error;
    }
  }
}

export const db = new DB();
