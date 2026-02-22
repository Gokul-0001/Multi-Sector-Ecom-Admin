import { useState } from 'react';
import {
  FaTimes, FaTag, FaPercent, FaRupeeSign,
  FaCalendarAlt, FaUsers, FaStore, FaBoxOpen,
  FaExclamationTriangle, FaCheckCircle, FaCopy,
  FaInfoCircle, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';
import Portal from '../ui/Portal';
import {
  couponTypeOptions, applicableForOptions,
  applicableProductOptions, applicableSiteOptions,
  couponStatusOptions,
} from '../../data/mockCoupons';

// ═══════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

const ModalWrapper = ({ onClose, children }) => (
  <Portal>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]
        flex items-center justify-center p-4"
      onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
          flex flex-col max-h-[90vh]">
        {children}
      </div>
    </div>
  </Portal>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="flex items-start justify-between px-7 pt-6 pb-5
    border-b border-gray-100 flex-shrink-0">
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 font-medium mt-0.5">{subtitle}</p>
      )}
    </div>
    <button onClick={onClose}
      className="w-8 h-8 rounded-full bg-gray-100 border-none cursor-pointer
        flex items-center justify-center text-gray-500
        hover:bg-red-100 hover:text-red-500
        transition-all duration-200 flex-shrink-0 mt-0.5">
      <FaTimes className="text-xs" />
    </button>
  </div>
);

const Section = ({ label }) => (
  <p className="text-[11px] font-extrabold text-gray-400 uppercase
    tracking-widest pt-2 pb-1 border-b border-gray-100">
    {label}
  </p>
);

const Field = ({ label, icon, error, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5
      text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">
      {icon && <span className="text-pink-400 text-xs">{icon}</span>}
      {label}
      {required && <span className="text-pink-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
        <FaInfoCircle className="text-[10px]" /> {hint}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
        <FaExclamationTriangle className="text-[10px]" /> {error}
      </p>
    )}
  </div>
);

const inputCls = (err = false) =>
  `w-full px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl border
  outline-none transition-all duration-200 bg-white placeholder-gray-300
  focus:border-pink-400 focus:ring-2 focus:ring-pink-100
  ${err
    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
    : 'border-gray-200 hover:border-gray-300'
  }`;

const selectCls = (err = false) =>
  `w-full px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl border
  outline-none transition-all duration-200 bg-white cursor-pointer
  focus:border-pink-400 focus:ring-2 focus:ring-pink-100
  ${err ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`;

// ═══════════════════════════════════════════════════════════════════
// USAGE PROGRESS BAR — exported for use in table + view
// ═══════════════════════════════════════════════════════════════════

export const UsageBar = ({ used, total }) => {
  if (!total) return (
    <span className="text-xs text-gray-400 font-medium">
      {used} used · Unlimited
    </span>
  );
  const pct = Math.min(Math.round((used / total) * 100), 100);
  const color = pct >= 100 ? 'bg-red-400'
              : pct >= 80  ? 'bg-orange-400'
              : 'bg-green-400';
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600">
          {used} / {total}
        </span>
        <span className={`text-[10px] font-extrabold
          ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-orange-500' : 'text-green-600'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// STATUS BADGE — exported
// ═══════════════════════════════════════════════════════════════════

export const CouponStatusBadge = ({ status }) => {
  const map = {
    Active:    'bg-green-50 text-green-700 border border-green-200',
    Inactive:  'bg-gray-100 text-gray-600 border border-gray-200',
    Expired:   'bg-red-50 text-red-600 border border-red-200',
    Scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
    Exhausted: 'bg-orange-50 text-orange-600 border border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5
      rounded-full text-xs font-semibold ${map[status] || map.Inactive}`}>
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

const validate = (form) => {
  const e = {};

  if (!form.couponCode.trim())
    e.couponCode = 'Coupon code is required';
  else if (!/^[A-Z0-9_-]{3,20}$/.test(form.couponCode.trim()))
    e.couponCode = 'Only uppercase letters, numbers, - or _. Min 3, max 20 chars';

  if (!form.couponTitle.trim())
    e.couponTitle = 'Coupon title is required';

  if (!form.couponType)
    e.couponType = 'Coupon type is required';

  if (!form.discountValue || isNaN(form.discountValue) || Number(form.discountValue) <= 0)
    e.discountValue = 'Discount value must be greater than 0';

  if (form.couponType === 'Percentage' && Number(form.discountValue) > 100)
    e.discountValue = 'Percentage cannot exceed 100%';

  if (form.minOrderAmount && isNaN(form.minOrderAmount))
    e.minOrderAmount = 'Must be a valid number';

  if (form.couponType === 'Percentage' && form.maxDiscountAmount
      && isNaN(form.maxDiscountAmount))
    e.maxDiscountAmount = 'Must be a valid number';

  if (!form.startDate)
    e.startDate = 'Start date is required';

  if (!form.expiryDate)
    e.expiryDate = 'Expiry date is required';

  if (form.startDate && form.expiryDate
      && new Date(form.expiryDate) <= new Date(form.startDate))
    e.expiryDate = 'Expiry date must be after start date';

  if (form.usageLimitPerUser && isNaN(form.usageLimitPerUser))
    e.usageLimitPerUser = 'Must be a valid number';

  if (form.totalUsageLimit && isNaN(form.totalUsageLimit))
    e.totalUsageLimit = 'Must be a valid number';

  return e;
};

// ═══════════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════════

const emptyForm = () => ({
  couponCode:         '',
  couponTitle:        '',
  description:        '',
  couponType:         'Percentage',
  discountValue:      '',
  maxDiscountAmount:  '',
  minOrderAmount:     '',
  applicableFor:      'All Customers',
  selectedCustomers:  [],
  applicableProducts: 'All',
  selectedProducts:   [],
  selectedCategories: [],
  applicableSites:    'All',
  selectedSites:      [],
  firstOrderOnly:     false,
  usageLimitPerUser:  '',
  totalUsageLimit:    '',
  startDate:          '',
  expiryDate:         '',
  status:             'Active',
});

// ═══════════════════════════════════════════════════════════════════
// FORM BODY — shared between Add and Edit
// ═══════════════════════════════════════════════════════════════════

const CouponFormBody = ({ form, setForm, errors, setErrors }) => {
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Live discount preview
  const previewDiscount = () => {
    if (!form.discountValue) return null;
    if (form.couponType === 'Percentage') {
      const max = form.maxDiscountAmount
        ? ` (max ₹${form.maxDiscountAmount})` : '';
      return `${form.discountValue}% off${max}`;
    }
    return `₹${form.discountValue} flat off`;
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── BASIC INFO ── */}
      <Section label="Basic Information" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Coupon Code" icon={<FaTag />}
          error={errors.couponCode} required
          hint="Auto-uppercased. E.g. SAVE20">
          <input
            value={form.couponCode}
            onChange={e => set('couponCode', e.target.value.toUpperCase())}
            placeholder="SAVE20"
            maxLength={20}
            className={inputCls(errors.couponCode)}
          />
        </Field>
        <Field label="Coupon Title" icon={<FaTag />}
          error={errors.couponTitle} required>
          <input
            value={form.couponTitle}
            onChange={e => set('couponTitle', e.target.value)}
            placeholder="Save 20% on All Orders"
            className={inputCls(errors.couponTitle)}
          />
        </Field>
      </div>

      <Field label="Description" hint="Optional — shown to customers">
        <textarea
          value={form.description} rows={2}
          onChange={e => set('description', e.target.value)}
          placeholder="Describe this coupon offer..."
          className={`${inputCls()} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select value={form.status}
            onChange={e => set('status', e.target.value)}
            className={selectCls()}>
            {couponStatusOptions.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {/* First Order Only toggle */}
        <Field label="First Order Only">
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(val => (
              <button key={String(val)} type="button"
                onClick={() => set('firstOrderOnly', val)}
                className={`py-2.5 rounded-xl text-sm font-bold border-2
                  transition-all duration-200 cursor-pointer
                  ${form.firstOrderOnly === val
                    ? 'bg-pink-50 border-pink-400 text-pink-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                {val ? '✓ Yes' : '✕ No'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* ── DISCOUNT ── */}
      <Section label="Discount Configuration" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Coupon Type" icon={<FaPercent />}
          error={errors.couponType} required>
          <select value={form.couponType}
            onChange={e => set('couponType', e.target.value)}
            className={selectCls(errors.couponType)}>
            {couponTypeOptions.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field
          label={form.couponType === 'Percentage' ? 'Discount %' : 'Flat Amount (₹)'}
          icon={form.couponType === 'Percentage' ? <FaPercent /> : <FaRupeeSign />}
          error={errors.discountValue} required>
          <input
            type="number" min="0"
            value={form.discountValue}
            onChange={e => set('discountValue', e.target.value)}
            placeholder={form.couponType === 'Percentage' ? '20' : '100'}
            className={inputCls(errors.discountValue)}
          />
        </Field>
      </div>

      {/* Live preview */}
      {previewDiscount() && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-pink-50 border border-pink-100">
          <FaTag className="text-pink-400 text-xs flex-shrink-0" />
          <p className="text-xs font-bold text-pink-700">
            Preview: <span className="text-pink-500">{previewDiscount()}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {form.couponType === 'Percentage' && (
          <Field label="Max Discount Amount (₹)" icon={<FaRupeeSign />}
            error={errors.maxDiscountAmount}
            hint="Cap for % discounts">
            <input
              type="number" min="0"
              value={form.maxDiscountAmount}
              onChange={e => set('maxDiscountAmount', e.target.value)}
              placeholder="500"
              className={inputCls(errors.maxDiscountAmount)}
            />
          </Field>
        )}
        <Field label="Minimum Order Amount (₹)" icon={<FaRupeeSign />}
          error={errors.minOrderAmount}>
          <input
            type="number" min="0"
            value={form.minOrderAmount}
            onChange={e => set('minOrderAmount', e.target.value)}
            placeholder="300"
            className={inputCls(errors.minOrderAmount)}
          />
        </Field>
      </div>

      {/* ── APPLICABILITY ── */}
      <Section label="Applicability" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Applicable For" icon={<FaUsers />}>
          <select value={form.applicableFor}
            onChange={e => set('applicableFor', e.target.value)}
            className={selectCls()}>
            {applicableForOptions.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Applicable Products" icon={<FaBoxOpen />}>
          <select value={form.applicableProducts}
            onChange={e => set('applicableProducts', e.target.value)}
            className={selectCls()}>
            {applicableProductOptions.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Selected Categories — shown only when Selected Categories */}
      {form.applicableProducts === 'Selected Categories' && (
        <Field label="Category Names"
          hint="Press Enter or comma to add">
          <input
            type="text"
            placeholder="e.g. Beverages, Snacks"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim().replace(/,$/, '');
                if (val && !form.selectedCategories.includes(val)) {
                  set('selectedCategories', [...form.selectedCategories, val]);
                }
                e.target.value = '';
              }
            }}
            className={inputCls()}
          />
          {form.selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.selectedCategories.map((cat, i) => (
                <span key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg
                    bg-pink-50 border border-pink-200 text-xs font-bold text-pink-700">
                  {cat}
                  <button type="button"
                    onClick={() => set('selectedCategories',
                      form.selectedCategories.filter((_, j) => j !== i)
                    )}
                    className="border-none bg-transparent cursor-pointer
                      text-pink-400 hover:text-pink-600 ml-0.5">
                    <FaTimes className="text-[9px]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      )}

      <Field label="Applicable Sites" icon={<FaStore />}>
        <select value={form.applicableSites}
          onChange={e => set('applicableSites', e.target.value)}
          className={selectCls()}>
          {applicableSiteOptions.map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      {/* ── USAGE LIMITS ── */}
      <Section label="Usage Limits" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Usage Limit Per User"
          error={errors.usageLimitPerUser}
          hint="Leave empty for unlimited">
          <input
            type="number" min="1"
            value={form.usageLimitPerUser}
            onChange={e => set('usageLimitPerUser', e.target.value)}
            placeholder="e.g. 2"
            className={inputCls(errors.usageLimitPerUser)}
          />
        </Field>
        <Field label="Total Usage Limit"
          error={errors.totalUsageLimit}
          hint="Leave empty for unlimited">
          <input
            type="number" min="1"
            value={form.totalUsageLimit}
            onChange={e => set('totalUsageLimit', e.target.value)}
            placeholder="e.g. 500"
            className={inputCls(errors.totalUsageLimit)}
          />
        </Field>
      </div>

      {/* ── VALIDITY ── */}
      <Section label="Validity Period" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date" icon={<FaCalendarAlt />}
          error={errors.startDate} required>
          <input
            type="date" value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            max={form.expiryDate || undefined}
            className={inputCls(errors.startDate)}
          />
        </Field>
        <Field label="Expiry Date" icon={<FaCalendarAlt />}
          error={errors.expiryDate} required>
          <input
            type="date" value={form.expiryDate}
            onChange={e => set('expiryDate', e.target.value)}
            min={form.startDate || undefined}
            className={inputCls(errors.expiryDate)}
          />
        </Field>
      </div>

      {/* Expiry warning */}
      {form.expiryDate && (() => {
        const diff = Math.ceil(
          (new Date(form.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (diff < 0) return (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            <FaExclamationTriangle />
            This coupon has already expired!
          </div>
        );
        if (diff <= 7) return (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600">
            <FaExclamationTriangle />
            Expires in {diff} day{diff !== 1 ? 's' : ''}!
          </div>
        );
        return null;
      })()}

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════════════

export const AddCouponModal = ({ onClose, onSubmit }) => {
  const [form,    setForm]    = useState(emptyForm());
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader
        title="Create New Coupon"
        subtitle="Fill in the details to create a coupon"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <CouponFormBody
            form={form} setForm={setForm}
            errors={errors} setErrors={setErrors}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-4
          border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600
              bg-gray-100 border-none hover:bg-gray-200
              transition-all duration-200 cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white
              border-none transition-all duration-200 flex items-center gap-2
              ${loading
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 cursor-pointer active:scale-95 shadow-md shadow-pink-200'
              }`}>
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30
                border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════════════

export const EditCouponModal = ({ coupon, onClose, onSubmit }) => {
  const [form,    setForm]    = useState({ ...coupon });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader
        title="Edit Coupon"
        subtitle={`Editing — ${coupon.couponCode}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <CouponFormBody
            form={form} setForm={setForm}
            errors={errors} setErrors={setErrors}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-4
          border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600
              bg-gray-100 border-none hover:bg-gray-200
              transition-all duration-200 cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white
              border-none transition-all duration-200 flex items-center gap-2
              ${loading
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 cursor-pointer active:scale-95 shadow-md shadow-pink-200'
              }`}>
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30
                border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VIEW MODAL
// ═══════════════════════════════════════════════════════════════════

export const ViewCouponModal = ({ coupon: c, onClose, onEdit, getComputedStatus }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(c.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = getComputedStatus(c);

  const InfoRow = ({ label, value }) => {
    if (!value && value !== false && value !== 0) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-extrabold text-gray-400
          uppercase tracking-wide">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      </div>
    );
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader
        title="Coupon Details"
        subtitle="Full coupon profile"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

        {/* Coupon code hero */}
        <div className="flex items-center gap-4 p-4
          bg-gradient-to-r from-pink-50 to-purple-50
          rounded-xl border border-pink-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Coupon Code
            </p>
            <p className="text-2xl font-extrabold text-pink-600 tracking-widest
              font-mono">
              {c.couponCode}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {c.couponTitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CouponStatusBadge status={status} />
            <button onClick={copyCode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-bold border-none cursor-pointer
                transition-all duration-200
                ${copied
                  ? 'bg-green-100 text-green-600'
                  : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}>
              {copied
                ? <><FaCheckCircle className="text-[11px]" /> Copied!</>
                : <><FaCopy className="text-[11px]" /> Copy Code</>
              }
            </button>
          </div>
        </div>

        {/* Discount value hero */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-pink-50 rounded-xl p-3.5 border border-pink-100 text-center">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wide mb-1">
              Discount
            </p>
            <p className="text-xl font-extrabold text-pink-600">
              {c.couponType === 'Percentage'
                ? `${c.discountValue}%`
                : `₹${c.discountValue}`
              }
            </p>
            <p className="text-[10px] text-pink-400 font-semibold mt-0.5">
              {c.couponType}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
              Min Order
            </p>
            <p className="text-xl font-extrabold text-gray-700">
              {c.minOrderAmount ? `₹${c.minOrderAmount}` : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
              Max Discount
            </p>
            <p className="text-xl font-extrabold text-gray-700">
              {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : '—'}
            </p>
          </div>
        </div>

        {/* Usage bar */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Usage Progress
          </p>
          <UsageBar used={c.totalUsedCount || 0} total={c.totalUsageLimit} />
          {c.usageLimitPerUser && (
            <p className="text-xs text-gray-500 font-medium mt-2">
              Per user limit: <strong>{c.usageLimitPerUser}</strong> use{c.usageLimitPerUser > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Details grid */}
        <Section label="Details" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Applicable For"      value={c.applicableFor} />
          <InfoRow label="Applicable Products"  value={c.applicableProducts} />
          <InfoRow label="Applicable Sites"     value={c.applicableSites} />
          <InfoRow label="First Order Only"     value={c.firstOrderOnly ? 'Yes' : 'No'} />
          <InfoRow label="Start Date"
            value={new Date(c.startDate).toLocaleDateString('en-IN',
              { day: '2-digit', month: 'short', year: 'numeric' })} />
          <InfoRow label="Expiry Date"
            value={new Date(c.expiryDate).toLocaleDateString('en-IN',
              { day: '2-digit', month: 'short', year: 'numeric' })} />
        </div>

        {/* Selected categories */}
        {c.selectedCategories?.length > 0 && (
          <>
            <Section label="Selected Categories" />
            <div className="flex flex-wrap gap-1.5">
              {c.selectedCategories.map((cat, i) => (
                <span key={i}
                  className="px-2.5 py-1 rounded-lg bg-pink-50 border
                    border-pink-200 text-xs font-bold text-pink-700">
                  {cat}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        {c.description && (
          <>
            <Section label="Description" />
            <p className="text-sm text-gray-600 font-medium bg-gray-50
              rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
              {c.description}
            </p>
          </>
        )}

      </div>
      <div className="flex items-center justify-end gap-3 px-7 py-4
        border-t border-gray-100 flex-shrink-0">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600
            bg-gray-100 border-none hover:bg-gray-200
            transition-all duration-200 cursor-pointer">
          Close
        </button>
        <button onClick={onEdit}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white
            border-none bg-gradient-to-r from-pink-500 to-pink-600
            hover:from-pink-600 hover:to-pink-700
            shadow-md shadow-pink-200
            transition-all duration-200 cursor-pointer active:scale-95">
          Edit Coupon
        </button>
      </div>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════

export const DeleteCouponModal = ({ coupon, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Delete Coupon" onClose={onClose} />
      <div className="px-7 py-6 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100
          flex items-center justify-center">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">
            Are you sure you want to delete
          </p>
          <p className="text-base font-extrabold text-gray-900 mt-0.5 font-mono
            tracking-widest text-pink-600">
            {coupon?.couponCode}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {coupon?.couponTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500 font-medium bg-red-50
          rounded-xl px-4 py-3 border border-red-100 leading-relaxed">
          This action <strong className="text-red-600">cannot be undone</strong>.
          All usage history and data for this coupon will be permanently removed.
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 px-7 py-4
        border-t border-gray-100 flex-shrink-0">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600
            bg-gray-100 border-none hover:bg-gray-200
            transition-all duration-200 cursor-pointer">
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={loading}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white
            border-none transition-all duration-200 flex items-center gap-2
            ${loading
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 cursor-pointer active:scale-95 shadow-md shadow-red-200'
            }`}>
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30
              border-t-white rounded-full animate-spin" />
          )}
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </ModalWrapper>
  );
};
