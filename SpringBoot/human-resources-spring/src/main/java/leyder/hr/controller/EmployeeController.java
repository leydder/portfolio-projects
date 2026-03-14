package leyder.hr.controller;


import leyder.hr.model.Employee;
import leyder.hr.service.IEmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("rh-app")
@CrossOrigin(value = "http://localhost:3000")
public class EmployeeController {
    private  static final Logger logger= LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private IEmployeeService employeeService;

    @GetMapping("/employee")
    public List<Employee> getEmployee(){
        var employees =employeeService.employeeList();
        employees.forEach((employee -> logger.info(employee.toString())));
        return employees;
    }
}
