import axios from 'axios';

const API_BASE_URL = 'https://api.school-bus-tracker.com'; // Replace with your actual API base URL

// Function to login a user (driver or parent)
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Login failed');
    }
};

// Function to get bus statuses
export const getBusStatuses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buses/status`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Failed to fetch bus statuses');
    }
};

// Function to get student details
export const getStudentDetails = async (studentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Failed to fetch student details');
    }
};

// Function to track bus location
export const trackBusLocation = async (busId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buses/${busId}/location`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Failed to track bus location');
    }
};