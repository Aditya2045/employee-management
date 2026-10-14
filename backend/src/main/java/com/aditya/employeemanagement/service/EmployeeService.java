package com.aditya.employeemanagement.service;

import com.aditya.employeemanagement.entity.Employee;
import com.aditya.employeemanagement.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    public Employee createEmployee(Employee employee) {
        if (repository.existsByEmailIgnoreCase(employee.getEmail())) {
            throw new DuplicateEmailException(employee.getEmail());
        }
        employee.setId(null);
        return repository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updated) {
        Employee existing = getEmployeeById(id);
        repository.findByEmailIgnoreCase(updated.getEmail())
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw new DuplicateEmailException(updated.getEmail());
                });

        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setDepartment(updated.getDepartment());
        existing.setSalary(updated.getSalary());
        return repository.save(existing);
    }

    public void deleteEmployee(Long id) {
        Employee existing = getEmployeeById(id);
        repository.delete(existing);
    }
}
