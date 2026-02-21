import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mockAdmin, MOCK_OTP } from '../data/mockAuth';

// ─── swap these two imports when backend is ready ─────────────────────────────
// import { authAPI } from '../api/auth.api';

const useLogin = () => {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [currentState,  setCurrentState]  = useState('login');      // 'login' | 'otpLogin' | 'otpVerification'
  const [isLoading,     setIsLoading]     = useState(false);
  const [formData,      setFormData]      = useState({ email: '', password: '' });
  const [errors,        setErrors]        = useState({});
  const [showPassword,  setShowPassword]  = useState(false);
  const [rememberMe,    setRememberMe]    = useState(false);
  const [otpEmail,      setOtpEmail]      = useState('');
  const [otpEmailError, setOtpEmailError] = useState('');
  const [otpValues,     setOtpValues]     = useState(['', '', '', '', '', '']);
  const [userEmail,     setUserEmail]     = useState('');
  const otpInputRefs = useRef([]);

  // ── On mount — restore remembered email ──────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard');
      return;
    }
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setFormData(prev => ({ ...prev, email: saved }));
      setRememberMe(true);
    }
  }, [navigate]);

  // ── Password login ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.email.trim())                           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) e.email    = 'Email is invalid';
    if (!formData.password.trim())                        e.password = 'Password is required';
    else if (formData.password.length < 6)                e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      // ── MOCK ──────────────────────────────────────────────────────────────
      if (
        formData.email.trim()    === mockAdmin.email &&
        formData.password        === mockAdmin.password
      ) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token',           mockAdmin.token);
        localStorage.setItem('adminName',       mockAdmin.name);
        if (rememberMe) localStorage.setItem('rememberedEmail', formData.email.trim());
        else            localStorage.removeItem('rememberedEmail');
        toast.success('Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.error('Invalid email or password');
      }

      // ── API (uncomment when backend ready, delete mock block above) ───────
      // const response = await authAPI.loginWithPassword(formData.email.trim(), formData.password);
      // localStorage.setItem('isAuthenticated', 'true');
      // localStorage.setItem('token', response.token);
      // localStorage.setItem('adminName', response.name);
      // if (rememberMe) localStorage.setItem('rememberedEmail', formData.email.trim());
      // else            localStorage.removeItem('rememberedEmail');
      // toast.success('Login successful!');
      // setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error) {
      if (error?.status === 401)     toast.error('Invalid email or password');
      else if (error?.status === 500) toast.error('Server error. Please try again later.');
      else if (error?.status === 0)   toast.error('Network error. Check your connection.');
      else                            toast.error(error?.message || 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP Email ─────────────────────────────────────────────────────────────
  const handleOtpEmailChange = (e) => {
    setOtpEmail(e.target.value);
    if (otpEmailError) setOtpEmailError('');
  };

  const validateOtpEmail = (val) => {
    if (!val.trim())                           { setOtpEmailError('Email is required');  return false; }
    if (!/\S+@\S+\.\S+/.test(val.trim()))      { setOtpEmailError('Email is invalid');   return false; }
    setOtpEmailError('');
    return true;
  };

  const handleOtpLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateOtpEmail(otpEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      // ── MOCK ──────────────────────────────────────────────────────────────
      if (otpEmail.trim() !== mockAdmin.email) {
        toast.error('Email not registered');
        return;
      }
      setUserEmail(otpEmail.trim());
      setCurrentState('otpVerification');
      toast.success(`OTP sent! Use ${MOCK_OTP} in dev mode.`);

      // ── API (uncomment when backend ready, delete mock block above) ───────
      // const response = await authAPI.sendOTP(otpEmail.trim());
      // setUserEmail(otpEmail.trim());
      // setCurrentState('otpVerification');
      // toast.success(response.message || 'OTP sent to your email!');

    } catch (error) {
      if (error?.status === 404)      toast.error('Email not registered');
      else if (error?.status === 500) toast.error('Server error. Please try again later.');
      else if (error?.status === 0)   toast.error('Network error. Check your connection.');
      else                            toast.error(error?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP Input ─────────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0)
      otpInputRefs.current[index - 1]?.focus();
  };

  // ── OTP Verify ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) { toast.error('Please enter the complete OTP'); return; }
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      // ── MOCK ──────────────────────────────────────────────────────────────
      if (otp === MOCK_OTP) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token',           mockAdmin.token);
        localStorage.setItem('adminName',       mockAdmin.name);
        toast.success('Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.error('Invalid OTP. Please try again.');
        setOtpValues(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }

      // ── API (uncomment when backend ready, delete mock block above) ───────
      // const response = await authAPI.verifyOTP(userEmail, otp);
      // localStorage.setItem('isAuthenticated', 'true');
      // localStorage.setItem('token', response.token);
      // localStorage.setItem('adminName', response.name);
      // toast.success('Login successful!');
      // setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error) {
      if (error?.status === 401)      toast.error('Invalid OTP. Please try again.');
      else if (error?.status === 500) toast.error('Server error. Please try again later.');
      else                            toast.error(error?.message || 'Invalid OTP.');
      setOtpValues(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setOtpValues(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
      toast.success(`OTP resent! Use ${MOCK_OTP} in dev mode.`);

      // ── API ───────────────────────────────────────────────────────────────
      // const response = await authAPI.sendOTP(userEmail);
      // setOtpValues(['', '', '', '', '', '']);
      // otpInputRefs.current[0]?.focus();
      // toast.success('OTP resent successfully!');

    } catch (error) {
      toast.error(error?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Back to login ─────────────────────────────────────────────────────────
  const handleBackToLogin = () => {
    setCurrentState('login');
    setOtpEmail('');
    setOtpEmailError('');
    setOtpValues(['', '', '', '', '', '']);
    setUserEmail('');
  };

  return {
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
  };
};

export default useLogin;
