import {
  User,
  Farm,
  Crop,
  SoilRecord,
  WeatherData,
  PestAlert,
  Product,
  Order,
  ForumPost,
  Expert,
  ConsultationBooking,
} from '../types';

const TOKEN_KEY = 'agritech_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    location?: string;
    preferredLanguage?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Farms
  async getFarms(): Promise<Farm[]> {
    const res = await fetch('/api/farms', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch farms');
    return res.json();
  },

  async createFarm(farmData: Partial<Farm>): Promise<Farm> {
    const res = await fetch('/api/farms', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(farmData),
    });
    if (!res.ok) throw new Error('Failed to create farm');
    return res.json();
  },

  async updateFarm(id: string, farmData: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`/api/farms/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(farmData),
    });
    if (!res.ok) throw new Error('Failed to update farm');
    return res.json();
  },

  async deleteFarm(id: string): Promise<void> {
    const res = await fetch(`/api/farms/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete farm');
  },

  // Crops
  async getCrops(farmId?: string): Promise<Crop[]> {
    const url = farmId ? `/api/crops?farmId=${encodeURIComponent(farmId)}` : '/api/crops';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch crops');
    return res.json();
  },

  async createCrop(cropData: Partial<Crop>): Promise<Crop> {
    const res = await fetch('/api/crops', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cropData),
    });
    if (!res.ok) throw new Error('Failed to create crop');
    return res.json();
  },

  async updateCrop(id: string, cropData: Partial<Crop>): Promise<Crop> {
    const res = await fetch(`/api/crops/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(cropData),
    });
    if (!res.ok) throw new Error('Failed to update crop');
    return res.json();
  },

  async deleteCrop(id: string): Promise<void> {
    const res = await fetch(`/api/crops/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete crop');
  },

  // Soil
  async getSoilLogs(farmId?: string): Promise<SoilRecord[]> {
    const url = farmId ? `/api/soil-logs?farmId=${encodeURIComponent(farmId)}` : '/api/soil-logs';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch soil logs');
    return res.json();
  },

  async createSoilLog(logData: Partial<SoilRecord>): Promise<SoilRecord> {
    const res = await fetch('/api/soil-logs', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData),
    });
    if (!res.ok) throw new Error('Failed to log soil test');
    return res.json();
  },

  // Weather
  async getWeather(lat?: number, lon?: number, city?: string): Promise<WeatherData> {
    const query = new URLSearchParams();
    if (lat) query.set('lat', lat.toString());
    if (lon) query.set('lon', lon.toString());
    if (city) query.set('city', city);
    const res = await fetch(`/api/weather?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  // Pest alerts
  async getPestAlerts(): Promise<PestAlert[]> {
    const res = await fetch('/api/pest-alerts');
    if (!res.ok) throw new Error('Failed to fetch pest alerts');
    return res.json();
  },

  async createPestAlert(alertData: Partial<PestAlert>): Promise<PestAlert> {
    const res = await fetch('/api/pest-alerts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(alertData),
    });
    if (!res.ok) throw new Error('Failed to create pest alert');
    return res.json();
  },

  // Products & Marketplace
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (search) query.set('search', search);
    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Forum & Experts
  async getForumPosts(): Promise<ForumPost[]> {
    const res = await fetch('/api/forum/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  async createForumPost(postData: Partial<ForumPost>): Promise<ForumPost> {
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async replyForumPost(postId: string, content: string): Promise<any> {
    const res = await fetch(`/api/forum/posts/${postId}/replies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to submit reply');
    return res.json();
  },

  async upvotePost(postId: string): Promise<{ upvotes: number }> {
    const res = await fetch(`/api/forum/posts/${postId}/upvote`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },

  async getExperts(): Promise<Expert[]> {
    const res = await fetch('/api/experts');
    if (!res.ok) throw new Error('Failed to fetch experts');
    return res.json();
  },

  async bookConsultation(bookingData: Partial<ConsultationBooking>): Promise<ConsultationBooking> {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error('Failed to book consultation');
    return res.json();
  },

  // AI Gemini Features
  async diagnoseCropAI(data: {
    cropName?: string;
    symptoms?: string;
    imageBase64?: string;
    farmContext?: string;
  }): Promise<{
    diagnosis: string;
    confidenceScore: number;
    severity: 'High' | 'Moderate' | 'Low';
    pathogenType: string;
    rootCause: string;
    immediateAction: string;
    organicRemedy: string;
    chemicalRemedy: string;
    preventiveAdvice: string;
  }> {
    const res = await fetch('/api/ai/diagnose-crop', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Crop diagnosis failed');
    }
    return res.json();
  },

  async getSoilRecommendationAI(data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    cropTarget?: string;
    soilType?: string;
  }): Promise<{
    soilCondition: string;
    nitrogenStatus: string;
    phosphorusStatus: string;
    potassiumStatus: string;
    phVerdict: string;
    dosagePrescription: string[];
    suitableCrops: string[];
    organicCorrection: string;
  }> {
    const res = await fetch('/api/ai/soil-recommendation', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Soil recommendation failed');
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin statistics');
    return res.json();
  },
};
