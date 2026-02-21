const variants = {
    primary:   'bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-600 hover:to-pink-800 shadow-[0_4px_14px_rgba(236,72,153,0.25)] hover:shadow-[0_4px_20px_rgba(236,72,153,0.4)]',
    secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-[#f0f0f0]',
    danger:    'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100',
    ghost:     'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700',
    outline:   'bg-transparent border border-pink-300 text-pink-500 hover:bg-pink-50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-[15px] gap-2',
  };
  
  const Button = ({
    children,
    variant  = 'primary',
    size     = 'md',
    onClick,
    type     = 'button',
    disabled = false,
    className = '',
  }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-semibold rounded-xl
          border-none cursor-pointer
          transition-all duration-200
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  