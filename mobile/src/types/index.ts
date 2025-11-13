export type User = {
  id: string;
  name: string;
  email: string;
  role: 'driver' | 'parent';
};

export type Bus = {
  id: string;
  route: string;
  status: 'on-time' | 'delayed' | 'arrived';
  location: {
    latitude: number;
    longitude: number;
  };
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  busId: string;
};

export type LocationUpdate = {
  busId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
};