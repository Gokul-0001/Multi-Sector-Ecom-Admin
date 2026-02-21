import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { mockDrivers, LICENSE_WARNING_DAYS } from '../data/mockDrivers';

// import * as driverAPI from '../api/drivers.api'; // ← swap when backend ready

const useDrivers = () => {
  const [drivers,      setDrivers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterExpiry, setFilterExpiry] = useState('All');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');

  // ── Modal states ──────────────────────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [viewModal,   setViewModal]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected,    setSelected]    = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        // ── MOCK ────────────────────────────────────────────────────────
        setDrivers(mockDrivers);
        // ── API ─────────────────────────────────────────────────────────
        // const data = await driverAPI.getAll();
        // setDrivers(data);
      } catch {
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── License expiry helper ─────────────────────────────────────────────────
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const today    = new Date();
    const expiry   = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)                     return 'expired';
    if (diffDays <= LICENSE_WARNING_DAYS) return 'expiring';
    return 'valid';
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const q = search.toLowerCase();

      const matchSearch =
        d.driverName.toLowerCase().includes(q)     ||
        d.mobileNumber.includes(q)                 ||
        d.drivingLicense.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'All' || d.status === filterStatus;

      const expStatus   = getExpiryStatus(d.licenseExpiry);
      const matchExpiry =
        filterExpiry === 'All'      ? true :
        filterExpiry === 'Expired'  ? expStatus === 'expired'  :
        filterExpiry === 'Expiring' ? expStatus === 'expiring' :
        filterExpiry === 'Valid'    ? expStatus === 'valid'     : true;

      // ── Date of Joining filter ────────────────────────────────────────
      const joined    = d.dateOfJoining ? new Date(d.dateOfJoining) : null;
      const matchFrom = !dateFrom || (joined && joined >= new Date(dateFrom));
      const matchTo   = !dateTo   || (joined && joined <= new Date(dateTo));

      return matchSearch && matchStatus && matchExpiry && matchFrom && matchTo;
    });
  }, [drivers, search, filterStatus, filterExpiry, dateFrom, dateTo]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = new Date();
    return {
      total:    drivers.length,
      active:   drivers.filter(d => d.status === 'Active').length,
      expired:  drivers.filter(d => {
        if (!d.licenseExpiry) return false;
        return new Date(d.licenseExpiry) < today;
      }).length,
      expiring: drivers.filter(d => {
        if (!d.licenseExpiry) return false;
        const diff = Math.ceil(
          (new Date(d.licenseExpiry) - today) / (1000 * 60 * 60 * 24)
        );
        return diff >= 0 && diff <= LICENSE_WARNING_DAYS;
      }).length,
    };
  }, [drivers]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────
      const newDriver = { ...formData, id: Date.now() };
      setDrivers(prev => [newDriver, ...prev]);
      // ── API ───────────────────────────────────────────────────────────
      // const saved = await driverAPI.create(formData);
      // setDrivers(prev => [saved, ...prev]);
      toast.success('Driver added successfully!');
      setAddModal(false);
    } catch {
      toast.error('Failed to add driver');
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────
      setDrivers(prev => prev.map(d => d.id === formData.id ? formData : d));
      // ── API ───────────────────────────────────────────────────────────
      // const updated = await driverAPI.update(formData.id, formData);
      // setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
      toast.success('Driver updated successfully!');
      setEditModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to update driver');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────
      setDrivers(prev => prev.filter(d => d.id !== selected.id));
      // ── API ───────────────────────────────────────────────────────────
      // await driverAPI.remove(selected.id);
      // setDrivers(prev => prev.filter(d => d.id !== selected.id));
      toast.success('Driver deleted successfully!');
      setDeleteModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to delete driver');
    }
  };

  // ── Toggle status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (driver) => {
    const newStatus = driver.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await new Promise(r => setTimeout(r, 300));
      setDrivers(prev =>
        prev.map(d => d.id === driver.id ? { ...d, status: newStatus } : d)
      );
      toast.success(`Driver marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return {
    drivers: filtered,
    loading,
    stats,
    search,       setSearch,
    filterStatus, setFilterStatus,
    filterExpiry, setFilterExpiry,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,
    // modal states
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
    getExpiryStatus,
  };
};

export default useDrivers;
