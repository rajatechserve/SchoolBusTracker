
import React from 'react';
export default function Button({ children, onClick, variant='primary', className='' }){
  const base = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2';
  const variants = {
    primary: 'bg-[var(--brand)] text-white hover:opacity-95 focus:ring-sky-300',
    ghost: 'bg-white border text-slate-700 hover:bg-gray-50'
  };
  return (<button onClick={onClick} className={[base, variants[variant] || '', className].join(' ')}>{children}</button>);
}
