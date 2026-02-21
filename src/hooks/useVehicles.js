import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { mockVehicles, CERT_WARNING_DAYS } from '../data/mockVehicles';

// import * as vehicleAPI from '../api/vehicles.api'; // ← swap when backend ready

const useVehicles = () => {
  const [vehicles,     setVehicles]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType,   setFilterType]   = useState('All');
  const [filterExpiry, setFilterExpiry] = useState('All'); // All | Expired | Expiring | Valid
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
        setVehicles(mockVehicles);
        // ── API ─────────────────────────────────────────────────────────
        // const data = await vehicleAPI.getAll();
        // setVehicles(data);
      } catch {
        toast.error('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Certificate expiry helper ─────────────────────────────────────────────
  const getCertStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const today    = new Date();
    const expiry   = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)                   return 'expired';
    if (diffDays <= CERT_WARNING_DAYS)  return 'expiring';
    return 'valid';
  };

  // Check if ANY certificate is expired or expiring
  const getVehicleExpiryStatus = (v) => {
    const dates = [
      v.rcExpiry, v.insuranceValidity,
      v.pucExpiry, v.fitnessCertExpiry, v.permitExpiry,
    ];
    const statuses = dates.map(getCertStatus);
    if (statuses.includes('expired'))  return 'expired';
    if (statuses.includes('expiring')) return 'expiring';
    return 'valid';
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const q = search.toLowerCase();

      const matchSearch =
        v.vehicleNumber.toLowerCase().includes(q)  ||
        v.vehicleModel.toLowerCase().includes(q)   ||
        v.ownerName.toLowerCase().includes(q)      ||
        v.rcNumber.toLowerCase().includes(q)       ||
        v.vehicleType.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'All' || v.status === filterStatus;
      const matchType   = filterType   === 'All' || v.vehicleType === filterType;

      const vExpStatus  = getVehicleExpiryStatus(v);
      const matchExpiry =
        filterExpiry === 'All'      ? true :
        filterExpiry === 'Expired'  ? vExpStatus === 'expired'  :
        filterExpiry === 'Expiring' ? vExpStatus === 'expiring' :
        filterExpiry === 'Valid'    ? vExpStatus === 'valid'     : true;

      // ── Insurance Validity date range filter ──────────────────────────
      const insDate   = v.insuranceValidity ? new Date(v.insuranceValidity) : null;
      const matchFrom = !dateFrom || (insDate && insDate >= new Date(dateFrom));
      const matchTo   = !dateTo   || (insDate && insDate <= new Date(dateTo));

      return matchSearch && matchStatus && matchType && matchExpiry && matchFrom && matchTo;
    });
  }, [vehicles, search, filterStatus, filterType, filterExpiry, dateFrom, dateTo]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total:    vehicles.length,
      active:   vehicles.filter(v => v.status === 'Active').length,
      expired:  vehicles.filter(v => getVehicleExpiryStatus(v) === 'expired').length,
      expiring: vehicles.filter(v => getVehicleExpiryStatus(v) === 'expiring').length,
    };
  }, [vehicles]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ────────────────────────────────────────────────────────────
      const newVehicle = { ...formData, id: Date.now() };
      setVehicles(prev => [newVehicle, ...prev]);
      // ── API ─────────────────────────────────────────────────────────────
      // const saved = await vehicleAPI.create(formData);
      // setVehicles(prev => [saved, ...prev]);
      toast.success('Vehicle added successfully!');
      setAddModal(false);
    } catch {
      toast.error('Failed to add vehicle');
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ────────────────────────────────────────────────────────────
      setVehicles(prev => prev.map(v => v.id === formData.id ? formData : v));
      // ── API ─────────────────────────────────────────────────────────────
      // const updated = await vehicleAPI.update(formData.id, formData);
      // setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
      toast.success('Vehicle updated successfully!');
      setEditModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to update vehicle');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ────────────────────────────────────────────────────────────
      setVehicles(prev => prev.filter(v => v.id !== selected.id));
      // ── API ─────────────────────────────────────────────────────────────
      // await vehicleAPI.remove(selected.id);
      // setVehicles(prev => prev.filter(v => v.id !== selected.id));
      toast.success('Vehicle deleted successfully!');
      setDeleteModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to delete vehicle');
    }
  };

  // ── Toggle status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (vehicle) => {
    const newStatus = vehicle.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await new Promise(r => setTimeout(r, 300));
      setVehicles(prev =>
        prev.map(v => v.id === vehicle.id ? { ...v, status: newStatus } : v)
      );
      toast.success(`Vehicle marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return {
    vehicles: filtered,
    allVehicles: vehicles,
    loading,
    stats,
    search,       setSearch,
    filterStatus, setFilterStatus,
    filterType,   setFilterType,
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
    getCertStatus,
    getVehicleExpiryStatus,
  };
};

export default useVehicles;
