import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  // Material Design 3 inspired buttons: Rounded Full, Ripple effect simulation via hover/active
  const base = "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants: any = {
    primary: "bg-brand-900 text-white hover:bg-brand-800 hover:shadow-material-sm shadow-none",
    secondary: "bg-white text-brand-900 border border-brand-200 hover:bg-brand-50 hover:border-brand-300 hover:shadow-material-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-none hover:shadow-material-sm",
    ghost: "text-brand-700 hover:bg-brand-50",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-2xl shadow-material-sm border border-transparent hover:shadow-material transition-shadow duration-300 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Input = ({ className = '', ...props }: any) => (
  // Material Outlined Text Field style
  <div className="relative">
    <input className={`peer block w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-brand-600 sm:text-sm py-3 px-4 border transition-colors placeholder-transparent ${className}`} {...props} placeholder=" " />
    {/* We can use the placeholder trick for floating labels if we control the label component, but for simple input let's keep it clean with standard placeholder behavior if needed, 
        but the parent usually provides a Label. If we want the 'Label' component to act as a floating label, we'd need more logic. 
        For this PRD, simple clean inputs are fine, but let's make them taller. */}
  </div>
);

export const Label = ({ children, className = '', ...props }: any) => (
  <label className={`block text-sm font-medium text-brand-800 mb-1.5 ml-1 ${className}`} {...props}>
    {children}
  </label>
);

export const Badge = ({ children, color = 'brand', className = '' }: any) => {
  const colors: any = {
    brand: "bg-brand-100 text-brand-800",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${colors[color]} ${className}`}>{children}</span>;
};