const Card = ({ children, className = '', onClick }) => {
    return (
      <div
        onClick={onClick}
        className={`
          bg-white rounded-2xl border border-[#f0f0f0]
          shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
          ${onClick ? 'cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200' : ''}
          ${className}
        `}
      >
        {children}
      </div>
    );
  };
  
  export default Card;
  