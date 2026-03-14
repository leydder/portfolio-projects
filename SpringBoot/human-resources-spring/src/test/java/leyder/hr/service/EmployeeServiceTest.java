package leyder.hr.service;

import leyder.hr.model.Employee;
import leyder.hr.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee(1, "John Smith", "Engineering", 3500.0);
    }

    // --- employeeList ---

    @Test
    void employeeList_returnsAllEmployees() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        List<Employee> result = employeeService.employeeList();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("John Smith");
    }

    @Test
    void employeeList_returnsEmptyList_whenNoEmployees() {
        when(employeeRepository.findAll()).thenReturn(Collections.emptyList());

        List<Employee> result = employeeService.employeeList();

        assertThat(result).isEmpty();
    }

    // --- searchEmployeeById ---

    @Test
    void searchEmployeeById_returnsEmployee_whenExists() {
        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee));

        Employee result = employeeService.searchEmployeeById(1);

        assertThat(result).isNotNull();
        assertThat(result.getIdEmployee()).isEqualTo(1);
    }

    @Test
    void searchEmployeeById_returnsNull_whenNotExists() {
        when(employeeRepository.findById(99)).thenReturn(Optional.empty());

        Employee result = employeeService.searchEmployeeById(99);

        assertThat(result).isNull();
    }

    @Test
    void searchEmployeeById_returnsNull_whenIdIsNull() {
        when(employeeRepository.findById(null)).thenReturn(Optional.empty());

        Employee result = employeeService.searchEmployeeById(null);

        assertThat(result).isNull();
    }

    // --- saveEmployee ---

    @Test
    void saveEmployee_savesAndReturnsEmployee() {
        when(employeeRepository.save(employee)).thenReturn(employee);

        Employee result = employeeService.saveEmployee(employee);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John Smith");
        verify(employeeRepository, times(1)).save(employee);
    }

    // --- deleteEmployee ---

    @Test
    void deleteEmployee_callsRepositoryDelete() {
        doNothing().when(employeeRepository).delete(employee);

        employeeService.deleteEmployee(employee);

        verify(employeeRepository, times(1)).delete(employee);
    }
}