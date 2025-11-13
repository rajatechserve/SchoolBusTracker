import { Request, Response } from 'express';
import Bus from '../models/bus'; // Assuming there's a Bus model defined
import LocationService from '../services/locationService';

export const getBusStatus = async (req: Request, res: Response) => {
    try {
        const busId = req.params.id;
        const busStatus = await Bus.findById(busId);
        if (!busStatus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.status(200).json(busStatus);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bus status', error });
    }
};

export const updateBusStatus = async (req: Request, res: Response) => {
    try {
        const busId = req.params.id;
        const updatedStatus = req.body;
        const bus = await Bus.findByIdAndUpdate(busId, updatedStatus, { new: true });
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.status(200).json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bus status', error });
    }
};

export const trackBusLocation = async (req: Request, res: Response) => {
    try {
        const busId = req.params.id;
        const location = await LocationService.getBusLocation(busId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking bus location', error });
    }
};