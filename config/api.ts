const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (baseUrl || 'http://localhost:5232').replace(/\/+$/, '');