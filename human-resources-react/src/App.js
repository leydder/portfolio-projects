import React, { useRef, useState } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeEdit from './components/EmployeeEdit';
import Login from './components/Login';

function App() {
    const employeeListRef = useRef();
    const [editingId, setEditingId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const handleLogin = () => setIsAuthenticated(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Human Resources</h1>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </div>

            {editingId ? (
                <EmployeeEdit
                    employeeId={editingId}
                    onEmployeeUpdated={() => {
                        setEditingId(null);
                        employeeListRef.current.loadEmployees();
                    }}
                    onCancel={() => setEditingId(null)}
                />
            ) : (
                <EmployeeForm onEmployeeCreated={() => employeeListRef.current.loadEmployees()} />
            )}

            <hr />
            <EmployeeList
                ref={employeeListRef}
                onEdit={(id) => setEditingId(id)}
            />
        </div>
    );
}

export default App;