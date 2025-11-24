import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;
type LogoutHandler = () => void;

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let getAccessToken: TokenGetter = () => null;
let refreshHandler: RefreshHandler | null = null;
let logoutHandler: LogoutHandler | null = null;

let isRefreshing = false;
const refreshSubscribers: Array<(token: string | null) => void> = [];

const notifySubscribers = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers.length = 0;
};

export const configureInterceptors = ({
  getToken,
  onRefresh,
  onLogout,
}: {
  getToken: TokenGetter;
  onRefresh: RefreshHandler;
  onLogout: LogoutHandler;
}) => {
  getAccessToken = getToken;
  refreshHandler = onRefresh;
  logoutHandler = onLogout;
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers) {
    config.headers['X-App-Name'] =
      import.meta.env.VITE_APP_NAME || 'healthcare-app';
  }
  return config;
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest;
    const status = error.response?.status;

    if (
      status === 401 &&
      !originalRequest?._retry &&
      refreshHandler &&
      typeof refreshHandler === 'function'
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshHandler()
          .then((newToken) => {
            notifySubscribers(newToken);
            return newToken;
          })
          .catch((refreshError) => {
            logoutHandler?.();
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        refreshSubscribers.push((token) => {
          if (!token) {
            return reject(error);
          }
          originalRequest._retry = true;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

