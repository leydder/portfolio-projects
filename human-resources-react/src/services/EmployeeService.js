import axios from 'axios';

const BASE_URL = 'http://localhost:8080/rh-app';

const getEmployees = () => axios.get(`${BASE_URL}/employee`);
const getEmployeeById = (id) => axios.get(`${BASE_URL}/employee/${id}`);
const createEmployee = (employee) => axios.post(`${BASE_URL}/employee`, employee);
const updateEmployee = (id, employee) => axios.put(`${BASE_URL}/employee/${id}`, employee);
const deleteEmployee = (id) => axios.delete(`${BASE_URL}/employee/${id}`);

const EmployeeService = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };

export default EmployeeService;