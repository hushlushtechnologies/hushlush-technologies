"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { JOBS, type Job } from "@/lib/jobs";
import { ArrowRight, ChevronDown } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_MB = 4; // server + hosting limit (Vercel accepts ~4.5 MB per request)

/* ───────────────────────── Icons ───────────────────────── */

const I = {
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />,
  mail: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.6L4 7.4V8l8 5 8-5v-.6l-8 5.2Z" />,
  phone: <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />,
  file: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
};
const Glyph = ({ d }: { d: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    {d}
  </svg>
);

/* ───────────────────────── Job accordion ───────────────────────── */

function JobCard({ job, index, open, onToggle, onApply }: { job: Job; index: number; open: boolean; onToggle: () => void; onApply: () => void }) {
  const panelId = useId();
  return (
    <motion.li
      variants={{ hidden: { opacity: 0, x: -60, filter: "blur(8px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } } }}
      className={cn(
        "group overflow-hidden rounded-[22px] border bg-[#0f0b14] transition-[border-color,box-shadow,background-color] duration-500",
        open ? "border-grad-mid/50 bg-[#150e1d] shadow-[0_24px_70px_-30px_rgba(183,43,202,0.7)]" : "border-white/[0.08] hover:border-white/20"
      )}
    >
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="flex w-full items-center justify-between gap-6 px-4 py-5 text-left sm:px-[16px] sm:py-[22px]">
        <div>
          <p className="font-display text-base font-medium text-primary">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 font-display text-2xl font-bold leading-tight transition-transform duration-500 ease-cinematic group-hover:translate-x-1 lg:text-[28px]">{job.title}</h3>
          <p className="mt-3 text-base text-text-primary/90">{job.team}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 text-lg text-text-primary/60">
            <span>{job.location}</span>
            <span className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-text-primary/60" />
              {job.type}
            </span>
          </p>
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500", open ? "rotate-180 border-primary/60 bg-primary text-ink" : "border-transparent text-text-primary")}>
          <ChevronDown className="size-6" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-4 pb-6 pt-5 sm:px-[16px]">
              <p className="text-[15px] leading-snug text-text-primary/90">{job.summary}</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {[
                  ["What You’ll Do", job.responsibilities],
                  ["What You’ll Bring", job.requirements],
                ].map(([h, list]) => (
                  <div key={h as string}>
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary">{h as string}</p>
                    <ul className="mt-2 space-y-1.5">
                      {(list as string[]).map((t, i) => (
                        <motion.li
                          key={t}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06 }}
                          className="flex gap-2 text-sm text-text-primary/80"
                        >
                          <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-grad-start" />
                          {t}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onApply}
                className="bg-brand-gradient group/apply mt-6 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium shadow-[0_10px_30px_-10px_rgba(183,43,202,0.8)] transition-shadow hover:shadow-[0_0_30px_rgba(233,110,216,0.7)]"
              >
                Apply For This Role
                <ArrowRight className="size-4 transition-transform group-hover/apply:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/* ───────────────────────── Form pieces ───────────────────────── */

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const inputBase =
  "h-[48px] w-full border border-white/[0.08] bg-[#140f1c]/90 px-[18px] text-[15px] text-text-primary outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-text-primary/45 focus:border-grad-mid/70 focus:bg-[#1a1324] focus:shadow-[0_0_0_4px_rgba(183,43,202,0.15),0_0_30px_-8px_rgba(183,43,202,0.6)]";

function Field({ label, required, error, htmlFor, children }: { label: string; required?: boolean; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <motion.div variants={fieldVariant}>
      <label htmlFor={htmlFor} className="mb-3 block text-lg font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 pl-4 text-sm text-grad-start" role="alert">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

type Status = "idle" | "sending" | "sent" | "error";

export default function OpenPositions() {
  const [open, setOpen] = useState<string | null>(JOBS[0]?.id ?? null);
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [flash, setFlash] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyFor = (job: Job) => {
    setRole(job.title);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => (formRef.current?.elements.namedItem("name") as HTMLInputElement | null)?.focus({ preventScroll: true }), 600);
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, resume: `File is larger than ${MAX_MB} MB.` }));
      return;
    }
    setFile(f);
    setErrors(({ resume: _drop, ...rest }) => rest); // eslint-disable-line @typescript-eslint/no-unused-vars
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/[\s-]/g, "");
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!/^\+?\d{7,15}$/.test(phone)) next.phone = "Please enter a valid phone number.";
    if (!file) next.resume = "Please upload your resume.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    if (file) fd.set("resume", file);
    fd.set("role", role || "General Application");

    setServerMsg("");
    try {
      const res = await fetch(siteConfig.careersFormEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      const data: { error?: string; errors?: Record<string, string> } = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
        formRef.current?.reset();
        setFile(null);
        setRole("");
        setTimeout(() => setStatus("idle"), 6000);
      } else {
        setStatus("error");
        if (data.errors) setErrors(data.errors);
        setServerMsg(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setServerMsg("Network error — please check your connection and try again.");
    }
  };

  return (
    <section id="openings" aria-labelledby="openings-title" className="relative scroll-mt-20 overflow-hidden py-24 lg:py-[150px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_55%_55%,rgba(70,20,110,0.55),transparent_75%)]" />

      <motion.h2
        id="openings-title"
        initial={{ opacity: 0, y: 40, letterSpacing: "0.15em" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "0em" }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.1, ease: EASE }}
        className="container-site relative text-center font-display text-[clamp(2.75rem,4vw,4.5rem)] font-bold leading-none"
      >
        Open Positions
      </motion.h2>

      <div className="container-site relative mt-14 grid gap-14 lg:mt-[170px] lg:grid-cols-[590fr_570fr] lg:gap-[120px]">
        {/* Jobs */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col gap-[28px]"
        >
          {JOBS.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} open={open === job.id} onToggle={() => setOpen(open === job.id ? null : job.id)} onApply={() => applyFor(job)} />
          ))}
        </motion.ul>

        {/* Form */}
        <motion.form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
          className="flex flex-col gap-[26px] lg:sticky lg:top-28 lg:self-start"
          aria-label="Job application form"
        >
          <Field label="Full Name" required htmlFor="ap-name" error={errors.name}>
            <div className="relative">
              <input id="ap-name" name="name" autoComplete="name" placeholder="Enter your Name" className={cn(inputBase, "rounded-full pr-12")} aria-invalid={!!errors.name} />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-text-primary/70">
                <Glyph d={I.user} />
              </span>
            </div>
          </Field>

          <Field label="Email Address" required htmlFor="ap-email" error={errors.email}>
            <div className="relative">
              <input id="ap-email" name="email" type="email" autoComplete="email" placeholder="Enter your Email ID" className={cn(inputBase, "rounded-full pr-12")} aria-invalid={!!errors.email} />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-text-primary/70">
                <Glyph d={I.mail} />
              </span>
            </div>
          </Field>

          <Field label="Phone Number (+971)" required htmlFor="ap-phone" error={errors.phone}>
            <div className="relative">
              <input id="ap-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter your Phone Number" className={cn(inputBase, "rounded-full pr-12")} aria-invalid={!!errors.phone} />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-text-primary/70">
                <Glyph d={I.phone} />
              </span>
            </div>
          </Field>

          <Field label="Apply For" htmlFor="ap-role">
            <div className="relative">
              <select
                id="ap-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={cn(inputBase, "appearance-none rounded-full pr-12", !role && "text-text-primary/45", flash && "border-primary shadow-[0_0_0_4px_rgba(233,224,42,0.2)]")}
              >
                <option value="">Pick your Role</option>
                {JOBS.map((j) => (
                  <option key={j.id} value={j.title} className="bg-[#140f1c] text-text-primary">
                    {j.title}
                  </option>
                ))}
                <option value="General Application" className="bg-[#140f1c] text-text-primary">
                  General Application
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-primary" />
            </div>
          </Field>

          <Field label="Resume" required htmlFor="ap-resume" error={errors.resume}>
            <div className="flex gap-3">
              <div className="relative min-w-0 flex-1">
                <div className={cn(inputBase, "flex items-center overflow-hidden rounded-full pr-12", file && "border-grad-mid/40")}>
                  <AnimatePresence mode="wait">
                    <motion.span key={file?.name ?? "empty"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={cn("truncate", !file && "text-text-primary/45")}>
                      {file ? file.name : "Upload your Resume"}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className={cn("pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 transition-colors", file ? "text-primary" : "text-text-primary/70")}>
                  <Glyph d={I.file} />
                </span>
              </div>
              <input
                ref={fileRef}
                id="ap-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="bg-brand-gradient h-[48px] shrink-0 rounded-full px-8 text-base font-medium transition-shadow hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]"
              >
                {file ? "Change" : "Upload"}
              </button>
            </div>
            <p className="mt-2 pl-4 text-xs text-text-primary/40">PDF or Word, up to {MAX_MB} MB</p>
          </Field>

          <Field label="Message" htmlFor="ap-message">
            <textarea id="ap-message" name="message" rows={4} placeholder="Write Something...." className={cn(inputBase, "h-[110px] resize-none rounded-[14px] py-3")} />
          </Field>

          <motion.div variants={fieldVariant} className="mt-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-brand-gradient group relative flex h-[49px] w-full items-center justify-center overflow-hidden rounded-full text-base font-medium shadow-[0_10px_40px_-12px_rgba(183,43,202,0.8)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)] disabled:opacity-80"
            >
              <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
              <AnimatePresence mode="wait">
                <motion.span key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative flex items-center gap-2">
                  {status === "sending" && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {status === "sending" ? "Sending…" : status === "sent" ? "Application Sent ✓" : status === "error" ? "Something Went Wrong — Try Again" : "Apply Now"}
                </motion.span>
              </AnimatePresence>
            </button>
            <AnimatePresence>
              {(status === "sent" || serverMsg) && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className={cn("mt-4 text-sm", status === "sent" ? "text-primary" : "text-grad-start")}
                >
                  {status === "sent" ? "Thank you! Your application has been sent — our team will be in touch." : serverMsg}
                </motion.p>
              )}
            </AnimatePresence>
            {/* spam trap — hidden from people, bots fill it */}
            <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
            <p className="mt-5 text-sm leading-snug text-text-primary/70">
              By clicking <span className="font-semibold text-text-primary">“Apply,”</span> you agree to our Privacy Policy and consent to being contacted regarding your enquiry.
            </p>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
