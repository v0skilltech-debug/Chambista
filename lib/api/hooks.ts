import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DashboardData {
  perfil: {
    nombre: string;
    nivelVerificacion: string;
    progresoVerificacion: number;
  };
  stats: {
    ingresosMes: number;
    variacionIngresos: number;
    trabajosPendientes: number;
    nuevasSolicitudes: number;
    trabajosProgramados: number;
    calificacionPromedio: number;
    tiempoRespuesta: string;
    mensajesSinLeer: number;
  };
  agenda: any[];
  solicitudes: any[];
}

export const useProviderDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ["providerDashboard"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const { data } = await axios.get(`${API_BASE}/dashboard/provider`, { headers });
      return data;
    },
    refetchInterval: 30000, // Poll for new solicitudes every 30 seconds
  });
};

export const useSearchProviders = (oficio: string | null) => {
  return useQuery({
    queryKey: ["searchProviders", oficio],
    queryFn: async () => {
      if (!oficio) return [];
      const { data } = await axios.post(`${API_BASE}/search/`, { oficio });
      return data;
    },
    enabled: !!oficio,
  });
};

export const createBooking = async (bookingData: any) => {
  const headers = getAuthHeaders();
  const { data } = await axios.post(`${API_BASE}/bookings/`, bookingData, { headers });
  return data;
};

export const updateBookingStatus = async (bookingId: number, estado: string) => {
  const headers = getAuthHeaders();
  const { data } = await axios.patch(`${API_BASE}/bookings/${bookingId}?estado=${estado}`, {}, { headers });
  return data;
};

export const useNotifications = (userId?: number) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const url = userId 
        ? `${API_BASE}/notifications/?user_id=${userId}` 
        : `${API_BASE}/notifications/`;
      const { data } = await axios.get(url, { headers });
      return data as any[];
    },
    refetchInterval: 30000,
  });
};

export const useProviderReviews = (providerId?: number) => {
  return useQuery({
    queryKey: ["providerReviews", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const { data } = await axios.get(`${API_BASE}/reviews/provider/${providerId}`);
      return data as any[];
    },
    enabled: !!providerId,
  });
};
