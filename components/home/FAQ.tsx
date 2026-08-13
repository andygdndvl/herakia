'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useDict } from '@/components/i18n/LangProvider';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-green-primary"
      >
        <span className="font-display text-lg font-semibold text-text-primary md:text-xl">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
            open ? 'border-border-green bg-green-subtle' : 'border-border-subtle bg-bg-elevated'
          }`}
        >
          <Plus
            className={`h-4 w-4 transition-colors ${
              open ? 'text-green-primary' : 'text-text-secondary group-hover:text-green-primary'
            }`}
          />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 font-sans text-base leading-relaxed text-text-secondary">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const dict = useDict();
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="relative px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {dict.faq.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance">
            {dict.faq.title}
          </h2>
          <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
            {dict.faq.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          {dict.faq.items.map((faq, i) => (
            <FAQAccordion
              key={faq.question}
              item={faq}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
