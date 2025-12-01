import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', disabled, ...props }: any) => {
  // Material Design 3 inspired buttons: Rounded Full, Ripple effect simulation via hover/active
  const base = "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants: any = {
    primary: "bg-brand-900 text-white hover:bg-brand-800 hover:shadow-material-sm shadow-none focus-visible:ring-brand-300",
    secondary: "bg-white text-brand-900 border border-brand-200 hover:bg-brand-50 hover:border-brand-300 hover:shadow-material-sm focus-visible:ring-brand-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-none hover:shadow-material-sm focus-visible:ring-red-300",
    ghost: "text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-200",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} aria-disabled={disabled} {...props}>{children}</button>;
};

export const IconButton = ({ children, label, className = '', ...props }: any) => {
  return (
    <button
      className={`p-2 rounded-full transition-all duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-2xl shadow-material-sm border border-transparent hover:shadow-material transition-shadow duration-300 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Input = ({ className = '', id, required, type = 'text', ...props }: any) => (
  <input
    className={`block w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-600 focus:outline-none sm:text-sm py-3 px-4 border transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
    id={id}
    type={type}
    required={required}
    aria-required={required}
    aria-invalid={props['aria-invalid']}
    {...props}
  />
);

export const Label = ({ children, className = '', htmlFor, ...props }: any) => (
  <label className={`block text-sm font-medium text-brand-800 mb-1.5 ml-1 ${className}`} htmlFor={htmlFor} {...props}>
    {children}
  </label>
);

export const Badge = ({ children, color = 'brand', className = '', ariaLabel }: any) => {
  const colors: any = {
    brand: "bg-brand-100 text-brand-800 border border-brand-200",
    blue: "bg-blue-100 text-blue-700 border border-blue-200",
    green: "bg-green-100 text-green-700 border border-green-200",
    red: "bg-red-100 text-red-700 border border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    gray: "bg-slate-100 text-slate-700 border border-slate-200",
  };
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${colors[color]} ${className}`} aria-label={ariaLabel}>{children}</span>;
};