// components/PhoneInputField.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
// @ts-ignore - side-effect CSS import without type declarations
import 'react-phone-number-input/style.css';

interface PhoneInputFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  touched: boolean;
  icon: React.ReactNode;
  placeholder?: string;
  onChange: (value: string | undefined) => void;
  onBlur: () => void;
}

export function PhoneFormField({
  id,
  label,
  value,
  error,
  touched,
  icon,
  placeholder,
  onChange,
  onBlur,
}: PhoneInputFieldProps) {
  const showError = touched && !!error;
  const showSuccess = touched && !error && value?.length > 0;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary"
      >
        <span className="text-green-primary/70">{icon}</span>
        {label}
      </label>

      <div className="relative">
        <PhoneInput
          id={id}
          international
          defaultCountry="FR"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`flex w-full items-center gap-3 rounded-xl border bg-bg-elevated px-4 py-3 font-sans text-text-primary placeholder:text-text-muted focus-within:ring-2 
            [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-text-muted
            [&_.PhoneInputCountrySelect]:bg-bg-elevated [&_.PhoneInputCountrySelect]:text-text-primary [&_.PhoneInputCountrySelect]:cursor-pointer
            [&_.PhoneInputCountryIcon]:rounded-sm [&_.PhoneInputCountryIcon]:overflow-hidden
            ${
              showError
                ? 'border-red-500/50 focus-within:border-red-500/80 focus-within:ring-red-500/20'
                : showSuccess
                  ? 'border-green-primary/50 focus-within:border-green-primary focus-within:ring-green-primary/20'
                  : 'border-border-subtle focus-within:border-green-primary/50 focus-within:ring-green-primary/20'
            }`}
        />

        <AnimatePresence>
          {showSuccess && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <Check className="h-4 w-4 text-green-primary" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 font-sans text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}