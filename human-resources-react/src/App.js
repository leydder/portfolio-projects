import React, { useRef, useState } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeEdit from './components/EmployeeEdit';

function App() {
    const employeeListRef = useRef();
    const [editingId, setEditingId] = useState(null);

    const handleEmployeeCreated = () => {
        employeeListRef.current.loadEmployees();
    };

    const handleEmployeeUpdated = () => {
        setEditingId(null);
        employeeListRef.current.loadEmployees();
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Human Resources</h1>

            {editingId ? (
                <EmployeeEdit
                    employeeId={editingId}
                    onEmployeeUpdated={handleEmployeeUpdated}
                    onCancel={() => setEditingId(null)}
                />
            ) : (
                <EmployeeForm onEmployeeCreated={handleEmployeeCreated} />
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