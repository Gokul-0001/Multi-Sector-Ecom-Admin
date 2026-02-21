import { useState } from 'react';
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaUser, FaToggleOn, FaToggleOff,
  FaChevronLeft, FaChevronRight, FaFilter, FaTimes,
  FaExclamationCircle, FaClock,
} from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import useDrivers from '../hooks/useDrivers';
import {
  AddDriverModal,
  EditDriverModal,
  ViewDriverModal,
  DeleteDriverModal,
  ExpiryBadge,
} from '../components/modals/DriverModals';

const ROWS_PER_PAGE = 10;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color }) => {
  const colorMap = {
    pink:   { wrap: 'bg-pink-50 border-pink-100',    icon: 'text-pink-500'   },
    green:  { wrap: 'bg-green-50 border-green-200',  icon: 'text-green-600'  },
    orange: { wrap: 'bg-orange-50 border-orange-200',icon: 'text-orange-600' },
    red:    { wrap: 'bg-red-50 border-red-200',      icon: 'text-red-600'    },
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
    Active:    'bg-green-50 text-green-700 border border-green-200',
    Inactive:  'bg-gray-100 text-gray-600 border border-gray-200',
    Suspended: 'bg-red-50   text-red-600   border border-red-100',
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
    {[...Array(7)].map((_, i) => (
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
        <strong className="text-gray-900">{total}</strong> drivers
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={navBtn(page === 1)}>
          <FaChevronLeft className="text-[11px]" />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`}
              className="px-1 text-gray-400 text-sm font-semibold">…</span>
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
        <button onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={navBtn(page === totalPages)}>
          <FaChevronRight className="text-[11px]" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Drivers = () => {
  const {
    drivers, loading, stats,
    search,       setSearch,
    filterStatus, setFilterStatus,
    filterExpiry, setFilterExpiry,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,
    addModal,    setAddModal,
    editModal,   setEditModal,
    viewModal,   setViewModal,
    deleteModal, setDeleteModal,
    selected,    setSelected,
    handleAdd, handleEdit, handleDelete, handleToggleStatus,
  } = useDrivers();

  const [page, setPage] = useState(1);
  const paginated = drivers.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleSearch = (v) => { setSearch(v);       setPage(1); };
  const handleStatus = (v) => { setFilterStatus(v); setPage(1); };
  const handleExpiry = (v) => { setFilterExpiry(v); setPage(1); };
  const handleFrom   = (v) => { setDateFrom(v);     setPage(1); };
  const handleTo     = (v) => { setDateTo(v);       setPage(1); };

  const handleClearFilters = () => {
    handleSearch('');
    handleStatus('All');
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
              Drivers
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage your driver fleet and license details
            </p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white
              bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl
              shadow-md shadow-pink-200 hover:from-pink-600 hover:to-pink-700
              hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200 cursor-pointer border-none">
            <FaPlus className="text-[11px]" /> Add Driver
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
          <StatCard
            label="Total Drivers"
            value={stats.total}
            sub="All registered drivers"
            icon={<FaUser />}
            color="pink"
          />
          <StatCard
            label="Active Drivers"
            value={stats.active}
            sub={`${stats.total
              ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
            icon={<FaToggleOn />}
            color="green"
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiring}
            sub="Within 90 days"
            icon={<FaClock />}
            color="orange"
          />
          <StatCard
            label="Expired DL"
            value={stats.expired}
            sub="Immediate renewal needed"
            icon={<FaExclamationCircle />}
            color="red"
          />
        </div>

        {/* ── Quick Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap -mt-2">
          {[
            { label: 'All',      active: filterExpiry === 'All',      onClick: () => handleExpiry('All')      },
            { label: 'Valid',    active: filterExpiry === 'Valid',     onClick: () => handleExpiry('Valid')    },
            { label: 'Expiring', active: filterExpiry === 'Expiring', onClick: () => handleExpiry('Expiring') },
            { label: 'Expired',  active: filterExpiry === 'Expired',  onClick: () => handleExpiry('Expired')  },
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
            <strong className="text-gray-900">{drivers.length}</strong>
            {' '}of{' '}
            <strong className="text-gray-900">{stats.total}</strong> drivers
          </span>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

          {/* Header */}
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

          {/* Filter grid — 5 filters */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">

            {/* Search */}
            <FilterInput label="Search">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2
                  text-gray-300 text-xs pointer-events-none" />
                <input
                  type="text" value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Name, mobile, DL no..."
                  className={`${filterInputCls} pl-8`}
                />
              </div>
            </FilterInput>

            {/* Status */}
            <FilterInput label="Status">
              <select
                value={filterStatus}
                onChange={e => handleStatus(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </FilterInput>

            {/* License Expiry */}
            <FilterInput label="License Expiry">
              <select
                value={filterExpiry}
                onChange={e => handleExpiry(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All</option>
                <option value="Valid">Valid</option>
                <option value="Expiring">Expiring (90 days)</option>
                <option value="Expired">Expired</option>
              </select>
            </FilterInput>

            {/* Joined From */}
            <FilterInput label="Joined From">
              <input
                type="date"
                value={dateFrom}
                onChange={e => handleFrom(e.target.value)}
                max={dateTo || undefined}
                className={filterInputCls}
              />
            </FilterInput>

            {/* Joined To */}
            <FilterInput label="Joined To">
              <input
                type="date"
                value={dateTo}
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

          {/* Table header bar */}
          <div className="px-5 py-4 border-b border-gray-100
            flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Driver List</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {drivers.length}{' '}
                {drivers.length === 1 ? 'driver' : 'drivers'} found
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Driver', 'Mobile', 'License No', 'License Expiry',
                    'Joined', 'Status', 'Actions'].map(h => (
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
                        <td colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2.5">
                            <div className="w-14 h-14 rounded-2xl bg-pink-50
                              flex items-center justify-center">
                              <FaUser className="text-pink-300 text-2xl" />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">
                              No drivers found
                            </p>
                            <p className="text-gray-500 text-xs font-medium">
                              Try adjusting your filters or add a new driver
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paginated.map((d, idx) => (
                      <tr key={d.id}
                        className={`transition-colors duration-150 hover:bg-pink-50/30
                          ${idx < paginated.length - 1 ? 'border-b border-gray-50' : ''}`}>

                        {/* Driver */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-[42px] h-[42px] rounded-[10px]
                              bg-gradient-to-br from-pink-500 to-pink-700
                              flex items-center justify-center flex-shrink-0
                              shadow-[0_3px_10px_rgba(236,72,153,0.2)]">
                              <FaUser className="text-white text-sm" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 whitespace-nowrap">
                                {d.driverName}
                              </p>
                              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">
                                Aadhaar: {d.aadharNumber
                                  ? `****${d.aadharNumber.slice(-4)}`
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                          {d.mobileNumber}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-bold text-pink-500
                            bg-pink-50 px-2 py-1 rounded-md tracking-wide">
                            {d.drivingLicense}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <ExpiryBadge expiryDate={d.licenseExpiry} />
                        </td>

                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap font-medium">
                          {d.dateOfJoining
                            ? new Date(d.dateOfJoining).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge status={d.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setSelected(d); setViewModal(true); }}
                              title="View"
                              className="w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer bg-blue-50 text-blue-500
                                hover:bg-blue-500 hover:text-white
                                hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => { setSelected(d); setEditModal(true); }}
                              title="Edit"
                              className="w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer bg-pink-50 text-pink-500
                                hover:bg-pink-500 hover:text-white
                                hover:shadow-[0_4px_12px_rgba(236,72,153,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(d)}
                              title={d.status === 'Active' ? 'Deactivate' : 'Activate'}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center
                                border-none cursor-pointer transition-all duration-200 active:scale-90
                                ${d.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-500 hover:text-white hover:shadow-[0_4px_12px_rgba(107,114,128,0.4)]'
                                }`}>
                              {d.status === 'Active'
                                ? <FaToggleOn  className="text-base" />
                                : <FaToggleOff className="text-base" />
                              }
                            </button>
                            <button
                              onClick={() => { setSelected(d); setDeleteModal(true); }}
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

          {/* Pagination */}
          {!loading && drivers.length > 0 && (
            <Pagination
              total={drivers.length}
              page={page}
              perPage={ROWS_PER_PAGE}
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {addModal && (
        <AddDriverModal
          onClose={() => setAddModal(false)}
          onSubmit={handleAdd}
        />
      )}
      {editModal && selected && (
        <EditDriverModal
          driver={selected}
          onClose={() => { setEditModal(false); setSelected(null); }}
          onSubmit={handleEdit}
        />
      )}
      {viewModal && selected && (
        <ViewDriverModal
          driver={selected}
          onClose={() => { setViewModal(false); setSelected(null); }}
          onEdit={() => { setViewModal(false); setEditModal(true); }}
        />
      )}
      {deleteModal && selected && (
        <DeleteDriverModal
          driver={selected}
          onClose={() => { setDeleteModal(false); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
};

export default Drivers;
