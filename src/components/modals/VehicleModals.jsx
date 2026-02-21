import { useState } from 'react';
import {
  FaTimes, FaCar, FaIdCard, FaCalendarAlt,
  FaUser, FaExclamationTriangle, FaCheckCircle,
  FaExclamationCircle, FaClock, FaFileAlt,
  FaSatelliteDish, FaStickyNote,
} from 'react-icons/fa';
import Portal from '../ui/Portal';
import { vehicleTypeOptions, vehicleStatusOptions, CERT_WARNING_DAYS } from '../../data/mockVehicles';

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
// CERT EXPIRY BADGE — exported for use in table
// ═══════════════════════════════════════════════════════════════════

export const CertBadge = ({ expiryDate, short = false }) => {
  if (!expiryDate) return <span className="text-gray-300 text-xs">—</span>;

  const today    = new Date();
  const expiry   = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
      <FaExclamationCircle className="text-[10px]" />
      {short ? 'Expired' : 'Expired'}
    </span>
  );

  if (diffDays <= CERT_WARNING_DAYS) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
      <FaClock className="text-[10px]" />
      {short ? `${diffDays}d` : `Expiring in ${diffDays}d`}
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
      <FaCheckCircle className="text-[10px]" />
      {short
        ? new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
        : new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EXPIRY WARNING BANNER — shown in form when any date is expiring
// ═══════════════════════════════════════════════════════════════════

const ExpiryWarning = ({ label, date }) => {
  if (!date) return null;
  const today    = new Date();
  const expiry   = new Date(date);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays > CERT_WARNING_DAYS) return null;

  const cls = diffDays < 0
    ? 'bg-red-50 border-red-200 text-red-600'
    : 'bg-orange-50 border-orange-200 text-orange-600';

  const msg = diffDays < 0
    ? `${label} has expired!`
    : `${label} expiring in ${diffDays} day(s) — renew soon!`;

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
      border text-xs font-bold ${cls}`}>
      <FaExclamationTriangle className="flex-shrink-0" />
      {msg}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

const validate = (form) => {
  const e = {};

  if (!form.vehicleNumber.trim())
    e.vehicleNumber = 'Vehicle number is required';

  if (!form.vehicleType.trim())
    e.vehicleType = 'Vehicle type is required';

  if (!form.vehicleModel.trim())
    e.vehicleModel = 'Vehicle model is required';

  if (!form.ownerName.trim())
    e.ownerName = 'Owner name is required';

  if (!form.rcNumber.trim())
    e.rcNumber = 'RC number is required';

  if (!form.rcExpiry)
    e.rcExpiry = 'RC expiry date is required';

  if (!form.chassisNumber.trim())
    e.chassisNumber = 'Chassis number is required';

  if (!form.engineNumber.trim())
    e.engineNumber = 'Engine number is required';

  if (!form.insurancePolicyNo.trim())
    e.insurancePolicyNo = 'Insurance policy number is required';

  if (!form.insuranceValidity)
    e.insuranceValidity = 'Insurance validity date is required';

  if (!form.pucNumber.trim())
    e.pucNumber = 'PUC number is required';

  if (!form.pucExpiry)
    e.pucExpiry = 'PUC expiry date is required';

  if (!form.fitnessCertExpiry)
    e.fitnessCertExpiry = 'Fitness certificate expiry is required';

  if (!form.permitExpiry)
    e.permitExpiry = 'Permit expiry date is required';

  return e;
};

// ═══════════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════════

const emptyForm = () => ({
  vehicleNumber:     '',
  vehicleType:       '',
  vehicleModel:      '',
  chassisNumber:     '',
  engineNumber:      '',
  rcNumber:          '',
  rcExpiry:          '',
  ownerName:         '',
  insurancePolicyNo: '',
  insuranceValidity: '',
  pucNumber:         '',
  pucExpiry:         '',
  fitnessCertExpiry: '',
  permitExpiry:      '',
  gpsInstalled:      false,
  status:            'Active',
  remarks:           '',
});

// ═══════════════════════════════════════════════════════════════════
// FORM BODY — shared between Add and Edit
// ═══════════════════════════════════════════════════════════════════

const VehicleFormBody = ({ form, setForm, errors, setErrors }) => {
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── VEHICLE INFO ── */}
      <Section label="Vehicle Information" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehicle Number" icon={<FaCar />}
          error={errors.vehicleNumber} required>
          <input
            value={form.vehicleNumber}
            onChange={e => set('vehicleNumber', e.target.value.toUpperCase())}
            placeholder="TN09AB1234"
            className={inputCls(errors.vehicleNumber)}
          />
        </Field>
        <Field label="Vehicle Type" icon={<FaCar />}
          error={errors.vehicleType} required>
          <select
            value={form.vehicleType}
            onChange={e => set('vehicleType', e.target.value)}
            className={selectCls(errors.vehicleType)}>
            <option value="">Select type</option>
            {vehicleTypeOptions.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehicle Model" error={errors.vehicleModel} required>
          <input
            value={form.vehicleModel}
            onChange={e => set('vehicleModel', e.target.value)}
            placeholder="Tata Ace"
            className={inputCls(errors.vehicleModel)}
          />
        </Field>
        <Field label="Owner Name" icon={<FaUser />}
          error={errors.ownerName} required>
          <input
            value={form.ownerName}
            onChange={e => set('ownerName', e.target.value)}
            placeholder="Owner / Company name"
            className={inputCls(errors.ownerName)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Chassis Number" icon={<FaIdCard />}
          error={errors.chassisNumber} required>
          <input
            value={form.chassisNumber}
            onChange={e => set('chassisNumber', e.target.value.toUpperCase())}
            placeholder="MAT445271N2F12345"
            className={inputCls(errors.chassisNumber)}
          />
        </Field>
        <Field label="Engine Number" icon={<FaIdCard />}
          error={errors.engineNumber} required>
          <input
            value={form.engineNumber}
            onChange={e => set('engineNumber', e.target.value.toUpperCase())}
            placeholder="N2F12345678"
            className={inputCls(errors.engineNumber)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className={selectCls()}>
            {vehicleStatusOptions.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {/* GPS Toggle */}
        <Field label="GPS Installed" icon={<FaSatelliteDish />}>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(val => (
              <button key={String(val)} type="button"
                onClick={() => set('gpsInstalled', val)}
                className={`py-2.5 rounded-xl text-sm font-bold border-2
                  transition-all duration-200 cursor-pointer
                  ${form.gpsInstalled === val
                    ? 'bg-pink-50 border-pink-400 text-pink-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                {val ? '✓ Yes' : '✕ No'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* ── RC ── */}
      <Section label="Registration Certificate (RC)" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="RC Number" icon={<FaFileAlt />}
          error={errors.rcNumber} required>
          <input
            value={form.rcNumber}
            onChange={e => set('rcNumber', e.target.value.toUpperCase())}
            placeholder="TN09RC123456"
            className={inputCls(errors.rcNumber)}
          />
        </Field>
        <Field label="RC Expiry Date" icon={<FaCalendarAlt />}
          error={errors.rcExpiry} required>
          <input
            type="date" value={form.rcExpiry}
            onChange={e => set('rcExpiry', e.target.value)}
            className={inputCls(errors.rcExpiry)}
          />
        </Field>
      </div>
      <ExpiryWarning label="RC" date={form.rcExpiry} />

      {/* ── INSURANCE ── */}
      <Section label="Insurance" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Insurance Policy No" icon={<FaFileAlt />}
          error={errors.insurancePolicyNo} required>
          <input
            value={form.insurancePolicyNo}
            onChange={e => set('insurancePolicyNo', e.target.value.toUpperCase())}
            placeholder="POL/2024/TN/001234"
            className={inputCls(errors.insurancePolicyNo)}
          />
        </Field>
        <Field label="Insurance Validity" icon={<FaCalendarAlt />}
          error={errors.insuranceValidity} required>
          <input
            type="date" value={form.insuranceValidity}
            onChange={e => set('insuranceValidity', e.target.value)}
            className={inputCls(errors.insuranceValidity)}
          />
        </Field>
      </div>
      <ExpiryWarning label="Insurance" date={form.insuranceValidity} />

      {/* ── PUC ── */}
      <Section label="Pollution Under Control (PUC)" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="PUC Number" icon={<FaFileAlt />}
          error={errors.pucNumber} required>
          <input
            value={form.pucNumber}
            onChange={e => set('pucNumber', e.target.value.toUpperCase())}
            placeholder="PUC/TN/2024/5678"
            className={inputCls(errors.pucNumber)}
          />
        </Field>
        <Field label="PUC Expiry Date" icon={<FaCalendarAlt />}
          error={errors.pucExpiry} required>
          <input
            type="date" value={form.pucExpiry}
            onChange={e => set('pucExpiry', e.target.value)}
            className={inputCls(errors.pucExpiry)}
          />
        </Field>
      </div>
      <ExpiryWarning label="PUC" date={form.pucExpiry} />

      {/* ── FITNESS & PERMIT ── */}
      <Section label="Fitness Certificate & Permit" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fitness Certificate Expiry" icon={<FaCalendarAlt />}
          error={errors.fitnessCertExpiry} required>
          <input
            type="date" value={form.fitnessCertExpiry}
            onChange={e => set('fitnessCertExpiry', e.target.value)}
            className={inputCls(errors.fitnessCertExpiry)}
          />
        </Field>
        <Field label="Permit Expiry Date" icon={<FaCalendarAlt />}
          error={errors.permitExpiry} required>
          <input
            type="date" value={form.permitExpiry}
            onChange={e => set('permitExpiry', e.target.value)}
            className={inputCls(errors.permitExpiry)}
          />
        </Field>
      </div>
      <ExpiryWarning label="Fitness Certificate" date={form.fitnessCertExpiry} />
      <ExpiryWarning label="Permit" date={form.permitExpiry} />

      {/* ── REMARKS ── */}
      <Section label="Remarks" />
      <Field label="Notes / Remarks" icon={<FaStickyNote />}>
        <textarea
          value={form.remarks} rows={2}
          onChange={e => set('remarks', e.target.value)}
          placeholder="Any additional notes about this vehicle..."
          className={`${inputCls()} resize-none`}
        />
      </Field>

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════════════

export const AddVehicleModal = ({ onClose, onSubmit }) => {
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
        title="Add New Vehicle"
        subtitle="Fill in the details to register a vehicle"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <VehicleFormBody
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
            {loading ? 'Saving...' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════════════

export const EditVehicleModal = ({ vehicle, onClose, onSubmit }) => {
  const [form,    setForm]    = useState({ ...vehicle });
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
        title="Edit Vehicle"
        subtitle={`Editing — ${vehicle.vehicleNumber}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <VehicleFormBody
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

export const ViewVehicleModal = ({ vehicle: v, onClose, onEdit }) => {
  if (!v) return null;

  const statusColor = {
    Active:              'bg-green-50 text-green-700 border border-green-200',
    Inactive:            'bg-gray-100 text-gray-600 border border-gray-200',
    'Under Maintenance': 'bg-orange-50 text-orange-600 border border-orange-200',
  };

  const InfoRow = ({ label, value }) => {
    if (!value && value !== false) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      </div>
    );
  };

  const CertRow = ({ label, date }) => (
    <div className="flex items-center justify-between py-2.5
      border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <CertBadge expiryDate={date} />
    </div>
  );

  return (
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Vehicle Details"
        subtitle="Full vehicle profile"
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

        {/* Profile row */}
        <div className="flex items-center gap-4 p-4
          bg-pink-50 rounded-xl border border-pink-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700
            flex items-center justify-center flex-shrink-0
            shadow-[0_3px_10px_rgba(236,72,153,0.25)]">
            <FaCar className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-extrabold text-gray-900 tracking-tight">
              {v.vehicleNumber}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {v.vehicleType} · {v.vehicleModel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-xs font-bold px-3 py-1
              rounded-full ${statusColor[v.status]}`}>
              {v.status}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full
              ${v.gpsInstalled
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
              {v.gpsInstalled ? '📡 GPS On' : '📡 No GPS'}
            </span>
          </div>
        </div>

        {/* Vehicle Info */}
        <Section label="Vehicle Information" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Owner Name"     value={v.ownerName} />
          <InfoRow label="Vehicle Type"   value={v.vehicleType} />
          <InfoRow label="Vehicle Model"  value={v.vehicleModel} />
          <InfoRow label="RC Number"      value={v.rcNumber} />
          <InfoRow label="Chassis Number" value={v.chassisNumber} />
          <InfoRow label="Engine Number"  value={v.engineNumber} />
          <InfoRow label="Insurance No"   value={v.insurancePolicyNo} />
          <InfoRow label="PUC Number"     value={v.pucNumber} />
        </div>

        {/* Certificate Expiry Summary */}
        <Section label="Certificate Expiry Status" />
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
          <CertRow label="RC Expiry"                  date={v.rcExpiry} />
          <CertRow label="Insurance Validity"         date={v.insuranceValidity} />
          <CertRow label="PUC Expiry"                 date={v.pucExpiry} />
          <CertRow label="Fitness Certificate Expiry" date={v.fitnessCertExpiry} />
          <CertRow label="Permit Expiry"              date={v.permitExpiry} />
        </div>

        {/* Remarks */}
        {v.remarks && (
          <>
            <Section label="Remarks" />
            <p className="text-sm text-gray-600 font-medium bg-gray-50
              rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
              {v.remarks}
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
          Edit Vehicle
        </button>
      </div>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════

export const DeleteVehicleModal = ({ vehicle, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Delete Vehicle" onClose={onClose} />
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
            {vehicle?.vehicleNumber}?
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {vehicle?.vehicleType} · {vehicle?.vehicleModel}
          </p>
        </div>
        <p className="text-xs text-gray-500 font-medium bg-red-50
          rounded-xl px-4 py-3 border border-red-100 leading-relaxed">
          This action <strong className="text-red-600">cannot be undone</strong>.
          All vehicle data including certificate records will be permanently removed.
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
