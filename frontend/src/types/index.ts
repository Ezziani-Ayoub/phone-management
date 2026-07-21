// Employee types
export interface Employee {
  id: number;
  fullName: string;
  department: string;
  position: string;
  email?: string;
  site?: string;
  status: 'Actif' | 'Inactif';
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignments?: Assignment[];
}

// PhoneNumber types
export interface PhoneNumber {
  id: number;
  phoneNumber: string;
  provider: string;
  status: 'Disponible' | 'Attribué' | 'Indisponible';
  lineStatus: 'Actif' | 'Inactif';
  notes?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignments?: Assignment[];
  forfaitId?: number | null;
  forfait?: Forfait | null;
}

// Forfait types
export interface Forfait {
  id: number;
  name: string;
  price: number;
  operator: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    phoneNumbers: number;
  };
}

// Assignment types
export interface Assignment {
  id: number;
  employeeId: number;
  phoneNumberId: number;
  assignedAt: string;
  returnedAt?: string | null;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  phoneNumber?: PhoneNumber;
}

// Pagination
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Dashboard
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalPhoneNumbers: number;
  assignedNumbers: number;
  availableNumbers: number;
  unavailableNumbers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentAssignments: Assignment[];
}

// Form types
export interface EmployeeFormData {
  fullName: string;
  department: string;
  position: string;
  email?: string;
  site?: string;
  status: 'Actif' | 'Inactif';
}

export interface PhoneNumberFormData {
  phoneNumber: string;
  provider: string;
  status: 'Disponible' | 'Attribué' | 'Indisponible';
  lineStatus: 'Actif' | 'Inactif';
  notes?: string;
  forfaitId?: number | null;
}

export interface ForfaitFormData {
  name: string;
  price: number;
  operator: string;
  description?: string;
}

export interface AssignmentFormData {
  employeeId: number;
  phoneNumberId: number;
  assignedBy: string;
}

// Providers list
export const PROVIDERS = ['Maroc Telecom', 'Orange Maroc', 'Inwi', 'Autre'];

// Departments list
export const DEPARTMENTS = [
  'Informatique',
  'Ressources Humaines',
  'Finance',
  'Direction',
  'Éducation',
  'Communication',
  'Administration',
  'Logistique',
  'Autre',
];
