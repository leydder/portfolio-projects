import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./services/EmployeeService', () => ({
    getEmployees: () => Promise.resolve({ data: [] }),
    getEmployeeById: () => Promise.resolve({ data: {} }),
    createEmployee: () => Promise.resolve({ data: {} }),
    updateEmployee: () => Promise.resolve({ data: {} }),
    deleteEmployee: () => Promise.resolve({ data: {} }),
}));

beforeEach(() => {
    localStorage.clear();
});

test('renders Login when not authenticated', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
});

test('renders app after login', () => {
    localStorage.setItem('token', 'fake-token');
    render(<App />);
    expect(screen.getByText(/Human Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Employee/i)).toBeInTheDocument();
});

test('renders logout button when authenticated', () => {
    localStorage.setItem('token', 'fake-token');
    render(<App />);
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});

test('logout clears token and shows login', () => {
    localStorage.setItem('token', 'fake-token');
    render(<App />);
    fireEvent.click(screen.getByText(/Logout/i));
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
});