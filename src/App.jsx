import { useEffect, useRef, useState } from "react";
import {
  Check,
  Menu,
  X,
  Instagram,
  Music2,
  Milk,
  Egg,
  Leaf,
  Truck,
} from "lucide-react";
const homeShot = "/mockups/home.png?v=3";
const inventoryShot = "/mockups/inventory.png?v=2";
const recipesShot = "/mockups/recipes.png?v=2";
const scanShot = "/mockups/scan.png";

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* Fade + rise as the element scrolls into view (once). */
function Reveal({ children, as: Tag = "div", delay = 0, className = "", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? "is-visible" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Hero device: idle float + 3D tilt that follows the pointer. */
function InteractivePhone() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  function handleMove(e) {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: +(py * -10).toFixed(2), ry: +(px * 14).toFixed(2), active: true });
  }
  function reset() {
    setTilt({ rx: 0, ry: 0, active: false });
  }

  return (
    <div
      className="flex justify-center [perspective:1200px] lg:justify-end"
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      <div
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <img
          src={homeShot}
          alt="Kitchin home screen on an iPhone, showing a streak and points, a Your Pantry card counting items by freshness, and a Create Recipes button."
          className="h-auto w-[clamp(260px,82vw,400px)] select-none [filter:drop-shadow(0_35px_50px_rgba(20,41,32,0.20))]"
          loading="eager"
          decoding="async"
          draggable="false"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Logo({ withWord = true, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width="32"
        height="32"
        className="h-8 w-8"
      />
      {withWord && (
        <span
          className={`font-display text-[19px] font-extrabold tracking-tight ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          Kitchin
        </span>
      )}
    </span>
  );
}

function StoreComingSoon({ variant = "light", className = "" }) {
  const tone = variant === "dark" ? "text-white/85" : "text-ink-mid";
  return (
    <p className={`text-[15px] font-semibold leading-snug ${tone} ${className}`}>
      Coming to App Store & Google Play
    </p>
  );
}

function DownloadSoonButton({ className = "", variant = "light", ...rest }) {
  const light = "bg-white text-primary";
  const dark = "bg-[#37805F] text-white";
  const styles = variant === "dark" ? dark : light;

  return (
    <span
      className={`inline-flex items-center rounded-full px-6 py-3 text-[15px] font-semibold ${styles} ${className}`}
      {...rest}
    >
      Download Soon
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Navigation                                                       */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Beta", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Join affiliate program", href: "mailto:affiliates@kitchin.app" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-black/[0.06] bg-page/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary">
        <a href="#top" className="rounded-md" aria-label="Kitchin home">
          <Logo dark={!scrolled} />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[14px] font-medium transition-colors ${
                scrolled
                  ? "text-ink-mid hover:text-ink"
                  : "text-white hover:text-white/80"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DownloadSoonButton
            variant="dark"
            className="hidden !px-5 !py-2.5 !text-[14px] md:inline-flex"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`rounded-lg p-2 md:hidden ${
              scrolled ? "text-ink" : "text-white"
            }`}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      {open && (
        <div className="mobile-menu fixed inset-0 z-50 flex flex-col bg-page md:hidden">
          <div className="shell flex h-16 shrink-0 items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-ink"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mobile-menu-links flex flex-col gap-3 px-8 pb-10 pt-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl font-bold text-ink"
              >
                {l.label}
              </a>
            ))}
            <DownloadSoonButton
              variant="dark"
              className="mt-6 w-full justify-center !px-5 !py-4 !text-base"
            />
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Hero                                                             */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[linear-gradient(180deg,#69BF98_0%,#83C8A4_34%,#A6D6BD_58%,#CDE7D7_80%,#F7F8F6_100%)]"
    >
      <div className="shell relative grid min-h-[calc(100svh-4rem)] items-center gap-10 pb-20 pt-[clamp(5rem,10vh,7rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-28">
        <div className="max-w-xl lg:-mt-[5vh]">
          <StoreComingSoon className="mb-4 text-white" />
          <h1 className="font-display font-extrabold text-ink [letter-spacing:-0.03em] text-[clamp(40px,8vw,80px)] leading-[1.02]">
            Track your kitchen with{" "}
            <span className="inline-block rounded-xl bg-[#37805F] px-3 py-0.5 text-white [box-decoration-break:clone]">
              a picture
            </span>
          </h1>
          <ul className="mt-6 max-w-md space-y-3">
            {[
              "Scan a receipt to auto-fill your pantry, no typing",
              "Get warned before anything expires",
              "Cook recipes from what you already own",
              "Smart restock low items with Instacart in one tap",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
                <Check size={20} strokeWidth={2.6} className="mt-[2px] shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <InteractivePhone />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Reviews                                                          */
/* ------------------------------------------------------------------ */

const REVIEWS = [
  {
    quote:
      "First week on TestFlight and I stopped guessing what's in my fridge. It pulled a 20-minute dinner from what I already had between classes.",
    name: "Jordan T.",
    role: "TestFlight beta · Student",
    img: "/avatars/avatar-student.png",
  },
  {
    quote:
      "We're testing the household view as a family. The kids log snacks and we finally stopped buying the same things twice.",
    name: "The Ruiz family",
    role: "TestFlight beta · Family of four",
    img: "/avatars/avatar-family.png",
  },
  {
    quote:
      "Two weeks in and we saved about $40 just by using what we already had. The expiry alerts alone changed how we shop for the week.",
    name: "Sam & Alex",
    role: "TestFlight beta · Couple",
    img: "/avatars/avatar-couple.png",
  },
];

function Reviews() {
  return (
    <section
      id="reviews"
      aria-label="TestFlight beta feedback"
      className="bg-[linear-gradient(130deg,#2AC885_0%,#2D6A4F_55%,#1E4D3A_100%)] pt-16 pb-24 sm:pt-20 sm:pb-32"
    >
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-semibold tracking-wide text-white ring-1 ring-white/20">
            TestFlight beta
          </p>
          <h2 className="mt-5 font-display text-[clamp(28px,5vw,46px)] font-extrabold tracking-tight text-white">
            What early testers are saying.
          </h2>
          <p className="mt-4 text-[17px] text-white/75">
            Real feedback from people trying Kitchin before launch.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal
              key={r.name}
              delay={i * 120}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.5)]"
            >
              <span className="self-start rounded-full bg-[#EEF4F0] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Beta feedback
              </span>
              <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-ink">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={r.img}
                  alt={`Portrait of ${r.name}`}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="leading-tight">
                  <p className="font-display text-[15px] font-bold text-ink">
                    {r.name}
                  </p>
                  <p className="text-[13px] text-ink-muted">{r.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. How it works                                                     */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Scan your receipt",
    copy: "Point your camera at any grocery receipt. We handle the rest.",
    img: scanShot,
    alt: "Kitchin receipt scanner on an iPhone, framing a Whole Foods Market receipt inside the camera viewfinder.",
  },
  {
    n: "02",
    title: "See what you have",
    copy: "Your fridge, freezer, and pantry. Organized and current.",
    img: inventoryShot,
    alt: "Kitchin inventory grid on an iPhone, showing grocery items with color-coded freshness dots under fridge, freezer, and pantry tabs.",
  },
  {
    n: "03",
    title: "Cook before it expires",
    copy: "Recipes that use what's about to go bad, not what's on a stock photo.",
    img: recipesShot,
    alt: "Kitchin recipes screen on an iPhone, showing a Spinach & Cheddar Omelet with ingredients, steps, and recipe suggestions.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-page py-20 sm:py-24">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(28px,5vw,46px)] font-extrabold tracking-tight text-ink">
            From receipt to recipes in three steps.
          </h2>
          <p className="mt-4 text-[17px] text-ink-mid">
            No manual data entry. Just a photo and a plan.
          </p>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ n, title, copy, img, alt }, i) => (
            <Reveal
              key={n}
              delay={i * 120}
              className="flex flex-col items-center text-center"
            >
              <div className="mx-auto h-[clamp(400px,58vw,540px)] w-[clamp(190px,27.5vw,252px)]">
                <img
                  src={img}
                  alt={alt}
                  className="h-full w-full object-contain object-bottom select-none transition-transform duration-500 ease-out hover:-translate-y-2 [filter:drop-shadow(0_25px_38px_rgba(20,41,32,0.16))]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="mt-8 max-w-xs">
                <span className="font-display text-[13px] font-bold text-bright">
                  {n}
                </span>
                <h3 className="mt-1 font-display text-[21px] font-bold tracking-tight text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-mid">
                  {copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Instacart integration                                            */
/* ------------------------------------------------------------------ */

const CART_ITEMS = [
  { Icon: Milk, name: "Whole milk", tag: "Running low", tone: "amber" },
  { Icon: Leaf, name: "Baby spinach", tag: "Expired", tone: "red" },
  { Icon: Egg, name: "Large eggs", tag: "Running low", tone: "amber" },
];

const TONES = {
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
};

function CarrotMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19.5c2.6 1.2 6.4-1 9.2-3.8C17 12.9 19.2 9.1 18 6.5l-1.8 1c.4-1 .3-2-.4-2.7l-2 2.4c-.2-1-.8-1.9-1.8-2.4l-.9 2.6c-1-.6-2.2-.7-3.3-.2 1 .5 1.6 1.4 1.8 2.4l-2.6-.4c.4 1 1.2 1.7 2.2 2L6.6 14c1 .2 2 0 2.8-.6-.2 1.1-.9 2.1-1.9 2.7l2.6.2c-.8.8-1.9 1.3-3 1.4l.9.8c-1.1.3-2.3.2-3.3-.3l.3 1.3Z"
        fill="#FF7009"
      />
      <path
        d="M16.5 4.5c.8-.8 2-1.2 3.2-1-.2 1.2-.8 2.3-1.7 3-.8.2-1.6.1-2.3-.3.2-.6.5-1.2.8-1.7Z"
        fill="#0AAD0A"
      />
    </svg>
  );
}

function CartCard() {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.55)] ring-1 ring-black/5">
      <div className="flex items-center gap-3 border-b border-black/[0.07] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E6]">
          <CarrotMark />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold text-ink">Instacart order</p>
          <p className="text-[12px] text-ink-muted">Built by Kitchin</p>
        </div>
        <span className="ml-auto rounded-full bg-bright/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
          Auto-built
        </span>
      </div>

      <ul className="space-y-2.5 py-4">
        {CART_ITEMS.map(({ Icon, name, tag, tone }) => (
          <li key={name} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF4F0]">
              <Icon size={17} strokeWidth={1.8} className="text-primary" />
            </span>
            <span className="text-[14px] font-medium text-ink">{name}</span>
            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONES[tone]}`}
            >
              {tag}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0AAD0A] py-3 text-[14px] font-bold text-white"
      >
        <Truck size={17} strokeWidth={2} />
        Deliver today
      </button>
    </div>
  );
}

function Integration() {
  return (
    <section id="integration" className="bg-page py-20 sm:py-24">
      <div className="shell">
        <Reveal className="overflow-hidden rounded-[36px] bg-deep">
          <div className="grid items-center gap-12 p-9 sm:p-12 lg:grid-cols-2 lg:gap-8 lg:p-16">
            <div className="max-w-md">
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-bright">
                <CarrotMark size={18} />
                Instacart integration
              </p>
              <h2 className="mt-4 font-display text-[clamp(28px,4.6vw,44px)] font-extrabold leading-[1.05] tracking-tight text-white">
                Out of milk? It&rsquo;s already on the way.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/70">
                Connect your Instacart account and Kitchin builds a cart from
                whatever&rsquo;s running low or expired, then schedules delivery
                to your door. You just approve it.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Restocks the items you actually use",
                  "Reads expiry and low-stock automatically",
                  "Groceries at your door, no list-making",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-white/80">
                    <Check size={18} strokeWidth={2.4} className="mt-[2px] shrink-0 text-bright" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto w-full max-w-sm">
              <CartCard />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Metric                                                           */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: "$1,200", label: "saved on groceries every year" },
  { value: "100 lbs", label: "of food kept out of the landfill" },
  { value: "15 hrs", label: "saved each month" },
];

function Metric() {
  return (
    <section
      id="coverage"
      className="bg-[linear-gradient(130deg,#2AC885_0%,#2D6A4F_55%,#1E4D3A_100%)] py-24 sm:py-32"
    >
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(28px,5vw,46px)] font-extrabold leading-[1.05] tracking-tight text-white">
            The average kitchen saves more than it expects.
          </h2>
          <p className="mt-4 text-[17px] text-white/75">
            What a typical Kitchin household saves.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 text-center sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <p className="font-display text-[clamp(44px,7vw,68px)] font-extrabold leading-none tracking-tight text-white">
                {s.value}
              </p>
              <p className="mx-auto mt-3 max-w-[13rem] text-[15px] leading-relaxed text-white/80">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. FAQ                                                              */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: "What does Kitchin actually do?",
    a: "Snap a grocery receipt or scan an item, and Kitchin builds a running list of what's in your kitchen, warns you before things go bad, and suggests recipes from what you already have.",
  },
  {
    q: "How long does it take to get started?",
    a: "About 10 seconds. Scan one receipt and your pantry is populated. There's no long setup, spreadsheet, or account to configure first.",
  },
  {
    q: "Do I have to type everything in myself?",
    a: "No. Kitchin fills your inventory from receipts, item photos, or barcodes. You can add or edit things by hand anytime, but you rarely need to.",
  },
  {
    q: "Will it work with my grocery store?",
    a: "Yes. Kitchin reads receipts from any US grocery store, including Whole Foods, Costco, Trader Joe's, and Aldi.",
  },
  {
    q: "How does it know when food expires?",
    a: "It combines USDA FoodKeeper data with brand-specific shelf life, so Fairlife milk gets about 75 days while regular milk gets about 7.",
  },
  {
    q: "Is my data private?",
    a: "Your inventory stays on your device by default, and we never sell your data.",
  },
];

function Faq() {
  return (
    <section id="faq" className="bg-page py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="font-display text-[clamp(28px,5vw,46px)] font-extrabold tracking-tight text-ink">
          Questions, answered.
        </h2>
        <dl className="divide-y divide-black/[0.07] border-t border-black/[0.07]">
          {FAQS.map(({ q, a }, i) => (
            <Reveal as="div" key={q} delay={i * 70} className="py-7">
              <dt className="font-display text-[18px] font-bold tracking-tight text-ink">
                {q}
              </dt>
              <dd className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
                {a}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Final CTA                                                        */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section id="download" className="bg-[#2A6249] py-24 sm:py-32">
      <div className="shell flex flex-col items-center text-center">
        <h2 className="max-w-2xl font-display text-[clamp(30px,5.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-white">
          Save food, save money, save time with Kitchin
        </h2>
        <div className="mt-10">
          <DownloadSoonButton />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Footer                                                           */
/* ------------------------------------------------------------------ */

const FOOTER_COLS = [
  {
    head: "Product",
    links: [
      ["How it works", "#how"],
      ["Instacart", "#integration"],
      ["FAQ", "#faq"],
      ["Beta", "#reviews"],
    ],
  },
  {
    head: "Company",
    links: [
      ["About", "#"],
      ["Blog", "#"],
      ["Contact", "#"],
    ],
  },
  {
    head: "Legal",
    links: [
      ["Privacy", "#"],
      ["Terms", "#"],
      ["Manage subscription", "#"],
    ],
  },
];

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.9 3h3.3l-7.2 8.2L23.5 21h-6.6l-5.2-6.8L5.8 21H2.5l7.7-8.8L1.5 3h6.8l4.7 6.2L18.9 3Zm-1.2 16h1.8L7.4 4.8H5.5L17.7 19Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/[0.07] bg-page py-16">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
              The app where your fridge tells you what to cook before it goes
              bad.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <h3 className="font-display text-[13px] font-bold text-ink">
                {col.head}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[14px] text-ink-mid transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-black/[0.07] pt-8 sm:flex-row">
          <p className="text-[13px] text-ink-muted">
            © 2026 Kitchin. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Kitchin on Instagram" className="text-ink-mid transition-colors hover:text-ink">
              <Instagram size={19} />
            </a>
            <a href="#" aria-label="Kitchin on TikTok" className="text-ink-mid transition-colors hover:text-ink">
              <Music2 size={19} />
            </a>
            <a href="#" aria-label="Kitchin on X" className="text-ink-mid transition-colors hover:text-ink">
              <XIcon size={17} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Reviews />
        <HowItWorks />
        <Integration />
        <Metric />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
