import { API_BASE_URL } from "./api"
const API_URL = `${API_BASE_URL}/api`

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string | null
  adresse: string | null
  ville: string | null
  code_postal: string | null
  est_admin: boolean
  est_abonne_newsletter: boolean
  date_creation: string
  derniere_connexion: string
}

export interface AuthResponse {
  success: boolean
  message: string
  error?: string  // Single error message
  errors?: string[]  // Array of validation errors
  data?: {
    user: User
    token: string
  }
}

export interface RegisterData {
  email: string
  mot_de_passe: string
  nom: string
  prenom: string
  telephone: string
}

export interface LoginData {
  email: string
  mot_de_passe: string
}

export interface VerifyEmailData {
  email: string
  code: string
}

export interface ResetPasswordData {
  email: string
  code: string
  mot_de_passe: string
}

// Store token in localStorage
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token)
  }
}

// Get token from localStorage
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Store user in localStorage
export const setUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

// Get user from localStorage
export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

// Remove auth data
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
  }
}

// Check if user is logged in
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Check if user is admin
export const isAdmin = () => {
  const user = getUser()
  return user?.est_admin === true
}

// Refresh user profile from server
export const refreshUserProfile = async () => {
  try {
    const response = await authAPI.getProfile()
    if (response.success && response.data?.user) {
      setUser(response.data.user)
      return response.data.user
    }
    return null
  } catch (error) {
    return null
  }
}

// API calls
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/connexion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('🔧 authAPI.register - URL:', `${API_URL}/auth/inscription`)
    console.log('🔧 authAPI.register - Data:', data)
    
    const response = await fetch(`${API_URL}/auth/inscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    console.log('🔧 authAPI.register - Response status:', response.status)
    console.log('🔧 authAPI.register - Response ok:', response.ok)
    
    const result = await response.json()
    console.log('🔧 authAPI.register - Result:', result)
    
    return result
  },

  verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/password/forgot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  resendVerification: async (email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  getProfile: async (): Promise<AuthResponse> => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/auth/profil`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    return response.json()
  },

  updateProfile: async (data: Partial<User>): Promise<AuthResponse> => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/auth/profil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    // Update local user data if successful
    if (result.success && result.data?.user) {
      setUser(result.data.user)
    }
    return result
  },

  changePassword: async (ancienMotDePasse: string, nouveauMotDePasse: string): Promise<AuthResponse> => {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/auth/password/change`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ancien_mot_de_passe: ancienMotDePasse,
        nouveau_mot_de_passe: nouveauMotDePasse,
      }),
    })
    return response.json()
  },
}
