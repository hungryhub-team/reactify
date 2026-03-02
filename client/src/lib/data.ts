// Mock data for the Account Manager Restaurant Dashboard

export interface Restaurant {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cuisine: string;
  status: "active" | "pending" | "suspended" | "churned";
  plan: "starter" | "growth" | "enterprise";
  monthlyRevenue: number;
  totalOrders: number;
  avgRating: number;
  totalReviews: number;
  joinedAt: string;
  lastActive: string;
  logo: string;
  menuItems: number;
  completionRate: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface ActivityItem {
  id: string;
  type: "restaurant_added" | "plan_upgraded" | "issue_resolved" | "review_flagged" | "payment_received";
  message: string;
  timestamp: string;
  restaurantName: string;
}

export const restaurants: Restaurant[] = [
  {
    id: "rst-001",
    name: "Warung Padang Sederhana",
    owner: "Budi Santoso",
    email: "budi@warungpadang.id",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 45",
    city: "Jakarta",
    cuisine: "Padang",
    status: "active",
    plan: "enterprise",
    monthlyRevenue: 45200000,
    totalOrders: 3420,
    avgRating: 4.8,
    totalReviews: 1240,
    joinedAt: "2024-03-15",
    lastActive: "2026-02-24",
    logo: "",
    menuItems: 48,
    completionRate: 95,
  },
  {
    id: "rst-002",
    name: "Sushi Zen Tokyo",
    owner: "Tanaka Kenji",
    email: "kenji@sushizen.jp",
    phone: "+62 821-9876-5432",
    address: "Jl. Senopati No. 12",
    city: "Jakarta",
    cuisine: "Japanese",
    status: "active",
    plan: "growth",
    monthlyRevenue: 38500000,
    totalOrders: 2180,
    avgRating: 4.9,
    totalReviews: 890,
    joinedAt: "2024-06-22",
    lastActive: "2026-02-23",
    logo: "",
    menuItems: 62,
    completionRate: 88,
  },
  {
    id: "rst-003",
    name: "Bakso Malang Cak Eko",
    owner: "Eko Prasetyo",
    email: "eko@baksocakeko.id",
    phone: "+62 856-1234-5678",
    address: "Jl. Diponegoro No. 78",
    city: "Surabaya",
    cuisine: "Indonesian",
    status: "active",
    plan: "starter",
    monthlyRevenue: 12800000,
    totalOrders: 1560,
    avgRating: 4.5,
    totalReviews: 620,
    joinedAt: "2025-01-10",
    lastActive: "2026-02-24",
    logo: "",
    menuItems: 24,
    completionRate: 72,
  },
  {
    id: "rst-004",
    name: "La Piazza Italiana",
    owner: "Marco Rossi",
    email: "marco@lapiazza.id",
    phone: "+62 878-5555-1234",
    address: "Jl. Kemang Raya No. 33",
    city: "Jakarta",
    cuisine: "Italian",
    status: "pending",
    plan: "growth",
    monthlyRevenue: 0,
    totalOrders: 0,
    avgRating: 0,
    totalReviews: 0,
    joinedAt: "2026-02-20",
    lastActive: "2026-02-22",
    logo: "",
    menuItems: 35,
    completionRate: 45,
  },
  {
    id: "rst-005",
    name: "Ayam Geprek Bu Sari",
    owner: "Sari Wulandari",
    email: "sari@ayamgeprek.id",
    phone: "+62 813-7777-8888",
    address: "Jl. Gajah Mada No. 99",
    city: "Bandung",
    cuisine: "Indonesian",
    status: "active",
    plan: "growth",
    monthlyRevenue: 28900000,
    totalOrders: 4210,
    avgRating: 4.6,
    totalReviews: 2100,
    joinedAt: "2024-09-05",
    lastActive: "2026-02-24",
    logo: "",
    menuItems: 18,
    completionRate: 91,
  },
  {
    id: "rst-006",
    name: "Dragon Palace",
    owner: "Li Wei",
    email: "wei@dragonpalace.id",
    phone: "+62 822-3333-4444",
    address: "Jl. Mangga Besar No. 56",
    city: "Jakarta",
    cuisine: "Chinese",
    status: "suspended",
    plan: "enterprise",
    monthlyRevenue: 0,
    totalOrders: 5800,
    avgRating: 4.3,
    totalReviews: 3200,
    joinedAt: "2023-11-20",
    lastActive: "2026-01-15",
    logo: "",
    menuItems: 85,
    completionRate: 60,
  },
  {
    id: "rst-007",
    name: "Nasi Goreng Kebon Sirih",
    owner: "Agus Hermawan",
    email: "agus@nasgor.id",
    phone: "+62 859-1111-2222",
    address: "Jl. Kebon Sirih No. 21",
    city: "Jakarta",
    cuisine: "Indonesian",
    status: "active",
    plan: "starter",
    monthlyRevenue: 8500000,
    totalOrders: 2890,
    avgRating: 4.4,
    totalReviews: 1580,
    joinedAt: "2025-04-18",
    lastActive: "2026-02-23",
    logo: "",
    menuItems: 12,
    completionRate: 82,
  },
  {
    id: "rst-008",
    name: "Thai Basil Garden",
    owner: "Somchai Prasert",
    email: "somchai@thaibasil.id",
    phone: "+62 881-6666-7777",
    address: "Jl. Thamrin No. 88",
    city: "Jakarta",
    cuisine: "Thai",
    status: "churned",
    plan: "starter",
    monthlyRevenue: 0,
    totalOrders: 450,
    avgRating: 3.8,
    totalReviews: 180,
    joinedAt: "2025-08-12",
    lastActive: "2025-12-30",
    logo: "",
    menuItems: 30,
    completionRate: 35,
  },
  {
    id: "rst-009",
    name: "Bebek Bengil Ubud",
    owner: "Made Suartana",
    email: "made@bebekbengil.id",
    phone: "+62 817-4444-5555",
    address: "Jl. Hanoman No. 15",
    city: "Bali",
    cuisine: "Balinese",
    status: "active",
    plan: "enterprise",
    monthlyRevenue: 62300000,
    totalOrders: 4890,
    avgRating: 4.7,
    totalReviews: 3800,
    joinedAt: "2024-01-08",
    lastActive: "2026-02-24",
    logo: "",
    menuItems: 42,
    completionRate: 97,
  },
  {
    id: "rst-010",
    name: "Kedai Kopi Nusantara",
    owner: "Rizky Aditya",
    email: "rizky@kedaikopi.id",
    phone: "+62 838-9999-0000",
    address: "Jl. Braga No. 67",
    city: "Bandung",
    cuisine: "Cafe",
    status: "active",
    plan: "growth",
    monthlyRevenue: 22100000,
    totalOrders: 3150,
    avgRating: 4.6,
    totalReviews: 1420,
    joinedAt: "2024-11-30",
    lastActive: "2026-02-24",
    logo: "",
    menuItems: 56,
    completionRate: 85,
  },
];

export const revenueData: RevenueDataPoint[] = [
  { month: "Sep", revenue: 145000000, orders: 18200 },
  { month: "Oct", revenue: 162000000, orders: 20100 },
  { month: "Nov", revenue: 178000000, orders: 22400 },
  { month: "Dec", revenue: 195000000, orders: 25600 },
  { month: "Jan", revenue: 210000000, orders: 27800 },
  { month: "Feb", revenue: 218300000, orders: 28100 },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "act-001",
    type: "restaurant_added",
    message: "New restaurant onboarded",
    timestamp: "2026-02-24T10:30:00",
    restaurantName: "La Piazza Italiana",
  },
  {
    id: "act-002",
    type: "plan_upgraded",
    message: "Upgraded from Growth to Enterprise",
    timestamp: "2026-02-23T14:15:00",
    restaurantName: "Bebek Bengil Ubud",
  },
  {
    id: "act-003",
    type: "payment_received",
    message: "Monthly payment processed",
    timestamp: "2026-02-22T09:00:00",
    restaurantName: "Warung Padang Sederhana",
  },
  {
    id: "act-004",
    type: "issue_resolved",
    message: "Menu sync issue resolved",
    timestamp: "2026-02-21T16:45:00",
    restaurantName: "Sushi Zen Tokyo",
  },
  {
    id: "act-005",
    type: "review_flagged",
    message: "Flagged review under investigation",
    timestamp: "2026-02-21T11:20:00",
    restaurantName: "Dragon Palace",
  },
  {
    id: "act-006",
    type: "payment_received",
    message: "Monthly payment processed",
    timestamp: "2026-02-20T09:00:00",
    restaurantName: "Ayam Geprek Bu Sari",
  },
  {
    id: "act-007",
    type: "restaurant_added",
    message: "New restaurant onboarded",
    timestamp: "2026-02-18T13:00:00",
    restaurantName: "Kedai Kopi Nusantara",
  },
];

// Dashboard summary stats
export function getDashboardStats() {
  const activeRestaurants = restaurants.filter((r) => r.status === "active").length;
  const pendingRestaurants = restaurants.filter((r) => r.status === "pending").length;
  const totalRevenue = restaurants.reduce((sum, r) => sum + r.monthlyRevenue, 0);
  const totalOrders = restaurants.reduce((sum, r) => sum + r.totalOrders, 0);
  const avgRating =
    restaurants.filter((r) => r.avgRating > 0).reduce((sum, r) => sum + r.avgRating, 0) /
    restaurants.filter((r) => r.avgRating > 0).length;

  return {
    totalRestaurants: restaurants.length,
    activeRestaurants,
    pendingRestaurants,
    suspendedRestaurants: restaurants.filter((r) => r.status === "suspended").length,
    churnedRestaurants: restaurants.filter((r) => r.status === "churned").length,
    totalRevenue,
    totalOrders,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function getStatusColor(status: Restaurant["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "pending":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "suspended":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
    case "churned":
      return "bg-neutral-500/15 text-neutral-700 dark:text-neutral-400";
  }
}

export function getPlanColor(plan: Restaurant["plan"]) {
  switch (plan) {
    case "starter":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-400";
    case "growth":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-400";
    case "enterprise":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
}
