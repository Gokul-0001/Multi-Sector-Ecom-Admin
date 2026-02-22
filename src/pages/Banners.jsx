import { useState } from 'react';
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaImage, FaToggleOn, FaToggleOff,
  FaChevronLeft, FaChevronRight,
  FaFilter, FaTimes, FaClock,
  FaCheckCircle, FaExclamationCircle,
  FaCalendarAlt, FaDesktop, FaMobile,
  FaLayerGroup, FaRocket, FaArrowRight,
} from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import useBanners from '../hooks/useBanners';
import {
  AddBannerModal,
  EditBannerModal,
  ViewBannerModal,
  DeleteBannerModal,
  BannerStatusBadge,
  BannerTypeBadge,
} from '../components/modals/BannerModals';
import {
  bannerTypeOptions, displayPositionOptions,
  deviceTargetOptions,
} from '../data/mockBanners';
import Portal from '../components/ui/Portal';

const ROWS_PER_PAGE   = 10;
const DRAWER_PER_PAGE = 8;

// ═══════════════════════════════════════════════════════════════════
// IMAGE THUMB — safe thumbnail for table + drawer
// works with both URL and base64, with graceful fallback
// ═══════════════════════════════════════════════════════════════════

const ImageThumb = ({ src, alt = '', className = '' }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center
        bg-gray-100 border border-gray-200 ${className}`}>
        <FaImage className="text-gray-300 text-sm" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

const StatCard = ({ label, value, sub, icon, color }) => {
  const colorMap = {
    pink:   { wrap: 'bg-pink-50 border-pink-100',     icon: 'text-pink-500'   },
    green:  { wrap: 'bg-green-50 border-green-200',   icon: 'text-green-600'  },
    blue:   { wrap: 'bg-blue-50 border-blue-200',     icon: 'text-blue-500'   },
    orange: { wrap: 'bg-orange-50 border-orange-200', icon: 'text-orange-600' },
    red:    { wrap: 'bg-red-50 border-red-200',       icon: 'text-red-600'    },
  };
  const c = colorMap[color] || colorMap.pink;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100
      flex items-start justify-between
      shadow-sm hover:shadow-md hover:-translate-y-0.5
      transition-all duration-200">
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
// FILTER INPUT
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
// SKELETON
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
    return pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'));
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
              className={`flex items-center justify-center min-w-[34px]
                h-[34px] px-1.5 rounded-lg border text-sm font-semibold
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

  const filtered = items.filter(b => {
    const q = drawerSearch.toLowerCase();
    return (
      b.bannerTitle.toLowerCase().includes(q) ||
      (b.bannerSubtitle && b.bannerSubtitle.toLowerCase().includes(q))
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
              onChange={e => { setDrawerSearch(e.target.value); setDrawerPage(1); }}
              placeholder="Search by title or subtitle..."
              className="w-full pl-8 pr-8 py-2.5 text-sm font-medium
                text-gray-800 bg-gray-50 border border-gray-100 rounded-xl
                outline-none transition-all duration-200 placeholder-gray-400
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
                onClick={() => { setDrawerSearch(''); setDrawerPage(1); }}
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
// BANNER ALERTS — Expiring Soon + Going Live Soon
// with empty states when no data
// ═══════════════════════════════════════════════════════════════════

const BannerAlerts = ({ expiringBanners, upcomingBanners }) => {
  const [expiringDrawer, setExpiringDrawer] = useState(false);
  const [upcomingDrawer, setUpcomingDrawer] = useState(false);

  const top3Expiring = expiringBanners.slice(0, 3);
  const top3Upcoming = upcomingBanners.slice(0, 3);

  const fmtShort = (dt) => new Date(dt).toLocaleDateString('en-IN',
    { day: '2-digit', month: 'short' }
  );

  const EmptyAlert = ({ mode }) => (
    <div className="flex flex-col flex-1 items-center justify-center py-6">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        {mode === 'expiring'
          ? <FaClock className="text-gray-300 text-sm" />
          : <FaRocket className="text-gray-300 text-sm" />
        }
      </div>
      <p className="text-sm font-semibold text-gray-600 mt-2">
        {mode === 'expiring'
          ? 'No banners expiring in the next 7 days'
          : 'No banners scheduled to go live soon'}
      </p>
    </div>
  );

  const DrawerRow = ({ b, mode }) => (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl
      border transition-all duration-150
      ${mode === 'expiring'
        ? 'bg-orange-50/40 border-orange-100 hover:bg-orange-50'
        : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50'
      }`}>
      <ImageThumb
        src={b.imageDesktop}
        alt={b.bannerTitle}
        className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-100"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {b.bannerTitle}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <BannerTypeBadge type={b.bannerType} />
          <BannerStatusBadge status={mode === 'expiring' ? 'Active' : 'Scheduled'} />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {mode === 'expiring' ? (
          <>
            <p className={`text-xs font-extrabold
              ${b.daysLeft === 0 ? 'text-red-600'
                : b.daysLeft <= 2 ? 'text-red-500'
                : 'text-orange-600'}`}>
              <FaClock className="inline text-[10px] mr-1" />
              {b.daysLeft === 0 ? 'Today!' : `${b.daysLeft}d left`}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Ends {new Date(b.endDate).toLocaleDateString('en-IN',
                { day: '2-digit', month: 'short', year: 'numeric' }
              )}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-extrabold text-blue-600">
              <FaRocket className="inline text-[10px] mr-1" />
              {b.daysToLive === 0 ? 'Today!' : `in ${b.daysToLive}d`}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Live {new Date(b.startDate).toLocaleDateString('en-IN',
                { day: '2-digit', month: 'short', year: 'numeric' }
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

{/* ── LEFT — Going Live Soon ── */}
<div className="bg-white rounded-2xl border border-blue-200
  shadow-sm overflow-hidden flex flex-col">
  <div className="flex items-center gap-3 px-5 py-4
    border-b border-blue-100 bg-blue-50/40">
    <div className="w-9 h-9 rounded-xl bg-blue-100
      flex items-center justify-center flex-shrink-0">
      <FaRocket className="text-blue-500 text-sm" />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-extrabold text-blue-800">
        Going Live Soon
      </h3>
      {upcomingBanners.length > 0 ? (
        <p className="text-xs text-blue-600 font-medium mt-0.5">
          Showing 3 of{' '}
          <strong className="text-blue-700">
            {upcomingBanners.length}
          </strong>
          {' '}scheduled banners
        </p>
      ) : (
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          No banners scheduled to go live soon
        </p>
      )}
    </div>
    <span className="text-xs font-bold px-2 py-0.5 rounded-full
      bg-blue-200 text-blue-700 flex-shrink-0">
      {upcomingBanners.length}
    </span>
  </div>

  {upcomingBanners.length === 0 ? (
    <EmptyAlert mode="upcoming" />
  ) : (
    <>
      <div className="flex flex-col flex-1">
        {top3Upcoming.map((b, i) => (
          <div key={b.id}
            className={`flex items-center gap-3 px-5 py-3.5
              hover:bg-blue-50/30 transition-colors duration-150
              ${i < top3Upcoming.length - 1
                ? 'border-b border-blue-50' : ''}`}>
            <ImageThumb
              src={b.imageDesktop}
              alt={b.bannerTitle}
              className="w-10 h-10 rounded-lg flex-shrink-0
                border border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {b.bannerTitle}
              </p>
              <div className="mt-0.5">
                <BannerTypeBadge type={b.bannerType} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-extrabold text-blue-600">
                <FaRocket className="inline text-[10px] mr-1" />
                {b.daysToLive === 0 ? 'Today!' : `in ${b.daysToLive}d`}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {fmtShort(b.startDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-blue-100 bg-blue-50/20">
        <button type="button" onClick={() => setUpcomingDrawer(true)}
          className="flex items-center gap-1.5 text-xs font-bold
            text-blue-600 hover:text-blue-700 border-none bg-transparent
            cursor-pointer transition-colors duration-150">
          View All {upcomingBanners.length} Scheduled Banners
          <FaArrowRight className="text-[10px]" />
        </button>
      </div>
    </>
  )}
</div>

{/* ── RIGHT — Expiring Soon ── */}
<div className="bg-white rounded-2xl border border-orange-200
  shadow-sm overflow-hidden flex flex-col">
  <div className="flex items-center gap-3 px-5 py-4
    border-b border-orange-100 bg-orange-50/40">
    <div className="w-9 h-9 rounded-xl bg-orange-100
      flex items-center justify-center flex-shrink-0 relative">
      <FaClock className="text-orange-500 text-sm z-10 relative" />
      <span className="absolute inset-0 rounded-xl animate-ping
        opacity-20 bg-orange-400" />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-extrabold text-orange-800">
        Expiring Soon
      </h3>
      {expiringBanners.length > 0 ? (
        <p className="text-xs text-orange-600 font-medium mt-0.5">
          Showing 3 of{' '}
          <strong className="text-orange-700">
            {expiringBanners.length}
          </strong>
          {' '}banners ending within 7 days
        </p>
      ) : (
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          No banners expiring in the next 7 days
        </p>
      )}
    </div>
    <span className="text-xs font-bold px-2 py-0.5 rounded-full
      bg-orange-200 text-orange-700 flex-shrink-0">
      {expiringBanners.length}
    </span>
  </div>

  {expiringBanners.length === 0 ? (
    <EmptyAlert mode="expiring" />
  ) : (
    <>
      <div className="flex flex-col flex-1">
        {top3Expiring.map((b, i) => (
          <div key={b.id}
            className={`flex items-center gap-3 px-5 py-3.5
              hover:bg-orange-50/30 transition-colors duration-150
              ${i < top3Expiring.length - 1
                ? 'border-b border-orange-50' : ''}`}>
            <ImageThumb
              src={b.imageDesktop}
              alt={b.bannerTitle}
              className="w-10 h-10 rounded-lg flex-shrink-0
                border border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {b.bannerTitle}
              </p>
              <div className="mt-0.5">
                <BannerTypeBadge type={b.bannerType} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-xs font-extrabold
                ${b.daysLeft === 0 ? 'text-red-600'
                  : b.daysLeft <= 2 ? 'text-red-500'
                  : 'text-orange-600'}`}>
                <FaClock className="inline text-[10px] mr-1" />
                {b.daysLeft === 0 ? 'Today!' : `${b.daysLeft}d left`}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {fmtShort(b.endDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-orange-100 bg-orange-50/20">
        <button type="button" onClick={() => setExpiringDrawer(true)}
          className="flex items-center gap-1.5 text-xs font-bold
            text-orange-600 hover:text-orange-700 border-none bg-transparent
            cursor-pointer transition-colors duration-150">
          View All {expiringBanners.length} Expiring Banners
          <FaArrowRight className="text-[10px]" />
        </button>
      </div>
    </>
  )}
</div>

</div>


      {/* Drawers */}
      {expiringDrawer && (
        <ViewAllDrawer
          title="All Expiring Banners"
          subtitle={`${expiringBanners.length} banners ending within 7 days`}
          icon={<FaClock className="text-orange-500 text-sm" />}
          iconBg="bg-orange-50/60"
          items={expiringBanners}
          onClose={() => setExpiringDrawer(false)}
          renderRow={(b) => (
            <DrawerRow key={b.id} b={b} mode="expiring" />
          )}
        />
      )}

      {upcomingDrawer && (
        <ViewAllDrawer
          title="All Scheduled Banners"
          subtitle={`${upcomingBanners.length} banners going live soon`}
          icon={<FaRocket className="text-blue-500 text-sm" />}
          iconBg="bg-blue-50/60"
          items={upcomingBanners}
          onClose={() => setUpcomingDrawer(false)}
          renderRow={(b) => (
            <DrawerRow key={b.id} b={b} mode="upcoming" />
          )}
        />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TYPE SUMMARY
// ═══════════════════════════════════════════════════════════════════

const TypeSummary = ({ byType }) => {
  const typeColor = {
    Homepage: 'bg-pink-50 text-pink-600 border-pink-100',
    Category: 'bg-purple-50 text-purple-600 border-purple-100',
    Offer:    'bg-orange-50 text-orange-600 border-orange-100',
    Campaign: 'bg-blue-50 text-blue-600 border-blue-100',
    Popup:    'bg-yellow-50 text-yellow-600 border-yellow-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100
      shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <FaLayerGroup className="text-pink-500 text-xs" />
        <span className="text-sm font-bold text-gray-900">By Type</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {bannerTypeOptions.map(t => (
          <div key={t}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl
              border text-xs font-bold ${typeColor[t]}`}>
            {t}
            <span className="font-extrabold">{byType[t] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

const Banners = () => {
  const {
    banners, loading, stats,
    byType, getComputedStatus,
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
    handleAdd, handleEdit, handleDelete, handleToggleStatus,
  } = useBanners();

  const [page, setPage] = useState(1);

  const paginated = banners.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const handleSearch   = (v) => { setSearch(v);         setPage(1); };
  const handleStatus   = (v) => { setFilterStatus(v);   setPage(1); };
  const handleType     = (v) => { setFilterType(v);     setPage(1); };
  const handlePosition = (v) => { setFilterPosition(v); setPage(1); };
  const handleDevice   = (v) => { setFilterDevice(v);   setPage(1); };
  const handleFrom     = (v) => { setDateFrom(v);       setPage(1); };
  const handleTo       = (v) => { setDateTo(v);         setPage(1); };

  const handleClearFilters = () => {
    handleSearch('');    handleStatus('All');
    handleType('All');   handlePosition('All');
    handleDevice('All'); handleFrom('');
    handleTo('');
  };

  const fmt = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN',
      { day: '2-digit', month: 'short', year: 'numeric' }
    );
  };

  return (
    <Layout>
      <div className="fade-up max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900
              tracking-tight mb-1">
              Banners
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage promotional banners, placements and schedules
            </p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold
              text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl
              shadow-md shadow-pink-200 hover:from-pink-600 hover:to-pink-700
              hover:-translate-y-0.5 hover:shadow-lg
              transition-all duration-200 cursor-pointer border-none">
            <FaPlus className="text-[11px]" /> Create Banner
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
          <StatCard label="Total Banners" value={stats.total}
            sub="All banners"         icon={<FaImage />}             color="pink"   />
          <StatCard label="Active"       value={stats.active}
            sub="Currently live"      icon={<FaCheckCircle />}       color="green"  />
          <StatCard label="Scheduled"    value={stats.scheduled}
            sub="Going live soon"     icon={<FaRocket />}            color="blue"   />
          <StatCard label="Draft"        value={stats.draft}
            sub="Not yet published"   icon={<FaLayerGroup />}        color="orange" />
          <StatCard label="Expired"      value={stats.expired}
            sub="Past end date"       icon={<FaExclamationCircle />} color="red"    />
        </div>

        {/* ── Type Summary ── */}
        {!loading && <TypeSummary byType={byType} />}

        {/* ── Alerts ── */}
        {!loading && (
          <BannerAlerts
            expiringBanners={expiringBanners}
            upcomingBanners={upcomingBanners}
          />
        )}

        {/* ── Quick Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap -mt-2">
          {['All','Active','Scheduled','Draft','Paused','Expired'].map(tab => (
            <button key={tab}
              onClick={() => handleStatus(tab)}
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
            <strong className="text-gray-900">{banners.length}</strong>
            {' '}of{' '}
            <strong className="text-gray-900">{stats.total}</strong> banners
          </span>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100
          p-5 shadow-sm">
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-3">

            <FilterInput label="Search">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2
                  text-gray-300 text-xs pointer-events-none" />
                <input type="text" value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Title, subtitle..."
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
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
                <option value="Expired">Expired</option>
              </select>
            </FilterInput>

            <FilterInput label="Banner Type">
              <select value={filterType}
                onChange={e => handleType(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Types</option>
                {bannerTypeOptions.map(t => <option key={t}>{t}</option>)}
              </select>
            </FilterInput>

            <FilterInput label="Position">
              <select value={filterPosition}
                onChange={e => handlePosition(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Positions</option>
                {displayPositionOptions.map(p => <option key={p}>{p}</option>)}
              </select>
            </FilterInput>

            <FilterInput label="Device">
              <select value={filterDevice}
                onChange={e => handleDevice(e.target.value)}
                className={`${filterInputCls} cursor-pointer`}>
                <option value="All">All Devices</option>
                {deviceTargetOptions.map(d => <option key={d}>{d}</option>)}
              </select>
            </FilterInput>

            <FilterInput label="End Date From">
              <input type="date" value={dateFrom}
                onChange={e => handleFrom(e.target.value)}
                max={dateTo || undefined}
                className={filterInputCls}
              />
            </FilterInput>

            <FilterInput label="End Date To">
              <input type="date" value={dateTo}
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
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Banner List</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {banners.length} {banners.length === 1 ? 'banner' : 'banners'} found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Banner','Type','Position','Device',
                    'Scheduling','Targeting','Status','Actions'].map(h => (
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
                              <FaImage className="text-pink-300 text-2xl" />
                            </div>
                            <p className="font-bold text-gray-700 text-sm">
                              No banners found
                            </p>
                            <p className="text-gray-500 text-xs font-medium">
                              Try adjusting filters or create a new banner
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paginated.map((b, idx) => (
                      <tr key={b.id}
                        className={`transition-colors duration-150
                          hover:bg-pink-50/30
                          ${idx < paginated.length - 1
                            ? 'border-b border-gray-50' : ''}`}>

                        {/* Banner */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <ImageThumb
                              src={b.imageDesktop}
                              alt={b.bannerTitle}
                              className="w-14 h-10 rounded-lg flex-shrink-0
                                border border-gray-100"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm
                                truncate max-w-[160px]">
                                {b.bannerTitle}
                              </p>
                              {b.bannerSubtitle && (
                                <p className="text-[11px] text-gray-400
                                  font-medium truncate max-w-[160px] mt-0.5">
                                  {b.bannerSubtitle}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                <span title="Desktop image"
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${b.imageDesktop ? 'bg-green-400' : 'bg-gray-200'}`}
                                />
                                <span className={`text-[9px] font-semibold
                                  ${b.imageDesktop ? 'text-green-600' : 'text-gray-400'}`}>
                                  D
                                </span>
                                <span title="Mobile image"
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${b.imageMobile ? 'bg-green-400' : 'bg-gray-200'}`}
                                />
                                <span className={`text-[9px] font-semibold
                                  ${b.imageMobile ? 'text-green-600' : 'text-gray-400'}`}>
                                  M
                                </span>
                                {b.fullWidth && (
                                  <span className="text-[9px] font-bold
                                    text-pink-400 ml-0.5">
                                    Full
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <BannerTypeBadge type={b.bannerType} />
                          <p className="text-[10px] text-gray-400
                            font-medium mt-1">{b.showAs}</p>
                        </td>

                        {/* Position */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-gray-700">
                            {b.displayPosition}
                          </p>
                          <p className="text-[10px] text-gray-400
                            font-medium mt-0.5">
                            Priority #{b.displayOrder || '—'}
                          </p>
                        </td>

                        {/* Device */}
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2 py-0.5
                            rounded-lg border
                            ${b.deviceTarget === 'All'
                              ? 'bg-gray-50 text-gray-600 border-gray-200'
                              : b.deviceTarget === 'Mobile'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-purple-50 text-purple-600 border-purple-100'
                            }`}>
                            {b.deviceTarget}
                          </span>
                        </td>

                        {/* Scheduling */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {b.alwaysShow ? (
                            <span className="text-xs font-bold text-green-600
                              flex items-center gap-1">
                              <FaCheckCircle className="text-[10px]" />
                              Always On
                            </span>
                          ) : (
                            <>
                              <div className="flex items-center gap-1
                                text-xs font-medium text-gray-600">
                                <FaCalendarAlt className="text-gray-400 text-[10px]" />
                                {fmt(b.endDate)}
                              </div>
                              <p className="text-[10px] text-gray-400
                                font-medium mt-0.5">
                                From {fmt(b.startDate)}
                              </p>
                            </>
                          )}
                        </td>

                        {/* Targeting */}
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-semibold text-gray-700">
                            {b.customerType}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {b.newUsersOnly && (
                              <span className="text-[9px] font-bold px-1.5
                                py-0.5 rounded bg-yellow-50 border
                                border-yellow-200 text-yellow-700">
                                New only
                              </span>
                            )}
                            {b.loggedInOnly && (
                              <span className="text-[9px] font-bold px-1.5
                                py-0.5 rounded bg-blue-50 border
                                border-blue-200 text-blue-600">
                                Logged in
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <BannerStatusBadge status={getComputedStatus(b)} />
                          {b.redirectType !== 'None' && (
                            <p className="text-[10px] text-gray-400
                              font-medium mt-1">
                              → {b.redirectType}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setSelected(b); setViewModal(true); }}
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
                              onClick={() => { setSelected(b); setEditModal(true); }}
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
                              onClick={() => handleToggleStatus(b)}
                              title={b.status === 'Active' ? 'Pause' : 'Activate'}
                              className={`w-9 h-9 rounded-xl flex items-center
                                justify-center border-none cursor-pointer
                                transition-all duration-200 active:scale-90
                                ${b.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-500 hover:text-white hover:shadow-[0_4px_12px_rgba(107,114,128,0.4)]'
                                }`}>
                              {b.status === 'Active'
                                ? <FaToggleOn  className="text-base" />
                                : <FaToggleOff className="text-base" />
                              }
                            </button>
                            <button
                              onClick={() => { setSelected(b); setDeleteModal(true); }}
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

          {!loading && banners.length > 0 && (
            <Pagination
              total={banners.length}
              page={page}
              perPage={ROWS_PER_PAGE}
              onChange={setPage}
            />
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      {addModal && (
        <AddBannerModal
          onClose={() => setAddModal(false)}
          onSubmit={handleAdd}
        />
      )}
      {editModal && selected && (
        <EditBannerModal
          banner={selected}
          onClose={() => { setEditModal(false); setSelected(null); }}
          onSubmit={handleEdit}
        />
      )}
      {viewModal && selected && (
        <ViewBannerModal
          banner={selected}
          onClose={() => { setViewModal(false); setSelected(null); }}
          onEdit={() => { setViewModal(false); setEditModal(true); }}
          getComputedStatus={getComputedStatus}
        />
      )}
      {deleteModal && selected && (
        <DeleteBannerModal
          banner={selected}
          onClose={() => { setDeleteModal(false); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
};

export default Banners;
