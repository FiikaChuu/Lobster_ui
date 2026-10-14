/**
 * Centralized HTTP Client
 * Production-ready fetch wrapper with timeouts, typed errors, and clean handling.
 */

import { getRuntimeConfig } from './apiConfig';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;
  public url?: string;

  constructor(message: string, status = 0, code = 'NETWORK_ERROR', details?: unknown, url?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { apiBaseUrl } = getRuntimeConfig();
  const {
    params,
    body,
    headers = {},
    timeoutMs = 8000,
    ...customConfig
  } = options;

  // Build full URL
  const cleanBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let fullUrl = `${cleanBase}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const mergedHeaders: HeadersInit = {
    'Accept': 'application/json',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...headers
  };

  try {
    const response = await fetch(fullUrl, {
      ...customConfig,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse response
    let responseData: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMsg = 
        (responseData && typeof responseData === 'object' && 'message' in responseData && typeof responseData.message === 'string')
          ? responseData.message
          : `HTTP ${response.status}: ${response.statusText}`;
      
      const errorCode = 
        (responseData && typeof responseData === 'object' && 'code' in responseData && typeof responseData.code === 'string')
          ? responseData.code
          : `HTTP_${response.status}`;

      throw new ApiError(errorMsg, response.status, errorCode, responseData, fullUrl);
    }

    return responseData as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        `Permintaan timeout setelah ${timeoutMs}ms. Backend tidak merespons tepat waktu.`,
        408,
        'REQUEST_TIMEOUT',
        undefined,
        fullUrl
      );
    }

    const nativeError = err as Error;
    throw new ApiError(
      `Gagal terhubung ke REST API (${nativeError.message || 'Network error'}). Periksa apakah backend aktif pada ${apiBaseUrl}`,
      0,
      'CONNECTION_REFUSED',
      undefined,
      fullUrl
    );
  }
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) => request<T>(url, { ...options, method: 'PUT', body }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
};
