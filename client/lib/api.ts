// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// API Client utility
export const apiClient = {
  /**
   * Make a GET request to the API
   */
  get: async <T>(endpoint: string): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`
    console.log("🔍 API GET Request:", url)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("📥 API Response Status:", response.status, response.statusText)

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error("❌ API Error Response:", errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // If JSON parsing fails, use status text
      }
      throw new Error(errorMessage)
    }

    return response.json()
  },

  /**
   * Make a POST request to the API
   */
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Make a PUT request to the API
   */
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Make a DELETE request to the API
   */
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Make a request with authentication token
   */
  authenticatedRequest: async <T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any
  ): Promise<T> => {
    // Get token from localStorage (you can modify this based on your auth implementation)
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },
}

// Specific API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post("/api/auth/login", { email, password }),
    register: (data: { nom: string; email: string; telephone: string; password: string }) =>
      apiClient.post("/api/auth/register", data),
    logout: () => apiClient.post("/api/auth/logout"),
  },

  // Products endpoints
  products: {
    getAll: () => apiClient.get("/api/produits"),
    getById: (id: string) => apiClient.get(`/api/produits/${id}`),
    getNew: () => apiClient.get("/api/produits?est_nouveau=true"),
    create: (data: any) => apiClient.post("/api/produits", data),
    update: (id: string, data: any) => apiClient.put(`/api/produits/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/produits/${id}`),
  },

  // Orders endpoints
  orders: {
    create: (data: any) => apiClient.post("/api/orders", data),
    getAll: () => apiClient.authenticatedRequest("/api/orders"),
    getById: (id: string) => apiClient.authenticatedRequest(`/api/orders/${id}`),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.authenticatedRequest("/api/user/profile"),
    updateProfile: (data: any) => apiClient.authenticatedRequest("/api/user/profile", "PUT", data),
  },
}
