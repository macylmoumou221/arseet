module.exports = [
"[project]/OneDrive/Bureau/WORK/arseet/client/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API Configuration
__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "api",
    ()=>api,
    "apiClient",
    ()=>apiClient
]);
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:5000") || "http://localhost:5000";
const apiClient = {
    /**
   * Make a GET request to the API
   */ get: async (endpoint)=>{
        const url = `${API_BASE_URL}${endpoint}`;
        console.log("🔍 API GET Request:", url);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("📥 API Response Status:", response.status, response.statusText);
        if (!response.ok) {
            let errorMessage = `API Error: ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.error("❌ API Error Response:", errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
            // If JSON parsing fails, use status text
            }
            throw new Error(errorMessage);
        }
        return response.json();
    },
    /**
   * Make a POST request to the API
   */ post: async (endpoint, data)=>{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: data ? JSON.stringify(data) : undefined
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },
    /**
   * Make a PUT request to the API
   */ put: async (endpoint, data)=>{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: data ? JSON.stringify(data) : undefined
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },
    /**
   * Make a DELETE request to the API
   */ delete: async (endpoint)=>{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },
    /**
   * Make a request with authentication token
   */ authenticatedRequest: async (endpoint, method = "GET", data)=>{
        // Get token from localStorage (you can modify this based on your auth implementation)
        const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {}
            },
            body: data ? JSON.stringify(data) : undefined
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }
};
const api = {
    // Auth endpoints
    auth: {
        login: (email, password)=>apiClient.post("/api/auth/login", {
                email,
                password
            }),
        register: (data)=>apiClient.post("/api/auth/register", data),
        logout: ()=>apiClient.post("/api/auth/logout")
    },
    // Products endpoints
    products: {
        getAll: ()=>apiClient.get("/api/produits"),
        getById: (id)=>apiClient.get(`/api/produits/${id}`),
        getNew: ()=>apiClient.get("/api/produits?est_nouveau=true"),
        create: (data)=>apiClient.post("/api/produits", data),
        update: (id, data)=>apiClient.put(`/api/produits/${id}`, data),
        delete: (id)=>apiClient.delete(`/api/produits/${id}`)
    },
    // Orders endpoints
    orders: {
        create: (data)=>apiClient.post("/api/orders", data),
        getAll: ()=>apiClient.authenticatedRequest("/api/orders"),
        getById: (id)=>apiClient.authenticatedRequest(`/api/orders/${id}`)
    },
    // User endpoints
    user: {
        getProfile: ()=>apiClient.authenticatedRequest("/api/user/profile"),
        updateProfile: (data)=>apiClient.authenticatedRequest("/api/user/profile", "PUT", data)
    }
};
}),
];

//# sourceMappingURL=OneDrive_Bureau_WORK_arseet_client_lib_api_ts_da2f6788._.js.map