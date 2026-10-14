package com.aditya.employeemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 150, message = "Email must be at most 150 characters")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Department is required")
    @Size(max = 100, message = "Department must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String department;

    @PositiveOrZero(message = "Salary cannot be negative")
    private double salary;

    public Employee() {}

    public Employee(String name, String email, String department, double salary) {
        this.name = name;
        this.email = email;
        this.department = department;
        this.salary = salary;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setDepartment(String department) { this.department = department; }
    public void setSalary(double salary) { this.salary = salary; }
}
