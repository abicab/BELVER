import React from 'react';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  accept,
  required = false,
  error
}) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        // Si es tipo file no le pasamos value para evitar el error
        {...(type !== 'file' ? { value: value || '' } : {})}
        onChange={onChange}
        placeholder={placeholder}
        accept={accept}
        required={required}
        className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition placeholder:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}