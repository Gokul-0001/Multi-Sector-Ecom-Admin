import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { mockCoupons } from '../data/mockCoupons';

// import * as couponAPI from '../api/coupons.api'; // ← swap when backend ready

const useCoupons = () => {

  // ── Raw data ──────────────────────────────────────────────────────────────
  const [coupons,      setCoupons]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  // ── Main list filters ─────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType,   setFilterType]   = useState('All');
  const [filterFor,    setFilterFor]    = useState('All');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');

  // ── Breakdown filters ─────────────────────────────────────────────────────
  const [bdSearch,  setBdSearch]  = useState('');
  const [bdSort,    setBdSort]    = useState('used_desc');
  const [bdHealth,  setBdHealth]  = useState('All');
  const [bdPage,    setBdPage]    = useState(1);

  // ── Modal states ──────────────────────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [viewModal,   setViewModal]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected,    setSelected]    = useState(null);

  // ════════════════════════════════════════════════════════════════════════════
  // LOAD
  // ════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        // ── MOCK ──────────────────────────────────────────────────────────
        setCoupons(mockCoupons);
        // ── API ───────────────────────────────────────────────────────────
        // const data = await couponAPI.getAll();
        // setCoupons(data);
      } catch {
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // COMPUTED STATUS
  // ════════════════════════════════════════════════════════════════════════════

  const getComputedStatus = (coupon) => {
    if (coupon.status === 'Inactive') return 'Inactive';
    const today  = new Date();
    const expiry = new Date(coupon.expiryDate);
    const start  = new Date(coupon.startDate);
    if (expiry < today) return 'Expired';
    if (start  > today) return 'Scheduled';
    if (coupon.totalUsageLimit &&
        coupon.totalUsedCount >= coupon.totalUsageLimit) return 'Exhausted';
    return 'Active';
  };

  // ════════════════════════════════════════════════════════════════════════════
  // STATS
  // ════════════════════════════════════════════════════════════════════════════

  const stats = useMemo(() => ({
    total:     coupons.length,
    active:    coupons.filter(c => getComputedStatus(c) === 'Active').length,
    expired:   coupons.filter(c => getComputedStatus(c) === 'Expired').length,
    exhausted: coupons.filter(c =>
      c.totalUsageLimit && c.totalUsedCount >= c.totalUsageLimit
    ).length,
  }), [coupons]);

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN LIST — filtered
  // ════════════════════════════════════════════════════════════════════════════

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const q = search.toLowerCase();

      const matchSearch =
        c.couponCode.toLowerCase().includes(q)  ||
        c.couponTitle.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const computedStatus = getComputedStatus(c);
      const matchStatus =
        filterStatus === 'All'       ? true :
        filterStatus === 'Scheduled' ? computedStatus === 'Scheduled' :
        filterStatus === 'Exhausted' ? computedStatus === 'Exhausted' :
        computedStatus === filterStatus;

      const matchType = filterType === 'All' || c.couponType === filterType;
      const matchFor  = filterFor  === 'All' || c.applicableFor === filterFor;

      const expDate   = c.expiryDate ? new Date(c.expiryDate) : null;
      const matchFrom = !dateFrom || (expDate && expDate >= new Date(dateFrom));
      const matchTo   = !dateTo   || (expDate && expDate <= new Date(dateTo));

      return matchSearch && matchStatus && matchType
           && matchFor && matchFrom && matchTo;
    });
  }, [coupons, search, filterStatus, filterType, filterFor, dateFrom, dateTo]);

  // ════════════════════════════════════════════════════════════════════════════
  // TOP PERFORMING — sorted by usage desc
  // ════════════════════════════════════════════════════════════════════════════

  const allPerforming = useMemo(() =>
    [...coupons]
      .filter(c => (c.totalUsedCount || 0) > 0)
      .sort((a, b) => (b.totalUsedCount || 0) - (a.totalUsedCount || 0))
      .map(c => ({ ...c, computedStatus: getComputedStatus(c) })),
    [coupons]
  );

  const top3Performing = useMemo(() =>
    allPerforming.slice(0, 3),
    [allPerforming]
  );

  // ════════════════════════════════════════════════════════════════════════════
  // EXPIRING SOON — active coupons expiring within 7 days
  // ════════════════════════════════════════════════════════════════════════════

  const allExpiring = useMemo(() => {
    const today = new Date();
    return coupons
      .filter(c => {
        if (getComputedStatus(c) !== 'Active') return false;
        const diff = Math.ceil(
          (new Date(c.expiryDate) - today) / (1000 * 60 * 60 * 24)
        );
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .map(c => ({
        ...c,
        daysLeft: Math.ceil(
          (new Date(c.expiryDate) - today) / (1000 * 60 * 60 * 24)
        ),
      }));
  }, [coupons]);

  const top3Expiring = useMemo(() =>
    allExpiring.slice(0, 3),
    [allExpiring]
  );

  // ════════════════════════════════════════════════════════════════════════════
  // USAGE BREAKDOWN — per-coupon health rows
  // ════════════════════════════════════════════════════════════════════════════

  const getHealthLabel = (used, limit) => {
    if (!limit)       return 'Unlimited';
    const pct = Math.min(Math.round((used / limit) * 100), 100);
    if (pct >= 100)   return 'Exhausted';
    if (pct >= 80)    return 'Critical';
    if (pct >= 50)    return 'Warning';
    return 'Healthy';
  };

  const allBreakdownRows = useMemo(() =>
    coupons.map(c => {
      const used      = c.totalUsedCount    || 0;
      const limit     = c.totalUsageLimit   || null;
      const perUser   = c.usageLimitPerUser || null;
      const pct       = limit ? Math.min(Math.round((used / limit) * 100), 100) : null;
      const remaining = limit ? Math.max(limit - used, 0) : null;
      const health    = getHealthLabel(used, limit);
      return {
        ...c,
        used, limit, perUser, pct, remaining, health,
        computedStatus: getComputedStatus(c),
      };
    }),
    [coupons]
  );

  // Health summary counts for dropdown
  const healthSummary = useMemo(() => ({
    healthy:   allBreakdownRows.filter(r => r.health === 'Healthy').length,
    warning:   allBreakdownRows.filter(r => r.health === 'Warning').length,
    critical:  allBreakdownRows.filter(r => r.health === 'Critical').length,
    exhausted: allBreakdownRows.filter(r => r.health === 'Exhausted').length,
    unlimited: allBreakdownRows.filter(r => r.health === 'Unlimited').length,
  }), [allBreakdownRows]);

  // Filtered + sorted breakdown rows
  const filteredBreakdownRows = useMemo(() => {
    return allBreakdownRows
      .filter(r => {
        const q = bdSearch.toLowerCase();
        const matchSearch =
          r.couponCode.toLowerCase().includes(q) ||
          r.couponTitle.toLowerCase().includes(q);
        const matchHealth = bdHealth === 'All' || r.health === bdHealth;
        return matchSearch && matchHealth;
      })
      .sort((a, b) => {
        switch (bdSort) {
          case 'used_desc':      return b.used - a.used;
          case 'used_asc':       return a.used - b.used;
          case 'pct_desc':       return (b.pct ?? -1) - (a.pct ?? -1);
          case 'remaining_desc': return (b.remaining ?? Infinity) - (a.remaining ?? Infinity);
          default:               return 0;
        }
      });
  }, [allBreakdownRows, bdSearch, bdSort, bdHealth]);

  // ════════════════════════════════════════════════════════════════════════════
  // CRUD ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  const handleAdd = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      const newCoupon = { ...formData, id: Date.now(), totalUsedCount: 0 };
      setCoupons(prev => [newCoupon, ...prev]);
      // ── API ───────────────────────────────────────────────────────────────
      // const saved = await couponAPI.create(formData);
      // setCoupons(prev => [saved, ...prev]);
      toast.success('Coupon created successfully!');
      setAddModal(false);
    } catch {
      toast.error('Failed to create coupon');
    }
  };

  const handleEdit = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      setCoupons(prev => prev.map(c => c.id === formData.id ? formData : c));
      // ── API ───────────────────────────────────────────────────────────────
      // const updated = await couponAPI.update(formData.id, formData);
      // setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success('Coupon updated successfully!');
      setEditModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      // ── MOCK ──────────────────────────────────────────────────────────────
      setCoupons(prev => prev.filter(c => c.id !== selected.id));
      // ── API ───────────────────────────────────────────────────────────────
      // await couponAPI.remove(selected.id);
      // setCoupons(prev => prev.filter(c => c.id !== selected.id));
      toast.success('Coupon deleted successfully!');
      setDeleteModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await new Promise(r => setTimeout(r, 300));
      setCoupons(prev =>
        prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c)
      );
      toast.success(`Coupon marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RETURN
  // ════════════════════════════════════════════════════════════════════════════

  return {
    // ── core ──────────────────────────────────────────────────────────────
    allCoupons:    coupons,
    coupons:       filteredCoupons,
    loading,
    stats,
    getComputedStatus,

    // ── main list filters ─────────────────────────────────────────────────
    search,       setSearch,
    filterStatus, setFilterStatus,
    filterType,   setFilterType,
    filterFor,    setFilterFor,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,

    // ── top performing ────────────────────────────────────────────────────
    allPerforming,
    top3Performing,

    // ── expiring soon ─────────────────────────────────────────────────────
    allExpiring,
    top3Expiring,

    // ── usage breakdown ───────────────────────────────────────────────────
    filteredBreakdownRows,
    healthSummary,
    bdSearch,  setBdSearch,
    bdSort,    setBdSort,
    bdHealth,  setBdHealth,
    bdPage,    setBdPage,

    // ── modal states ──────────────────────────────────────────────────────
    addModal,    setAddModal,
    editModal,   setEditModal,
    viewModal,   setViewModal,
    deleteModal, setDeleteModal,
    selected,    setSelected,

    // ── actions ───────────────────────────────────────────────────────────
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  };
};

export default useCoupons;
