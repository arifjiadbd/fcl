"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

/* ================================================================
   TYPES
================================================================ */

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;
  photo?: string;
  photoUrl?: string;
}

const FALLBACK_PHOTO = "/FCL Cricket Avatar Placeholder.jpg";

/* ================================================================
   THEME DETECTION
   Compatible with FCL Home Page
================================================================ */

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;

      const dt = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();

      if (dt === "dark" || dt === "light") {
        return dt === "dark";
      }

      const cls = `${h.className} ${b.className}`.toLowerCase();

      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;

      if (scheme === "light" || scheme === "dark") {
        return scheme === "dark";
      }

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "light" || saved === "dark") {
          return saved === "dark";
        }
      } catch {}

      return window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    };

    const update = () => setIsDark(read());

    update();

    const observer = new MutationObserver(update);

    const options = {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme",
        "data-mode",
        "style",
      ],
    };

    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);

    window.addEventListener("storage", update);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
      media.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

/* ================================================================
   PHOTO PATH HELPER
================================================================ */

function getPhotoPath(player: Player) {
  const raw = player.photo || player.photoUrl;

  if (!raw || raw === "—" || raw.trim() === "") {
    return FALLBACK_PHOTO;
  }

  if (
    raw.startsWith("/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  return `/players/${raw}`;
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={index}
          className="gallery-skeleton overflow-hidden rounded-[22px] border"
        >
          <div className="gallery-skeleton-image aspect-square w-full animate-pulse" />

          <div className="space-y-3 p-3.5">
            <div className="gallery-skeleton-line h-3 w-4/5 animate-pulse rounded-full" />

            <div className="gallery-skeleton-line h-2 w-2/3 animate-pulse rounded-full" />

            <div className="gallery-skeleton-line mt-4 h-9 w-full animate-pulse rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   PLAYER PHOTO CARD
================================================================ */

interface PhotoCardProps {
  player: Player;
  index: number;
  onDownload: (
    photoPath: string,
    playerName: string
  ) => Promise<void>;
  downloading: string | null;
}

function PhotoCard({
  player,
  index,
  onDownload,
  downloading,
}: PhotoCardProps) {
  const photoPath = getPhotoPath(player);

  const [imageLoaded, setImageLoaded] = useState(false);

  const [imageError, setImageError] = useState(false);

  const isDownloading = downloading === `${player.name}-${index}`;

  return (
    <article
      className="gallery-card group relative flex flex-col overflow-hidden rounded-[22px] border transition-all duration-500 hover:-translate-y-2"
      style={
        {
          "--card-delay": `${Math.min(index, 15) * 45}ms`,
        } as React.CSSProperties
      }
    >
      {/* Top Accent Line */}

      <div className="absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Photo */}

      <div className="gallery-image-bg relative aspect-square w-full overflow-hidden">
        {!imageLoaded && (
          <div className="gallery-image-placeholder absolute inset-0 animate-pulse" />
        )}

        <img
          src={imageError ? FALLBACK_PHOTO : photoPath}
          alt={`${player.name} - FCL Player`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (!imageError) {
              setImageError(true);
              setImageLoaded(false);
            } else {
              setImageLoaded(true);
            }
          }}
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Image Gradient */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-80" />

        {/* FCL Badge */}

        <div className="absolute left-2.5 top-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-[#020617]/65 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md sm:text-[9px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
            FCL PLAYER
          </span>
        </div>

        {/* HD Badge */}

        <div className="absolute right-2.5 top-2.5 z-10">
          <span className="rounded-lg border border-blue-400/30 bg-[#1877F2]/80 px-2 py-1 text-[8px] font-black tracking-wide text-white backdrop-blur-md">
            HD
          </span>
        </div>

        {/* Bottom Image Text */}

        <div className="absolute bottom-3 left-3 right-3 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">
            Official FCL Gallery
          </span>
        </div>
      </div>

      {/* Card Details */}

      <div className="relative flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="min-w-0">
          <h3
            className="gallery-heading truncate text-[13px] font-black tracking-tight transition-colors duration-300 group-hover:text-[#1877F2] sm:text-[15px]"
            title={player.name}
          >
            {player.name}
          </h3>

          <p className="gallery-muted mt-1 truncate text-[10px] font-medium sm:text-[11px]">
            {player.nickName
              ? `@${player.nickName}`
              : player.role || "FCL Player"}
          </p>
        </div>

        {/* Download Button */}

        <button
          type="button"
          disabled={isDownloading}
          onClick={() =>
            onDownload(photoPath, `${player.name}-${index}`)
          }
          className="gallery-download group/btn relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border px-2 py-2.5 text-[10px] font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-70 sm:text-xs"
        >
          <span className="relative z-10 text-sm transition-transform duration-300 group-hover/btn:-translate-y-0.5">
            {isDownloading ? "⏳" : "📥"}
          </span>

          <span className="relative z-10">
            {isDownloading
              ? "Downloading..."
              : "HD ডাউনলোড"}
          </span>

          <span className="gallery-download-shine pointer-events-none absolute inset-y-0 left-[-70%] w-1/2 -skew-x-12 transition-transform duration-700 group-hover/btn:translate-x-[350%]" />
        </button>
      </div>
    </article>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function PhotoGalleryPage() {
  const isDark = useIsDark();

  const [players, setPlayers] = useState<Player[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [downloading, setDownloading] = useState<string | null>(
    null
  );

  const [error, setError] = useState(false);

  /* ================================================================
     FETCH PLAYERS
  ================================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/fcl-data", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load gallery data");
        }

        const data = await response.json();

        let list: Player[] = [];

        if (data.players && Array.isArray(data.players)) {
          list = data.players;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const withPhotos = list.filter((player) => {
          const raw = player.photo || player.photoUrl;

          return (
            typeof raw === "string" &&
            raw.trim() !== "" &&
            raw !== "—" &&
            raw !== FALLBACK_PHOTO
          );
        });

        setPlayers(withPhotos);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Gallery loading error:", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPlayers();

    return () => controller.abort();
  }, []);

  /* ================================================================
     SEARCH FILTER
  ================================================================ */

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return players;

    return players.filter((player) => {
      const name = player.name?.toLowerCase() || "";

      const nickname =
        player.nickName?.toLowerCase() || "";

      const role = player.role?.toLowerCase() || "";

      return (
        name.includes(query) ||
        nickname.includes(query) ||
        role.includes(query)
      );
    });
  }, [players, search]);

  /* ================================================================
     DOWNLOAD IMAGE
  ================================================================ */

  const handleDownload = useCallback(
    async (photoPath: string, playerName: string) => {
      setDownloading(playerName);

      let objectUrl: string | null = null;

      try {
        const response = await fetch(photoPath);

        if (!response.ok) {
          throw new Error("Image download failed");
        }

        const blob = await response.blob();

        objectUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        const safeName = playerName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-");

        link.href = objectUrl;

        link.download = `FCL-Player-${safeName}.png`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      } catch (err) {
        console.error("Download error:", err);

        window.open(
          photoPath,
          "_blank",
          "noopener,noreferrer"
        );
      } finally {
        if (objectUrl) {
          const url = objectUrl;

          window.setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        }

        setDownloading(null);
      }
    },
    []
  );

  /* ================================================================
     PAGE
  ================================================================ */

  return (
    <div
      className={`gallery-root ${
        isDark ? "gallery-dark" : "gallery-light"
      } min-h-screen pb-28 font-sans transition-colors duration-300 sm:pb-20`}
    >
      {/* ============================================================
          GLOBAL STYLES
      ============================================================ */}

      <style jsx global>{`

        /* ============================================================
           FCL OFFICIAL COLOR TOKENS
        ============================================================ */

        .gallery-root {
          --gallery-bg: #ffffff;
          --gallery-bg-alt: #f1f5f9;

          --gallery-card: #ffffff;
          --gallery-card-alt: #f8fafc;

          --gallery-heading: #0f172a;
          --gallery-text: #475569;
          --gallery-muted: #64748b;

          --gallery-border: #e2e8f0;

          --gallery-blue: #1877F2;
          --gallery-blue-light: #1d4ed8;

          --gallery-amber: #b45309;

          --gallery-input: #ffffff;

          --gallery-image-bg: #e2e8f0;

          --gallery-shadow:
            0 8px 30px rgba(15, 23, 42, 0.06);

          --gallery-hover-shadow:
            0 20px 50px rgba(24, 119, 242, 0.16);

          background: var(--gallery-bg);

          color: var(--gallery-heading);

          transition:
            background 0.3s ease,
            color 0.3s ease;
        }

        .gallery-root.gallery-dark {
          --gallery-bg: #020617;
          --gallery-bg-alt: #02050b;

          --gallery-card: #0f172a;
          --gallery-card-alt: #0b1220;

          --gallery-heading: #ffffff;
          --gallery-text: #94a3b8;
          --gallery-muted: #94a3b8;

          --gallery-border: #172033;

          --gallery-blue: #1877F2;
          --gallery-blue-light: #60a5fa;

          --gallery-amber: #f59e0b;

          --gallery-input: #0b1220;

          --gallery-image-bg: #081020;

          --gallery-shadow:
            0 10px 35px rgba(0, 0, 0, 0.18);

          --gallery-hover-shadow:
            0 25px 60px rgba(24, 119, 242, 0.18);
        }

        /* ============================================================
           THEME UTILITIES
        ============================================================ */

        .gallery-heading {
          color: var(--gallery-heading);
        }

        .gallery-text {
          color: var(--gallery-text);
        }

        .gallery-muted {
          color: var(--gallery-muted);
        }

        .gallery-blue {
          color: var(--gallery-blue-light);
        }

        .gallery-amber {
          color: var(--gallery-amber);
        }

        /* ============================================================
           HERO
        ============================================================ */

        .gallery-hero {
          background: var(--gallery-bg-alt);

          border-color: var(--gallery-border);
        }

        .gallery-grid {
          background-image:
            linear-gradient(
              to right,
              rgba(100, 116, 139, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(100, 116, 139, 0.08) 1px,
              transparent 1px
            );

          background-size: 45px 45px;

          mask-image:
            radial-gradient(
              ellipse 75% 85% at 50% 30%,
              black 25%,
              transparent 95%
            );
        }

        .gallery-dark .gallery-grid {
          background-image:
            linear-gradient(
              to right,
              rgba(148, 163, 184, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(148, 163, 184, 0.045) 1px,
              transparent 1px
            );
        }

        /* ============================================================
           GRADIENT TEXT
        ============================================================ */

        .gallery-gradient-text {
          background:
            linear-gradient(
              90deg,
              #1d4ed8,
              #1877F2,
              #7c3aed,
              #1d4ed8
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;

          animation:
            galleryGradient 6s ease infinite;
        }

        .gallery-dark .gallery-gradient-text {
          background:
            linear-gradient(
              90deg,
              #60a5fa,
              #22d3ee,
              #a78bfa,
              #60a5fa
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes galleryGradient {
          0%, 100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* ============================================================
           FLOATING ORBS
        ============================================================ */

        @keyframes galleryFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }

          50% {
            transform: translate(20px, -20px) scale(1.08);
          }
        }

        .gallery-orb {
          animation:
            galleryFloat 10s ease-in-out infinite;
        }

        .gallery-orb-delay {
          animation-delay: -5s;
        }

        /* ============================================================
           SEARCH
        ============================================================ */

        .gallery-search {
          background: var(--gallery-input);

          color: var(--gallery-heading);

          border-color: var(--gallery-border);

          box-shadow:
            0 4px 20px rgba(15, 23, 42, 0.04);

          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease,
            background 0.3s ease;
        }

        .gallery-search::placeholder {
          color: var(--gallery-muted);
          opacity: 0.75;
        }

        .gallery-search:focus {
          border-color: #1877F2;

          box-shadow:
            0 0 0 4px rgba(24, 119, 242, 0.10),
            0 8px 30px rgba(24, 119, 242, 0.08);
        }

        /* ============================================================
           STATS PILL
        ============================================================ */

        .gallery-stat {
          background: var(--gallery-card);

          border-color: var(--gallery-border);

          box-shadow: var(--gallery-shadow);
        }

        /* ============================================================
           PHOTO CARDS
        ============================================================ */

        .gallery-card {
          background:
            linear-gradient(
              to bottom,
              var(--gallery-card),
              var(--gallery-card-alt)
            );

          border-color: var(--gallery-border);

          box-shadow: var(--gallery-shadow);

          animation:
            galleryCardEnter 0.6s ease-out both;

          animation-delay: var(--card-delay);
        }

        .gallery-card:hover {
          border-color: rgba(24, 119, 242, 0.55);

          box-shadow: var(--gallery-hover-shadow);
        }

        @keyframes galleryCardEnter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gallery-image-bg {
          background: var(--gallery-image-bg);
        }

        .gallery-image-placeholder {
          background:
            linear-gradient(
              110deg,
              var(--gallery-card-alt) 8%,
              var(--gallery-image-bg) 18%,
              var(--gallery-card-alt) 33%
            );

          background-size: 200% 100%;

          animation:
            galleryShimmer 1.5s linear infinite;
        }

        @keyframes galleryShimmer {
          to {
            background-position-x: -200%;
          }
        }

        /* ============================================================
           DOWNLOAD BUTTON
        ============================================================ */

        .gallery-download {
          background: rgba(24, 119, 242, 0.09);

          border-color: rgba(24, 119, 242, 0.22);

          color: #1d4ed8;
        }

        .gallery-dark .gallery-download {
          background: rgba(24, 119, 242, 0.13);

          border-color: rgba(96, 165, 250, 0.25);

          color: #93c5fd;
        }

        .gallery-download:hover {
          background: #1877F2;

          border-color: #1877F2;

          color: #ffffff;

          box-shadow:
            0 10px 25px rgba(24, 119, 242, 0.25);
        }

        .gallery-download-shine {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
        }

        /* ============================================================
           SKELETON
        ============================================================ */

        .gallery-skeleton {
          background: var(--gallery-card);

          border-color: var(--gallery-border);
        }

        .gallery-skeleton-image {
          background: var(--gallery-image-bg);
        }

        .gallery-skeleton-line {
          background: var(--gallery-border);
        }

        /* ============================================================
           EMPTY STATE
        ============================================================ */

        .gallery-empty {
          background: var(--gallery-card);

          border-color: var(--gallery-border);

          box-shadow: var(--gallery-shadow);
        }

        /* ============================================================
           REDUCED MOTION
        ============================================================ */

        @media (prefers-reduced-motion: reduce) {
          .gallery-root *,
          .gallery-root *::before,
          .gallery-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>

      {/* ============================================================
          PREMIUM HERO HEADER
      ============================================================ */}

      <section className="gallery-hero relative overflow-hidden border-b">
        {/* Grid Background */}

        <div className="gallery-grid pointer-events-none absolute inset-0" />

        {/* Glow Orbs */}

        <div className="gallery-orb pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#1877F2]/15 blur-[100px]" />

        <div className="gallery-orb gallery-orb-delay pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-[110px]" />

        {/* Radial Glow */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,119,242,0.08),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:pb-14 lg:pt-14">
          {/* Eyebrow */}

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-3.5 py-2 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />

            <span className="gallery-blue text-[9px] font-black uppercase tracking-[0.22em] sm:text-[10px]">
              FCL OFFICIAL MEDIA HUB
            </span>
          </div>

          {/* Heading */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="gallery-heading text-[32px] font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[56px]">
                FCL Player
                <br className="sm:hidden" />{" "}
                <span className="gallery-gradient-text">
                  Photo Gallery.
                </span>
              </h1>

              <p className="gallery-text mt-4 max-w-2xl text-xs leading-6 sm:text-sm sm:leading-7">
                ফেসবুক ক্রিকেট লীগের সকল তারকার অফিশিয়াল
                ফটো গ্যালারি। আপনার পছন্দের প্লেয়ারকে খুঁজুন,
                ছবি দেখুন এবং এক ক্লিকেই ডাউনলোড করুন
                হাই-কোয়ালিটি প্লেয়ার ফটো।
              </p>

              {/* Feature Badges */}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                  📸 Official Photos
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
                  ✓ HD Quality
                </span>

                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-600 sm:text-[10px]">
                  ⚡ Instant Download
                </span>
              </div>
            </div>

            {/* Back Button */}

            <div className="flex shrink-0">
              <Link
                href="/"
                className="gallery-stat gallery-heading group inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40"
              >
                <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>

                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main className="relative mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10">
        {/* ============================================================
            SEARCH & STATS
        ============================================================ */}

        <div className="mb-7 flex flex-col gap-5 sm:mb-9 lg:flex-row lg:items-end lg:justify-between">
          {/* Section Title */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

              <span className="gallery-blue text-[9px] font-black uppercase tracking-[0.25em]">
                FCL PHOTO COLLECTION
              </span>
            </div>

            <h2 className="gallery-heading text-[23px] font-black tracking-tight sm:text-[30px]">
              Explore Player Photos
            </h2>

            <p className="gallery-muted mt-1.5 text-[11px] sm:text-xs">
              আপনার প্রিয় ক্রিকেট তারকার ছবি খুঁজে নিন।
            </p>
          </div>

          {/* Search */}

          <div className="w-full lg:max-w-[390px]">
            <label
              htmlFor="gallery-search"
              className="gallery-muted mb-2 block text-[10px] font-bold uppercase tracking-wider"
            >
              Search Players
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                🔍
              </span>

              <input
                id="gallery-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="নাম, নিকনেম বা রোল দিয়ে খুঁজুন..."
                className="gallery-search w-full rounded-2xl border py-3.5 pl-11 pr-11 text-xs font-medium outline-none sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="gallery-muted absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-xs transition hover:bg-blue-500/10 hover:text-[#1877F2]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            RESULTS BAR
        ============================================================ */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Total Players */}

            <div className="gallery-stat inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5">
              <span className="text-sm">📸</span>

              <span className="gallery-heading text-[11px] font-bold">
                Total Photos:
              </span>

              <span className="gallery-blue text-xs font-black">
                {loading ? "..." : players.length}
              </span>
            </div>

            {/* Search Results */}

            {search.trim() && !loading && (
              <div className="gallery-stat inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5">
                <span className="text-sm">🔎</span>

                <span className="gallery-muted text-[11px] font-bold">
                  Results:
                </span>

                <span className="gallery-blue text-xs font-black">
                  {filteredPlayers.length}
                </span>
              </div>
            )}
          </div>

          {/* Official Badge */}

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />

            <span className="gallery-muted text-[10px] font-bold uppercase tracking-wider">
              FCL Official Collection
            </span>
          </div>
        </div>

        {/* ============================================================
            DIVIDER
        ============================================================ */}

        <div className="mb-7 h-px w-full bg-gradient-to-r from-[#1877F2]/40 via-[#1877F2]/10 to-transparent" />

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading ? (
          <GallerySkeleton />
        ) : error ? (
          /* ============================================================
             ERROR STATE
          ============================================================ */

          <div className="gallery-empty flex flex-col items-center justify-center rounded-[28px] border px-5 py-16 text-center sm:py-20">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/10 text-4xl">
              ⚠️
            </div>

            <h3 className="gallery-heading text-xl font-black">
              Gallery Loading Failed
            </h3>

            <p className="gallery-muted mt-3 max-w-md text-xs leading-6 sm:text-sm">
              দুঃখিত, এই মুহূর্তে প্লেয়ারদের ছবি লোড করা
              যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা
              করুন।
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              🔄 Try Again
            </button>
          </div>
        ) : filteredPlayers.length === 0 ? (
          /* ============================================================
             EMPTY STATE
          ============================================================ */

          <div className="gallery-empty flex flex-col items-center justify-center rounded-[28px] border px-5 py-16 text-center sm:py-20">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-4xl">
              🔍
            </div>

            <h3 className="gallery-heading text-lg font-black sm:text-xl">
              {search
                ? "No Players Found"
                : "No Photos Available"}
            </h3>

            <p className="gallery-muted mt-3 max-w-md text-xs leading-6 sm:text-sm">
              {search
                ? `"${search}" নামে কোনো প্লেয়ারের ছবি পাওয়া যায়নি। অন্য কোনো নাম দিয়ে খুঁজে দেখুন।`
                : "এই মুহূর্তে গ্যালারিতে কোনো প্লেয়ারের ছবি পাওয়া যায়নি।"}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        ) : (
          /* ============================================================
             PLAYER PHOTO GRID
          ============================================================ */

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
            {filteredPlayers.map((player, index) => (
              <PhotoCard
                key={`${player.id ?? player.name}-${index}`}
                player={player}
                index={index}
                onDownload={handleDownload}
                downloading={downloading}
              />
            ))}
          </div>
        )}

        {/* ============================================================
            BOTTOM COLLECTION INFO
        ============================================================ */}

        {!loading &&
          !error &&
          filteredPlayers.length > 0 && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#1877F2]/40" />

                <span className="text-lg">🏏</span>

                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#1877F2]/40" />
              </div>

              <p className="gallery-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
                Facebook Cricket League
              </p>

              <p className="gallery-muted text-[10px]">
                Showing {filteredPlayers.length} of{" "}
                {players.length} official player photos
              </p>
            </div>
          )}
      </main>
    </div>
  );
}