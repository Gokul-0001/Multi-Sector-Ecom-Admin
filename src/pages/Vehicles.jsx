import { useState, useMemo } from 'react';
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaCar, FaToggleOn, FaToggleOff,
  FaChevronLeft, FaChevronRight, FaFilter, FaTimes,
  FaExclamationCircle, FaClock, FaSatelliteDish,
  FaBell, FaCheckCircle,
} from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import useVehicles from '../hooks/useVehicles';
import {
  AddVehicleModal,
  EditVehicleModal,
  ViewVehicleModal,
  DeleteVehicleModal,
  CertBadge,
} from '../components/modals/VehicleModals';
import { vehicleTypeOptions } from '../data/mockVehicles';

const ROWS_PER_PAGE = 10;
const URGENT_DAYS = 7;

const CERT_KEYS = [
  { key: 'rcExpiry', label: 'RC' },
  { key: 'insuranceValidity', label: 'Insurance' },
  { key: 'pucExpiry', label: 'PUC' },
  { key: 'fitnessCertExpiry', label: 'Fitness Cert' },
  { key: 'permitExpiry', label: 'Permit' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color }) => {
  const colorMap = {
    pink: { wrap: 'bg-pink-50 border-pink-100', icon: 'text-pink-500' },
    green: { wrap: 'bg-green-50 border-green-200', icon: 'text-green-600' },
    orange: { wrap: 'bg-orange-50 border-orange-200', icon: 'text-orange-600' },
    red: { wrap: 'bg-red-50 border-red-200', icon: 'text-red-600' },
  };
  const c = colorMap[color] || colorMap.pink;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100
      flex items-start justify-between
      shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div>
        <p className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </p>
        <p className="text-[26px] font-extrabold text-gray-900 leading-none tracking-tight">
          {value}
        </p>
        <p className="text-xs text-gray-500 font-medium mt-1.5">{sub}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl border flex items-center
        justify-center flex-shrink-0 ${c.wrap}`}>
        <span className={`text-lg ${c.icon}`}>{icon}</span>
      </div>
    </div>
  );
};

// ─── Filter Input ─────────────────────────────────────────────────────────────
const FilterInput = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const filterInputCls =
  `w-full px-3 py-2.5 text-sm font-medium text-gray-900 bg-gray-50
  border border-gray-100 rounded-xl outline-none transition-all duration-200
  focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100
  hover:border-gray-200 placeholder-gray-400`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active: 'bg-green-50 text-green-700 border border-green-200',
    Inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
    'Under Maintenance': 'bg-orange-50 text-orange-600 border border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5
      rounded-full text-xs font-semibold ${map[status] || map.Inactive}`}>
      {status}
    </span>
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ total, page, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 1, pages = [];
    const left = page - delta, right = page + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) pages.push(i);
      else if (i === left - 1 || i === right + 1) pages.push('...');
    }
    return pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'));
  };

  const navBtn = (disabled) =>
    `flex items-center justify-center min-w-[34px] h-[34px] px-1.5 rounded-lg border
    text-sm font-semibold transition-all duration-200
    ${disabled
      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
      : 'bg-white border-gray-200 text-gray-700 hover:border-pink-400 hover:text-pink-500 cursor-pointer'
    }`;

  return (
    <div className="flex items-center justify-between px-5 py-3.5
      border-t border-gray-100 flex-wrap gap-3">
      <span className="text-sm text-gray-500 font-medium">
        Showing{' '}
        <strong className="text-gray-900">
          {Math.min((page - 1) * perPage + 1, total)}
        </strong>
        {' – '}
        <strong className="text-gray-900">{Math.min(page * perPage, total)}</strong>
        {' of '}
        <strong className="text-gray-900">{total}</strong> vehicles
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={navBtn(page === 1)}>
          <FaChevronLeft className="text-[11px]" />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-1 text-gray-400 text-sm font-semibold">
              …
            </span>
          ) : (
            <button key={p} onClick={() => onChange(p)}
              className={`flex items-center justify-center min-w-[34px] h-[34px]
                px-1.5 rounded-lg border text-sm font-semibold
                transition-all duration-200 cursor-pointer
                ${p === page
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-400 hover:text-pink-500'
                }`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className={navBtn(page === totalPages)}>
          <FaChevronRight className="text-[11px]" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 🔴 URGENT ALERTS
// ═══════════════════════════════════════════════════════════════════

const UrgentAlerts = ({ allVehicles }) => {
  const today = new Date();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // ── Build grouped alerts ──────────────────────────────────────────────────
  const allGrouped = useMemo(() => {
    const result = [];

    allVehicles.forEach(v => {
      const certIssues = [];

      CERT_KEYS.forEach(cert => {
        const dateStr = v[cert.key];
        if (!dateStr) return;
        const diffDays = Math.ceil(
          (new Date(dateStr) - today) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > URGENT_DAYS) return;
        certIssues.push({
          label: cert.label,
          diffDays,
          type: diffDays < 0 ? 'expired' : 'urgent',
        });
      });

      if (certIssues.length === 0) return;
      certIssues.sort((a, b) => a.diffDays - b.diffDays);

      result.push({
        vehicleNumber: v.vehicleNumber,
        vehicleModel: v.vehicleModel,
        vehicleType: v.vehicleType,
        certIssues,
        severity: certIssues.some(c => c.type === 'expired') ? 'expired' : 'urgent',
      });
    });

    return result.sort((a, b) =>
      a.severity === b.severity ? 0 : a.severity === 'expired' ? -1 : 1
    );
  }, [allVehicles]);

  // ── Apply internal filters ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allGrouped
      .map(v => {
        let certs = v.certIssues;
        if (certFilter !== 'All')
          certs = certs.filter(c => c.label === certFilter);
        if (severityFilter === 'Expired')
          certs = certs.filter(c => c.type === 'expired');
        else if (severityFilter === 'Expiring')
          certs = certs.filter(c => c.type === 'urgent');
        return { ...v, certIssues: certs };
      })
      .filter(v => {
        if (v.certIssues.length === 0) return false;
        if (vehicleSearch.trim()) {
          const q = vehicleSearch.toLowerCase();
          return (
            v.vehicleNumber.toLowerCase().includes(q) ||
            v.vehicleModel.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [allGrouped, severityFilter, certFilter, vehicleSearch]);

  const totalIssues = allGrouped.reduce((s, v) => s + v.certIssues.length, 0);
  const hasExpired = allGrouped.some(v => v.severity === 'expired');
  const activeFilters = (severityFilter !== 'All' ? 1 : 0)
    + (certFilter !== 'All' ? 1 : 0)
    + (vehicleSearch.trim() ? 1 : 0);

  const handleClearAlertFilters = () => {
    setSeverityFilter('All');
    setCertFilter('All');
    setVehicleSearch('');
  };

  // ── All clear ─────────────────────────────────────────────────────────────
  if (allGrouped.length === 0) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl
      px-5 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center
        justify-center flex-shrink-0">
        <FaCheckCircle className="text-green-500 text-base" />
      </div>
      <div>
        <p className="text-sm font-bold text-green-800">
          All certificates are healthy
        </p>
        <p className="text-xs text-green-600 font-medium mt-0.5">
          No vehicles have expired or urgently expiring certificates
          within {URGENT_DAYS} days
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100
      shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className={`flex items-center gap-3 px-6 py-4 border-b
        ${hasExpired
          ? 'border-red-100 bg-red-50/60'
          : 'border-orange-100 bg-orange-50/60'
        }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center
          flex-shrink-0 relative
          ${hasExpired ? 'bg-red-100' : 'bg-orange-100'}`}>
          <FaBell className={`text-sm z-10 relative
            ${hasExpired ? 'text-red-500' : 'text-orange-500'}`} />
          <span className={`absolute inset-0 rounded-xl animate-ping opacity-20
            ${hasExpired ? 'bg-red-400' : 'bg-orange-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-extrabold
              ${hasExpired ? 'text-red-800' : 'text-orange-800'}`}>
              Urgent Alerts
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full
              ${hasExpired
                ? 'bg-red-200 text-red-700'
                : 'bg-orange-200 text-orange-700'
              }`}>
              {totalIssues} certificate issue{totalIssues > 1 ? 's' : ''}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full
              bg-gray-200 text-gray-600">
              {allGrouped.length} vehicle{allGrouped.length > 1 ? 's' : ''} affected
            </span>
          </div>
          <p className={`text-xs font-medium mt-0.5
            ${hasExpired ? 'text-red-600' : 'text-orange-600'}`}>
            Expired or expiring within {URGENT_DAYS} days
            — across all {allVehicles.length} vehicles
          </p>
        </div>
      </div>

      {/* ── Inline Filters — same design as page filters ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-pink-500 text-xs" />
            <span className="text-sm font-bold text-gray-900">Filters</span>
          </div>
          <button
            type="button"
            onClick={handleClearAlertFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
      text-xs font-bold text-red-500 bg-red-50 border border-red-100
      hover:bg-red-500 hover:text-white hover:border-red-500
      transition-all duration-200 cursor-pointer">
            <FaTimes className="text-[10px]" />
            Clear All
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-200 text-red-700
        text-[10px] font-extrabold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter grid — same pattern as page filters */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">

          {/* Search Vehicle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Search Vehicle
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2
        text-gray-300 text-xs pointer-events-none" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                placeholder="Number or model..."
                className="w-full pl-8 pr-8 py-2.5 text-sm font-medium text-gray-900
          bg-gray-50 border border-gray-100 rounded-xl outline-none
          transition-all duration-200 placeholder-gray-400
          focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100
          hover:border-gray-200"
              />
              {vehicleSearch && (
                <button
                  type="button"
                  onClick={() => setVehicleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-gray-600 cursor-pointer
            border-none bg-transparent transition-colors duration-150">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-medium text-gray-900
        bg-gray-50 border border-gray-100 rounded-xl outline-none
        transition-all duration-200 cursor-pointer
        focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100
        hover:border-gray-200">
              <option value="All">All Severity</option>
              <option value="Expired">Expired</option>
              <option value="Expiring">Expiring Soon</option>
            </select>
          </div>

          {/* Certificate Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Certificate
            </label>
            <select
              value={certFilter}
              onChange={e => setCertFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-medium text-gray-900
        bg-gray-50 border border-gray-100 rounded-xl outline-none
        transition-all duration-200 cursor-pointer
        focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100
        hover:border-gray-200">
              <option value="All">All Certificates</option>
              {CERT_KEYS.map(c => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>


      {/* ── Filtered result count ── */}
      {activeFilters > 0 && (
        <div className="px-6 py-2.5 bg-pink-50/40 border-b border-pink-100">
          <p className="text-xs font-semibold text-pink-600">
            Showing{' '}
            <strong>
              {filtered.reduce((s, v) => s + v.certIssues.length, 0)}
            </strong>
            {' '}issue{filtered.reduce((s, v) => s + v.certIssues.length, 0) !== 1 ? 's' : ''}
            {' across '}
            <strong>{filtered.length}</strong>
            {' '}vehicle{filtered.length !== 1 ? 's' : ''}
            {' — filtered from '}
            <strong>{totalIssues}</strong> total
          </p>
        </div>
      )}

      {/* ── Vehicle Cards ── */}
      <div className="p-5 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100
              flex items-center justify-center">
              <FaSearch className="text-gray-300 text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-600">
              No alerts match your filters
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Try changing the severity, certificate type or vehicle search
            </p>
            <button
              type="button"
              onClick={handleClearAlertFilters}
              className="mt-1 text-xs font-bold text-pink-500
                hover:text-pink-600 cursor-pointer border-none
                bg-transparent transition-colors duration-150">
              Clear all filters
            </button>
          </div>
        ) : (
          filtered.map((v, i) => (
            <div key={i}
              className={`rounded-xl border overflow-hidden
                ${v.severity === 'expired'
                  ? 'border-red-200'
                  : 'border-orange-200'
                }`}>

              {/* Vehicle identity row */}
              <div className={`flex items-center gap-3 px-4 py-3
                ${v.severity === 'expired'
                  ? 'bg-red-50/70'
                  : 'bg-orange-50/70'
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center
                  justify-center flex-shrink-0
                  ${v.severity === 'expired' ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <FaCar className={`text-xs
                    ${v.severity === 'expired'
                      ? 'text-red-500'
                      : 'text-orange-500'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-gray-900">
                    {v.vehicleNumber}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {v.vehicleModel} · {v.vehicleType}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1
                  rounded-lg flex-shrink-0
                  ${v.severity === 'expired'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                  {v.certIssues.length} issue{v.certIssues.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Cert pills */}
              <div className="flex flex-wrap gap-2 px-4 py-3 bg-white
                border-t border-gray-100">
                {v.certIssues.map((cert, j) => (
                  <div key={j}
                    className={`flex items-center gap-1.5 px-3 py-1.5
                      rounded-lg text-xs font-bold border
                      ${cert.type === 'expired'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-orange-50 border-orange-200 text-orange-700'
                      }`}>
                    <span>{cert.label}</span>
                    <span className="text-gray-300">·</span>
                    {cert.type === 'expired' ? (
                      <span className="flex items-center gap-1">
                        <FaExclamationCircle className="text-[10px]" />
                        Expired {Math.abs(cert.diffDays)}d ago
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FaClock className="text-[10px]" />
                        {cert.diffDays === 0
                          ? 'Expires today!'
                          : `${cert.diffDays}d left`
                        }
                      </span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

const Vehicles = () => {
  const {
    vehicles,
    allVehicles,
    loading,
    stats,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    filterExpiry, setFilterExpiry,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    addModal, setAddModal,
    editModal, setEditModal,
    viewModal, setViewModal,
    deleteModal, setDeleteModal,
    selected, setSelected,
    handleAdd, handleEdit, handleDelete, handleToggleStatus,
  } = useVehicles();

  const [page, setPage] = useState(1);
  const paginated = vehicles.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleStatus = (v) => { setFilterStatus(v); setPage(1); };
  const handleType = (v) => { setFilterType(v); setPage(1); };
  const handleExpiry = (v) => { setFilterExpiry(v); setPage(1); };
  const handleFrom = (v) => { setDateFrom(v); setPage(1); };
  const handleTo = (v) => { setDateTo(v); setPage(1); };

  const handleClearFilters = () => {
    handleSearch('');
    handleStatus('All');
    handleType('All');
    handleExpiry('All');
    handleFrom('');
    handleTo('');
  };

  return (
    <Layout>
      <div className="fade-up max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
              Vehicles
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage your fleet, certificates and expiry dates
            </p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white
              bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl
              shadow-md shadow-pink-200 hover:from-pink-600 hover:to-pink-700
              hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200 cursor-pointer border-none">
            <FaPlus className="text-[11px]" /> Add Vehicle
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
          <StatCard
            label="Total Vehicles"
            value={stats.total}
            sub="All registered vehicles"
            icon={<FaCar />}
            color="pink"
          />
          <StatCard
            label="Active Vehicles"
            value={stats.active}
            sub={`${stats.total
              ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
            icon={<FaToggleOn />}
            color="green"
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiring}
            sub="Any certificate within 90 days"
            icon={<FaClock />}
            color="orange"
          />
          <StatCard
            label="Cert Expired"
            value={stats.expired}
            sub="Immediate renewal needed"
            icon={<FaExclamationCircle />}
            color="red"
          />
        </div>

        {/* ── Quick Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap -mt-2">
          {[
            { label: 'All', active: filterExpiry === 'All', onClick: () => handleExpiry('All') },
            { label: 'Valid', active: filterExpiry === 'Valid', onClick: () => handleExpiry('Valid') },
            { label: 'Expiring', active: filterExpiry === 'Expiring', onClick: () => handleExpiry('Expiring') },
            { label: 'Expired', active: filterExpiry === 'Expired', onClick: () => handleExpiry('Expired') },
          ].map(tab => (
            <button key={tab.label} onClick={tab.onClick}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg
                border-none cursor-pointer transition-all duration-200
                ${tab.active
                  ? 'bg-pink-50 text-pink-500'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}>
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500 font-medium">
            Showing{' '}
            <strong className="text-gray-900">{vehicles.length}</strong>
            {' '}of{' '}
            <strong className="text-gray-900">{stats.total}</strong> vehicles
          </span>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-pink-500 text-xs" />
              <span className="text-sm font-bold text-gray-900">Filters</span>
            </div>
            <button onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-bold text-red-500 bg-red-50 border border-red-100
                hover:bg-red-500 hover:text-white hover:border-red-500
                transition-all duration-200 cursor-pointer">
              <FaTimes className="text-[10px]" /> Clear All
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            <FilterInput label="Search">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2
                  text-gray-300 text-xs pointer-events-none" />
                <input type="text" value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Number, model, owner..."
                  className={`${filterInputCls} pl-8`}
                />
              </div>
            </FilterInput>
            <FilterInput label="Vehicle Type">
              <select value={filterType}
                onChange={e => handleType(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Types</option>
                {vehicleTypeOptions.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FilterInput>
            <FilterInput label="Status">
              <select value={filterStatus}
                onChange={e => handleStatus(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </FilterInput>
            <FilterInput label="Cert Expiry">
              <select value={filterExpiry}
                onChange={e => handleExpiry(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All</option>
                <option value="Valid">Valid</option>
                <option value="Expiring">Expiring (90 days)</option>
                <option value="Expired">Expired</option>
              </select>
            </FilterInput>
            <FilterInput label="Insurance From">
              <input
                type="date" value={dateFrom}
                onChange={e => handleFrom(e.target.value)}
                max={dateTo || undefined}
                className={filterInputCls}
              />
            </FilterInput>
            <FilterInput label="Insurance To">
              <input
                type="date" value={dateTo}
                onChange={e => handleTo(e.target.value)}
                min={dateFrom || undefined}
                className={filterInputCls}
              />
            </FilterInput>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100
          overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100
            flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Vehicle List</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {vehicles.length}{' '}
                {vehicles.length === 1 ? 'vehicle' : 'vehicles'} found
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Vehicle', 'Type', 'Insurance', 'PUC Expiry',
                    'RC Expiry', 'GPS', 'Status', 'Actions'].map(h => (
                      <th key={h}
                        className="px-4 py-3 text-[11px] font-bold text-gray-500
                        uppercase tracking-wider whitespace-nowrap text-left">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  : paginated.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2.5">
                            <div className="w-14 h-14 rounded-2xl bg-pink-50
                              flex items-center justify-center">
                              <FaCar className="text-pink-300 text-2xl" />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">
                              No vehicles found
                            </p>
                            <p className="text-gray-500 text-xs font-medium">
                              Try adjusting your filters or add a new vehicle
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paginated.map((v, idx) => (
                      <tr key={v.id}
                        className={`transition-colors duration-150 hover:bg-pink-50/30
                          ${idx < paginated.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-[42px] h-[42px] rounded-[10px]
                              bg-gradient-to-br from-pink-500 to-pink-700
                              flex items-center justify-center flex-shrink-0
                              shadow-[0_3px_10px_rgba(236,72,153,0.2)]">
                              <FaCar className="text-white text-sm" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 whitespace-nowrap">
                                {v.vehicleNumber}
                              </p>
                              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">
                                {v.vehicleModel}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-pink-500
                            bg-pink-50 px-2 py-1 rounded-md">
                            {v.vehicleType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CertBadge expiryDate={v.insuranceValidity} short />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CertBadge expiryDate={v.pucExpiry} short />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CertBadge expiryDate={v.rcExpiry} short />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1
                            px-2.5 py-0.5 rounded-full text-xs font-semibold
                            ${v.gpsInstalled
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                            <FaSatelliteDish className="text-[10px]" />
                            {v.gpsInstalled ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setSelected(v); setViewModal(true); }}
                              title="View"
                              className="w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer bg-blue-50 text-blue-500
                                hover:bg-blue-500 hover:text-white
                                hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => { setSelected(v); setEditModal(true); }}
                              title="Edit"
                              className="w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer bg-pink-50 text-pink-500
                                hover:bg-pink-500 hover:text-white
                                hover:shadow-[0_4px_12px_rgba(236,72,153,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(v)}
                              title={v.status === 'Active' ? 'Deactivate' : 'Activate'}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer transition-all duration-200 active:scale-90
                                ${v.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-500 hover:text-white hover:shadow-[0_4px_12px_rgba(107,114,128,0.4)]'
                                }`}>
                              {v.status === 'Active'
                                ? <FaToggleOn className="text-base" />
                                : <FaToggleOff className="text-base" />
                              }
                            </button>
                            <button
                              onClick={() => { setSelected(v); setDeleteModal(true); }}
                              title="Delete"
                              className="w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer bg-red-50 text-red-500
                                hover:bg-red-500 hover:text-white
                                hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
          {!loading && vehicles.length > 0 && (
            <Pagination
              total={vehicles.length}
              page={page}
              perPage={ROWS_PER_PAGE}
              onChange={setPage}
            />
          )}
        </div>

        {/* ══ URGENT ALERTS — below table, uses allVehicles ══ */}
        {!loading && (
          <UrgentAlerts allVehicles={allVehicles} />
        )}

      </div>

      {/* ── Modals ── */}
      {addModal && (
        <AddVehicleModal
          onClose={() => setAddModal(false)}
          onSubmit={handleAdd}
        />
      )}
      {editModal && selected && (
        <EditVehicleModal
          vehicle={selected}
          onClose={() => { setEditModal(false); setSelected(null); }}
          onSubmit={handleEdit}
        />
      )}
      {viewModal && selected && (
        <ViewVehicleModal
          vehicle={selected}
          onClose={() => { setViewModal(false); setSelected(null); }}
          onEdit={() => { setViewModal(false); setEditModal(true); }}
        />
      )}
      {deleteModal && selected && (
        <DeleteVehicleModal
          vehicle={selected}
          onClose={() => { setDeleteModal(false); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
};

export default Vehicles;
