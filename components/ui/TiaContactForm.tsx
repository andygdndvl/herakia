'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Building2, Send, Check, Loader2 } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { PhoneFormField } from '../home/PhoneFormField';
import { isValidPhoneNumber } from 'react-phone-number-input';
import type { Locale } from '@/dictionaries';

type ContactValues = { name: string; email: string; phone: string; company: string };
type ContactErrors = Partial<Record<keyof ContactValues, string>>;
type ContactErrorMessages = {
  name: string;
  emailRequired: string;
  emailInvalid: string;
  phone: string;
};

const TEXT: Record<Locale, {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  companyPlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
  errors: ContactErrorMessages;
}> = {
  fr: {
    title: 'Vos coordonnées',
    subtitle: 'Un dernier détail et un membre de l’équipe vous recontacte.',
    name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    company: 'Entreprise',
    namePlaceholder: 'Jeanne Dupont',
    emailPlaceholder: 'jeanne@entreprise.com',
    phonePlaceholder: '06 12 34 56 78',
    companyPlaceholder: 'Acme Industries (optionnel)',
    submit: 'Envoyer mes coordonnées',
    submitting: 'Envoi en cours…',
    successTitle: 'Merci !',
    successBody: 'Un membre de l’équipe vous recontacte sous 24h ouvrées.',
    errorGeneric: 'Une erreur est survenue. Réessayez.',
    errors: {
      name: 'Veuillez indiquer votre nom.',
      emailRequired: 'Veuillez indiquer votre email.',
      emailInvalid: 'Email invalide.',
      phone: 'Numéro de téléphone invalide.',
    },
  },
  en: {
    title: 'Your details',
    subtitle: 'One last thing and a team member will get back to you.',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    namePlaceholder: 'Jane Doe',
    emailPlaceholder: 'jane@company.com',
    phonePlaceholder: '+1 555 123 4567',
    companyPlaceholder: 'Acme Industries (optional)',
    submit: 'Send my details',
    submitting: 'Sending…',
    successTitle: 'Thank you!',
    successBody: 'A team member will get back to you within 24 business hours.',
    errorGeneric: 'Something went wrong. Try again.',
    errors: {
      name: 'Please enter your name.',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Invalid email.',
      phone: 'Invalid phone number.',
    },
  },
};

function validate(values: ContactValues, messages: ContactErrorMessages): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = messages.name;
  if (!values.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = messages.emailInvalid;
  }
  if (!values.phone || !isValidPhoneNumber(values.phone)) {
    errors.phone = messages.phone;
  }
  return errors;
}

export function TiaContactForm({ lang, initialName }: { lang: Locale; initialName: string }) {
  const t = TEXT[lang];
  const [values, setValues] = useState<ContactValues>({
    name: initialName,
    email: '',
    phone: '',
    company: '',
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Record<keyof ContactValues, boolean>>({
    name: false,
    email: false,
    phone: false,
    company: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (touched[name as keyof ContactValues]) {
      setErrors(validate({ ...values, [name]: value }, t.errors));
    }
  };

  const handlePhoneChange = (phoneVal: string | undefined) => {
    const val = phoneVal ?? '';
    setValues((v) => ({ ...v, phone: val }));
    if (touched.phone) {
      setErrors(validate({ ...values, phone: val }, t.errors));
    }
  };

  const handleBlur = (field: keyof ContactValues) => {
    setTouched((tch) => ({ ...tch, [field]: true }));
    setErrors(validate(values, t.errors));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formErrors = validate(values, t.errors);
    setErrors(formErrors);
    setTouched({ name: true, email: true, phone: true, company: true });
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company || null,
          need: 'demo-vocale-tia', // origine : formulaire déclenché pendant l'appel avec Tia
          message: 'Contact initié pendant une démonstration vocale avec Tia.',
          website: '', // honeypot, toujours vide ici
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t.errorGeneric);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!submitted ? (
        <motion.form
          key="contact-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 px-6 py-6"
        >
          <div>
            <p className="font-display text-base font-semibold text-text-primary">{t.title}</p>
            <p className="mt-1 font-sans text-sm text-text-secondary">{t.subtitle}</p>
          </div>

          <div>
            <label
              htmlFor="tia-contact-name"
              className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary"
            >
              <User className="h-3.5 w-3.5 text-green-primary/70" />
              {t.name}
            </label>
            <input
              id="tia-contact-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder={t.namePlaceholder}
              className={`w-full rounded-xl border bg-bg-elevated px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                touched.name && errors.name
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-border-subtle focus:border-green-primary/50 focus:ring-green-primary/20'
              }`}
            />
            {touched.name && errors.name && (
              <p className="mt-1.5 font-sans text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tia-contact-email"
              className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary"
            >
              <Mail className="h-3.5 w-3.5 text-green-primary/70" />
              {t.email}
            </label>
            <input
              id="tia-contact-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder={t.emailPlaceholder}
              className={`w-full rounded-xl border bg-bg-elevated px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                touched.email && errors.email
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-border-subtle focus:border-green-primary/50 focus:ring-green-primary/20'
              }`}
            />
            {touched.email && errors.email && (
              <p className="mt-1.5 font-sans text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <PhoneFormField
            id="phone"
            label={t.phone}
            value={values.phone}
            error={errors.phone}
            touched={touched.phone}
            icon={<Phone className="h-3.5 w-3.5" />}
            placeholder={t.phonePlaceholder}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur('phone')}
          />

          <div>
            <label
              htmlFor="tia-contact-company"
              className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary"
            >
              <Building2 className="h-3.5 w-3.5 text-green-primary/70" />
              {t.company}
            </label>
            <input
              id="tia-contact-company"
              name="company"
              value={values.company}
              onChange={handleChange}
              onBlur={() => handleBlur('company')}
              placeholder={t.companyPlaceholder}
              className="w-full rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted focus:border-green-primary/50 focus:outline-none focus:ring-2 focus:ring-green-primary/20"
            />
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-sans text-xs text-red-400"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-green-primary px-6 py-3 font-display text-sm font-bold text-bg-primary shadow-glow-green transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                {t.submit}
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.form>
      ) : (
        <motion.div
          key="contact-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center px-6 py-10 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border-green bg-green-subtle shadow-glow-green">
            <Check className="h-7 w-7 text-green-primary" strokeWidth={3} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-text-primary">{t.successTitle}</p>
          <p className="mt-1 font-sans text-sm text-text-secondary">{t.successBody}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}