
export interface Vehicle {
  id: string;
  plate: string;
  vin: string;
  type: string;
  model: string;
  year: string;
  color: string;
  owner: string;
  history: string;
  image?: string; // Base64 encoded image string
  lastUpdated?: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export type View = 'login' | 'dashboard' | 'search' | 'add' | 'edit';
