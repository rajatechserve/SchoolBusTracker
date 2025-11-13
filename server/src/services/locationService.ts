import { Request, Response } from 'express';

interface Location {
    busId: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
}

const locations: Location[] = [];

export const updateLocation = (req: Request, res: Response) => {
    const { busId, latitude, longitude } = req.body;

    if (!busId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    const location: Location = {
        busId,
        latitude,
        longitude,
        timestamp: new Date(),
    };

    locations.push(location);
    return res.status(200).json({ message: 'Location updated successfully' });
};

export const getLocation = (req: Request, res: Response) => {
    const { busId } = req.params;

    const busLocation = locations.filter(location => location.busId === busId);
    
    if (busLocation.length === 0) {
        return res.status(404).json({ message: 'Bus not found' });
    }

    return res.status(200).json(busLocation);
};