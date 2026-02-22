import { useState } from 'react';
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaTag, FaToggleOn, FaToggleOff,
  FaChevronLeft, FaChevronRight, FaFilter, FaTimes,
  FaPercent, FaRupeeSign, FaUsers, FaFire,
  FaCopy, FaCheckCircle, FaExclamationCircle,
  FaClock, FaCalendarAlt, FaChartBar, FaArrowRight,
} from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import useCoupons from '../hooks/useCoupons';
import {
  AddCouponModal,
  EditCouponModal,
  ViewCouponModal,
  DeleteCouponModal,
  UsageBar,
  CouponStatusBadge,
} from '../components/modals/CouponModals';
import { applicableForOptions, couponTypeOptions } from '../data/mockCoupons';
import Portal from '../components/ui/Portal';

const ROWS_PER_PAGE       = 10;
const BREAKDOWN_ROWS_PAGE = 5;
const DRAWER_PER_PAGE     = 8;

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

const StatCard = ({ label, value, sub, icon, color }) => {
  const colorMap = {
    pink:   { wrap: 'bg-pink-50 border-pink-100',     icon: 'text-pink-500'   },
    green:  { wrap: 'bg-green-50 border-green-200',   icon: 'text-green-600'  },
    orange: { wrap: 'bg-orange-50 border-orange-200', icon: 'text-orange-600' },
    red:    { wrap: 'bg-red-50 border-red-200',       icon: 'text-red-600'    },
  };
  const c = colorMap[color] || colorMap.pink;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100
      flex items-start justify-between
      shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div>
        <p className="text-[11.5px] font-bold text-gray-400
          uppercase tracking-wider mb-1.5">
          {label}
        </p>
        <p className="text-[26px] font-extrabold text-gray-900
          leading-none tracking-tight">
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

// ═══════════════════════════════════════════════════════════════════
// FILTER INPUT WRAPPER
// ═══════════════════════════════════════════════════════════════════

const FilterInput = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500
      uppercase tracking-wide">
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

// ═══════════════════════════════════════════════════════════════════
// SKELETON ROW
// ═══════════════════════════════════════════════════════════════════

const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
      </td>
    ))}
  </tr>
);

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════

const Pagination = ({ total, page, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 1, pages = [];
    const left = page - delta, right = page + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right))
        pages.push(i);
      else if (i === left - 1 || i === right + 1)
        pages.push('...');
    }
    return pages.filter((p, i) =>
      !(p === '...' && pages[i - 1] === '...')
    );
  };

  const navBtn = (disabled) =>
    `flex items-center justify-center min-w-[34px] h-[34px] px-1.5
    rounded-lg border text-sm font-semibold transition-all duration-200
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
        <strong className="text-gray-900">
          {Math.min(page * perPage, total)}
        </strong>
        {' of '}
        <strong className="text-gray-900">{total}</strong>
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

// ═══════════════════════════════════════════════════════════════════
// VIEW ALL DRAWER
// ═══════════════════════════════════════════════════════════════════

const ViewAllDrawer = ({
  title, subtitle, icon, iconBg,
  items, onClose, renderRow,
}) => {
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerPage,   setDrawerPage]   = useState(1);

  const filtered = items.filter(c => {
    const q = drawerSearch.toLowerCase();
    return (
      c.couponCode.toLowerCase().includes(q) ||
      c.couponTitle.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(
    (drawerPage - 1) * DRAWER_PER_PAGE,
    drawerPage * DRAWER_PER_PAGE
  );

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg
        bg-white z-[999] shadow-2xl flex flex-col
        animate-[slideInRight_0.25s_ease-out]">

        {/* Header */}
        <div className={`flex items-center gap-3 px-6 py-5
          border-b border-gray-100 flex-shrink-0 ${iconBg}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center
            flex-shrink-0 bg-white/80">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 border-none cursor-pointer
              flex items-center justify-center text-gray-500
              hover:bg-red-100 hover:text-red-500 transition-all duration-200">
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2
              text-gray-300 text-xs pointer-events-none" />
            <input
              type="text"
              value={drawerSearch}
              onChange={e => {
                setDrawerSearch(e.target.value);
                setDrawerPage(1);
              }}
              placeholder="Search by code or title..."
              className="w-full pl-8 pr-8 py-2.5 text-sm font-medium text-gray-800
                bg-gray-50 border border-gray-100 rounded-xl outline-none
                transition-all duration-200 placeholder-gray-400
                focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
            />
            {drawerSearch && (
              <button type="button"
                onClick={() => { setDrawerSearch(''); setDrawerPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-600 cursor-pointer
                  border-none bg-transparent">
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100
                flex items-center justify-center">
                <FaSearch className="text-gray-300 text-lg" />
              </div>
              <p className="text-sm font-bold text-gray-600">No results found</p>
              <button type="button"
                onClick={() => setDrawerSearch('')}
                className="text-xs font-bold text-pink-500 border-none
                  bg-transparent cursor-pointer hover:text-pink-600">
                Clear search
              </button>
            </div>
          ) : (
            paginated.map((item, i) =>
              renderRow(item, (drawerPage - 1) * DRAWER_PER_PAGE + i)
            )
          )}
        </div>

        {/* Drawer Pagination */}
        {filtered.length > DRAWER_PER_PAGE && (
          <div className="flex-shrink-0">
            <Pagination
              total={filtered.length}
              page={drawerPage}
              perPage={DRAWER_PER_PAGE}
              onChange={setDrawerPage}
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40
          flex-shrink-0">
          <p className="text-xs text-gray-500 font-medium">
            Showing{' '}
            <strong className="text-gray-900">{paginated.length}</strong>
            {' '}of{' '}
            <strong className="text-gray-900">{filtered.length}</strong>
            {drawerSearch && ` (filtered from ${items.length})`}
          </p>
        </div>
      </div>
    </Portal>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TOP PERFORMING + EXPIRING SOON — 2 column
// ═══════════════════════════════════════════════════════════════════

const TopAndExpiring = ({
  allPerforming, top3Performing,
  allExpiring,   top3Expiring,
}) => {
  const [topDrawer,      setTopDrawer]      = useState(false);
  const [expiringDrawer, setExpiringDrawer] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── LEFT — Top Performing ── */}
        <div className="bg-white rounded-2xl border border-gray-100
          shadow-sm overflow-hidden flex flex-col">

          <div className="flex items-center gap-3 px-5 py-4
            border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100
              flex items-center justify-center flex-shrink-0">
              <FaFire className="text-orange-500 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-gray-900">
                Top Performing
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Showing top 3 of{' '}
                <strong className="text-gray-700">{allPerforming.length}</strong>
                {' '}coupons
              </p>
            </div>
          </div>

          <div className="flex flex-col flex-1">
            {top3Performing.length === 0 ? (
              <div className="flex flex-col items-center gap-2
                py-10 text-center px-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50
                  flex items-center justify-center">
                  <FaFire className="text-orange-300 text-base" />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  No coupon usage yet
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  Usage data will appear once coupons are applied
                </p>
              </div>
            ) : (
              top3Performing.map((c, i) => (
                <div key={c.id}
                  className={`flex items-center gap-3 px-5 py-3.5
                    hover:bg-orange-50/30 transition-colors duration-150
                    ${i < top3Performing.length - 1
                      ? 'border-b border-gray-50' : ''}`}>
                  {/* Rank badge */}
                  <div className={`w-7 h-7 rounded-lg flex items-center
                    justify-center flex-shrink-0 text-xs font-extrabold
                    ${i === 0 ? 'bg-yellow-100 text-yellow-600'
                      : i === 1 ? 'bg-gray-200 text-gray-600'
                      : 'bg-orange-100 text-orange-600'
                    }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-pink-600
                        font-mono tracking-wider">
                        {c.couponCode}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5
                        rounded border
                        ${c.couponType === 'Percentage'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        {c.couponType === 'Percentage'
                          ? `${c.discountValue}%`
                          : `₹${c.discountValue}`
                        }
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium
                      truncate mt-0.5">
                      {c.couponTitle}
                    </p>
                  </div>
                  <div className="flex-shrink-0 min-w-[100px]">
                    <UsageBar
                      used={c.totalUsedCount}
                      total={c.totalUsageLimit}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {allPerforming.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
              <button type="button" onClick={() => setTopDrawer(true)}
                className="flex items-center gap-1.5 text-xs font-bold
                  text-pink-500 hover:text-pink-600 border-none bg-transparent
                  cursor-pointer transition-colors duration-150">
                View All {allPerforming.length} Coupons
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT — Expiring Soon ── */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col
          ${allExpiring.length > 0
            ? 'bg-white border-orange-200'
            : 'bg-white border-gray-100'
          }`}>

          <div className={`flex items-center gap-3 px-5 py-4 border-b
            ${allExpiring.length > 0
              ? 'border-orange-100 bg-orange-50/40'
              : 'border-gray-100'
            }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
              flex-shrink-0 relative
              ${allExpiring.length > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
              {allExpiring.length > 0 ? (
                <>
                  <FaClock className="text-orange-500 text-sm z-10 relative" />
                  <span className="absolute inset-0 rounded-xl animate-ping
                    opacity-20 bg-orange-400" />
                </>
              ) : (
                <FaCheckCircle className="text-green-500 text-sm" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-extrabold
                ${allExpiring.length > 0 ? 'text-orange-800' : 'text-gray-900'}`}>
                Expiring Soon
              </h3>
              <p className={`text-xs font-medium mt-0.5
                ${allExpiring.length > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                {allExpiring.length > 0
                  ? <>Showing 3 of{' '}
                      <strong className="text-orange-700">
                        {allExpiring.length}
                      </strong>
                      {' '}expiring within 7 days</>
                  : 'No coupons expiring within 7 days'
                }
              </p>
            </div>
            {allExpiring.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full
                bg-orange-200 text-orange-700 flex-shrink-0">
                {allExpiring.length}
              </span>
            )}
          </div>

          <div className="flex flex-col flex-1">
            {top3Expiring.length === 0 ? (
              <div className="flex flex-col items-center gap-2
                py-10 text-center px-5">
                <div className="w-10 h-10 rounded-xl bg-green-50
                  flex items-center justify-center">
                  <FaCheckCircle className="text-green-400 text-base" />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  All coupons are safe
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  No active coupons expiring within the next 7 days
                </p>
              </div>
            ) : (
              top3Expiring.map((c, i) => (
                <div key={c.id}
                  className={`flex items-center gap-3 px-5 py-3.5
                    hover:bg-orange-50/40 transition-colors duration-150
                    ${i < top3Expiring.length - 1
                      ? 'border-b border-orange-50' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-pink-50
                    flex items-center justify-center flex-shrink-0">
                    <FaTag className="text-pink-400 text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-pink-600
                      font-mono tracking-wider">
                      {c.couponCode}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium
                      truncate mt-0.5">
                      {c.couponTitle}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-extrabold
                      ${c.daysLeft === 0  ? 'text-red-600'
                        : c.daysLeft <= 2 ? 'text-red-500'
                        : 'text-orange-600'
                      }`}>
                      <FaClock className="inline text-[10px] mr-1" />
                      {c.daysLeft === 0 ? 'Today!' : `${c.daysLeft}d left`}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {new Date(c.expiryDate).toLocaleDateString('en-IN',
                        { day: '2-digit', month: 'short' }
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {allExpiring.length > 0 && (
            <div className="px-5 py-3 border-t border-orange-100 bg-orange-50/20">
              <button type="button" onClick={() => setExpiringDrawer(true)}
                className="flex items-center gap-1.5 text-xs font-bold
                  text-orange-600 hover:text-orange-700 border-none bg-transparent
                  cursor-pointer transition-colors duration-150">
                View All {allExpiring.length} Expiring Coupons
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Performing Drawer ── */}
      {topDrawer && (
        <ViewAllDrawer
          title="All Performing Coupons"
          subtitle={`${allPerforming.length} coupons with usage`}
          icon={<FaFire className="text-orange-500 text-sm" />}
          iconBg="bg-orange-50/60"
          items={allPerforming}
          onClose={() => setTopDrawer(false)}
          renderRow={(c, i) => (
            <div key={c.id}
              className="flex items-center gap-3 p-3.5 rounded-xl
                bg-gray-50 border border-gray-100
                hover:bg-pink-50/30 hover:border-pink-100
                transition-all duration-150">
              <div className={`w-7 h-7 rounded-lg flex items-center
                justify-center flex-shrink-0 text-[11px] font-extrabold
                ${i === 0 ? 'bg-yellow-100 text-yellow-600'
                  : i === 1 ? 'bg-gray-200 text-gray-600'
                  : i === 2 ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-pink-600
                    font-mono tracking-wider">
                    {c.couponCode}
                  </span>
                  <CouponStatusBadge status={c.computedStatus} />
                </div>
                <p className="text-[11px] text-gray-400 font-medium
                  truncate mt-0.5">
                  {c.couponTitle}
                </p>
              </div>
              <div className="flex-shrink-0 min-w-[110px]">
                <UsageBar used={c.totalUsedCount} total={c.totalUsageLimit} />
              </div>
            </div>
          )}
        />
      )}

      {/* ── Expiring Drawer ── */}
      {expiringDrawer && (
        <ViewAllDrawer
          title="All Expiring Coupons"
          subtitle={`${allExpiring.length} coupons expiring within 7 days`}
          icon={<FaClock className="text-orange-500 text-sm" />}
          iconBg="bg-orange-50/60"
          items={allExpiring}
          onClose={() => setExpiringDrawer(false)}
          renderRow={(c) => (
            <div key={c.id}
              className="flex items-center gap-3 p-3.5 rounded-xl
                bg-orange-50/40 border border-orange-100
                hover:bg-orange-50 transition-all duration-150">
              <div className="w-9 h-9 rounded-xl bg-white border border-orange-200
                flex items-center justify-center flex-shrink-0">
                <FaTag className="text-pink-400 text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-pink-600
                    font-mono tracking-wider">
                    {c.couponCode}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5
                    rounded border
                    ${c.couponType === 'Percentage'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                    {c.couponType === 'Percentage'
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`
                    }
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium
                  truncate mt-0.5">
                  {c.couponTitle}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-extrabold
                  ${c.daysLeft === 0  ? 'text-red-600'
                    : c.daysLeft <= 2 ? 'text-red-500'
                    : 'text-orange-600'
                  }`}>
                  <FaClock className="inline text-[10px] mr-1" />
                  {c.daysLeft === 0 ? 'Today!' : `${c.daysLeft}d left`}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {new Date(c.expiryDate).toLocaleDateString('en-IN',
                    { day: '2-digit', month: 'short', year: 'numeric' }
                  )}
                </p>
              </div>
            </div>
          )}
        />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// USAGE BREAKDOWN TABLE
// ═══════════════════════════════════════════════════════════════════

const UsageBreakdown = ({
  filteredBreakdownRows,
  healthSummary,
  allCount,
  bdSearch,  setBdSearch,
  bdSort,    setBdSort,
  bdHealth,  setBdHealth,
  bdPage,    setBdPage,
}) => {
  const healthConfig = {
    Healthy:   { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-200'    },
    Warning:   { dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    Critical:  { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    Exhausted: { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600 border-red-200'          },
    Unlimited: { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-600 border-blue-200'       },
  };

  const barColor = (pct) =>
    pct >= 100 ? 'bg-red-400'    :
    pct >= 80  ? 'bg-orange-400' :
    pct >= 50  ? 'bg-yellow-400' :
                 'bg-green-400';

  const paginatedRows = filteredBreakdownRows.slice(
    (bdPage - 1) * BREAKDOWN_ROWS_PAGE,
    bdPage * BREAKDOWN_ROWS_PAGE
  );

  const handleSearch = (v) => { setBdSearch(v); setBdPage(1); };
  const handleHealth = (v) => { setBdHealth(v); setBdPage(1); };
  const handleSort   = (v) => { setBdSort(v);   setBdPage(1); };
  const handleClear  = ()  => {
    setBdSearch(''); setBdHealth('All');
    setBdSort('used_desc'); setBdPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100
      shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100
          flex items-center justify-center flex-shrink-0">
          <FaChartBar className="text-pink-500 text-sm" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-gray-900">
            Coupon Usage Breakdown
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Per-coupon usage tracking — limits, remaining and health status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-pink-500 text-xs" />
            <span className="text-sm font-bold text-gray-900">Filters</span>
          </div>
          <button type="button" onClick={handleClear}
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
              <input type="text" value={bdSearch}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Code or title..."
                className={`${filterInputCls} pl-8`}
              />
              {bdSearch && (
                <button type="button" onClick={() => handleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600 cursor-pointer
                    border-none bg-transparent">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </FilterInput>

          <FilterInput label="Health Status">
            <select value={bdHealth}
              onChange={e => handleHealth(e.target.value)}
              className={`${filterInputCls} cursor-pointer`}>
              <option value="All">All ({allCount})</option>
              <option value="Healthy">Healthy ({healthSummary.healthy})</option>
              <option value="Warning">Warning ({healthSummary.warning})</option>
              <option value="Critical">Critical ({healthSummary.critical})</option>
              <option value="Exhausted">Exhausted ({healthSummary.exhausted})</option>
              <option value="Unlimited">Unlimited ({healthSummary.unlimited})</option>
            </select>
          </FilterInput>

          <FilterInput label="Sort By">
            <select value={bdSort}
              onChange={e => handleSort(e.target.value)}
              className={`${filterInputCls} cursor-pointer`}>
              <option value="used_desc">Most Used</option>
              <option value="used_asc">Least Used</option>
              <option value="pct_desc">Highest % Used</option>
              <option value="remaining_desc">Most Remaining</option>
            </select>
          </FilterInput>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Coupon', 'Type', 'Per User Limit',
                'Total Used', 'Usage Progress',
                'Remaining', 'Health', 'Status'].map(h => (
                <th key={h}
                  className="px-4 py-3 text-[11px] font-bold text-gray-500
                    uppercase tracking-wider whitespace-nowrap text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100
                      flex items-center justify-center">
                      <FaSearch className="text-gray-300 text-lg" />
                    </div>
                    <p className="text-sm font-bold text-gray-600">
                      No coupons match
                    </p>
                    <button type="button" onClick={handleClear}
                      className="text-xs font-bold text-pink-500
                        hover:text-pink-600 cursor-pointer border-none
                        bg-transparent transition-colors duration-150">
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((r, idx) => {
                const hc = healthConfig[r.health];
                return (
                  <tr key={r.id}
                    className={`transition-colors duration-150 hover:bg-pink-50/30
                      ${idx < paginatedRows.length - 1
                        ? 'border-b border-gray-50' : ''}`}>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl
                          bg-gradient-to-br from-pink-500 to-pink-700
                          flex items-center justify-center flex-shrink-0
                          shadow-[0_3px_10px_rgba(236,72,153,0.2)]">
                          <FaTag className="text-white text-xs" />
                        </div>
                        <div>
                          <p className="font-extrabold text-pink-600
                            font-mono tracking-wider text-sm">
                            {r.couponCode}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium
                            mt-0.5 truncate max-w-[150px]">
                            {r.couponTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1
                        text-xs font-bold px-2.5 py-1 rounded-lg
                        ${r.couponType === 'Percentage'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {r.couponType === 'Percentage'
                          ? <FaPercent className="text-[9px]" />
                          : <FaRupeeSign className="text-[9px]" />
                        }
                        {r.couponType === 'Percentage'
                          ? `${r.discountValue}%`
                          : `₹${r.discountValue}`
                        }
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {r.perUser ? (
                        <span className="text-sm font-bold text-gray-700">
                          {r.perUser}{' '}
                          <span className="text-xs text-gray-400 font-medium">
                            use{r.perUser > 1 ? 's' : ''}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">
                          Unlimited
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-gray-900">
                          {r.used}
                        </span>
                        {r.limit && (
                          <span className="text-xs text-gray-400 font-medium">
                            / {r.limit}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 min-w-[160px]">
                      {r.limit ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-500">
                              {r.pct}% used
                            </span>
                            {r.pct >= 80 && (
                              <FaExclamationCircle className={`text-[11px]
                                ${r.pct >= 100
                                  ? 'text-red-400' : 'text-orange-400'}`} />
                            )}
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all
                                duration-500 ${barColor(r.pct)}`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 flex-1 bg-blue-100 rounded-full" />
                          <span className="text-[11px] font-bold text-blue-500">
                            ∞
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {r.remaining !== null ? (
                        <span className={`text-sm font-extrabold
                          ${r.remaining === 0  ? 'text-red-500'
                            : r.remaining <= 20 ? 'text-orange-500'
                            : 'text-gray-800'
                          }`}>
                          {r.remaining}
                          <span className="text-[11px] font-medium
                            text-gray-400 ml-1">
                            left
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-500">
                          Unlimited
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5
                        px-2.5 py-1 rounded-full text-xs font-bold border
                        ${hc.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full
                          flex-shrink-0 ${hc.dot}`} />
                        {r.health}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <CouponStatusBadge status={r.computedStatus} />
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredBreakdownRows.length > BREAKDOWN_ROWS_PAGE && (
        <Pagination
          total={filteredBreakdownRows.length}
          page={bdPage}
          perPage={BREAKDOWN_ROWS_PAGE}
          onChange={setBdPage}
        />
      )}

      {/* Footer */}
      {filteredBreakdownRows.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500 font-medium">
            Showing{' '}
            <strong className="text-gray-900">
              {Math.min((bdPage - 1) * BREAKDOWN_ROWS_PAGE + 1,
                filteredBreakdownRows.length)}
            </strong>
            {' – '}
            <strong className="text-gray-900">
              {Math.min(bdPage * BREAKDOWN_ROWS_PAGE,
                filteredBreakdownRows.length)}
            </strong>
            {' of '}
            <strong className="text-gray-900">
              {filteredBreakdownRows.length}
            </strong>
            {' '}coupons
            {bdHealth !== 'All' && (
              <span className="ml-1 text-pink-500 font-bold">
                · filtered by {bdHealth}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE — pure UI only, zero logic
// ═══════════════════════════════════════════════════════════════════

const Coupons = () => {
  const {
    allCoupons, coupons, loading, stats,
    getComputedStatus,
    // main filters
    search,       setSearch,
    filterStatus, setFilterStatus,
    filterType,   setFilterType,
    filterFor,    setFilterFor,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,
    // top + expiring
    allPerforming, top3Performing,
    allExpiring,   top3Expiring,
    // breakdown
    filteredBreakdownRows, healthSummary,
    bdSearch,  setBdSearch,
    bdSort,    setBdSort,
    bdHealth,  setBdHealth,
    bdPage,    setBdPage,
    // modals
    addModal,    setAddModal,
    editModal,   setEditModal,
    viewModal,   setViewModal,
    deleteModal, setDeleteModal,
    selected,    setSelected,
    // actions
    handleAdd, handleEdit, handleDelete, handleToggleStatus,
  } = useCoupons();

  const [page,     setPage]     = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  const paginated = coupons.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const handleSearch = (v) => { setSearch(v);       setPage(1); };
  const handleStatus = (v) => { setFilterStatus(v); setPage(1); };
  const handleType   = (v) => { setFilterType(v);   setPage(1); };
  const handleFor    = (v) => { setFilterFor(v);    setPage(1); };
  const handleFrom   = (v) => { setDateFrom(v);     setPage(1); };
  const handleTo     = (v) => { setDateTo(v);       setPage(1); };

  const handleClearFilters = () => {
    handleSearch(''); handleStatus('All');
    handleType('All'); handleFor('All');
    handleFrom('');   handleTo('');
  };

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Layout>
      <div className="fade-up max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900
              tracking-tight mb-1">
              Coupons
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage discount coupons, usage limits and validity
            </p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold
              text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl
              shadow-md shadow-pink-200 hover:from-pink-600 hover:to-pink-700
              hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200 cursor-pointer border-none">
            <FaPlus className="text-[11px]" /> Create Coupon
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
          <StatCard label="Total Coupons"  value={stats.total}
            sub="All coupons created"     icon={<FaTag />}             color="pink"   />
          <StatCard label="Active Coupons" value={stats.active}
            sub={`${stats.total
              ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
            icon={<FaCheckCircle />}                                    color="green"  />
          <StatCard label="Exhausted"      value={stats.exhausted}
            sub="Usage limit reached"     icon={<FaFire />}            color="orange" />
          <StatCard label="Expired"        value={stats.expired}
            sub="Past expiry date"        icon={<FaExclamationCircle />} color="red"  />
        </div>

        {/* ══ TOP PERFORMING + EXPIRING — 2 column ══ */}
        {!loading && (
          <TopAndExpiring
            allPerforming={allPerforming}
            top3Performing={top3Performing}
            allExpiring={allExpiring}
            top3Expiring={top3Expiring}
          />
        )}

        {/* ── Quick Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap -mt-2">
          {['All','Active','Inactive','Expired','Scheduled','Exhausted'].map(tab => (
            <button key={tab} onClick={() => handleStatus(tab)}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg
                border-none cursor-pointer transition-all duration-200
                ${filterStatus === tab
                  ? 'bg-pink-50 text-pink-500'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}>
              {tab}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500 font-medium">
            Showing{' '}
            <strong className="text-gray-900">{coupons.length}</strong>
            {' '}of{' '}
            <strong className="text-gray-900">{stats.total}</strong> coupons
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
                  placeholder="Code, title..."
                  className={`${filterInputCls} pl-8`}
                />
              </div>
            </FilterInput>

            <FilterInput label="Status">
              <select value={filterStatus}
                onChange={e => handleStatus(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Exhausted">Exhausted</option>
              </select>
            </FilterInput>

            <FilterInput label="Coupon Type">
              <select value={filterType}
                onChange={e => handleType(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Types</option>
                {couponTypeOptions.map(t => <option key={t}>{t}</option>)}
              </select>
            </FilterInput>

            <FilterInput label="Applicable For">
              <select value={filterFor}
                onChange={e => handleFor(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All</option>
                {applicableForOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </FilterInput>

            <FilterInput label="Expiry From">
              <input type="date" value={dateFrom}
                onChange={e => handleFrom(e.target.value)}
                max={dateTo || undefined}
                className={filterInputCls}
              />
            </FilterInput>

            <FilterInput label="Expiry To">
              <input type="date" value={dateTo}
                onChange={e => handleTo(e.target.value)}
                min={dateFrom || undefined}
                className={filterInputCls}
              />
            </FilterInput>

          </div>
        </div>

        {/* ── Coupon List Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100
          overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Coupon List</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'} found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Coupon','Type','Discount','Applicable',
                    'Validity','Usage','Status','Actions'].map(h => (
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
                              <FaTag className="text-pink-300 text-2xl" />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">
                              No coupons found
                            </p>
                            <p className="text-gray-500 text-xs font-medium">
                              Try adjusting your filters or create a new coupon
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paginated.map((c, idx) => (
                      <tr key={c.id}
                        className={`transition-colors duration-150
                          hover:bg-pink-50/30
                          ${idx < paginated.length - 1
                            ? 'border-b border-gray-50' : ''}`}>

                        {/* Coupon */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-[42px] h-[42px] rounded-[10px]
                              bg-gradient-to-br from-pink-500 to-pink-700
                              flex items-center justify-center flex-shrink-0
                              shadow-[0_3px_10px_rgba(236,72,153,0.2)]">
                              <FaTag className="text-white text-sm" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-extrabold text-pink-600
                                  font-mono tracking-wider text-sm">
                                  {c.couponCode}
                                </p>
                                <button
                                  onClick={() => copyCode(c.id, c.couponCode)}
                                  title="Copy code"
                                  className={`w-5 h-5 rounded flex items-center
                                    justify-center border-none cursor-pointer
                                    transition-all duration-200
                                    ${copiedId === c.id
                                      ? 'bg-green-100 text-green-500'
                                      : 'bg-gray-100 text-gray-400 hover:bg-pink-100 hover:text-pink-500'
                                    }`}>
                                  {copiedId === c.id
                                    ? <FaCheckCircle className="text-[9px]" />
                                    : <FaCopy className="text-[9px]" />
                                  }
                                </button>
                              </div>
                              <p className="text-[11.5px] text-gray-500
                                font-medium mt-0.5 truncate max-w-[160px]">
                                {c.couponTitle}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1
                            text-xs font-bold px-2.5 py-1 rounded-lg
                            ${c.couponType === 'Percentage'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                            {c.couponType === 'Percentage'
                              ? <FaPercent className="text-[9px]" />
                              : <FaRupeeSign className="text-[9px]" />
                            }
                            {c.couponType}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-extrabold text-gray-900">
                            {c.couponType === 'Percentage'
                              ? `${c.discountValue}%`
                              : `₹${c.discountValue}`
                            }
                          </p>
                          {c.minOrderAmount > 0 && (
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                              Min ₹{c.minOrderAmount}
                            </p>
                          )}
                        </td>

                        {/* Applicable */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-xs
                            font-semibold text-gray-600">
                            <FaUsers className="text-gray-400 text-[10px]" />
                            {c.applicableFor}
                          </div>
                          {c.firstOrderOnly && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5
                              rounded bg-yellow-50 border border-yellow-200
                              text-yellow-700 mt-1 inline-block">
                              1st order
                            </span>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs
                            font-medium text-gray-600">
                            <FaCalendarAlt className="text-gray-400 text-[10px]" />
                            {new Date(c.expiryDate).toLocaleDateString('en-IN',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            From {new Date(c.startDate).toLocaleDateString('en-IN',
                              { day: '2-digit', month: 'short' }
                            )}
                          </p>
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-3.5">
                          <UsageBar
                            used={c.totalUsedCount || 0}
                            total={c.totalUsageLimit}
                          />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <CouponStatusBadge status={getComputedStatus(c)} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setSelected(c); setViewModal(true); }}
                              title="View"
                              className="w-9 h-9 rounded-xl flex items-center
                                justify-center border-none cursor-pointer
                                bg-blue-50 text-blue-500 hover:bg-blue-500
                                hover:text-white
                                hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => { setSelected(c); setEditModal(true); }}
                              title="Edit"
                              className="w-9 h-9 rounded-xl flex items-center
                                justify-center border-none cursor-pointer
                                bg-pink-50 text-pink-500 hover:bg-pink-500
                                hover:text-white
                                hover:shadow-[0_4px_12px_rgba(236,72,153,0.4)]
                                transition-all duration-200 active:scale-90">
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(c)}
                              title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                              className={`w-9 h-9 rounded-xl flex items-center
                                justify-center border-none cursor-pointer
                                transition-all duration-200 active:scale-90
                                ${c.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-500 hover:text-white hover:shadow-[0_4px_12px_rgba(107,114,128,0.4)]'
                                }`}>
                              {c.status === 'Active'
                                ? <FaToggleOn  className="text-base" />
                                : <FaToggleOff className="text-base" />
                              }
                            </button>
                            <button
                              onClick={() => { setSelected(c); setDeleteModal(true); }}
                              title="Delete"
                              className="w-9 h-9 rounded-xl flex items-center
                                justify-center border-none cursor-pointer
                                bg-red-50 text-red-500 hover:bg-red-500
                                hover:text-white
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

          {!loading && coupons.length > 0 && (
            <Pagination
              total={coupons.length}
              page={page}
              perPage={ROWS_PER_PAGE}
              onChange={setPage}
            />
          )}
        </div>

        {/* ══ USAGE BREAKDOWN ══ */}
        {!loading && (
          <UsageBreakdown
            filteredBreakdownRows={filteredBreakdownRows}
            healthSummary={healthSummary}
            allCount={allCoupons.length}
            bdSearch={bdSearch}   setBdSearch={setBdSearch}
            bdSort={bdSort}       setBdSort={setBdSort}
            bdHealth={bdHealth}   setBdHealth={setBdHealth}
            bdPage={bdPage}       setBdPage={setBdPage}
          />
        )}

      </div>

      {/* ── Modals ── */}
      {addModal && (
        <AddCouponModal
          onClose={() => setAddModal(false)}
          onSubmit={handleAdd}
        />
      )}
      {editModal && selected && (
        <EditCouponModal
          coupon={selected}
          onClose={() => { setEditModal(false); setSelected(null); }}
          onSubmit={handleEdit}
        />
      )}
      {viewModal && selected && (
        <ViewCouponModal
          coupon={selected}
          onClose={() => { setViewModal(false); setSelected(null); }}
          onEdit={() => { setViewModal(false); setEditModal(true); }}
          getComputedStatus={getComputedStatus}
        />
      )}
      {deleteModal && selected && (
        <DeleteCouponModal
          coupon={selected}
          onClose={() => { setDeleteModal(false); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
};

export default Coupons;
