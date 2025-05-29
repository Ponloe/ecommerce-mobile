const API_BASE_URL = 'http://192.168.0.202:8000/api/v1'; 

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  brand_id: number;
  image: string;
  category?: Category;
  brand?: Brand;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  products?: Product[];
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  products?: Product[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(filters?: { category_id?: number; brand_id?: number; search?: string }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.brand_id) params.append('brand_id', filters.brand_id.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return this.makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id: number): Promise<Product> {
    return this.makeRequest(`/products/${id}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.makeRequest('/categories');
  }

  async getCategory(id: number): Promise<Category> {
    return this.makeRequest(`/categories/${id}`);
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return this.makeRequest('/brands');
  }

  async getBrand(id: number): Promise<Brand> {
    return this.makeRequest(`/brands/${id}`);
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.makeRequest('/logout', { method: 'POST' });
    this.token = null;
  }

  async getProfile(): Promise<User> {
    return this.makeRequest('/profile');
  }
}

export const apiService = new ApiService();