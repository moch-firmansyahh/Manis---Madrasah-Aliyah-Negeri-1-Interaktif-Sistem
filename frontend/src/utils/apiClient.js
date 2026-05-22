const normalizeApiUrl = (url) => {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    trimmed = `https://${trimmed}`;
  }
  if (trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
};

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || "");

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response, skipAuthRedirect = false) => {
  const data = await response.json().catch(() => ({}));
  
  if (response.status === 401) {
    // Don't redirect if explicitly skipped (e.g., login request)
    if (!skipAuthRedirect) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    throw new Error(data.message || data.error || "Sesi telah habis, silakan login kembali.");
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  post: async (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response, options.skipAuthRedirect);
  },
  
  put: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },
  
  patch: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};
