import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { mockBanners } from '../data/mockBanners';

const useBanners = () => {
  // ── Raw data ─────────────────────────────────────────────────────
  const [banners,  setBanners]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Filters ──────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('All');
  const [filterType,     setFilterType]     = useState('All');
  const [filterPosition, setFilterPosition] = useState('All');
  const [filterDevice,   setFilterDevice]   = useState('All');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');

  // ── Modals / selection ───────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [viewModal,   setViewModal]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected,    setSelected]    = useState(null);

  // ═════════════════════════════════════════════════════════════════
  // LOAD
  // ═════════════════════════════════════════════════════════════════

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fake delay to simulate API
        await new Promise(r => setTimeout(r, 600));
        setBanners(mockBanners);
        // TODO: replace with API:
        // const data = await bannerAPI.getAll();
        // setBanners(data);
      } catch {
        toast.error('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ═════════════════════════════════════════════════════════════════
  // COMPUTED STATUS
  // ═════════════════════════════════════════════════════════════════

  const getComputedStatus = (banner) => {
    if (banner.status === 'Draft')  return 'Draft';
    if (banner.status === 'Paused') return 'Paused';
    if (banner.alwaysShow)          return 'Active';

    const now   = new Date();
    const start = new Date(banner.startDate);
    const end   = new Date(banner.endDate);

    if (end   < now) return 'Expired';
    if (start > now) return 'Scheduled';
    return 'Active';
  };

  // ═════════════════════════════════════════════════════════════════
  // STATS
  // ═════════════════════════════════════════════════════════════════

  const stats = useMemo(() => ({
    total:     banners.length,
    active:    banners.filter(b => getComputedStatus(b) === 'Active').length,
    scheduled: banners.filter(b => getComputedStatus(b) === 'Scheduled').length,
    expired:   banners.filter(b => getComputedStatus(b) === 'Expired').length,
    draft:     banners.filter(b => getComputedStatus(b) === 'Draft').length,
  }), [banners]);

  // ═════════════════════════════════════════════════════════════════
  // FILTERED LIST
  // ═════════════════════════════════════════════════════════════════

  const filteredBanners = useMemo(() => {
    return banners.filter(b => {
      const q = search.toLowerCase();

      const matchSearch =
        b.bannerTitle.toLowerCase().includes(q) ||
        (b.bannerSubtitle && b.bannerSubtitle.toLowerCase().includes(q)) ||
        (b.redirectValue  && b.redirectValue.toLowerCase().includes(q));

      const computed    = getComputedStatus(b);
      const matchStatus = filterStatus   === 'All' || computed          === filterStatus;
      const matchType   = filterType     === 'All' || b.bannerType      === filterType;
      const matchPos    = filterPosition === 'All' || b.displayPosition === filterPosition;
      const matchDev    = filterDevice   === 'All' || b.deviceTarget    === filterDevice;

      const endDate  = b.endDate ? new Date(b.endDate) : null;
      const matchFrom = !dateFrom || (endDate && endDate >= new Date(dateFrom));
      const matchTo   = !dateTo   || (endDate && endDate <= new Date(dateTo));

      return matchSearch && matchStatus && matchType &&
             matchPos && matchDev && matchFrom && matchTo;
    });
  }, [
    banners,
    search,
    filterStatus,
    filterType,
    filterPosition,
    filterDevice,
    dateFrom,
    dateTo,
  ]);

  // ═════════════════════════════════════════════════════════════════
  // EXPIRING SOON — active banners ending within 7 days
  // ═════════════════════════════════════════════════════════════════

  const expiringBanners = useMemo(() => {
    const today = new Date();
    return banners
      .filter(b => {
        if (getComputedStatus(b) !== 'Active') return false;
        if (b.alwaysShow) return false;
        if (!b.endDate) return false;

        const diff = Math.ceil(
          (new Date(b.endDate) - today) / (1000 * 60 * 60 * 24)
        );
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .map(b => ({
        ...b,
        daysLeft: Math.ceil(
          (new Date(b.endDate) - today) / (1000 * 60 * 60 * 24)
        ),
        computedStatus: 'Active',
      }));
  }, [banners]);

  // ═════════════════════════════════════════════════════════════════
  // UPCOMING — scheduled banners going live
  // ═════════════════════════════════════════════════════════════════

  const upcomingBanners = useMemo(() => {
    const today = new Date();
    return banners
      .filter(b => getComputedStatus(b) === 'Scheduled')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map(b => ({
        ...b,
        daysToLive: Math.ceil(
          (new Date(b.startDate) - today) / (1000 * 60 * 60 * 24)
        ),
      }));
  }, [banners]);

  // ═════════════════════════════════════════════════════════════════
  // BY TYPE
  // ═════════════════════════════════════════════════════════════════

  const byType = useMemo(() => {
    const map = {};
    banners.forEach(b => {
      map[b.bannerType] = (map[b.bannerType] || 0) + 1;
    });
    return map;
  }, [banners]);

  // ═════════════════════════════════════════════════════════════════
  // CRUD
  // ═════════════════════════════════════════════════════════════════

  const handleAdd = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      const now = new Date().toISOString().slice(0, 10);
      const newBanner = {
        ...formData,
        id:              Date.now(),
        createdBy:       'Admin',
        createdDate:     now,
        lastUpdatedDate: now,
      };
      setBanners(prev => [newBanner, ...prev]);
      toast.success('Banner created successfully!');
      setAddModal(false);
    } catch {
      toast.error('Failed to create banner');
    }
  };

  const handleEdit = async (formData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      const now = new Date().toISOString().slice(0, 10);
      setBanners(prev => prev.map(b =>
        b.id === formData.id
          ? { ...formData, lastUpdatedDate: now }
          : b
      ));
      toast.success('Banner updated successfully!');
      setEditModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to update banner');
    }
  };

  const handleDelete = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      setBanners(prev => prev.filter(b => b.id !== selected.id));
      toast.success('Banner deleted successfully!');
      setDeleteModal(false);
      setSelected(null);
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'Active' ? 'Paused' : 'Active';
    try {
      await new Promise(r => setTimeout(r, 300));
      setBanners(prev =>
        prev.map(b => b.id === banner.id
          ? {
              ...b,
              status: newStatus,
              lastUpdatedDate: new Date().toISOString().slice(0, 10),
            }
          : b
        )
      );
      toast.success(
        `Banner ${newStatus === 'Active' ? 'activated' : 'paused'}`
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // RETURN API
  // ═════════════════════════════════════════════════════════════════

  return {
    allBanners:  banners,           // raw list if needed
    banners:     filteredBanners,   // filtered list for table
    loading,
    stats,
    byType,
    getComputedStatus,

    search,         setSearch,
    filterStatus,   setFilterStatus,
    filterType,     setFilterType,
    filterPosition, setFilterPosition,
    filterDevice,   setFilterDevice,
    dateFrom,       setDateFrom,
    dateTo,         setDateTo,

    expiringBanners,
    upcomingBanners,

    addModal,    setAddModal,
    editModal,   setEditModal,
    viewModal,   setViewModal,
    deleteModal, setDeleteModal,
    selected,    setSelected,

    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  };
};

export default useBanners;
