import { useState, useRef } from 'react';
import {
  FaTimes, FaLink, FaDesktop, FaMobile,
  FaCalendarAlt, FaGlobe, FaUsers,
  FaExclamationTriangle, FaInfoCircle,
  FaCheckCircle, FaCloudUploadAlt,
  FaTrash, FaRedo, FaImage,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Portal from '../ui/Portal';
import {
  bannerTypeOptions, redirectTypeOptions,
  displayPositionOptions, showAsOptions,
  deviceTargetOptions, customerTypeOptions,
  bannerStatusOptions,
} from '../../data/mockBanners';

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
  ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;

const selectCls = (err = false) =>
  `w-full px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl border
  outline-none transition-all duration-200 bg-white cursor-pointer
  focus:border-pink-400 focus:ring-2 focus:ring-pink-100
  ${err ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`;

// ═══════════════════════════════════════════════════════════════════
// STATUS BADGE — exported
// ═══════════════════════════════════════════════════════════════════

export const BannerStatusBadge = ({ status }) => {
  const map = {
    Active:    'bg-green-50 text-green-700 border border-green-200',
    Scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
    Draft:     'bg-gray-100 text-gray-600 border border-gray-200',
    Paused:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Expired:   'bg-red-50 text-red-600 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5
      rounded-full text-xs font-semibold ${map[status] || map.Draft}`}>
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// BANNER TYPE BADGE — exported
// ═══════════════════════════════════════════════════════════════════

export const BannerTypeBadge = ({ type }) => {
  const map = {
    Homepage: 'bg-pink-50 text-pink-600 border-pink-200',
    Category: 'bg-purple-50 text-purple-600 border-purple-200',
    Offer:    'bg-orange-50 text-orange-600 border-orange-200',
    Campaign: 'bg-blue-50 text-blue-600 border-blue-200',
    Popup:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg
      text-xs font-bold border
      ${map[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {type}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// IMAGE PREVIEW — shared thumbnail used in View modal + anywhere
// ═══════════════════════════════════════════════════════════════════

export const BannerImagePreview = ({ src, alt = 'Banner', className = '' }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center
        bg-gray-100 border border-gray-200 rounded-xl ${className}`}>
        <div className="flex flex-col items-center gap-1.5 text-gray-400">
          <FaImage className="text-2xl" />
          <p className="text-xs font-semibold">No image</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`object-cover rounded-xl ${className}`}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// IMAGE UPLOADER — drag & drop + click to upload
// ═══════════════════════════════════════════════════════════════════

const ImageUploader = ({ label, icon, hint, value, onChange, error, required }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5
        text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">
        {icon && <span className="text-pink-400 text-xs">{icon}</span>}
        {label}
        {required && <span className="text-pink-500 ml-0.5">*</span>}
      </label>

      {value ? (
        /* ── Preview ── */
        <div className="relative rounded-xl overflow-hidden border
          border-gray-200 group cursor-pointer"
          onClick={() => inputRef.current?.click()}>
          <img
            src={value}
            alt="preview"
            className="w-full h-28 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0
            group-hover:opacity-100 transition-opacity duration-200
            flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-bold text-white bg-pink-500 border-none
                cursor-pointer hover:bg-pink-600 transition-colors duration-150">
              <FaRedo className="text-[10px]" /> Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-bold text-white bg-red-500 border-none
                cursor-pointer hover:bg-red-600 transition-colors duration-150">
              <FaTrash className="text-[10px]" /> Remove
            </button>
          </div>
          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50
            px-3 py-1.5">
            <p className="text-[10px] text-white font-medium truncate">
              Image uploaded — hover to replace or remove
            </p>
          </div>
        </div>
      ) : (
        /* ── Drop Zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2.5
            px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-200
            ${dragging
              ? 'border-pink-400 bg-pink-50 scale-[1.01]'
              : error
                ? 'border-red-300 bg-red-50 hover:border-red-400'
                : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/30'
            }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center
            justify-center transition-all duration-200
            ${dragging ? 'bg-pink-100 scale-110' : 'bg-white border border-gray-100'}`}>
            <FaCloudUploadAlt className={`text-lg
              ${dragging ? 'text-pink-500' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <p className={`text-xs font-bold
              ${dragging ? 'text-pink-600' : 'text-gray-600'}`}>
              {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {hint}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {['PNG', 'JPG', 'WEBP'].map(f => (
              <span key={f}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md
                  bg-gray-100 text-gray-500">
                {f}
              </span>
            ))}
            <span className="text-[11px] text-gray-400 font-medium">
              · Max 5MB
            </span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
          <FaExclamationTriangle className="text-[10px]" /> {error}
        </p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

const validate = (form) => {
  const e = {};
  if (!form.bannerTitle.trim())
    e.bannerTitle = 'Banner title is required';
  if (!form.bannerType)
    e.bannerType = 'Banner type is required';
  if (!form.imageDesktop)
    e.imageDesktop = 'Desktop image is required';
  if (!form.displayPosition)
    e.displayPosition = 'Display position is required';
  if (!form.showAs)
    e.showAs = 'Show as is required';
  if (form.displayOrder !== '' && isNaN(form.displayOrder))
    e.displayOrder = 'Must be a valid number';
  if (!form.alwaysShow) {
    if (!form.startDate)
      e.startDate = 'Start date is required';
    if (!form.endDate)
      e.endDate = 'End date is required';
    if (form.startDate && form.endDate
        && new Date(form.endDate) <= new Date(form.startDate))
      e.endDate = 'End date must be after start date';
  }
  if (form.redirectType !== 'None' && !form.redirectValue.trim())
    e.redirectValue = 'Redirect value is required';
  return e;
};

// ═══════════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════════

const emptyForm = () => ({
  bannerTitle:       '',
  bannerSubtitle:    '',
  bannerDescription: '',
  bannerType:        'Homepage',
  imageDesktop:      '',
  imageMobile:       '',
  redirectType:      'None',
  redirectValue:     '',
  displayPosition:   'Top',
  displayOrder:      '',
  showAs:            'Static',
  deviceTarget:      'All',
  fullWidth:         true,
  startDate:         '',
  endDate:           '',
  alwaysShow:        false,
  timeBasedDisplay:  '',
  applicableSites:   'All',
  selectedSites:     [],
  customerType:      'All',
  newUsersOnly:      false,
  loggedInOnly:      false,
  geoTarget:         '',
  status:            'Draft',
});

// ═══════════════════════════════════════════════════════════════════
// TOGGLE GROUP
// ═══════════════════════════════════════════════════════════════════

const ToggleGroup = ({ value, onChange, options }) => (
  <div
    className="grid gap-2"
    style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
    {options.map(opt => (
      <button key={String(opt.value)} type="button"
        onClick={() => onChange(opt.value)}
        className={`py-2 rounded-xl text-xs font-bold border-2
          transition-all duration-200 cursor-pointer
          ${value === opt.value
            ? 'bg-pink-50 border-pink-400 text-pink-600'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
        {opt.label}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// FORM BODY
// ═══════════════════════════════════════════════════════════════════

const BannerFormBody = ({ form, setForm, errors, setErrors }) => {
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const redirectPlaceholder = {
    None:     'No redirect',
    Product:  'e.g. prod_123',
    Category: 'e.g. electronics',
    URL:      'e.g. /offers/summer-sale',
    Offer:    'e.g. flash-sale-feb',
    Coupon:   'e.g. SAVE20',
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── BASIC INFO ── */}
      <Section label="Basic Information" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Banner Title" icon={<FaImage />}
          error={errors.bannerTitle} required>
          <input value={form.bannerTitle}
            onChange={e => set('bannerTitle', e.target.value)}
            placeholder="Grand Summer Sale"
            className={inputCls(errors.bannerTitle)}
          />
        </Field>
        <Field label="Banner Type" error={errors.bannerType} required>
          <select value={form.bannerType}
            onChange={e => set('bannerType', e.target.value)}
            className={selectCls(errors.bannerType)}>
            {bannerTypeOptions.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Banner Subtitle" hint="Optional — shown below title">
        <input value={form.bannerSubtitle}
          onChange={e => set('bannerSubtitle', e.target.value)}
          placeholder="Up to 50% off on all categories"
          className={inputCls()}
        />
      </Field>

      <Field label="Banner Description" hint="Optional — additional details">
        <textarea value={form.bannerDescription} rows={2}
          onChange={e => set('bannerDescription', e.target.value)}
          placeholder="Describe this banner..."
          className={`${inputCls()} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select value={form.status}
            onChange={e => set('status', e.target.value)}
            className={selectCls()}>
            {bannerStatusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Display Order / Priority"
          error={errors.displayOrder}
          hint="Lower number = higher priority">
          <input type="number" min="1"
            value={form.displayOrder}
            onChange={e => set('displayOrder', e.target.value)}
            placeholder="e.g. 1"
            className={inputCls(errors.displayOrder)}
          />
        </Field>
      </div>

      {/* ── IMAGES ── */}
      <Section label="Banner Images" />

      <ImageUploader
        label="Desktop Image"
        icon={<FaDesktop />}
        hint="Recommended: 1200 × 400px"
        value={form.imageDesktop}
        onChange={v => set('imageDesktop', v)}
        error={errors.imageDesktop}
        required
      />

      <ImageUploader
        label="Mobile Image"
        icon={<FaMobile />}
        hint="Recommended: 600 × 300px — Optional"
        value={form.imageMobile}
        onChange={v => set('imageMobile', v)}
        error={errors.imageMobile}
      />

      {/* ── REDIRECT ── */}
      <Section label="Redirect Configuration" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Redirect Type" icon={<FaLink />}>
          <select value={form.redirectType}
            onChange={e => set('redirectType', e.target.value)}
            className={selectCls()}>
            {redirectTypeOptions.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Redirect Value"
          error={errors.redirectValue}
          required={form.redirectType !== 'None'}>
          <input
            value={form.redirectValue}
            onChange={e => set('redirectValue', e.target.value)}
            placeholder={redirectPlaceholder[form.redirectType] || ''}
            disabled={form.redirectType === 'None'}
            className={`${inputCls(errors.redirectValue)}
              ${form.redirectType === 'None' ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
        </Field>
      </div>

      {/* ── DISPLAY & PLACEMENT ── */}
      <Section label="Display & Placement" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Display Position"
          error={errors.displayPosition} required>
          <select value={form.displayPosition}
            onChange={e => set('displayPosition', e.target.value)}
            className={selectCls(errors.displayPosition)}>
            {displayPositionOptions.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Show As" error={errors.showAs} required>
          <select value={form.showAs}
            onChange={e => set('showAs', e.target.value)}
            className={selectCls(errors.showAs)}>
            {showAsOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Device Target">
        <ToggleGroup
          value={form.deviceTarget}
          onChange={v => set('deviceTarget', v)}
          options={[
            { value: 'All',     label: 'All'     },
            { value: 'Mobile',  label: 'Mobile'  },
            { value: 'Desktop', label: 'Desktop' },
          ]}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Width">
          <ToggleGroup
            value={form.fullWidth}
            onChange={v => set('fullWidth', v)}
            options={[
              { value: true,  label: 'Yes' },
              { value: false, label: 'No'  },
            ]}
          />
        </Field>
        <Field label="Always Show">
          <ToggleGroup
            value={form.alwaysShow}
            onChange={v => set('alwaysShow', v)}
            options={[
              { value: true,  label: 'Yes' },
              { value: false, label: 'No'  },
            ]}
          />
        </Field>
      </div>

      {/* ── SCHEDULING ── */}
      <Section label="Scheduling" />

      {form.alwaysShow ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl
          bg-green-50 border border-green-200">
          <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
          <p className="text-xs font-bold text-green-700">
            Always Show is enabled — date scheduling is disabled
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date & Time"
              icon={<FaCalendarAlt />} error={errors.startDate} required>
              <input type="datetime-local"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                max={form.endDate || undefined}
                className={inputCls(errors.startDate)}
              />
            </Field>
            <Field label="End Date & Time"
              icon={<FaCalendarAlt />} error={errors.endDate} required>
              <input type="datetime-local"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                min={form.startDate || undefined}
                className={inputCls(errors.endDate)}
              />
            </Field>
          </div>

          <Field label="Time-based Display"
            hint="Optional — e.g. 09:00 - 21:00">
            <input value={form.timeBasedDisplay}
              onChange={e => set('timeBasedDisplay', e.target.value)}
              placeholder="e.g. 10:00 - 22:00"
              className={inputCls()}
            />
          </Field>

          {form.endDate && (() => {
            const diff = Math.ceil(
              (new Date(form.endDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            if (diff < 0) return (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                <FaExclamationTriangle />
                This banner has already expired!
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
        </>
      )}

      {/* ── TARGETING ── */}
      <Section label="Targeting & Visibility" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Customer Type" icon={<FaUsers />}>
          <select value={form.customerType}
            onChange={e => set('customerType', e.target.value)}
            className={selectCls()}>
            {customerTypeOptions.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Applicable Sites" icon={<FaGlobe />}>
          <select value={form.applicableSites}
            onChange={e => set('applicableSites', e.target.value)}
            className={selectCls()}>
            <option value="All">All Sites</option>
            <option value="Selected Sites">Selected Sites</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="New Users Only">
          <ToggleGroup
            value={form.newUsersOnly}
            onChange={v => set('newUsersOnly', v)}
            options={[
              { value: true,  label: 'Yes' },
              { value: false, label: 'No'  },
            ]}
          />
        </Field>
        <Field label="Logged-in Users Only">
          <ToggleGroup
            value={form.loggedInOnly}
            onChange={v => set('loggedInOnly', v)}
            options={[
              { value: true,  label: 'Yes' },
              { value: false, label: 'No'  },
            ]}
          />
        </Field>
      </div>

      <Field label="Geo Target" icon={<FaGlobe />}
        hint="Optional — e.g. Chennai, Mumbai">
        <input value={form.geoTarget}
          onChange={e => set('geoTarget', e.target.value)}
          placeholder="e.g. Chennai, Mumbai, Delhi"
          className={inputCls()}
        />
      </Field>

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════════════

export const AddBannerModal = ({ onClose, onSubmit }) => {
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
        title="Create New Banner"
        subtitle="Fill in the details to create a banner"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <BannerFormBody
            form={form} setForm={setForm}
            errors={errors} setErrors={setErrors}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-4
          border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold
              text-gray-600 bg-gray-100 border-none hover:bg-gray-200
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
            {loading ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════════════

export const EditBannerModal = ({ banner, onClose, onSubmit }) => {
  const [form,    setForm]    = useState({ ...banner });
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
        title="Edit Banner"
        subtitle={`Editing — ${banner.bannerTitle}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <BannerFormBody
            form={form} setForm={setForm}
            errors={errors} setErrors={setErrors}
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-4
          border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold
              text-gray-600 bg-gray-100 border-none hover:bg-gray-200
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

export const ViewBannerModal = ({
  banner: b, onClose, onEdit, getComputedStatus,
}) => {
  const [imgTab, setImgTab] = useState('desktop');
  const status = getComputedStatus(b);

  const activeImg = imgTab === 'desktop' ? b.imageDesktop : b.imageMobile;

  const InfoRow = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-extrabold text-gray-400
          uppercase tracking-wide">{label}</span>
        <span className="text-sm font-semibold text-gray-800">
          {String(value)}
        </span>
      </div>
    );
  };

  const fmt = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader
        title="Banner Details"
        subtitle="Full banner profile"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

        {/* ── Image preview tabs ── */}
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <div className="flex border-b border-gray-100">
            {[
              { key: 'desktop', label: 'Desktop', has: !!b.imageDesktop },
              { key: 'mobile',  label: 'Mobile',  has: !!b.imageMobile  },
            ].map(tab => (
              <button key={tab.key} type="button"
                onClick={() => setImgTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase
                  tracking-wide transition-all duration-200 border-none cursor-pointer
                  flex items-center justify-center gap-1.5
                  ${imgTab === tab.key
                    ? 'bg-pink-50 text-pink-600'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}>
                {tab.label}
                {!tab.has && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5
                    rounded bg-gray-200 text-gray-500">
                    No image
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Image area */}
          <div className="h-40 bg-gray-50">
            {activeImg ? (
              <img
                src={activeImg}
                alt={`${imgTab} preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex-col items-center justify-center
                gap-1.5 text-gray-400
                ${activeImg ? 'hidden' : 'flex'}`}>
              <FaImage className="text-3xl text-gray-300" />
              <p className="text-xs font-semibold text-gray-400">
                No {imgTab} image uploaded
              </p>
            </div>
          </div>
        </div>

        {/* ── Title + badges ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-gray-900">
              {b.bannerTitle}
            </h3>
            {b.bannerSubtitle && (
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {b.bannerSubtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <BannerStatusBadge status={status} />
            <BannerTypeBadge   type={b.bannerType} />
          </div>
        </div>

        {/* ── Quick info cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Position', value: b.displayPosition },
            { label: 'Show As',  value: b.showAs          },
            { label: 'Device',   value: b.deviceTarget    },
          ].map(card => (
            <div key={card.label}
              className="bg-gray-50 rounded-xl p-3 border border-gray-100
                text-center">
              <p className="text-[10px] font-bold text-gray-400
                uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-sm font-extrabold text-gray-800">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Scheduling ── */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-500 uppercase
            tracking-wide mb-2.5">
            Scheduling
          </p>
          {b.alwaysShow ? (
            <p className="text-sm font-bold text-green-700
              flex items-center gap-1.5">
              <FaCheckCircle className="text-green-500 text-xs" />
              Always Show — no expiry
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-blue-400
                  uppercase tracking-wide mb-0.5">Start</p>
                <p className="text-xs font-semibold text-gray-800">
                  {fmt(b.startDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400
                  uppercase tracking-wide mb-0.5">End</p>
                <p className="text-xs font-semibold text-gray-800">
                  {fmt(b.endDate)}
                </p>
              </div>
            </div>
          )}
          {b.timeBasedDisplay && (
            <p className="text-xs text-blue-600 font-medium mt-2">
              Time window: <strong>{b.timeBasedDisplay}</strong>
            </p>
          )}
        </div>

        {/* ── Redirect ── */}
        {b.redirectType !== 'None' && (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400
              uppercase tracking-wide mb-1.5">Redirect</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded
                bg-pink-50 text-pink-600 border border-pink-100">
                {b.redirectType}
              </span>
              <span className="text-sm font-semibold text-gray-700
                truncate font-mono">
                {b.redirectValue}
              </span>
            </div>
          </div>
        )}

        {/* ── Targeting ── */}
        <Section label="Targeting & Visibility" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Customer Type"    value={b.customerType} />
          <InfoRow label="Applicable Sites" value={b.applicableSites} />
          <InfoRow label="New Users Only"   value={b.newUsersOnly ? 'Yes' : 'No'} />
          <InfoRow label="Logged-in Only"   value={b.loggedInOnly ? 'Yes' : 'No'} />
          <InfoRow label="Full Width"       value={b.fullWidth    ? 'Yes' : 'No'} />
          <InfoRow label="Priority Order"   value={b.displayOrder || '—'} />
          {b.geoTarget && <InfoRow label="Geo Target" value={b.geoTarget} />}
        </div>

        {/* ── Meta ── */}
        <Section label="Meta" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Created By"   value={b.createdBy} />
          <InfoRow label="Created Date" value={b.createdDate} />
          <InfoRow label="Last Updated" value={b.lastUpdatedDate} />
        </div>

        {/* ── Description ── */}
        {b.bannerDescription && (
          <>
            <Section label="Description" />
            <p className="text-sm text-gray-600 font-medium bg-gray-50
              rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
              {b.bannerDescription}
            </p>
          </>
        )}

      </div>
      <div className="flex items-center justify-end gap-3 px-7 py-4
        border-t border-gray-100 flex-shrink-0">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold
            text-gray-600 bg-gray-100 border-none hover:bg-gray-200
            transition-all duration-200 cursor-pointer">
          Close
        </button>
        <button onClick={onEdit}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white
            border-none bg-gradient-to-r from-pink-500 to-pink-600
            hover:from-pink-600 hover:to-pink-700
            shadow-md shadow-pink-200 transition-all duration-200
            cursor-pointer active:scale-95">
          Edit Banner
        </button>
      </div>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════

export const DeleteBannerModal = ({ banner, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Delete Banner" onClose={onClose} />
      <div className="px-7 py-6 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100
          flex items-center justify-center">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">
            Are you sure you want to delete
          </p>
          <p className="text-base font-extrabold text-gray-900 mt-0.5">
            {banner?.bannerTitle}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {banner?.bannerType} · {banner?.displayPosition}
          </p>
        </div>
        {/* Thumbnail */}
        {banner?.imageDesktop && (
          <img
            src={banner.imageDesktop}
            alt={banner.bannerTitle}
            className="w-full h-20 object-cover rounded-xl border border-red-100"
            onError={e => e.target.style.display = 'none'}
          />
        )}
        <p className="text-xs text-gray-500 font-medium bg-red-50
          rounded-xl px-4 py-3 border border-red-100 leading-relaxed">
          This action{' '}
          <strong className="text-red-600">cannot be undone</strong>.
          The banner will be permanently removed.
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 px-7 py-4
        border-t border-gray-100 flex-shrink-0">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold
            text-gray-600 bg-gray-100 border-none hover:bg-gray-200
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
