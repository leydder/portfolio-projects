import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/EmployeeService', () => ({
    getEmployees: () => Promise.resolve({ data: [] }),
    getEmployeeById: () => Promise.resolve({ data: {} }),
    createEmployee: () => Promise.resolve({ data: {} }),
    updateEmployee: () => Promise.resolve({ data: {} }),
    deleteEmployee: () => Promise.resolve({ data: {} }),
}));

test('renders Human Resources title', () => {
    render(<App />);
    expect(screen.getByText(/Human Resources/i)).toBeInTheDocument();
});

test('renders Add Employee form by default', () => {
    render(<App />);
    expect(screen.getByText(/Add Employee/i)).toBeInTheDocument();
});