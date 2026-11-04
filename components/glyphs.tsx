export function Glyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 64 64",
    "aria-hidden": true as const,
    className: "h-12 w-12",
  };
  switch (id) {
    case "pizza-box":
      return (
        <svg {...common}>
          <rect x="8" y="14" width="48" height="36" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M8 26h48" stroke="#1b1712" strokeWidth="2" />
          <circle cx="32" cy="40" r="8" fill="#c2410c" />
        </svg>
      );
    case "produce":
      return (
        <svg {...common}>
          <path d="M32 50c10 0 16-8 16-18 0-8-6-12-10-12-2 6-6 8-6 8s-4-2-6-8c-4 0-10 4-10 12 0 10 6 18 16 18z" fill="#3f6212" stroke="#1b1712" strokeWidth="2" />
          <path d="M32 20c2-8 8-10 12-10" stroke="#1b1712" strokeWidth="2" fill="none" />
        </svg>
      );
    case "food-scraps":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="36" rx="20" ry="12" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M18 36c4 6 24 6 28 0" stroke="#c2410c" strokeWidth="2" fill="none" />
          <path d="M24 18c2 6 4 6 6 0M34 16c2 6 4 6 6 0" stroke="#3f6212" strokeWidth="2" fill="none" />
        </svg>
      );
    case "aluminum-can":
      return (
        <svg {...common}>
          <rect x="22" y="10" width="20" height="44" rx="4" fill="#d7dde3" stroke="#1b1712" strokeWidth="2" />
          <path d="M22 18h20M22 46h20" stroke="#1b1712" strokeWidth="2" />
        </svg>
      );
    case "coffee-cup":
      return (
        <svg {...common}>
          <path d="M16 20h28l-3 26H19z" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M44 24h6a6 6 0 0 1 0 12h-6" stroke="#1b1712" strokeWidth="2" fill="none" />
          <path d="M24 12c2 3 2 3 4 0M32 12c2 3 2 3 4 0" stroke="#4a433a" strokeWidth="2" fill="none" />
        </svg>
      );
    case "plastic-film":
      return (
        <svg {...common}>
          <path d="M14 18c10 4 8 10 18 8 8-2 12 2 16 6-8 4-10 12-20 12S16 36 14 18z" fill="#8eb4d6" stroke="#1b1712" strokeWidth="2" />
        </svg>
      );
    case "textile":
      return (
        <svg {...common}>
          <path d="M16 22 32 14l16 8-6 28H22z" fill="#1e4d7b" stroke="#1b1712" strokeWidth="2" />
          <path d="M16 22h32" stroke="#1b1712" strokeWidth="2" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <rect x="20" y="8" width="24" height="48" rx="3" fill="#1b1712" />
          <rect x="24" y="14" width="16" height="28" fill="#e7dcc4" />
          <circle cx="32" cy="48" r="2" fill="#e7dcc4" />
        </svg>
      );
    case "alkaline-battery":
    case "lithium-battery":
      return (
        <svg {...common}>
          <rect x="26" y="8" width="12" height="6" fill="#c2410c" stroke="#1b1712" strokeWidth="2" />
          <rect x="20" y="14" width="24" height="40" rx="2" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M28 28h8M32 24v8" stroke="#1b1712" strokeWidth="2" />
        </svg>
      );
    case "glass-container":
      return (
        <svg {...common}>
          <path d="M22 12h20l-2 8H24zM24 20h16l-2 30H26z" fill="#d7e4ea" stroke="#1b1712" strokeWidth="2" />
        </svg>
      );
    case "cardboard-box":
      return (
        <svg {...common}>
          <path d="M8 24 32 12l24 12-24 12z" fill="#c4a574" stroke="#1b1712" strokeWidth="2" />
          <path d="M8 24v20l24 12V36M56 24v20L32 56" stroke="#1b1712" strokeWidth="2" fill="none" />
        </svg>
      );
    case "ceramic":
      return (
        <svg {...common}>
          <path d="M18 22h22a10 10 0 0 1 0 20H18z" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M40 26h6a6 6 0 0 1 0 12h-6" stroke="#1b1712" strokeWidth="2" fill="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="12" y="12" width="40" height="40" fill="#f6f0e4" stroke="#1b1712" strokeWidth="2" />
          <path d="M20 40 32 20l12 20" stroke="#c2410c" strokeWidth="2" fill="none" />
        </svg>
      );
  }
}
