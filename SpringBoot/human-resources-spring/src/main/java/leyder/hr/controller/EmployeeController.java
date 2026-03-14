package leyder.hr.controller;

import leyder.hr.exception.ResourceNotFoundException;
import leyder.hr.model.Employee;
import leyder.hr.service.IEmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("rh-app")
@CrossOrigin(value = "http://localhost:3000")
public class EmployeeController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private IEmployeeService employeeService;

    @GetMapping("/employee")
    public List<Employee> getEmployee() {
        var employees = employeeService.employeeList();
        employees.forEach(employee -> logger.info(employee.toString()));
        return employees;
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Integer id) {
        Employee employee = employeeService.searchEmployeeById(id);
        if (employee == null)
            throw new ResourceNotFoundException("Id not found: " + id);
        return ResponseEntity.ok(employee);
    }

    @PostMapping("/employee")
    public Employee saveEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    @PutMapping("/employee/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Integer id, @RequestBody Employee employee) {
        Employee employeeDb = employeeService.searchEmployeeById(id);
        if (employeeDb == null)
            throw new ResourceNotFoundException("Id not found: " + id);
        employeeDb.setName(employee.getName());
        employeeDb.setDepartment(employee.getDepartment());
        employeeDb.setSalary(employee.getSalary());
        employeeService.saveEmployee(employeeDb);
        return ResponseEntity.ok(employeeDb);
    }

    @DeleteMapping("/employee/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteEmployee(@PathVariable Integer id) {
        Employee employee = employeeService.searchEmployeeById(id);
        if (employee == null)
            throw new ResourceNotFoundException("Id not found: " + id);
        employeeService.deleteEmployee(employee);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
}