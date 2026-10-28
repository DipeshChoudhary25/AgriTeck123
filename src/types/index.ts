export type UserRole = 'farmer' | 'expert' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  title?: string;
  verified?: boolean;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  sizeAcres: number;
  soilType: 'Alluvial' | 'Black Soil' | 'Red & Yellow' | 'Clayey Loam' | 'Sandy Loam';
  irrigationType: 'Drip Irrigation' | 'Canal Water' | 'Sprinkler' | 'Borewell / Tube Well' | 'Rainfed';
  location: {
    village: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  primaryCrops: string[];
  establishedYear: number;
  healthIndex: number;
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  stage: 'Sowing' | 'Germination' | 'Vegetative' | 'Flowering' | 'Maturity' | 'Harvest Ready';
  acreage: number;
  healthScore: number;
  waterRequirement: 'Low' | 'Moderate' | 'High';
  targetYieldTons: number;
  notes?: string;
}

export interface SoilRecord {
  id: string;
  farmId: string;
  testDate: string;
  nitrogen: number; // kg/ha (ideal ~ 280-560)
  phosphorus: number; // kg/ha (ideal ~ 10-25)
  potassium: number; // kg/ha (ideal ~ 110-280)
  ph: number; // 0-14 (ideal ~ 6.0-7.5)
  moisturePercentage: number; // 0-100%
  organicCarbonPercentage: number; // ideal ~ 0.5-0.75%
  status: 'Optimal' | 'Deficient' | 'Excess';
  recommendations: string[];
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  rainChance: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherData {
  city: string;
  currentTemp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainfallChance: number;
  uvIndex: number;
  sprayAdvisory: {
    status: 'Safe' | 'Caution' | 'Unfavorable';
    reason: string;
    bestWindow: string;
  };
  forecast: WeatherDay[];
}

export interface PestAlert {
  id: string;
  title: string;
  crop: string;
  severity: 'High' | 'Moderate' | 'Low';
  region: string;
  riskFactor: number; // 0-100%
  detectedDate: string;
  symptoms: string[];
  remediation: string;
  organicRemedy: string;
  chemicalRemedy: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools & Sensors' | 'Irrigation';
  price: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  description: string;
  organicCertified: boolean;
  dosageGuide?: string;
  seller: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  farmerName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  trackingNumber: string;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorLocation: string;
  title: string;
  content: string;
  cropTag: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  imageUrl?: string;
  replies: {
    id: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    createdAt: string;
    isVerifiedExpert?: boolean;
  }[];
}

export interface Expert {
  id: string;
  name: string;
  designation: string;
  organization: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  consultationCount: number;
  availableSlot: string;
  fee: string;
  languages: string[];
  phone: string;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  expertName: string;
  farmerId: string;
  farmerName: string;
  farmTopic: string;
  cropConcern: string;
  scheduledDate: string;
  slotTime: string;
  status: 'Scheduled' | 'Completed' | 'Pending';
  notes?: string;
}
