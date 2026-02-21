import { FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaSignInAlt, FaCheckCircle, FaArrowLeft, FaMobileAlt } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLogin from '../hooks/useLogin';

// ── Sub-components ────────────────────────────────────────────────────────────

const FieldError = ({ error }) =>
error ? (
<p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
 <span>⚠</span> {error}
</p>
) : null;

const Label = ({ text }) => (
<label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
{text}
</label>
);

const SubmitBtn = ({ loading, label, loadingLabel, icon }) => (
<button
type="submit"
disabled={loading}
className={`w-full py-3 px-6 rounded-xl text-sm font-bold text-white
 flex items-center justify-center gap-2 transition-all duration-200 shadow-md border-none
 ${loading
   ? 'bg-pink-300 cursor-not-allowed shadow-none'
   : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer'
 }`}
>
{loading ? (
 <>
   <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
   {loadingLabel}
 </>
) : (
 <>
   <span className="text-sm">{icon}</span>
   {label}
 </>
)}
</button>
);

const BackBtn = ({ onClick }) => (
<button
type="button"
onClick={onClick}
className="w-full py-2.5 px-6 rounded-xl text-sm font-semibold text-gray-500
 bg-gray-50 border border-gray-200 flex items-center justify-center gap-2
 transition-all duration-200 hover:border-pink-400 hover:text-pink-500
 cursor-pointer"
>
<FaArrowLeft className="text-xs" /> Back to Login
</button>
);

// ── Input class helper ────────────────────────────────────────────────────────
const inputCls = (hasErr) =>
`w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-800 rounded-xl border-2
outline-none transition-all duration-200 bg-gray-50
focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100
${hasErr
? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
: 'border-gray-100 hover:border-gray-200'
}`;

// ── Main ──────────────────────────────────────────────────────────────────────
const Login = () => {
const {
currentState, setCurrentState,
isLoading,
formData, errors, showPassword, setShowPassword, rememberMe, setRememberMe,
handleChange, handleSubmit,
otpEmail, otpEmailError,
handleOtpEmailChange, handleOtpLoginSubmit,
otpValues, otpInputRefs,
handleOtpChange, handleOtpKeyDown,
userEmail,
handleVerifyOtp, handleResendOtp,
handleBackToLogin,
} = useLogin();

const headers = {
login:           { title: 'Admin Login',    subtitle: 'Sign in to your admin account' },
otpLogin:        { title: 'Login with OTP', subtitle: 'Enter your email to receive OTP' },
otpVerification: { title: 'Verify OTP',     subtitle: 'Enter the code sent to your email' },
};
const h = headers[currentState];

return (
<div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] relative overflow-hidden">

 {/* Blobs */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden">
   <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full
     bg-pink-200 opacity-20 blur-3xl animate-[blob_7s_infinite]" />
   <div className="absolute top-[50%] right-[5%] w-72 h-72 rounded-full
     bg-pink-300 opacity-15 blur-3xl animate-[blob_7s_2s_infinite]" />
   <div className="absolute bottom-[5%] left-[20%] w-64 h-64 rounded-full
     bg-pink-100 opacity-25 blur-3xl animate-[blob_7s_4s_infinite]" />
 </div>

 <div className="w-full max-w-md relative z-10 fade-up">

   {/* Brand + Header */}
   <div className="text-center mb-7">
     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600
       flex items-center justify-center mx-auto mb-4
       shadow-[0_8px_24px_rgba(236,72,153,0.3)]">
       <i className="fas fa-shopping-bag text-white text-xl" />
     </div>
     <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
       {h.title}
     </h1>
     <p className="text-sm text-gray-400 font-medium">{h.subtitle}</p>
   </div>

   {/* Card */}
   <div className="bg-white rounded-2xl border border-gray-100 p-8
     shadow-[0_20px_60px_rgba(236,72,153,0.08),0_4px_16px_rgba(0,0,0,0.06)]">

     {/* ══ PASSWORD LOGIN ══ */}
     {currentState === 'login' && (
       <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

         {/* Email */}
         <div>
           <Label text="Email Address" />
           <div className="relative">
             <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2
               text-gray-300 text-sm pointer-events-none" />
             <input
               type="email" name="email"
               value={formData.email} onChange={handleChange}
               placeholder="Enter your email" autoComplete="email"
               className={inputCls(errors.email)}
             />
           </div>
           <FieldError error={errors.email} />
         </div>

         {/* Password */}
         <div>
           <Label text="Password" />
           <div className="relative">
             <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2
               text-gray-300 text-sm pointer-events-none" />
             <input
               type={showPassword ? 'text' : 'password'}
               name="password"
               value={formData.password} onChange={handleChange}
               placeholder="Enter your password" autoComplete="current-password"
               className={`${inputCls(errors.password)} pr-11`}
             />
             <button
               type="button"
               onClick={() => setShowPassword(p => !p)}
               className="absolute right-3.5 top-1/2 -translate-y-1/2
                 text-gray-400 hover:text-pink-500 transition-colors duration-200
                 bg-transparent border-none cursor-pointer p-0 flex items-center"
             >
               {showPassword
                 ? <FaEyeSlash className="text-sm" />
                 : <FaEye     className="text-sm" />
               }
             </button>
           </div>
           <FieldError error={errors.password} />
         </div>

         {/* Remember me + OTP switch */}
         <div className="flex items-center justify-between">
           <label className="flex items-center gap-2 cursor-pointer select-none">
             <div
               onClick={() => setRememberMe(p => !p)}
               className={`w-[18px] h-[18px] rounded flex items-center justify-center
                 flex-shrink-0 border transition-all duration-200 cursor-pointer
                 ${rememberMe
                   ? 'bg-pink-500 border-pink-500'
                   : 'bg-white border-gray-300 hover:border-pink-400'
                 }`}
             >
               {rememberMe && (
                 <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                   <path d="M1.5 5L4 7.5L8.5 2.5"
                     stroke="#fff" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
               )}
             </div>
             <span className="text-sm text-gray-500 font-medium">Remember me</span>
           </label>

           <button
             type="button"
             onClick={() => setCurrentState('otpLogin')}
             className="text-sm font-semibold text-pink-500 hover:text-pink-700
               transition-colors duration-200 bg-transparent border-none cursor-pointer p-0"
           >
             Login with OTP
           </button>
         </div>

         {/* Demo credentials */}
         <div className="bg-pink-50 border border-pink-100 rounded-xl p-3.5">
           <p className="text-xs font-bold text-gray-700 mb-1.5">Demo Credentials</p>
           <div className="flex flex-col gap-1">
             <p className="text-xs text-gray-500">
               Email: <strong className="text-pink-500">admin@gmail.com</strong>
             </p>
             <p className="text-xs text-gray-500">
               Password: <strong className="text-pink-500">Password@123</strong>
             </p>
           </div>
         </div>

         <SubmitBtn
           loading={isLoading}
           label="Sign In"
           loadingLabel="Signing in..."
           icon={<FaSignInAlt />}
         />
       </form>
     )}

     {/* ══ OTP EMAIL ══ */}
     {currentState === 'otpLogin' && (
       <form onSubmit={handleOtpLoginSubmit} noValidate className="flex flex-col gap-4">

         <div className="flex justify-center mb-1">
           <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100
             flex items-center justify-center">
             <FaMobileAlt className="text-pink-500 text-2xl" />
           </div>
         </div>

         <div>
           <Label text="Email Address" />
           <div className="relative">
             <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2
               text-gray-300 text-sm pointer-events-none" />
             <input
               type="email"
               value={otpEmail} onChange={handleOtpEmailChange}
               placeholder="Enter your email"
               className={inputCls(otpEmailError)}
             />
           </div>
           <FieldError error={otpEmailError} />
         </div>

         <SubmitBtn
           loading={isLoading}
           label="Send OTP"
           loadingLabel="Sending OTP..."
           icon={<FaSignInAlt />}
         />
         <BackBtn onClick={handleBackToLogin} />
       </form>
     )}

     {/* ══ OTP VERIFY ══ */}
     {currentState === 'otpVerification' && (
       <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-5">

         {/* Email indicator */}
         <div className="text-center bg-pink-50 border border-pink-100 rounded-xl p-3.5">
           <p className="text-xs text-gray-400 font-medium mb-1">
             We've sent a 6-digit code to
           </p>
           <p className="text-sm font-bold text-pink-500">{userEmail}</p>
         </div>

         {/* OTP boxes */}
         <div>
           <Label text="Enter OTP" />
           <div className="flex justify-center gap-2 mt-1">
             {otpValues.map((value, index) => (
               <input
                 key={index}
                 ref={el => (otpInputRefs.current[index] = el)}
                 type="text" maxLength="1"
                 value={value}
                 onChange={e => handleOtpChange(index, e.target.value)}
                 onKeyDown={e => handleOtpKeyDown(index, e)}
                 autoComplete="off"
                 className={`w-11 h-[52px] text-center text-xl font-extrabold
                   text-gray-900 rounded-xl border-2 outline-none
                   transition-all duration-200
                   focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white
                   ${value
                     ? 'bg-pink-50 border-pink-400'
                     : 'bg-gray-50 border-gray-100'
                   }`}
               />
             ))}
           </div>
         </div>

         {/* Resend */}
         <p className="text-center text-sm text-gray-400">
           Didn't receive code?{' '}
           <button
             type="button"
             onClick={handleResendOtp}
             disabled={isLoading}
             className={`text-sm font-bold text-pink-500 hover:text-pink-700
               bg-transparent border-none transition-colors duration-200
               ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
           >
             Resend OTP
           </button>
         </p>

         <SubmitBtn
           loading={isLoading}
           label="Verify & Login"
           loadingLabel="Verifying..."
           icon={<FaCheckCircle />}
         />
         <BackBtn onClick={handleBackToLogin} />
       </form>
     )}

   </div>

   <p className="text-center text-xs text-gray-300 mt-5 font-medium">
     © 2026 MultiEcom. All rights reserved.
   </p>
 </div>

 <ToastContainer
   position="top-right"
   autoClose={3000}
   hideProgressBar={false}
   newestOnTop
   closeOnClick
   pauseOnHover
   theme="light"
 />

 {/* Blob keyframe */}
 <style>{`
   @keyframes blob {
     0%   { transform: translate(0,0) scale(1); }
     33%  { transform: translate(30px,-50px) scale(1.1); }
     66%  { transform: translate(-20px,20px) scale(0.9); }
     100% { transform: translate(0,0) scale(1); }
   }
 `}</style>
</div>
);
};

export default Login;
