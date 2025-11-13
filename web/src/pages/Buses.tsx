import React, { useEffect, useState } from 'react';
import { BusStatus } from '../components/BusStatus';
import { fetchBuses } from '../services/api';

const Buses: React.FC = () => {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        const getBuses = async () => {
            const busData = await fetchBuses();
            setBuses(busData);
        };

        getBuses();
    }, []);

    return (
        <div>
            <h1>Bus Management</h1>
            <div>
                {buses.map(bus => (
                    <BusStatus key={bus.id} bus={bus} />
                ))}
            </div>
        </div>
    );
};

export default Buses;