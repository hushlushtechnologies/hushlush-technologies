"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { serviceCategories } from "@/lib/navigation";
import { ChevronDown } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Icons ───────────────────────── */

const I = {
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />,
  mail: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.6L4 7.4V8l8 5 8-5v-.6l-8 5.2Z" />,
  phone: <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />,
  store: <path d="M4 4h16l1.5 5a3 3 0 0 1-5 2.2A3 3 0 0 1 12 12a3 3 0 0 1-4.5-.8A3 3 0 0 1 2.5 9L4 4Zm1 9.7V20h14v-6.3a5 5 0 0 1-2.5.3V18h-9v-4a5 5 0 0 1-2.5-.3ZM10 15h4v3h-4v-3Z" />,
  globe: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3a15 15 0 0 0-1.3-6 8 8 0 0 1 4.3 6ZM12 4c.9 1.2 1.8 3.6 1.9 7h-3.8C10.2 7.6 11.1 5.2 12 4ZM9.4 5a15 15 0 0 0-1.3 6h-3a8 8 0 0 1 4.3-6Zm-4.3 8h3a15 15 0 0 0 1.3 6 8 8 0 0 1-4.3-6Zm6.9 7c-.9-1.2-1.8-3.6-1.9-7h3.8c-.1 3.4-1 5.8-1.9 7Zm2.6-1a15 15 0 0 0 1.3-6h3a8 8 0 0 1-4.3 6Z" />,
};
const Glyph = ({ d }: { d: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    {d}
  </svg>
);
const Plane = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M21.7 2.3a1 1 0 0 0-1-.2l-18 7a1 1 0 0 0 0 1.9l7.4 2.9 2.9 7.4a1 1 0 0 0 1.9 0l7-18a1 1 0 0 0-.2-1Z" />
  </svg>
);

/* ───────────────────────── Field ───────────────────────── */

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

const inputBase =
  "peer h-[48px] w-full rounded-[10px] border border-white/[0.07] bg-[#17121f]/90 px-[18px] pr-12 text-[15px] text-text-primary outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-text-primary/45 focus:border-grad-mid/70 focus:bg-[#1c1527] focus:shadow-[0_0_0_4px_rgba(183,43,202,0.15),0_0_30px_-8px_rgba(183,43,202,0.6)]";

function Field({ label, required, error, htmlFor, icon, children }: { label: string; required?: boolean; error?: string; htmlFor: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <motion.div variants={fieldVariant}>
      <label htmlFor={htmlFor} className="mb-3 block text-lg font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        {children}
        {icon && (
          <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-text-primary/60 transition-colors duration-300 peer-focus:text-grad-start">
            {icon}
          </span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 pl-1 text-sm text-grad-start" role="alert">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

type Status = "idle" | "sending" | "sent" | "error";
const REQUIRED = ["name", "email", "phone"] as const;

const TITLE = "Tell Us About Your Project";

export default function EnquiryForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reduce = !!useReducedMotion();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [service, setService] = useState("");
  const [filled, setFilled] = useState(0);

  // card rises and un-tilts as it scrolls in
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "start 0.2"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });
  const tilt = useTransform(p, [0, 1], reduce ? [0, 0] : [22, 0]);
  const lift = useTransform(p, [0, 1], reduce ? [0, 0] : [120, 0]);
  const cardScale = useTransform(p, [0, 1], reduce ? [1, 1] : [0.9, 1]);

  const countFilled = () => {
    const f = formRef.current;
    if (!f) return;
    setFilled(REQUIRED.filter((n) => String((f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "").trim()).length);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/[\s()-]/g, "");
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!/^\+?\d{7,15}$/.test(phone)) next.phone = "Please enter a valid phone or WhatsApp number.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      (formRef.current?.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }

    setStatus("sending");
    const endpoint = siteConfig.enquiryFormEndpoint;
    if (!endpoint) {
      // No form service configured yet → open the visitor's email app with everything filled in
      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone / WhatsApp: ${phone}`,
        `Company: ${fd.get("company") || "-"}`,
        `Website: ${fd.get("website") || "-"}`,
        `Service: ${service || "-"}`,
        "",
        String(fd.get("message") ?? ""),
      ];
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(`Project Enquiry — ${name}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setStatus("sent");
      return;
    }
    try {
      const res = await fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) {
        formRef.current?.reset();
        setService("");
        setFilled(0);
      }
    } catch {
      setStatus("error");
    }
  };

  const progress = filled / REQUIRED.length;

  return (
    <section ref={sectionRef} id="enquiry" aria-labelledby="enquiry-title" className="relative scroll-mt-20 overflow-hidden py-[clamp(5rem,10vw,10rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_60%,rgba(70,20,110,0.35),transparent_75%)]" />

      <motion.h2
        id="enquiry-title"
        aria-label={TITLE}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        className="container-site relative text-center font-display text-[clamp(2.5rem,4.2vw,5rem)] font-bold leading-[1.05] tracking-[-0.01em]"
      >
        {TITLE.split(" ").map((w, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 50, rotateX: -70, filter: "blur(10px)" },
              show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {w}&nbsp;
          </motion.span>
        ))}
      </motion.h2>

      <div className="container-site relative mt-[clamp(3rem,7vw,9rem)] [perspective:1600px]">
        <motion.div style={{ rotateX: tilt, y: lift, scale: cardScale }} className="relative origin-bottom">
          {/* rotating light along the border */}
          <div aria-hidden className="absolute -inset-px overflow-hidden rounded-[33px]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(233,110,216,0.9)_40deg,rgba(98,34,157,0.6)_80deg,transparent_120deg,transparent_360deg)] motion-safe:animate-[spin_8s_linear_infinite]" />
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#0f0b14] shadow-[0_40px_120px_-40px_rgba(102,34,159,0.6)]">
            {/* completion meter */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-white/[0.04]">
              <motion.div
                className="bg-brand-gradient h-full shadow-[0_0_14px_rgba(233,110,216,0.9)]"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </div>

            <motion.form
              ref={formRef}
              noValidate
              onSubmit={onSubmit}
              onInput={countFilled}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
              aria-label="Project enquiry form"
              className="p-6 sm:p-10 lg:px-16 lg:pb-14 lg:pt-16"
            >
              <div className="grid gap-x-[10px] gap-y-10 lg:grid-cols-2">
                {/* Your details */}
                <fieldset className="flex flex-col gap-[26px]">
                  <motion.legend variants={fieldVariant} className="mb-[26px] font-display text-2xl font-medium">
                    Your Details
                  </motion.legend>
                  <Field label="Full Name" required htmlFor="eq-name" error={errors.name} icon={<Glyph d={I.user} />}>
                    <input id="eq-name" name="name" autoComplete="name" placeholder="Enter your Name" className={inputBase} aria-invalid={!!errors.name} />
                  </Field>
                  <Field label="Email Address" required htmlFor="eq-email" error={errors.email} icon={<Glyph d={I.mail} />}>
                    <input id="eq-email" name="email" type="email" autoComplete="email" placeholder="Enter your Email ID" className={inputBase} aria-invalid={!!errors.email} />
                  </Field>
                  <Field label="Phone Number / WhatsApp" required htmlFor="eq-phone" error={errors.phone} icon={<Glyph d={I.phone} />}>
                    <input id="eq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter your Phone Number" className={inputBase} aria-invalid={!!errors.phone} />
                  </Field>
                </fieldset>

                {/* Requirements */}
                <fieldset className="flex flex-col gap-[26px]">
                  <motion.legend variants={fieldVariant} className="mb-[26px] font-display text-2xl font-medium">
                    Your Requirements
                  </motion.legend>
                  <Field label="Company Name" htmlFor="eq-company" icon={<Glyph d={I.store} />}>
                    <input id="eq-company" name="company" autoComplete="organization" placeholder="Enter your Company Name" className={inputBase} />
                  </Field>
                  <Field label="Website" htmlFor="eq-website" icon={<Glyph d={I.globe} />}>
                    <input id="eq-website" name="website" inputMode="url" autoComplete="url" placeholder="Enter your Website URL" className={inputBase} />
                  </Field>
                  <Field label="Service Required" htmlFor="eq-service" icon={<ChevronDown className="size-5" />}>
                    <select
                      id="eq-service"
                      name="service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className={cn(inputBase, "appearance-none", !service && "text-text-primary/45")}
                    >
                      <option value="">Pick your Interested Service</option>
                      {serviceCategories.map((c) => (
                        <optgroup key={c.title} label={c.title} className="bg-[#17121f] text-text-primary/60">
                          {c.items.map((it) => (
                            <option key={it} value={`${c.title} — ${it}`} className="bg-[#17121f] text-text-primary">
                              {it}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Not sure yet" className="bg-[#17121f] text-text-primary">
                        Not sure yet — let&apos;s talk
                      </option>
                    </select>
                  </Field>
                </fieldset>
              </div>

              <div className="mt-[52px]">
                <Field label="Tell Us More" htmlFor="eq-message">
                  <textarea id="eq-message" name="message" rows={4} placeholder="Write Something...." className={cn(inputBase, "h-[110px] resize-none py-3")} />
                </Field>
              </div>

              <motion.div variants={fieldVariant} className="mt-10">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="bg-brand-gradient group relative flex h-[49px] w-full items-center justify-center overflow-hidden rounded-full text-base font-medium shadow-[0_10px_40px_-12px_rgba(183,43,202,0.8)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)] disabled:opacity-80"
                >
                  <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
                  <AnimatePresence mode="wait">
                    <motion.span key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative flex items-center gap-2">
                      {status === "sending" && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                      {status === "sending" ? "Sending…" : status === "sent" ? "Enquiry Sent ✓" : status === "error" ? "Something Went Wrong — Try Again" : "Send Enquiry"}
                      {status === "idle" && (
                        <Plane className="size-[18px] transition-transform duration-500 ease-cinematic group-hover:-translate-y-1 group-hover:translate-x-1.5" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                  {/* plane flies off on send */}
                  <AnimatePresence>
                    {status === "sending" && !reduce && (
                      <motion.span
                        className="absolute left-1/2 top-1/2"
                        initial={{ x: 40, y: -9, opacity: 1, scale: 1 }}
                        animate={{ x: 900, y: -120, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.9, ease: [0.5, 0, 0.75, 0] }}
                      >
                        <Plane className="size-[18px]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <p className="mt-12 text-sm leading-snug text-text-primary/60">
                  By clicking “Send Enquiry,” you agree to be contacted by {siteConfig.name} regarding your enquiry. Your information will be handled in
                  accordance with our Privacy Policy.
                </p>
              </motion.div>
            </motion.form>

            {/* success state */}
            <AnimatePresence>
              {status === "sent" && siteConfig.enquiryFormEndpoint && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 grid place-items-center bg-[#0f0b14]/95 p-8 text-center backdrop-blur-sm"
                  role="status"
                >
                  <div>
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14 }}
                      className="bg-brand-gradient mx-auto grid size-20 place-items-center rounded-full shadow-[0_0_60px_rgba(233,110,216,0.7)]"
                    >
                      <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
                      </svg>
                    </motion.div>
                    <p className="mt-6 font-display text-3xl font-bold">Thank You!</p>
                    <p className="mt-3 text-text-primary/70">We&apos;ve got your enquiry and will get back to you shortly.</p>
                    <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm text-grad-start underline-offset-4 hover:underline">
                      Send another enquiry
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
