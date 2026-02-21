import { useState, useRef } from 'react';
import {
  FaTimes, FaUser, FaPhone, FaIdCard, FaMapMarkerAlt,
  FaCalendarAlt, FaExclamationTriangle, FaUniversity,
  FaUpload, FaFilePdf, FaFileImage, FaTrash, FaEye,
  FaCheckCircle, FaExclamationCircle, FaClock,
} from 'react-icons/fa';
import Portal from '../ui/Portal';
import { driverStatusOptions } from '../../data/mockDrivers';

// ═══════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

const ModalWrapper = ({ onClose, children, wide = false }) => (
  <Portal>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]
        flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl w-full
          flex flex-col max-h-[90vh]
          ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      >
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
    <button
      onClick={onClose}
      className="w-8 h-8 rounded-full bg-gray-100 border-none cursor-pointer
        flex items-center justify-center text-gray-500
        hover:bg-red-100 hover:text-red-500
        transition-all duration-200 flex-shrink-0 mt-0.5"
    >
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

const Field = ({ label, icon, error, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5
      text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">
      {icon && <span className="text-pink-400 text-xs">{icon}</span>}
      {label}
      {required && <span className="text-pink-500 ml-0.5">*</span>}
    </label>
    {children}
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
// LICENSE EXPIRY BADGE
// ═══════════════════════════════════════════════════════════════════

export const ExpiryBadge = ({ expiryDate }) => {
  if (!expiryDate) return <span className="text-gray-300 text-xs">—</span>;

  const today    = new Date();
  const expiry   = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
      <FaExclamationCircle className="text-[10px]" /> Expired
    </span>
  );

  if (diffDays <= 90) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
      <FaClock className="text-[10px]" /> Expiring in {diffDays}d
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
      <FaCheckCircle className="text-[10px]" />
      {new Date(expiryDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DL UPLOAD COMPONENT
// ═══════════════════════════════════════════════════════════════════

const DLUpload = ({ value, onChange }) => {
  const inputRef  = useRef();
  const [preview, setPreview] = useState(value || null);
  const [isDrag,  setIsDrag]  = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG or PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ url, name: file.name, type: file.type, file });
    onChange({ url, name: file.name, type: file.type, file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = preview?.type?.startsWith('image/');

  return (
    <div className="flex flex-col gap-2">
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2.5
            p-6 rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-200
            ${isDrag
              ? 'border-pink-400 bg-pink-50'
              : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/40'
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-pink-100
            flex items-center justify-center">
            <FaUpload className="text-pink-500 text-sm" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              Click or drag to upload DL copy
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG or PDF — max 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3.5 rounded-xl
          border border-gray-200 bg-gray-50">

          {/* Preview thumbnail or PDF icon */}
          {isImage ? (
            <img
              src={preview.url} alt="DL Copy"
              className="w-12 h-12 rounded-lg object-cover
                border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100
              flex items-center justify-center flex-shrink-0">
              <FaFilePdf className="text-red-500 text-xl" />
            </div>
          )}

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {preview.name}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {isImage ? 'Image' : 'PDF'} · Uploaded
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 flex-shrink-0">
            {isImage && (
              <a href={preview.url} target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-blue-50 flex items-center
                  justify-center text-blue-500 hover:bg-blue-500 hover:text-white
                  transition-all duration-200 cursor-pointer">
                <FaEye className="text-xs" />
              </a>
            )}
            <button type="button" onClick={handleRemove}
              className="w-8 h-8 rounded-lg bg-red-50 flex items-center
                justify-center text-red-500 hover:bg-red-500 hover:text-white
                border-none cursor-pointer transition-all duration-200">
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

const validate = (form) => {
  const e = {};

  if (!form.driverName.trim())
    e.driverName = 'Driver name is required';

  if (!form.mobileNumber.trim())
    e.mobileNumber = 'Mobile number is required';
  else if (!/^\d{10}$/.test(form.mobileNumber))
    e.mobileNumber = 'Enter a valid 10-digit number';

  if (!form.drivingLicense.trim())
    e.drivingLicense = 'Driving license number is required';
  else if (!/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(form.drivingLicense.replace(/\s/g, '')))
    e.drivingLicense = 'Enter valid DL number (e.g. TN0120230012345)';

  if (!form.licenseExpiry)
    e.licenseExpiry = 'License expiry date is required';

  if (!form.aadharNumber.trim())
    e.aadharNumber = 'Aadhar number is required';
  else if (!/^\d{12}$/.test(form.aadharNumber.replace(/\s/g, '')))
    e.aadharNumber = 'Enter valid 12-digit Aadhar number';

  if (!form.dateOfJoining)
    e.dateOfJoining = 'Date of joining is required';

  if (!form.address.trim())
    e.address = 'Address is required';

  if (form.emergencyContact && !/^\d{10}$/.test(form.emergencyContact))
    e.emergencyContact = 'Enter a valid 10-digit number';

  // Bank validation — only if any bank field is filled
  const hasBank = form.bankAccountNumber || form.bankIFSC || form.bankName;
  if (hasBank) {
    if (!form.bankAccountName.trim())
      e.bankAccountName = 'Account holder name is required';
    if (!form.bankAccountNumber.trim())
      e.bankAccountNumber = 'Account number is required';
    if (!form.bankIFSC.trim())
      e.bankIFSC = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIFSC.toUpperCase()))
      e.bankIFSC = 'Enter valid IFSC code (e.g. SBIN0001234)';
    if (!form.bankName.trim())
      e.bankName = 'Bank name is required';
  }

  return e;
};

// ═══════════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════════

const emptyForm = () => ({
  driverName:         '',
  mobileNumber:       '',
  emergencyContact:   '',
  drivingLicense:     '',
  licenseExpiry:      '',
  aadharNumber:       '',
  dateOfJoining:      new Date().toISOString().split('T')[0],
  address:            '',
  status:             'Active',
  bankAccountName:    '',
  bankAccountNumber:  '',
  bankIFSC:           '',
  bankName:           '',
  dlCopy:             null,
  remarks:            '',
});

// ═══════════════════════════════════════════════════════════════════
// FORM BODY — shared between Add and Edit
// ═══════════════════════════════════════════════════════════════════

const DriverFormBody = ({ form, setForm, errors, setErrors }) => {
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // License expiry visual warning inside form
  const today    = new Date();
  const expiry   = form.licenseExpiry ? new Date(form.licenseExpiry) : null;
  const diffDays = expiry
    ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    : null;

  const expiryWarning =
    diffDays !== null && diffDays < 0
      ? { msg: 'License has already expired!', cls: 'bg-red-50 border-red-200 text-red-600' }
      : diffDays !== null && diffDays <= 90
      ? { msg: `License expiring in ${diffDays} day(s) — renew soon!`, cls: 'bg-orange-50 border-orange-200 text-orange-600' }
      : null;

  return (
    <div className="flex flex-col gap-5">

      {/* ── PERSONAL ── */}
      <Section label="Personal Information" />

      <Field label="Driver Name" icon={<FaUser />} error={errors.driverName} required>
        <input
          value={form.driverName}
          onChange={e => set('driverName', e.target.value)}
          placeholder="Full name"
          className={inputCls(errors.driverName)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mobile Number" icon={<FaPhone />} error={errors.mobileNumber} required>
          <input
            value={form.mobileNumber} maxLength={10}
            onChange={e => set('mobileNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="9876543210"
            className={inputCls(errors.mobileNumber)}
          />
        </Field>
        <Field label="Emergency Contact" icon={<FaPhone />} error={errors.emergencyContact}>
          <input
            value={form.emergencyContact} maxLength={10}
            onChange={e => set('emergencyContact', e.target.value.replace(/\D/g, ''))}
            placeholder="Optional"
            className={inputCls(errors.emergencyContact)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Aadhar Number" icon={<FaIdCard />} error={errors.aadharNumber} required>
          <input
            value={form.aadharNumber} maxLength={12}
            onChange={e => set('aadharNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="234567891234"
            className={inputCls(errors.aadharNumber)}
          />
        </Field>
        <Field label="Date of Joining" icon={<FaCalendarAlt />} error={errors.dateOfJoining} required>
          <input
            type="date" value={form.dateOfJoining}
            onChange={e => set('dateOfJoining', e.target.value)}
            className={inputCls(errors.dateOfJoining)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className={selectCls()}>
            {driverStatusOptions.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Driver Address" icon={<FaMapMarkerAlt />} error={errors.address} required>
        <textarea
          value={form.address} rows={2}
          onChange={e => set('address', e.target.value)}
          placeholder="Full address with city and pincode"
          className={`${inputCls(errors.address)} resize-none`}
        />
      </Field>

      {/* ── LICENSE ── */}
      <Section label="License Details" />

      <Field label="Driving License Number" icon={<FaIdCard />}
        error={errors.drivingLicense} required>
        <input
          value={form.drivingLicense}
          onChange={e => set('drivingLicense', e.target.value.toUpperCase())}
          placeholder="TN0120230012345"
          className={inputCls(errors.drivingLicense)}
        />
      </Field>

      <Field label="License Expiry Date" icon={<FaCalendarAlt />}
        error={errors.licenseExpiry} required>
        <input
          type="date" value={form.licenseExpiry}
          onChange={e => set('licenseExpiry', e.target.value)}
          className={inputCls(errors.licenseExpiry)}
        />
      </Field>

      {/* Expiry warning banner */}
      {expiryWarning && (
        <div className={`flex items-center gap-2.5 px-4 py-3
          rounded-xl border text-xs font-bold ${expiryWarning.cls}`}>
          <FaExclamationTriangle className="text-sm flex-shrink-0" />
          {expiryWarning.msg}
        </div>
      )}

      {/* DL Upload */}
      <Field label="Upload DL Copy" icon={<FaUpload />}>
        <DLUpload
          value={form.dlCopy}
          onChange={file => set('dlCopy', file)}
        />
      </Field>

      {/* ── BANK ── */}
      <Section label="Bank Account Details (for Salary Transfer)" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Account Holder Name" icon={<FaUser />} error={errors.bankAccountName}>
          <input
            value={form.bankAccountName}
            onChange={e => set('bankAccountName', e.target.value)}
            placeholder="As per bank records"
            className={inputCls(errors.bankAccountName)}
          />
        </Field>
        <Field label="Bank Name" icon={<FaUniversity />} error={errors.bankName}>
          <input
            value={form.bankName}
            onChange={e => set('bankName', e.target.value)}
            placeholder="State Bank of India"
            className={inputCls(errors.bankName)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Account Number" error={errors.bankAccountNumber}>
          <input
            value={form.bankAccountNumber}
            onChange={e => set('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="Account number"
            className={inputCls(errors.bankAccountNumber)}
          />
        </Field>
        <Field label="IFSC Code" error={errors.bankIFSC}>
          <input
            value={form.bankIFSC}
            onChange={e => set('bankIFSC', e.target.value.toUpperCase())}
            placeholder="SBIN0001234"
            maxLength={11}
            className={inputCls(errors.bankIFSC)}
          />
        </Field>
      </div>

      {/* ── REMARKS ── */}
      <Section label="Remarks" />
      <Field label="Notes / Remarks">
        <textarea
          value={form.remarks} rows={2}
          onChange={e => set('remarks', e.target.value)}
          placeholder="Any additional notes about this driver..."
          className={`${inputCls()} resize-none`}
        />
      </Field>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════════════

export const AddDriverModal = ({ onClose, onSubmit }) => {
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
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Add New Driver"
        subtitle="Fill in the details to register a driver"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <DriverFormBody
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
            {loading ? 'Saving...' : 'Add Driver'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════════════

export const EditDriverModal = ({ driver, onClose, onSubmit }) => {
  const [form,    setForm]    = useState({ ...driver });
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
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Edit Driver"
        subtitle={`Editing — ${driver.driverName}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <DriverFormBody
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

export const ViewDriverModal = ({ driver: d, onClose, onEdit }) => {
  if (!d) return null;

  const statusColor = {
    Active:    'bg-green-50 text-green-700 border border-green-200',
    Inactive:  'bg-gray-100 text-gray-600 border border-gray-200',
    Suspended: 'bg-red-50   text-red-600   border border-red-100',
  };

  const InfoRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      </div>
    );
  };

  const InfoGrid = ({ children }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
  );

  const hasBank = d.bankAccountNumber || d.bankIFSC || d.bankName;

  return (
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Driver Details"
        subtitle="Driver profile information"
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

        {/* Profile row */}
        <div className="flex items-center gap-4 p-4
          bg-pink-50 rounded-xl border border-pink-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700
            flex items-center justify-center flex-shrink-0
            shadow-[0_3px_10px_rgba(236,72,153,0.25)]">
            <FaUser className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-extrabold text-gray-900 tracking-tight">
              {d.driverName}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              DL: {d.drivingLicense}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1
            rounded-full flex-shrink-0 ${statusColor[d.status]}`}>
            {d.status}
          </span>
        </div>

        {/* Personal */}
        <Section label="Personal Information" />
        <InfoGrid>
          <InfoRow label="Mobile Number"      value={d.mobileNumber} />
          <InfoRow label="Emergency Contact"  value={d.emergencyContact || '—'} />
          <InfoRow label="Aadhar Number"      value={d.aadharNumber} />
          <InfoRow label="Date of Joining"    value={
            d.dateOfJoining
              ? new Date(d.dateOfJoining).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : '—'
          } />
        </InfoGrid>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
            Address
          </span>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed">
            {d.address || '—'}
          </p>
        </div>

        {/* License */}
        <Section label="License Details" />
        <InfoGrid>
          <InfoRow label="License Number" value={d.drivingLicense} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
              Expiry Status
            </span>
            <ExpiryBadge expiryDate={d.licenseExpiry} />
          </div>
        </InfoGrid>

        {/* DL Copy */}
        {d.dlCopy?.url && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl
            border border-gray-200 bg-gray-50">
            {d.dlCopy.type?.startsWith('image/') ? (
              <img src={d.dlCopy.url} alt="DL Copy"
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100
                flex items-center justify-center flex-shrink-0">
                <FaFilePdf className="text-red-500 text-xl" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{d.dlCopy.name}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">DL Document</p>
            </div>
            <a href={d.dlCopy.url} target="_blank" rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center
                text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200">
              <FaEye className="text-xs" />
            </a>
          </div>
        )}

        {/* Bank */}
        {hasBank && (
          <>
            <Section label="Bank Account Details" />
            <InfoGrid>
              <InfoRow label="Account Holder" value={d.bankAccountName} />
              <InfoRow label="Bank Name"       value={d.bankName} />
              <InfoRow label="Account Number"  value={d.bankAccountNumber} />
              <InfoRow label="IFSC Code"       value={d.bankIFSC} />
            </InfoGrid>
          </>
        )}

        {/* Remarks */}
        {d.remarks && (
          <>
            <Section label="Remarks" />
            <p className="text-sm text-gray-600 font-medium bg-gray-50
              rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
              {d.remarks}
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
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white border-none
            bg-gradient-to-r from-pink-500 to-pink-600
            hover:from-pink-600 hover:to-pink-700
            shadow-md shadow-pink-200
            transition-all duration-200 cursor-pointer active:scale-95">
          Edit Driver
        </button>
      </div>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════

export const DeleteDriverModal = ({ driver, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Delete Driver" onClose={onClose} />
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
            {driver?.driverName}?
          </p>
        </div>
        <p className="text-xs text-gray-500 font-medium bg-red-50
          rounded-xl px-4 py-3 border border-red-100 leading-relaxed">
          This action <strong className="text-red-600">cannot be undone</strong>.
          All driver data including documents will be permanently removed.
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
