import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import EmployeeEdit from './EmployeeEdit';
import EmployeeService from '../services/EmployeeService';

jest.mock('../services/EmployeeService');

const mockOnUpdated = jest.fn();
const mockOnCancel = jest.fn();

describe('EmployeeEdit', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- Carga datos del empleado ---

    test('loads and displays employee data', async () => {
        EmployeeService.getEmployeeById.mockResolvedValue({
            data: { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }
        });

        render(<EmployeeEdit employeeId={1} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByLabelText('Name').value).toBe('John Smith');
            expect(screen.getByLabelText('Department').value).toBe('Engineering');
            expect(screen.getByLabelText('Salary').value).toBe('3500');
        });
    });

    // --- Submit exitoso ---

    test('submits updated employee and calls onEmployeeUpdated', async () => {
        EmployeeService.getEmployeeById.mockResolvedValue({
            data: { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }
        });
        EmployeeService.updateEmployee.mockResolvedValue({ data: {} });

        render(<EmployeeEdit employeeId={1} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        await waitFor(() => screen.getByDisplayValue('John Smith'));

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.click(screen.getByText('Update'));

        await waitFor(() => {
            expect(EmployeeService.updateEmployee).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Jane Doe' }));
            expect(mockOnUpdated).toHaveBeenCalled();
        });
    });

    // --- Botón Cancel ---

    test('calls onCancel when Cancel button clicked', async () => {
        EmployeeService.getEmployeeById.mockResolvedValue({
            data: { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }
        });

        render(<EmployeeEdit employeeId={1} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    // --- Error al cargar empleado ---

    test('handles load error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.getEmployeeById.mockRejectedValue(new Error('Not found'));

        render(<EmployeeEdit employeeId={99} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error loading employee:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    // --- Error al actualizar ---

    test('handles update error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.getEmployeeById.mockResolvedValue({
            data: { idEmployee: 1, name: 'John Smith', department: 'Engineering', salary: 3500 }
        });
        EmployeeService.updateEmployee.mockRejectedValue(new Error('Update failed'));

        render(<EmployeeEdit employeeId={1} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        await waitFor(() => screen.getByDisplayValue('John Smith'));
        fireEvent.click(screen.getByText('Update'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error updating employee:', expect.any(Error));
            expect(mockOnUpdated).not.toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    // --- ID no existente ---

    test('renders form even when employeeId does not exist', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EmployeeService.getEmployeeById.mockRejectedValue(new Error('404 Not Found'));

        render(<EmployeeEdit employeeId={999} onEmployeeUpdated={mockOnUpdated} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByText('Edit Employee')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });
});