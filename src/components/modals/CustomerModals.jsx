import { useState } from 'react';
import {
  FaTimes, FaUser, FaBuilding, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaPlus, FaTrash, FaStar, FaRegStar,
  FaWhatsapp, FaExclamationTriangle, FaCheck, FaMinus,
  FaCalendarAlt, FaCreditCard, FaFileAlt, FaStickyNote,
} from 'react-icons/fa';
import Portal from '../ui/Portal';
import { paymentTermsOptions, customerStatusOptions } from '../../data/mockCustomers';

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

// Section divider label
const Section = ({ label }) => (
  <p className="text-[11px] font-extrabold text-gray-400 uppercase
    tracking-widest pt-2 pb-1 border-b border-gray-100 mb-1">
    {label}
  </p>
);

// Field wrapper
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

// Input styles
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
// STATUS TOGGLE
// ═══════════════════════════════════════════════════════════════════

const StatusToggle = ({ value, onChange }) => (
  <div className="grid grid-cols-3 rounded-xl border border-gray-200 overflow-hidden">
    {[
      { val: 'Active',   label: '✓ Active',   active: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' },
      { val: 'Inactive', label: '— Inactive', active: 'bg-gray-100 text-gray-700' },
      { val: 'Blocked',  label: '✕ Blocked',  active: 'bg-red-50 text-red-600' },
    ].map((opt, i) => (
      <button
        key={opt.val}
        type="button"
        onClick={() => onChange(opt.val)}
        className={`py-2.5 text-sm font-bold border-none cursor-pointer
          transition-all duration-200 flex items-center justify-center gap-1.5
          ${i > 0 ? 'border-l border-gray-200' : ''}
          ${value === opt.val ? opt.active : 'bg-white text-gray-400 hover:bg-gray-50'}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// ADDRESS EDITOR
// ═══════════════════════════════════════════════════════════════════

const emptyAddress = () => ({
  id: Date.now() + Math.random(),
  label: '', line1: '', line2: '',
  city: '', state: '', pincode: '',
  isDefault: false,
});

const AddressEditor = ({ addresses, onChange }) => {
  const add    = ()       => onChange([...addresses, emptyAddress()]);
  const remove = (id)     => {
    const rest = addresses.filter(a => a.id !== id);
    if (rest.length && !rest.some(a => a.isDefault)) rest[0].isDefault = true;
    onChange(rest);
  };
  const update = (id, f, v) =>
    onChange(addresses.map(a => a.id === id ? { ...a, [f]: v } : a));
  const setDef = (id) =>
    onChange(addresses.map(a => ({ ...a, isDefault: a.id === id })));

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((addr, idx) => (
        <div key={addr.id}
          className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3
            hover:border-pink-200 transition-colors duration-200 bg-gray-50/40">

          {/* Address row header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-pink-400 text-xs" />
              <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wide">
                Address {idx + 1}
              </span>
              {addr.isDefault && (
                <span className="text-[10px] font-bold px-2 py-0.5
                  bg-pink-50 text-pink-500 rounded-full border border-pink-100">
                  Default
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => setDef(addr.id)}
                title="Set as default"
                className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent
                  text-gray-300 hover:text-pink-500 hover:bg-pink-50 transition-all duration-200">
                {addr.isDefault
                  ? <FaStar    className="text-xs text-pink-500" />
                  : <FaRegStar className="text-xs" />
                }
              </button>
              {addresses.length > 1 && (
                <button type="button" onClick={() => remove(addr.id)}
                  className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent
                    text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Label + Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                Label
              </label>
              <input value={addr.label} placeholder="Home, Office..."
                onChange={e => update(addr.id, 'label', e.target.value)}
                className={inputCls()} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                Pincode
              </label>
              <input value={addr.pincode} placeholder="600001" maxLength={6}
                onChange={e => update(addr.id, 'pincode', e.target.value.replace(/\D/g, ''))}
                className={inputCls()} />
            </div>
          </div>

          {/* Line 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
              Address Line 1
            </label>
            <input value={addr.line1} placeholder="Street, Building No."
              onChange={e => update(addr.id, 'line1', e.target.value)}
              className={inputCls()} />
          </div>

          {/* Line 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
              Address Line 2
            </label>
            <input value={addr.line2} placeholder="Area, Landmark (optional)"
              onChange={e => update(addr.id, 'line2', e.target.value)}
              className={inputCls()} />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                City
              </label>
              <input value={addr.city} placeholder="Chennai"
                onChange={e => update(addr.id, 'city', e.target.value)}
                className={inputCls()} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                State
              </label>
              <input value={addr.state} placeholder="Tamil Nadu"
                onChange={e => update(addr.id, 'state', e.target.value)}
                className={inputCls()} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl
          border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400
          hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/40
          transition-all duration-200 bg-transparent cursor-pointer">
        <FaPlus className="text-xs" /> Add Another Address
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

const validate = (form) => {
  const e = {};

  // Required fields
  if (!form.customerName.trim())
    e.customerName = 'Customer name is required';

  if (!form.mobileNumber.trim())
    e.mobileNumber = 'Mobile number is required';
  else if (!/^\d{10}$/.test(form.mobileNumber))
    e.mobileNumber = 'Enter a valid 10-digit number';

  // Optional but validated if filled
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
    e.email = 'Enter a valid email address';

  if (form.alternateMobile && !/^\d{10}$/.test(form.alternateMobile))
    e.alternateMobile = 'Enter a valid 10-digit number';

  if (form.whatsappNumber && !/^\d{10}$/.test(form.whatsappNumber))
    e.whatsappNumber = 'Enter a valid 10-digit number';

  // Business-only required fields
  if (form.customerType === 'Business') {
    if (!form.businessName.trim())
      e.businessName = 'Business name is required';
    if (!form.contactPersonName.trim())
      e.contactPersonName = 'Contact person name is required';
    if (form.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber))
      e.gstNumber = 'Enter a valid 15-character GST number';
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber))
      e.panNumber = 'Enter a valid 10-character PAN number';
  }

  // Credit limit
  if (form.creditLimit < 0)
    e.creditLimit = 'Credit limit cannot be negative';

  return e;
};

// ═══════════════════════════════════════════════════════════════════
// EMPTY FORM
// ═══════════════════════════════════════════════════════════════════

const emptyForm = () => ({
  customerName:      '',
  mobileNumber:      '',
  alternateMobile:   '',
  whatsappNumber:    '',
  email:             '',
  customerType:      'Individual',
  businessName:      '',
  gstNumber:         '',
  panNumber:         '',
  contactPersonName: '',
  address:           [{ ...emptyAddress(), isDefault: true }],
  status:            'Active',
  creditLimit:       0,
  paymentTerms:      'Immediate',
  customerSince:     new Date().toISOString().split('T')[0],
  remarks:           '',
});

// ═══════════════════════════════════════════════════════════════════
// ADD MODAL
// ═══════════════════════════════════════════════════════════════════

export const AddCustomerModal = ({ onClose, onSubmit }) => {
  const [form,    setForm]    = useState(emptyForm());
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Add New Customer"
        subtitle="Fill in the details to register a customer"
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

          {/* ── PERSONAL INFORMATION ── */}
          <Section label="Personal Information" />

          {/* Customer Type */}
          <Field label="Customer Type" icon={<FaUser />} required>
            <div className="grid grid-cols-2 gap-2">
              {['Individual', 'Business'].map(type => (
                <button key={type} type="button"
                  onClick={() => set('customerType', type)}
                  className={`flex items-center justify-center gap-2 py-2.5
                    rounded-xl text-sm font-bold border-2
                    transition-all duration-200 cursor-pointer
                    ${form.customerType === type
                      ? 'bg-pink-50 border-pink-400 text-pink-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                  {type === 'Individual'
                    ? <FaUser     className="text-sm" />
                    : <FaBuilding className="text-sm" />
                  }
                  {type}
                </button>
              ))}
            </div>
          </Field>

          {/* Customer Name */}
          <Field label="Customer Name" icon={<FaUser />} error={errors.customerName} required>
            <input
              value={form.customerName}
              onChange={e => set('customerName', e.target.value)}
              placeholder="Full name"
              className={inputCls(errors.customerName)}
            />
          </Field>

          {/* Mobile + Alternate */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mobile Number" icon={<FaPhone />} error={errors.mobileNumber} required>
              <input
                value={form.mobileNumber} maxLength={10}
                onChange={e => set('mobileNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className={inputCls(errors.mobileNumber)}
              />
            </Field>
            <Field label="Alternate Mobile" error={errors.alternateMobile}>
              <input
                value={form.alternateMobile} maxLength={10}
                onChange={e => set('alternateMobile', e.target.value.replace(/\D/g, ''))}
                placeholder="Optional"
                className={inputCls(errors.alternateMobile)}
              />
            </Field>
          </div>

          {/* WhatsApp + Email */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp Number" icon={<FaWhatsapp />} error={errors.whatsappNumber}>
              <input
                value={form.whatsappNumber} maxLength={10}
                onChange={e => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Optional"
                className={inputCls(errors.whatsappNumber)}
              />
            </Field>
            <Field label="Email Address" icon={<FaEnvelope />} error={errors.email}>
              <input
                type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                className={inputCls(errors.email)}
              />
            </Field>
          </div>

          {/* Customer Since + Status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer Since" icon={<FaCalendarAlt />}>
              <input
                type="date" value={form.customerSince}
                onChange={e => set('customerSince', e.target.value)}
                className={inputCls()}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={selectCls()}>
                {customerStatusOptions.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── ADDRESS ── */}
          <Section label="Address" />
          <AddressEditor
            addresses={form.address}
            onChange={addrs => setForm(prev => ({ ...prev, address: addrs }))}
          />

          {/* ── BUSINESS DETAILS (conditional) ── */}
          {form.customerType === 'Business' && (
            <>
              <Section label="Business Details" />

              <Field label="Business Name" icon={<FaBuilding />}
                error={errors.businessName} required>
                <input
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                  placeholder="Company Pvt Ltd"
                  className={inputCls(errors.businessName)}
                />
              </Field>

              <Field label="Contact Person Name" icon={<FaUser />}
                error={errors.contactPersonName} required>
                <input
                  value={form.contactPersonName}
                  onChange={e => set('contactPersonName', e.target.value)}
                  placeholder="Primary contact person"
                  className={inputCls(errors.contactPersonName)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="GST Number" icon={<FaFileAlt />} error={errors.gstNumber}>
                  <input
                    value={form.gstNumber} maxLength={15}
                    onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    className={inputCls(errors.gstNumber)}
                  />
                </Field>
                <Field label="PAN Number" icon={<FaFileAlt />} error={errors.panNumber}>
                  <input
                    value={form.panNumber} maxLength={10}
                    onChange={e => set('panNumber', e.target.value.toUpperCase())}
                    placeholder="AAAAA0000A"
                    className={inputCls(errors.panNumber)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── FINANCIAL ── */}
          <Section label="Financial & Payment" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Credit Limit (₹)" icon={<FaCreditCard />} error={errors.creditLimit}>
              <input
                type="number" value={form.creditLimit} min={0}
                onChange={e => set('creditLimit', Number(e.target.value))}
                placeholder="0"
                className={inputCls(errors.creditLimit)}
              />
            </Field>
            <Field label="Payment Terms">
              <select
                value={form.paymentTerms}
                onChange={e => set('paymentTerms', e.target.value)}
                className={selectCls()}>
                {paymentTermsOptions.map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── NOTES ── */}
          <Section label="Notes" />

          <Field label="Remarks / Notes" icon={<FaStickyNote />}>
            <textarea
              value={form.remarks} rows={3}
              onChange={e => set('remarks', e.target.value)}
              placeholder="Any special notes about this customer..."
              className={`${inputCls()} resize-none`}
            />
          </Field>

        </div>

        {/* Footer */}
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
            {loading ? 'Saving...' : 'Add Customer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════════════

export const EditCustomerModal = ({ customer, onClose, onSubmit }) => {
  const [form,    setForm]    = useState({ ...customer });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Edit Customer"
        subtitle={`Editing — ${customer.customerName}`}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

          {/* ── PERSONAL INFORMATION ── */}
          <Section label="Personal Information" />

          <Field label="Customer Type" icon={<FaUser />} required>
            <div className="grid grid-cols-2 gap-2">
              {['Individual', 'Business'].map(type => (
                <button key={type} type="button"
                  onClick={() => set('customerType', type)}
                  className={`flex items-center justify-center gap-2 py-2.5
                    rounded-xl text-sm font-bold border-2
                    transition-all duration-200 cursor-pointer
                    ${form.customerType === type
                      ? 'bg-pink-50 border-pink-400 text-pink-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                  {type === 'Individual'
                    ? <FaUser     className="text-sm" />
                    : <FaBuilding className="text-sm" />
                  }
                  {type}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Customer Name" icon={<FaUser />} error={errors.customerName} required>
            <input
              value={form.customerName}
              onChange={e => set('customerName', e.target.value)}
              placeholder="Full name"
              className={inputCls(errors.customerName)}
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
            <Field label="Alternate Mobile" error={errors.alternateMobile}>
              <input
                value={form.alternateMobile} maxLength={10}
                onChange={e => set('alternateMobile', e.target.value.replace(/\D/g, ''))}
                placeholder="Optional"
                className={inputCls(errors.alternateMobile)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp Number" icon={<FaWhatsapp />} error={errors.whatsappNumber}>
              <input
                value={form.whatsappNumber} maxLength={10}
                onChange={e => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Optional"
                className={inputCls(errors.whatsappNumber)}
              />
            </Field>
            <Field label="Email Address" icon={<FaEnvelope />} error={errors.email}>
              <input
                type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                className={inputCls(errors.email)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer Since" icon={<FaCalendarAlt />}>
              <input
                type="date" value={form.customerSince}
                onChange={e => set('customerSince', e.target.value)}
                className={inputCls()}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={selectCls()}>
                {customerStatusOptions.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── ADDRESS ── */}
          <Section label="Address" />
          <AddressEditor
            addresses={form.address}
            onChange={addrs => setForm(prev => ({ ...prev, address: addrs }))}
          />

          {/* ── BUSINESS DETAILS ── */}
          {form.customerType === 'Business' && (
            <>
              <Section label="Business Details" />

              <Field label="Business Name" icon={<FaBuilding />}
                error={errors.businessName} required>
                <input
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                  placeholder="Company Pvt Ltd"
                  className={inputCls(errors.businessName)}
                />
              </Field>

              <Field label="Contact Person Name" icon={<FaUser />}
                error={errors.contactPersonName} required>
                <input
                  value={form.contactPersonName}
                  onChange={e => set('contactPersonName', e.target.value)}
                  placeholder="Primary contact person"
                  className={inputCls(errors.contactPersonName)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="GST Number" icon={<FaFileAlt />} error={errors.gstNumber}>
                  <input
                    value={form.gstNumber} maxLength={15}
                    onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    className={inputCls(errors.gstNumber)}
                  />
                </Field>
                <Field label="PAN Number" icon={<FaFileAlt />} error={errors.panNumber}>
                  <input
                    value={form.panNumber} maxLength={10}
                    onChange={e => set('panNumber', e.target.value.toUpperCase())}
                    placeholder="AAAAA0000A"
                    className={inputCls(errors.panNumber)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── FINANCIAL ── */}
          <Section label="Financial & Payment" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Credit Limit (₹)" icon={<FaCreditCard />} error={errors.creditLimit}>
              <input
                type="number" value={form.creditLimit} min={0}
                onChange={e => set('creditLimit', Number(e.target.value))}
                placeholder="0"
                className={inputCls(errors.creditLimit)}
              />
            </Field>
            <Field label="Payment Terms">
              <select
                value={form.paymentTerms}
                onChange={e => set('paymentTerms', e.target.value)}
                className={selectCls()}>
                {paymentTermsOptions.map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── NOTES ── */}
          <Section label="Notes" />

          <Field label="Remarks / Notes" icon={<FaStickyNote />}>
            <textarea
              value={form.remarks} rows={3}
              onChange={e => set('remarks', e.target.value)}
              placeholder="Any special notes about this customer..."
              className={`${inputCls()} resize-none`}
            />
          </Field>

        </div>

        {/* Footer */}
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

export const ViewCustomerModal = ({ customer: c, onClose, onEdit }) => {
  if (!c) return null;

  const statusColor = {
    Active:   'bg-green-50 text-green-700 border border-green-200',
    Inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
    Blocked:  'bg-red-50   text-red-600   border border-red-100',
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

  return (
    <ModalWrapper onClose={onClose} wide>
      <ModalHeader
        title="Customer Details"
        subtitle={`${c.customerType} Account`}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

        {/* Profile row */}
        <div className="flex items-center gap-4 p-4
          bg-pink-50 rounded-xl border border-pink-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700
            flex items-center justify-center flex-shrink-0
            shadow-[0_3px_10px_rgba(236,72,153,0.25)]">
            {c.customerType === 'Business'
              ? <FaBuilding className="text-white text-lg" />
              : <FaUser     className="text-white text-lg" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-extrabold text-gray-900 tracking-tight truncate">
              {c.customerName}
            </p>
            {c.businessName && (
              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                {c.businessName}
              </p>
            )}
          </div>
          <span className={`text-xs font-bold px-3 py-1
            rounded-full flex-shrink-0 ${statusColor[c.status]}`}>
            {c.status}
          </span>
        </div>

        {/* Contact */}
        <Section label="Contact Information" />
        <InfoGrid>
          <InfoRow label="Mobile Number"    value={c.mobileNumber} />
          <InfoRow label="Alternate Mobile" value={c.alternateMobile || '—'} />
          <InfoRow label="WhatsApp"         value={c.whatsappNumber || '—'} />
          <InfoRow label="Email"            value={c.email || '—'} />
        </InfoGrid>

        {/* Business */}
        {c.customerType === 'Business' && (
          <>
            <Section label="Business Details" />
            <InfoGrid>
              <InfoRow label="Business Name"  value={c.businessName} />
              <InfoRow label="Contact Person" value={c.contactPersonName} />
              <InfoRow label="GST Number"     value={c.gstNumber || '—'} />
              <InfoRow label="PAN Number"     value={c.panNumber  || '—'} />
            </InfoGrid>
          </>
        )}

        {/* Addresses */}
        {c.address?.length > 0 && (
          <>
            <Section label={`Addresses (${c.address.length})`} />
            <div className="flex flex-col gap-2">
              {c.address.map(addr => (
                <div key={addr.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl
                    bg-gray-50 border border-gray-100">
                  <FaMapMarkerAlt className="text-pink-400 text-sm mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-800">
                        {addr.label || 'Address'}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5
                          bg-pink-50 text-pink-500 rounded-full border border-pink-100">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                        .filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Financial */}
        <Section label="Financial & Payment" />
        <InfoGrid>
          <InfoRow
            label="Credit Limit"
            value={`₹${Number(c.creditLimit || 0).toLocaleString('en-IN')}`}
          />
          <InfoRow label="Payment Terms"  value={c.paymentTerms} />
          <InfoRow label="Customer Since" value={
            c.customerSince
              ? new Date(c.customerSince).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : '—'
          } />
        </InfoGrid>

        {/* Remarks */}
        {c.remarks && (
          <>
            <Section label="Remarks / Notes" />
            <p className="text-sm text-gray-600 font-medium bg-gray-50
              rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
              {c.remarks}
            </p>
          </>
        )}

      </div>

      {/* Footer */}
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
          Edit Customer
        </button>
      </div>
    </ModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════

export const DeleteCustomerModal = ({ customer, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Delete Customer" onClose={onClose} />

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
            {customer?.customerName}?
          </p>
          {customer?.businessName && (
            <p className="text-xs text-gray-500 mt-0.5">{customer.businessName}</p>
          )}
        </div>

        <p className="text-xs text-gray-500 font-medium bg-red-50
          rounded-xl px-4 py-3 border border-red-100 leading-relaxed">
          This action <strong className="text-red-600">cannot be undone</strong>.
          All customer data including addresses will be permanently removed.
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
