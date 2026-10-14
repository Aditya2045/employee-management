import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee
} from "./api.js";

const EMPTY_FORM = { name: "", email: "", department: "", salary: "" };

function Icon({ name, size = 18 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true
  };
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18m-5 5h.01"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/></>
  };
  return <svg {...common}>{paths[name] || paths.users}</svg>;
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong.";
}

function EmployeeForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? {
      name: initial.name,
      email: initial.email,
      department: initial.department,
      salary: String(initial.salary)
    } : EMPTY_FORM);
    setErrors({});
  }, [initial]);

  function change(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setErrors((current) => ({ ...current, [e.target.name]: "" }));
  }

  async function submit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (!form.department.trim()) nextErrors.department = "Department is required.";
    if (form.salary === "" || Number(form.salary) < 0) nextErrors.salary = "Enter a non-negative salary.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      salary: Number(form.salary)
    });
  }

  return (
    <form className="employee-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Full name
          <input name="name" value={form.name} onChange={change} placeholder="e.g. Aditi Sharma" maxLength="100" />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>
        <label>Email address
          <input name="email" type="email" value={form.email} onChange={change} placeholder="e.g. aditi@company.com" maxLength="150" />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>
        <label>Department
          <input name="department" value={form.department} onChange={change} placeholder="e.g. Engineering" maxLength="100" />
          {errors.department && <small className="field-error">{errors.department}</small>}
        </label>
        <label>Annual salary (₹)
          <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={change} placeholder="e.g. 450000" />
          {errors.salary && <small className="field-error">{errors.salary}</small>}
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          <Icon name="plus" size={17} /> {saving ? "Saving..." : initial ? "Save changes" : "Add employee"}
        </button>
        {initial && <button className="btn btn-quiet" type="button" onClick={onCancel}><Icon name="close" size={16}/> Cancel</button>}
      </div>
    </form>
  );
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response.data);
      setError("");
    } catch (err) {
      setError(`Could not connect to the backend. ${getErrorMessage(err)} Check that PostgreSQL and Spring Boot are running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesDepartment = department === "all" || employee.department === department;
      const matchesSearch = !query || [employee.name, employee.email, employee.department]
        .some((value) => value.toLowerCase().includes(query));
      return matchesDepartment && matchesSearch;
    });
  }, [employees, search, department]);

  const totalSalary = employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0);
  const averageSalary = employees.length ? totalSalary / employees.length : 0;
  const money = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(value);

  async function saveEmployee(employee) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editing) {
        await updateEmployee(editing.id, employee);
        setNotice("Employee details updated successfully.");
      } else {
        await createEmployee(employee);
        setNotice("Employee added successfully.");
      }
      setEditing(null);
      setShowForm(false);
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employee) {
    if (!window.confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteEmployee(employee.id);
      setNotice(`${employee.name} was deleted.`);
      if (editing?.id === employee.id) {
        setEditing(null);
        setShowForm(false);
      }
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function beginEdit(employee) {
    setEditing(employee);
    setShowForm(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function beginAdd() {
    setEditing(null);
    setShowForm(true);
    setError("");
    setNotice("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="users" size={23}/></span><span>People<span className="brand-light">Desk</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><Icon name="users"/> Employees <span className="nav-count">{employees.length}</span></div>
        <div className="sidebar-note"><div className="note-icon"><Icon name="building" size={19}/></div><strong>People operations</strong><p>A simple, organized space to manage your team.</p></div>
        <div className="sidebar-bottom"><span className="status-dot"/> Local development <span className="version">v1.0</span></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><div className="breadcrumb">Workspace <span>/</span> Employees</div><div className="page-eyebrow">PEOPLE OPERATIONS</div></div>
          <div className="topbar-right"><span className="api-status"><span className="status-dot"/> API connected when backend is running</span><div className="avatar">AS</div></div>
        </header>

        <section className="page-heading">
          <div><h1>Employee management</h1><p>Keep your employee records clear, current, and in one place.</p></div>
          <button className="btn btn-primary add-top" onClick={beginAdd}><Icon name="plus"/> Add employee</button>
        </section>

        {error && <div className="alert alert-error" role="alert"><strong>Something needs attention</strong><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><Icon name="close"/></button></div>}
        {notice && <div className="alert alert-success" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><Icon name="close"/></button></div>}

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Total employees</span><span className="stat-icon blue"><Icon name="users"/></span></div><div className="stat-value">{employees.length}</div><div className="stat-foot">Records in your directory</div></article>
          <article className="stat-card"><div className="stat-top"><span>Departments</span><span className="stat-icon violet"><Icon name="building"/></span></div><div className="stat-value">{departments.length}</div><div className="stat-foot">Unique departments</div></article>
          <article className="stat-card"><div className="stat-top"><span>Total annual payroll</span><span className="stat-icon green"><Icon name="wallet"/></span></div><div className="stat-value stat-money">{money(totalSalary)}</div><div className="stat-foot">Combined listed salaries</div></article>
          <article className="stat-card"><div className="stat-top"><span>Average salary</span><span className="stat-icon amber"><Icon name="wallet"/></span></div><div className="stat-value stat-money">{money(averageSalary)}</div><div className="stat-foot">Average per employee</div></article>
        </section>

        {showForm && <section className="panel form-panel"><div className="panel-heading"><div><h2>{editing ? "Edit employee" : "Add a new employee"}</h2><p>Enter the details below. Fields marked with required information must be completed.</p></div><button className="icon-btn" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close form"><Icon name="close"/></button></div><EmployeeForm key={editing?.id ?? "new"} initial={editing} onSubmit={saveEmployee} onCancel={() => { setShowForm(false); setEditing(null); }} saving={saving}/></section>}

        <section className="panel directory-panel">
          <div className="panel-heading directory-heading"><div><h2>Employee directory</h2><p>Browse, search, and manage your employee records.</p></div><button className="btn btn-secondary" onClick={loadEmployees} disabled={loading}><Icon name="refresh" size={16}/> Refresh</button></div>
          <div className="toolbar">
            <label className="search-box"><Icon name="search" size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, department..." aria-label="Search employees"/></label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Filter by department"><option value="all">All departments</option>{departments.map((name) => <option key={name} value={name}>{name}</option>)}</select>
            <span className="result-count">{filteredEmployees.length} result{filteredEmployees.length === 1 ? "" : "s"}</span>
          </div>
          <div className="table-wrap">
            <table className="employee-table">
              <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>ANNUAL SALARY</th><th className="actions-heading">ACTIONS</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="empty-state"><span className="spinner"/> Loading employee records...</td></tr>
                  : filteredEmployees.length === 0 ? <tr><td colSpan="4" className="empty-state"><div className="empty-icon"><Icon name="users" size={25}/></div><strong>{employees.length ? "No matching employees" : "Your directory is ready"}</strong><span>{employees.length ? "Try another search or department filter." : "Add your first employee to get started."}</span>{!employees.length && <button className="btn btn-primary" onClick={beginAdd}><Icon name="plus" size={16}/> Add first employee</button>}</td></tr>
                  : filteredEmployees.map((employee) => <tr key={employee.id}><td><div className="employee-cell"><div className="employee-avatar">{employee.name.trim().split(/\s+/).slice(0,2).map((s) => s[0]).join("").toUpperCase()}</div><div><strong>{employee.name}</strong><span><Icon name="mail" size={13}/>{employee.email}</span></div></div></td><td><span className="department-pill">{employee.department}</span></td><td className="salary-cell">{money(employee.salary)}</td><td><div className="row-actions"><button className="icon-btn edit-btn" onClick={() => beginEdit(employee)} aria-label={`Edit ${employee.name}`} title="Edit"><Icon name="edit" size={16}/></button><button className="icon-btn delete-btn" onClick={() => removeEmployee(employee)} aria-label={`Delete ${employee.name}`} title="Delete"><Icon name="trash" size={16}/></button></div></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="table-footer"><span>Showing {filteredEmployees.length} of {employees.length} employee records</span><span>Changes save to PostgreSQL</span></div>
        </section>
        <footer className="footer">PeopleDesk <span>·</span> Employee Management System <span>·</span> Built with React & Spring Boot</footer>
      </main>
    </div>
  );
}

export default App;
