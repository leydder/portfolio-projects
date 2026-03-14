import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import EmployeeForm from './EmployeeForm';
import EmployeeService from '../services/EmployeeService';

jest.mock('../services/EmployeeService');

const mockOnEmployeeCreated = jest.fn();

describe('EmployeeForm', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- Render ---

    test('renders form fields', () => {
        render(<EmployeeForm onEmployeeCreated={mockOnEmployeeCreated} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
        expect(screen.getByLabelText('Salary')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    // --- Submit exitoso ---

    test('submits form and calls onEmployeeCreated', async () => {
        EmployeeService.createEmployee.mockResolvedValue({ data: { idEmployee: 1, name: 'John' } });

        render(<EmployeeForm onEmployeeCreated={mockOnEmployeeCreated} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });
        fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
        fireEvent.change(screen.getByLabelText('Salary'), { target: { value: '3500' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(EmployeeService.createEmployee).toHaveBeenCalledWith({
                name: 'John Smith',
                department: 'Engineering',
                salary: '3500'
            });
            expect(mockOnEmployeeCreated).toHaveBeenCalled();
        });
    });

    // --- Limpia el formulario después de guardar ---

    test('clears form after successful submit', async () => {
        EmployeeService.createEmployee.mockResolvedValue({ data: {} });

        render(<EmployeeForm onEmployeeCreated={mockOnEmployeeCreated} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Smith' } });
        fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } });
        fireEvent.change(screen.getByLabelText('Salary'), { target: { value: '3500' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByLabelText('Name').value).toBe('');
            expect(screen.getByLabelText('Department').value).toBe('');
            expect(screen.getByLabelText('Salary').value).toBe('');
        });
    });

    // --- Error en la API ---

    test('handles API error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.createEmployee.mockRejectedValue(new Error('Network Error'));

        render(<EmployeeForm onEmployeeCreated={mockOnEmployeeCreated} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'HR' } });
        fireEvent.change(screen.getByLabelText('Salary'), { target: { value: '1000' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error creating employee:', expect.any(Error));
            expect(mockOnEmployeeCreated).not.toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});