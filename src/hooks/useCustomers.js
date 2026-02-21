import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { mockCustomers } from '../data/mockCustomers';

// import * as customerAPI from '../api/customers.api'; // ← swap when backend ready

const useCustomers = () => {
  const [customers,   setCustomers]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('All');   // All | Individual | Business
  const [filterStatus,setFilterStatus]= useState('All');   // All | Active | Inactive | Blocked

  // ── Modals ──────────────────────────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [viewModal,   setViewModal]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected,    setSelected]    = useState(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        // ── MOCK ────────────────────────────────────────────────────────────
        setCustomers(mockCustomers);
        // ── API ─────────────────────────────────────────────────────────────
        // const data = await customerAPI.getAll();
        // setCustomers(data);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        c.customerName.toLowerCase().includes(q)    ||
        c.mobileNumber.includes(q)                  ||
        c.email.toLowerCase().includes(q)           ||
        c.businessName?.toLowerCase().includes(q);
      const matchType   = filterType   === 'All' || c.customerType === filterType;
      const matchStatus = filterStatus === 'All' || c.status       === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [customers, search, filterType, filterStatus]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      customers.length,
    active:     customers.filter(c => c.status === 'Active').length,
    individual: customers.filter(c => c.customerType === 'Individual').length,
    business:   customers.filter(c => c.customerType === 'Business').length,
  }), [customers]);

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      const newCustomer = { ...formData, id: Date.now() };
      setCustomers(prev => [newCustomer, ...prev]);
      // ── API ───────────────────────────────────────────────────────────────
      // const saved = await customerAPI.create(formData);
      // setCustomers(prev => [saved, ...prev]);
      toast.success('Customer added successfully!');
      setAddModal(false);
    } catch {
      toast.error('Failed to add customer');
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      setCustomers(prev => prev.map(c => c.id === formData.id ? formData : c));
      // ── API ───────────────────────────────────────────────────────────────
      // const updated = await customerAPI.update(formData.id, formData);
      // setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success('Customer updated successfully!');
      setEditModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to update customer');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      setCustomers(prev => prev.filter(c => c.id !== selected.id));
      // ── API ───────────────────────────────────────────────────────────────
      // await customerAPI.remove(selected.id);
      // setCustomers(prev => prev.filter(c => c.id !== selected.id));
      toast.success('Customer deleted successfully!');
      setDeleteModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  // ── Toggle status ────────────────────────────────────────────────────────
  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await new Promise(r => setTimeout(r, 300));
      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? { ...c, status: newStatus } : c)
      );
      toast.success(`Customer marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return {
    customers: filtered,
    loading,
    stats,
    search,      setSearch,
    filterType,  setFilterType,
    filterStatus,setFilterStatus,
    // modal state
    addModal,    setAddModal,
    editModal,   setEditModal,
    viewModal,   setViewModal,
    deleteModal, setDeleteModal,
    selected,    setSelected,
    // actions
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  };
};

export default useCustomers;
