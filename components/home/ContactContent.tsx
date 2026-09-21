'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Building2, Calendar, Check, Mail, MessageSquare, Phone, Send, User, Sparkles } from 'lucide-react';
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/components/i18n/LangProvider';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { PhoneFormField } from './PhoneFormField';
import { trackEvent } from '@/lib/gtag';

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  need: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  need?: string;
  message?: string;
}

const initialState: FormState = { name: '', email: '', phone: '', company: '', need: '', message: '' };

const TEXT = {
  fr: {
    badge: 'Démarrer un projet',
    titleLead: 'Parlons de votre projet d’',
    titleAccent: 'IA',
    titleTail: '.',
    subtitle:
      'Décrivez-nous brièvement votre besoin, votre stack actuelle et vos objectifs. Nous répondons sous 24h ouvrées avec un premier diagnostic et une proposition de créneau.',
    perks: ['Premier échange gratuit (30 min)', 'Réponse sous 24h ouvrées', 'Diagnostic initial offert'],
    preferEmail: 'Préférez l’email ?',
    fields: {
      name: 'Votre nom',
      email: 'Email professionnel',
      phone: 'Téléphone',
      company: 'Entreprise',
      need: 'Offre souhaitée',
      message: 'Décrivez votre besoin',
    },
    placeholders: {
      name: 'Jeanne Dupont',
      email: 'jeanne@entreprise.com',
      phone: '06 12 34 56 78',
      company: 'Acme Industries',
      need: 'Sélectionne une offre',
      message: 'Ex : automatiser notre qualification de leads B2B intégrée à HubSpot…',
    },
    submit: 'Envoyer le message',
    submitting: 'Envoi en cours…',
    disclaimer: 'En envoyant ce formulaire, vous acceptez d’être recontacté par Herakia.',
    genericError: 'Une erreur est survenue. Réessayez ou écrivez-nous par email.',
    successTitle: 'Message envoyé.',
    successBody: (name: string) => `Merci ${name}, nous revenons vers vous sous 24h ouvrées.`,
    sendAnother: 'Envoyer un autre message',
    errors: {
      name: 'Veuillez indiquer votre nom.',
      emailRequired: 'Veuillez indiquer votre email.',
      emailInvalid: 'Email invalide.',
      phone: 'Numéro de téléphone invalide.',
      company: 'Veuillez indiquer votre entreprise.',
      need: 'Veuillez sélectionner une offre.',
      message: 'Décrivez votre besoin en au moins 20 caractères.',
    },
    serviceOptions: [
      { value: 'audit-diagnostic', label: 'Audit & Diagnostic' },
      { value: 'agents-ia', label: "Mise en place d'agents IA" },
      { value: 'systeme-automatise', label: "Création d'un système automatisé complet" },
    ],
  },
  en: {
    badge: 'Start a project',
    titleLead: 'Let’s talk about your ',
    titleAccent: 'AI',
    titleTail: ' project.',
    subtitle:
      'Tell us briefly about your need, your current stack and your goals. We reply within 24 business hours with a first assessment and a proposed time slot.',
    perks: ['First conversation free (30 min)', 'Reply within 24 business hours', 'Initial assessment offered'],
    preferEmail: 'Prefer email?',
    fields: {
      name: 'Your name',
      email: 'Work email',
      phone: 'Phone',
      company: 'Company',
      need: 'Desired offer',
      message: 'Describe your need',
    },
    placeholders: {
      name: 'Jane Doe',
      email: 'jane@company.com',
      phone: '+1 555 123 4567',
      company: 'Acme Industries',
      need: 'Select an offer',
      message: 'e.g. automate our B2B lead qualification integrated with HubSpot…',
    },
    submit: 'Send message',
    submitting: 'Sending…',
    disclaimer: 'By submitting this form, you agree to be contacted by Herakia.',
    genericError: 'Something went wrong. Try again or email us.',
    successTitle: 'Message sent.',
    successBody: (name: string) => `Thanks ${name}, we’ll get back to you within 24 business hours.`,
    sendAnother: 'Send another message',
    errors: {
      name: 'Please enter your name.',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Invalid email.',
      phone: 'Invalid phone number.',
      company: 'Please enter your company.',
      need: 'Please select an offer.',
      message: 'Describe your need in at least 20 characters.',
    },
    serviceOptions: [
      { value: 'audit-diagnostic', label: 'Audit & Assessment' },
      { value: 'agents-ia', label: 'AI Agent Implementation' },
      { value: 'systeme-automatise', label: 'Complete Automated System' },
    ],
  },
} as const;

interface ErrorMessages {
  name: string;
  emailRequired: string;
  emailInvalid: string;
  phone: string;
  company: string;
  need: string;
  message: string;
}

const PHONE_RE = /^\+?\d{6,20}$/;

function validate(values: FormState, messages: ErrorMessages): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = messages.name;
  if (!values.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = messages.emailInvalid;
  }
  if (!values.phone || !isValidPhoneNumber(values.phone)) {
    errors.phone = messages.phone;
  }
  if (!values.company.trim()) errors.company = messages.company;
  if (!values.need) errors.need = messages.need;
  if (values.message.trim().length < 20) {
    errors.message = messages.message;
  }
  return errors;
}

interface InputFieldProps {
  id: keyof FormState;
  label: string;
  type?: string;
  value: string;
  error?: string;
  touched: boolean;
  icon: React.ReactNode;
  textarea?: boolean;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
}

function InputField({
  id,
  label,
  type = 'text',
  value,
  error,
  touched,
  icon,
  textarea,
  placeholder,
  onChange,
  onBlur,
}: InputFieldProps) {
  const showError = touched && !!error;
  const showSuccess = touched && !error && value.length > 0;

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
        {textarea ? (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={5}
            className={`w-full rounded-xl border bg-bg-elevated px-4 py-3 font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 ${
              showError
                ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20'
                : showSuccess
                  ? 'border-green-primary/50 focus:border-green-primary focus:ring-green-primary/20'
                  : 'border-border-subtle focus:border-green-primary/50 focus:ring-green-primary/20'
            }`}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`w-full rounded-xl border bg-bg-elevated px-4 py-3 font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 ${
              showError
                ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20'
                : showSuccess
                  ? 'border-green-primary/50 focus:border-green-primary focus:ring-green-primary/20'
                  : 'border-border-subtle focus:border-green-primary/50 focus:ring-green-primary/20'
            }`}
          />
        )}

        <AnimatePresence>
          {showSuccess && !textarea && (
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

interface SelectFieldProps {
  id: keyof FormState;
  label: string;
  value: string;
  error?: string;
  touched: boolean;
  icon: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onBlur: () => void;
}

function SelectField({
  id,
  label,
  value,
  error,
  touched,
  icon,
  options,
  placeholder,
  onChange,
  onBlur,
}: SelectFieldProps) {
  const showError = touched && !!error;
  const showSuccess = touched && !error && value.length > 0;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary"
      >
        <span className="text-green-primary/70">{icon}</span>
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-bg-elevated px-4 py-3 font-sans text-text-primary focus:outline-none focus:ring-2 ${
          showError
            ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20'
            : showSuccess
              ? 'border-green-primary/50 focus:border-green-primary focus:ring-green-primary/20'
              : 'border-border-subtle focus:border-green-primary/50 focus:ring-green-primary/20'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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

export function ContactContent() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    phone: false,
    company: false,
    need: false,
    message: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (touched[name as keyof FormState]) {
      setErrors(validate({ ...values, [name]: value }, t.errors));
    }
  };

  const handlePhoneInputChange = (phoneVal: string | undefined) => {
  const val = phoneVal ?? '';
  setValues((v) => ({ ...v, phone: val }));

  if (touched.phone) {
    setErrors(validate({ ...values, phone: val }, t.errors));
  }
};

  const handleBlur = (field: keyof FormState) => {
    setTouched((tch) => ({ ...tch, [field]: true }));
    setErrors(validate(values, t.errors));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formErrors = validate(values, t.errors);
    setErrors(formErrors);
    setTouched({ name: true, email: true, phone: true, company: true, need: true, message: true });

    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t.genericError);
      }
      setSubmitted(true);
      trackEvent('generate_lead', { form_id: 'contact', need: values.need });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const perkIcons = [Calendar, Mail, Sparkles];

  return (
    <section className="relative overflow-hidden px-6 pt-40 pb-32 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-30" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-green-primary/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge pulse>{t.badge}</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance"
          >
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
            {t.titleTail}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl"
          >
            {t.subtitle}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 space-y-4"
          >
            {t.perks.map((text, i) => {
              const Icon = perkIcons[i];
              return (
                <li key={text} className="flex items-center gap-3 font-sans text-text-secondary">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-green bg-green-subtle">
                    <Icon className="h-4 w-4 text-green-primary" />
                  </span>
                  {text}
                </li>
              );
            })}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 rounded-2xl border border-border-subtle bg-bg-secondary/60 p-6 backdrop-blur-md"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              {t.preferEmail}
            </p>
            <a
              href="mailto:contact@herakia.com"
              className="mt-2 block font-display text-2xl font-bold text-text-primary transition-colors hover:text-green-primary"
            >
              contact@herakia.com
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative rounded-2xl border border-border-subtle bg-bg-secondary/60 p-8 backdrop-blur-md md:p-10">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  noValidate
                >
                  <InputField
                    id="name"
                    label={t.fields.name}
                    value={values.name}
                    error={errors.name}
                    touched={touched.name}
                    icon={<User className="h-3.5 w-3.5" />}
                    placeholder={t.placeholders.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                  />

                  <InputField
                    id="email"
                    label={t.fields.email}
                    type="email"
                    value={values.email}
                    error={errors.email}
                    touched={touched.email}
                    icon={<Mail className="h-3.5 w-3.5" />}
                    placeholder={t.placeholders.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                  />

                  {/* Remplacement du champ téléphone */}
<PhoneFormField
  id="phone"
  label={t.fields.phone}
  value={values.phone}
  error={errors.phone}
  touched={touched.phone}
  icon={<Phone className="h-3.5 w-3.5" />}
  placeholder={t.placeholders.phone}  
  onChange={handlePhoneInputChange}
  onBlur={() => handleBlur('phone')}
/>

                  <InputField
                    id="company"
                    label={t.fields.company}
                    value={values.company}
                    error={errors.company}
                    touched={touched.company}
                    icon={<Building2 className="h-3.5 w-3.5" />}
                    placeholder={t.placeholders.company}
                    onChange={handleChange}
                    onBlur={() => handleBlur('company')}
                  />

                  <SelectField
                    id="need"
                    label={t.fields.need}
                    value={values.need}
                    error={errors.need}
                    touched={touched.need}
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    options={[...t.serviceOptions]}
                    placeholder={t.placeholders.need}
                    onChange={(e) => {
                      const { value } = e.target;
                      setValues((v) => ({ ...v, need: value }));
                      if (touched.need) {
                        setErrors(validate({ ...values, need: value }, t.errors));
                      }
                    }}
                    onBlur={() => handleBlur('need')}
                  />

                  <InputField
                    id="message"
                    label={t.fields.message}
                    value={values.message}
                    error={errors.message}
                    touched={touched.message}
                    icon={<MessageSquare className="h-3.5 w-3.5" />}
                    placeholder={t.placeholders.message}
                    textarea
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                  />

                  <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                    <label htmlFor="website">Ne pas remplir</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {submitError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-400"
                    >
                      {submitError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-green-primary px-8 py-4 font-display text-base font-semibold text-bg-primary shadow-glow-green transition-all hover:bg-green-dark hover:shadow-glow-green-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="block h-4 w-4 rounded-full border-2 border-bg-primary border-t-transparent"
                        />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        {t.submit}
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </motion.button>

                  <p className="text-center font-mono text-xs text-text-muted">{t.disclaimer}</p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 180 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border-green bg-green-subtle shadow-glow-green"
                  >
                    <Check className="h-10 w-10 text-green-primary" strokeWidth={3} />
                  </motion.div>

                  {!prefersReducedMotion && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <motion.span
                          key={i}
                          className="absolute h-1.5 w-1.5 rounded-full bg-green-primary"
                          style={{ left: '50%', top: '30%' }}
                          initial={{ x: 0, y: 0, opacity: 1 }}
                          animate={{
                            x: (Math.cos((i / 18) * Math.PI * 2) * 200) | 0,
                            y: (Math.sin((i / 18) * Math.PI * 2) * 200) | 0,
                            opacity: 0,
                          }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  )}

                  <h2 className="mt-8 font-display text-3xl font-bold text-text-primary">
                    {t.successTitle}
                  </h2>
                  <p className="mt-3 font-sans text-text-secondary">
                    {t.successBody(values.name.split(' ')[0])}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setValues(initialState);
                      setTouched({ name: false, email: false, phone: false, company: false, need: false, message: false });
                      setErrors({});
                      setSubmitted(false);
                      setSubmitError(null);
                      setHoneypot('');
                    }}
                    className="mt-8 font-mono text-xs uppercase tracking-widest text-text-secondary underline-offset-4 transition-colors hover:text-green-primary hover:underline"
                  >
                    {t.sendAnother}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}