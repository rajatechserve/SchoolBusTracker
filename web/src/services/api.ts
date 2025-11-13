import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

// Function to get all students
export const getStudents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching students: ' + error.message);
    }
};

// Function to add a new student
export const addStudent = async (studentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/students`, studentData);
        return response.data;
    } catch (error) {
        throw new Error('Error adding student: ' + error.message);
    }
};

// Function to update student details
export const updateStudent = async (studentId, studentData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/students/${studentId}`, studentData);
        return response.data;
    } catch (error) {
        throw new Error('Error updating student: ' + error.message);
    }
};

// Function to get all buses
export const getBuses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buses`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching buses: ' + error.message);
    }
};

// Function to update bus status
export const updateBusStatus = async (busId, statusData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/buses/${busId}`, statusData);
        return response.data;
    } catch (error) {
        throw new Error('Error updating bus status: ' + error.message);
    }
};