package leyder.hr.service;

import leyder.hr.model.Employee;
import java.util.List;

public interface IEmployeeService {
    public List<Employee> employeeList();
    public Employee searchEmployeeById(Integer idEmployee);
    public Employee saveEmployee(Employee employee);
    public void deleteEmployee(Employee employee);
}