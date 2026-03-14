package leyder.hr.controller;

import leyder.hr.exception.ResourceNotFoundException;
import leyder.hr.model.Employee;
import leyder.hr.service.IEmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeControllerTest {

    @Mock
    private IEmployeeService employeeService;

    @InjectMocks
    private EmployeeController employeeController;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee(1, "John Smith", "Engineering", 3500.0);
    }

    // --- GET /employee ---

    @Test
    void getEmployee_returnsListOfEmployees() {
        when(employeeService.employeeList()).thenReturn(List.of(employee));

        List<Employee> result = employeeController.getEmployee();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("John Smith");
    }

    @Test
    void getEmployee_returnsEmptyList_whenNoEmployees() {
        when(employeeService.employeeList()).thenReturn(Collections.emptyList());

        List<Employee> result = employeeController.getEmployee();

        assertThat(result).isEmpty();
    }

    // --- GET /employee/{id} ---

    @Test
    void getEmployeeById_returnsEmployee_whenExists() {
        when(employeeService.searchEmployeeById(1)).thenReturn(employee);

        ResponseEntity<Employee> response = employeeController.getEmployeeById(1);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("John Smith");
    }

    @Test
    void getEmployeeById_throws404_whenNotExists() {
        when(employeeService.searchEmployeeById(99)).thenReturn(null);

        assertThatThrownBy(() -> employeeController.getEmployeeById(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getEmployeeById_throws404_whenIdIsNull() {
        when(employeeService.searchEmployeeById(null)).thenReturn(null);

        assertThatThrownBy(() -> employeeController.getEmployeeById(null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- POST /employee ---

    @Test
    void saveEmployee_createsAndReturnsEmployee() {
        when(employeeService.saveEmployee(any(Employee.class))).thenReturn(employee);

        Employee result = employeeController.saveEmployee(employee);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John Smith");
        verify(employeeService, times(1)).saveEmployee(employee);
    }

    @Test
    void saveEmployee_withNullFields_stillDelegates() {
        Employee emptyEmployee = new Employee(null, null, null, null);
        when(employeeService.saveEmployee(any(Employee.class))).thenReturn(emptyEmployee);

        Employee result = employeeController.saveEmployee(emptyEmployee);

        assertThat(result).isNotNull();
    }

    // --- PUT /employee/{id} ---

    @Test
    void updateEmployee_updatesEmployee_whenExists() {
        Employee updated = new Employee(1, "Jane Doe", "HR", 4000.0);
        when(employeeService.searchEmployeeById(1)).thenReturn(employee);
        when(employeeService.saveEmployee(any(Employee.class))).thenReturn(updated);

        ResponseEntity<Employee> response = employeeController.updateEmployee(1, updated);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Jane Doe");
    }

    @Test
    void updateEmployee_throws404_whenNotExists() {
        when(employeeService.searchEmployeeById(99)).thenReturn(null);

        assertThatThrownBy(() -> employeeController.updateEmployee(99, employee))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // --- DELETE /employee/{id} ---

    @Test
    void deleteEmployee_returns200WithConfirmation_whenExists() {
        when(employeeService.searchEmployeeById(1)).thenReturn(employee);
        doNothing().when(employeeService).deleteEmployee(employee);

        ResponseEntity<Map<String, Boolean>> response = employeeController.deleteEmployee(1);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).containsEntry("deleted", true);
        verify(employeeService, times(1)).deleteEmployee(employee);
    }

    @Test
    void deleteEmployee_throws404_whenNotExists() {
        when(employeeService.searchEmployeeById(99)).thenReturn(null);

        assertThatThrownBy(() -> employeeController.deleteEmployee(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}