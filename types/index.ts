export interface User {
  _id: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  clientId?: string;
  createdAt: Date;
}

export interface Client {
  _id: string;
  name: string;
  createdAt: Date;
}

export interface Automation {
  _id: string;
  name: string;
  description: string;
  clientId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Metric {
  _id: string;
  automationId: string;
  date: Date;
  emailsSent: number;
  conversions: number;
  revenue: number;
}

export interface DashboardStats {
  totalAutomations: number;
  activeAutomations: number;
  totalEmailsSent: number;
  totalRevenue: number;
}