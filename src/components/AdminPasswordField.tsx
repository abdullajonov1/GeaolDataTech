'use client'

import { useState } from 'react'

export function AdminPasswordField({ value, onChange, autoFocus }: { value: string, onChange: (value: string) => void, autoFocus?: boolean }) {
  const [open, setOpen] = useState(false)
  return <label className="admin-pass">
    Parol
    <span className="admin-pass-box">
      <input
        type={open ? 'text' : 'password'}
        value={value}
        onChange={event => onChange(event.target.value)}
        autoFocus={autoFocus}
        autoComplete="current-password"
      />
      <button
        type="button"
        className="admin-pass-toggle"
        aria-label={open ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
        aria-pressed={open}
        onClick={() => setOpen(current => !current)}
      >
        {open ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.5 10.7a3 3 0 0 0 4 4M9.9 5.2A10.5 10.5 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3.2 3.8M6.1 6.2A17.6 17.6 0 0 0 2 12s4 7 10 7c1.4 0 2.7-.3 3.9-.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>}
      </button>
    </span>
  </label>
}
