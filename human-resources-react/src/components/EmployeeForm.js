import React, { useState } from 'react';
import EmployeeService from '../services/EmployeeService';

const EmployeeForm = ({ onEmployeeCreated }) => {
    const [employee, setEmployee] = useState({
        name: '',
        department: '',
        salary: ''
    });

    const handleChange = (e) => {
        setEmployee({ ...employee, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        EmployeeService.createEmployee(employee)
            .then(() => {
                onEmployeeCreated();
                setEmployee({ name: '', department: '', salary: '' });
            })
            .catch(error => console.error('Error creating employee:', error));
    };

    return (
        <div className="card p-4 mb-4">
            <h2 className="mb-3">Add Employee</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        id="name"
                        type="text"
                        className="form-control"
                        name="name"
                        value={employee.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input
                        id="department"
                        type="text"
                        className="form-control"
                        name="department"
                        value={employee.department}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="salary" className="form-label">Salary</label>
                    <input
                        id="salary"
                        type="number"
                        className="form-control"
                        name="salary"
                        value={employee.salary}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Save</button>
            </form>
        </div>
    );
};

export default EmployeeForm;