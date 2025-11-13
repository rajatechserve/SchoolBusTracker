import React, { useEffect, useState } from 'react';
import { getBusStatuses } from '../services/api';

const BusStatus: React.FC = () => {
    const [busStatuses, setBusStatuses] = useState([]);

    useEffect(() => {
        const fetchBusStatuses = async () => {
            const statuses = await getBusStatuses();
            setBusStatuses(statuses);
        };

        fetchBusStatuses();
    }, []);

    return (
        <div>
            <h2>Bus Statuses</h2>
            <ul>
                {busStatuses.map((bus) => (
                    <li key={bus.id}>
                        Bus ID: {bus.id} - Status: {bus.status} - Location: {bus.location}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusStatus;