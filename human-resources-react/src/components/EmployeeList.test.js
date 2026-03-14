import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import EmployeeList from './EmployeeList';
import EmployeeService from '../services/EmployeeService';

jest.mock('../services/EmployeeService');

const mockOnEdit = jest.fn();

describe('EmployeeList', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- Lista normal ---

    test('renders list of employees', async () => {
        EmployeeService.getEmployees.mockResolvedValue({
            data: [
                { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }
            ]
        });

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => {
            expect(screen.getByText('John Smith')).toBeInTheDocument();
            expect(screen.getByText('Engineering')).toBeInTheDocument();
        });
    });

    // --- Lista vacía ---

    test('renders empty table when no employees', async () => {
        EmployeeService.getEmployees.mockResolvedValue({ data: [] });

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => {
            expect(screen.queryByRole('row', { name: /John/i })).not.toBeInTheDocument();
        });
    });

    // --- Múltiples empleados ---

    test('renders multiple employees', async () => {
        EmployeeService.getEmployees.mockResolvedValue({
            data: [
                { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 },
                { idEmployee: 2, name: 'Maria Garcia', department: 'HR', salary: 2800 }
            ]
        });

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => {
            expect(screen.getByText('John Smith')).toBeInTheDocument();
            expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
        });
    });

    // --- Error en la API ---

    test('handles API error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.getEmployees.mockRejectedValue(new Error('Network Error'));

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error loading employees:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    // --- Botón Edit ---

    test('calls onEdit with employee id when Edit button clicked', async () => {
        EmployeeService.getEmployees.mockResolvedValue({
            data: [{ idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }]
        });

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => screen.getByText('John Smith'));
        fireEvent.click(screen.getByText('Edit'));
        expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    // --- Botón Delete ---

    test('deletes employee and reloads list', async () => {
        EmployeeService.getEmployees.mockResolvedValue({
            data: [{ idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }]
        });
        EmployeeService.deleteEmployee.mockResolvedValue({});

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => screen.getByText('John Smith'));
        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(EmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
            expect(EmployeeService.getEmployees).toHaveBeenCalledTimes(2);
        });
    });

    // --- Error al eliminar ---

    test('handles delete error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.getEmployees.mockResolvedValue({
            data: [{ idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }]
        });
        EmployeeService.deleteEmployee.mockRejectedValue(new Error('Delete failed'));

        render(<EmployeeList onEdit={mockOnEdit} />);

        await waitFor(() => screen.getByText('John Smith'));
        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting employee:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
});