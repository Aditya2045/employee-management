package com.aditya.employeemanagement.repository;

import com.aditya.employeemanagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<Employee> findByEmailIgnoreCase(String email);
}
