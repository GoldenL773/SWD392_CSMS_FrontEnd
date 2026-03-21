import React, { useState, useMemo } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employeeApi.jsx';
import { register } from '../api/authApi.jsx';
import EmployeeCard from '../features/employees/EmployeeCard.jsx';
import EmployeeDetailView from '../features/employees/EmployeeDetailView.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import Button from '../components/common/Button/index.jsx';
import Modal from '../components/common/Modal/index.jsx';
import { Users, Plus, PencilSimple, Trash, Eye, EyeSlash } from '@phosphor-icons/react';
import { EMPLOYEE_POSITIONS } from '../utils/constants.jsx';
import './EmployeesPage.css';

const EmployeesPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [sortField, setSortField] = useState('lastName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const toast = useToast();

  const { data: employeesData, loading, refetch: refetchEmployees } = useApiQuery(getAllEmployees, { size: 1000 }, []);
  const employees = employeesData?.content || employeesData || [];

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', position: '', phone: '', address: '', userId: '', hireDate: '',
    username: '', password: '', email: '', baseSalary: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const openCreate = () => { 
    setEditingEmployee(null); 
    setFormData({ 
      firstName: '', lastName: '', position: '', phone: '', address: '', userId: '', hireDate: '',
      username: '', password: '', email: '', baseSalary: ''
    }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (emp) => { 
    setEditingEmployee(emp); 
    setFormData({ 
      firstName: emp.firstName || '', lastName: emp.lastName || '', position: emp.position || '', 
      phone: emp.phone || '', address: emp.address || '', userId: emp.userId || '', 
      hireDate: emp.hireDate || '', username: '', password: '', email: '',
      baseSalary: emp.baseSalary || ''
    }); 
    setIsModalOpen(true); 
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Manual validation since button onClick bypasses HTML5 form validation
    if (!formData.firstName || !formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.position) {
      toast.error('Position is required');
      return;
    }
    if (!formData.hireDate) {
      toast.error('Hire date is required');
      return;
    }

    try {
      // Clean up empty string values that will fail backend validation
      const payload = { ...formData };
      if (payload.baseSalary === '') payload.baseSalary = null;
      if (payload.userId === '') payload.userId = null;
      
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, { ...payload, userId: payload.userId ? parseInt(payload.userId) : null });
        toast.success('Employee updated successfully');
      } else {
        // 1. Register account first
        let finalUserId = payload.userId ? parseInt(payload.userId) : null;
        
        if (!finalUserId && formData.username && formData.password) {
          const roleMap = {
            'Manager': 'MANAGER',
            'Barista': 'BARISTA',
            'Cashier': 'STAFF',
            'Staff': 'STAFF',
            'Cleaner': 'STAFF',
            'Accountant': 'FINANCE'
          };
          
          const regResponse = await register({
            username: formData.username,
            password: formData.password,
            email: formData.email,
            roles: [roleMap[formData.position] || 'STAFF']
          });
          finalUserId = regResponse.userId || regResponse.id;
          toast.success('Account created successfully');
        }

        // 2. Create employee profile
        await createEmployee({ ...payload, userId: finalUserId });
        toast.success('Employee profile created successfully');
      }
      setIsModalOpen(false);
      refetchEmployees();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      setDeleteConfirmId(null);
      if (selectedEmployee?.id === id) setSelectedEmployee(null);
      refetchEmployees();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    const search = searchTerm.toLowerCase().trim();
    return employees.filter(emp =>
      emp.firstName?.toLowerCase().includes(search) ||
      emp.lastName?.toLowerCase().includes(search) ||
      emp.position?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.phone?.includes(search)
    );
  }, [employees, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const aVal = (a[sortField] || '').toString().toLowerCase();
      const bVal = (b[sortField] || '').toString().toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, sortField, sortDirection]);

  const paginatedEmployees = useMemo(() => {
    const start = page * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, page]);

  const totalPages = Math.ceil(sortedEmployees.length / pageSize);

  return (
    <div className="employees-page page-container">
      <div className="page-header">
        <div className="page-header-content">
          <Users size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Employee Management</h1>
            <p className="page-subtitle">Manage employee profiles, attendance, and salary</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate} className="btn-add">
          <Plus size={20} weight="bold" /> Add Employee
        </Button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'list' ? 'tab--active' : ''}`} onClick={() => setActiveTab('list')}>Employee List</button>
        <button className={`tab ${activeTab === 'manage' ? 'tab--active' : ''}`} onClick={() => setActiveTab('manage')}>Manage</button>
      </div>

      {activeTab === 'list' && (
        <div className="employees-layout">
          <div className="employees-list">
            <div className="employees-list-header">
              <h2>Employees ({filteredEmployees?.length || 0})</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')} aria-label="Clear search">✕</button>
                )}
              </div>
            </div>
            {loading && (<div className="loading-container"><div className="loading"></div><p>Loading employees...</p></div>)}
            {!loading && filteredEmployees && filteredEmployees.length > 0 && (
              <div className="employees-grid">
                {filteredEmployees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} onSelect={setSelectedEmployee} isSelected={selectedEmployee?.id === employee.id} />
                ))}
              </div>
            )}
            {!loading && (!filteredEmployees || filteredEmployees.length === 0) && (
              <div className="empty-state">
                <p>{searchTerm ? 'No employees match your search' : 'No employees found'}</p>
              </div>
            )}
          </div>
          <div className="employee-detail-panel">
            {selectedEmployee ? (
              <EmployeeDetailView employee={selectedEmployee} />
            ) : (
              <div className="no-selection card"><p>Select an employee to view details</p></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="employees-manage-table table-container">
          {loading && (<div className="loading-container"><div className="loading"></div><p>Loading...</p></div>)}
          {!loading && (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('firstName')} className="sortable">
                      Name {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('position')} className="sortable">
                      Position {sortField === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('phone')} className="sortable">
                      Phone {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('hireDate')} className="sortable">
                      Hire Date {sortField === 'hireDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.position}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.hireDate}</td>
                      <td className="actions-cell text-center">
                        <button className="btn-icon" onClick={() => openEdit(emp)} title="Edit">
                          <PencilSimple size={20}/>
                        </button>
                        <button className="btn-icon btn-danger" onClick={() => setDeleteConfirmId(emp.id)} title="Delete">
                          <Trash size={20}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-controls">
                <Button variant="secondary" size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>&lt; Previous</Button>
                <span className="page-info">Page {page + 1} of {totalPages || 1}</span>
                <Button variant="secondary" size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next &gt;</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="medium"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>{editingEmployee ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input 
                required 
                className="form-input"
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input 
                required 
                className="form-input"
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Position *</label>
            <select 
              required 
              className="form-select"
              value={formData.position} 
              onChange={e => setFormData({...formData, position: e.target.value})}
            >
              <option value="">-- Select Position --</option>
              {EMPLOYEE_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input 
                className="form-input"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hire Date *</label>
              <input 
                type="date" 
                required
                className="form-input"
                value={formData.hireDate} 
                onChange={e => setFormData({...formData, hireDate: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea 
              className="form-textarea"
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              rows={2} 
            />
          </div>
          
          {!editingEmployee && (
            <div className="account-section">
              <h4 className="section-title">Account Settings</h4>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input 
                  required
                  className="form-input"
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  placeholder="System login username" 
                />
              </div>
              <div className="form-group password-group">
                <label className="form-label">Password *</label>
                <div className="password-input-wrapper">
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder="Secure password" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="employee@example.com" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Base Salary (VND) *</label>
                <input 
                  type="number" 
                  required
                  className="form-input"
                  value={formData.baseSalary} 
                  onChange={e => setFormData({...formData, baseSalary: e.target.value})} 
                  placeholder="e.g. 5000000" 
                />
              </div>
              <div className="divider"><span>OR</span></div>
              <div className="form-group">
                <label className="form-label">Link existing User ID</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={formData.userId} 
                  onChange={e => setFormData({...formData, userId: e.target.value})} 
                  placeholder="User ID" 
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete"
        size="small"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>Delete</Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
      </Modal>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default EmployeesPage;
