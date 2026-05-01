/**
 * Custom Hooks for API Service
 * Provides reusable logic for API calls with loading and error states
 */

import { useCallback, useState } from 'react';
import { ApiError } from '../services/api';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Generic hook for async operations
 */
export function useAsync<T = any>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error: any) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, [asyncFunction]);

  return { ...state, execute };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T = any>(
  mutationFn: (data: any) => Promise<T>
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: any) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await mutationFn(variables);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error: any) {
        setState({ data: null, loading: false, error });
        throw error;
      }
    },
    [mutationFn]
  );

  return { ...state, mutate };
}

/**
 * Hook for hotels data
 */
export function useHotels() {
  const { hotelService } = require('../services/api');

  const hotels = useAsync(() => hotelService.getAll());

  const getHotel = useCallback(async (id: string) => {
    try {
      return await hotelService.getById(id);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  }, []);

  return { hotels, getHotel };
}

/**
 * Hook for authentication
 */
export function useAuth() {
  const { authService } = require('../services/api');

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('uh_auth_token')
  );

  const login = useMutation((credentials: any) => authService.login(credentials));
  const register = useMutation((data: any) => authService.register(data));

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }, []);

  return {
    user,
    token,
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated: !!token,
  };
}

/**
 * Hook for bookings
 */
export function useBookings() {
  const { bookingService } = require('../services/api');

  const bookings = useAsync(() => bookingService.getAll());
  const bookRoom = useMutation((data: any) => bookingService.bookRoom(data));

  return { bookings, bookRoom };
}

/**
 * Hook for pricing
 */
export function usePricing() {
  const { pricingService } = require('../services/api');

  const getRecommendedPrice = useMutation((data: any) =>
    pricingService.getRecommendedPrice(data)
  );
  const getAvailability = useMutation((data: any) =>
    pricingService.getAvailability(data)
  );
  const getAllAvailability = useMutation((data: any) =>
    pricingService.getAllAvailability(data)
  );

  return { getRecommendedPrice, getAvailability, getAllAvailability };
}
