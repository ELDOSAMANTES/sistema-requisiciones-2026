import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface PerfilUsuario {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  email: string;
  telefono?: string;
  foto_perfil?: string;
}

class PerfilService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  async obtenerPerfil(): Promise<PerfilUsuario> {
    try {
      const response = await axios.get(`${API_BASE_URL}/perfil`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      // Mock data por ahora
      return {
        id: '1',
        nombre: 'Juan Pérez García',
        puesto: 'Jefe de Departamento',
        area: 'Dirección de Adquisiciones',
        email: 'juan.perez@gobierno.gob.mx',
        telefono: '55-1234-5678'
      };
    }
  }

  async actualizarPerfil(datos: Partial<PerfilUsuario>): Promise<PerfilUsuario> {
    try {
      const response = await axios.put(`${API_BASE_URL}/perfil`, datos, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }
}

export const perfilService = new PerfilService();
