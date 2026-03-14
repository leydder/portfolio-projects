import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import EmployeeService from '../services/EmployeeService';

const EmployeeList = forwardRef(({ onEdit }, ref) => {
    const [employees, setEmployees] = useState([]);

    useImperativeHandle(ref, () => ({
        loadEmployees
    }));

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        EmployeeService.getEmployees()
            .then(response => setEmployees(response.data))
            .catch(error => console.error('Error loading employees:', error));
    };

    const handleDelete = (id) => {
        EmployeeService.deleteEmployee(id)
            .then(() => loadEmployees())
            .catch(error => console.error('Error deleting employee:', error));
    };

    return (
        <div>
            <h2 className="mb-3">Employees</h2>
            <table className="table table-striped table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.idEmployee}>
                            <td>{employee.idEmployee}</td>
                            <td>{employee.name}</td>
                            <td>{employee.department}</td>
                            <td>${employee.salary}</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => onEdit(employee.idEmployee)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(employee.idEmployee)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default EmployeeList;