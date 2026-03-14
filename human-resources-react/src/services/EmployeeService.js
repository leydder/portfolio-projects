import axios from 'axios';

const BASE_URL = 'http://localhost:8080/rh-app';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const getEmployees = () => axios.get(`${BASE_URL}/employee`, getAuthHeader());
const getEmployeeById = (id) => axios.get(`${BASE_URL}/employee/${id}`, getAuthHeader());
const createEmployee = (employee) => axios.post(`${BASE_URL}/employee`, employee, getAuthHeader());
const updateEmployee = (id, employee) => axios.put(`${BASE_URL}/employee/${id}`, employee, getAuthHeader());
const deleteEmployee = (id) => axios.delete(`${BASE_URL}/employee/${id}`, getAuthHeader());

const EmployeeService = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };

export default EmployeeService;