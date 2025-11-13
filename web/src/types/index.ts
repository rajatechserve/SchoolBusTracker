export interface Student {
    id: string;
    name: string;
    grade: string;
    parentContact: string;
}

export interface Bus {
    id: string;
    route: string;
    driverName: string;
    status: 'on-time' | 'delayed' | 'arrived';
}

export interface BusStatus {
    busId: string;
    location: {
        latitude: number;
        longitude: number;
    };
    estimatedArrivalTime: string;
}

export interface User {
    id: string;
    username: string;
    role: 'driver' | 'parent' | 'admin';
}