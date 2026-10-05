/** GENERATED from tokens.json by src/build.py. Do not edit by hand.
 *  Tailwind CSS v3 config for TuinZorg DP. Every value points at a CSS variable from css/tokens.css,
 *  so load tokens.css first and the [data-theme] sections keep working: bg-surface, text-ink, bg-accent...
 *  For Tailwind v4 load it with @config "./tailwind.config.js"; */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,svelte}"
  ],
  darkMode: [
    "selector",
    "[data-theme=\"forest\"]"
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px"
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      forest: {
        "50": "var(--forest-50)",
        "100": "var(--forest-100)",
        "200": "var(--forest-200)",
        "500": "var(--forest-500)",
        "700": "var(--forest-700)",
        "800": "var(--forest-800)",
        "850": "var(--forest-850)",
        "900": "var(--forest-900)",
        "950": "var(--forest-950)"
      },
      leaf: {
        "300": "var(--leaf-300)",
        "400": "var(--leaf-400)",
        "500": "var(--leaf-500)",
        "600": "var(--leaf-600)",
        "700": "var(--leaf-700)"
      },
      lime: {
        "300": "var(--lime-300)"
      },
      bark: {
        "100": "var(--bark-100)",
        "500": "var(--bark-500)",
        "700": "var(--bark-700)"
      },
      sand: {
        "100": "var(--sand-100)",
        "200": "var(--sand-200)"
      },
      sage: {
        "50": "var(--sage-50)",
        "100": "var(--sage-100)",
        "200": "var(--sage-200)",
        "500": "var(--sage-500)",
        "600": "var(--sage-600)",
        "700": "var(--sage-700)"
      },
      charcoal: {
        "800": "var(--charcoal-800)"
      },
      white: "var(--white)",
      mist: {
        "200": "var(--mist-200)",
        "300": "var(--mist-300)"
      },
      moss: {
        "500": "var(--moss-500)"
      },
      red: {
        "700": "var(--red-700)",
        "300": "var(--red-300)",
        "50": "var(--red-50)"
      },
      amber: {
        "700": "var(--amber-700)",
        "300": "var(--amber-300)",
        "50": "var(--amber-50)"
      },
      blue: {
        "700": "var(--blue-700)",
        "300": "var(--blue-300)",
        "50": "var(--blue-50)"
      },
      bg: "var(--bg)",
      surface: "var(--surface)",
      "surface-sunken": "var(--surface-sunken)",
      "surface-inverse": "var(--surface-inverse)",
      heading: "var(--heading)",
      ink: "var(--ink)",
      "ink-soft": "var(--ink-soft)",
      "ink-faint": "var(--ink-faint)",
      "ink-inverse": "var(--ink-inverse)",
      line: "var(--line)",
      "line-strong": "var(--line-strong)",
      accent: "var(--accent)",
      "accent-hover": "var(--accent-hover)",
      "accent-press": "var(--accent-press)",
      "on-accent": "var(--on-accent)",
      "accent-word": "var(--accent-word)",
      link: "var(--link)",
      highlight: "var(--highlight)",
      tint: "var(--tint)",
      focus: "var(--focus)",
      success: "var(--success)",
      "success-bg": "var(--success-bg)",
      warning: "var(--warning)",
      "warning-bg": "var(--warning-bg)",
      danger: "var(--danger)",
      "danger-bg": "var(--danger-bg)",
      info: "var(--info)",
      "info-bg": "var(--info-bg)"
    },
    fontFamily: {
      display: [
        "Bricolage Grotesque",
        "Segoe UI",
        "system-ui",
        "sans-serif"
      ],
      sans: [
        "Figtree",
        "Segoe UI",
        "system-ui",
        "-apple-system",
        "sans-serif"
      ]
    },
    fontSize: {
      display: [
        "88px",
        {
          lineHeight: "0.98",
          fontWeight: "800",
          letterSpacing: "-0.03em"
        }
      ],
      h1: [
        "60px",
        {
          lineHeight: "1.02",
          fontWeight: "750",
          letterSpacing: "-0.025em"
        }
      ],
      h2: [
        "44px",
        {
          lineHeight: "1.06",
          fontWeight: "700",
          letterSpacing: "-0.02em"
        }
      ],
      h3: [
        "30px",
        {
          lineHeight: "1.15",
          fontWeight: "700",
          letterSpacing: "-0.015em"
        }
      ],
      h4: [
        "22px",
        {
          lineHeight: "1.25",
          fontWeight: "650",
          letterSpacing: "-0.01em"
        }
      ],
      h5: [
        "18px",
        {
          lineHeight: "1.35",
          fontWeight: "700"
        }
      ],
      h6: [
        "16px",
        {
          lineHeight: "1.4",
          fontWeight: "700"
        }
      ],
      lead: [
        "20px",
        {
          lineHeight: "1.55",
          fontWeight: "400"
        }
      ],
      body: [
        "17px",
        {
          lineHeight: "1.65",
          fontWeight: "400"
        }
      ],
      "body-strong": [
        "17px",
        {
          lineHeight: "1.65",
          fontWeight: "650"
        }
      ],
      small: [
        "15px",
        {
          lineHeight: "1.55",
          fontWeight: "400"
        }
      ],
      caption: [
        "13px",
        {
          lineHeight: "1.45",
          fontWeight: "500"
        }
      ],
      button: [
        "16px",
        {
          lineHeight: "1",
          fontWeight: "650",
          letterSpacing: "0.005em"
        }
      ],
      label: [
        "13px",
        {
          lineHeight: "1.3",
          fontWeight: "700",
          letterSpacing: "0.08em"
        }
      ],
      stat: [
        "48px",
        {
          lineHeight: "1",
          fontWeight: "800",
          letterSpacing: "-0.02em"
        }
      ]
    },
    spacing: {
      "0": "0px",
      px: "1px",
      "3xs": "var(--space-3xs)",
      "2xs": "var(--space-2xs)",
      xs: "var(--space-xs)",
      sm: "var(--space-sm)",
      md: "var(--space-md)",
      lg: "var(--space-lg)",
      xl: "var(--space-xl)",
      "2xl": "var(--space-2xl)",
      "3xl": "var(--space-3xl)",
      "4xl": "var(--space-4xl)",
      "5xl": "var(--space-5xl)"
    },
    borderRadius: {
      none: "0px",
      xs: "var(--radius-xs)",
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
      full: "var(--radius-full)"
    },
    boxShadow: {
      none: "none",
      sm: "var(--shadow-sm)",
      md: "var(--shadow-md)",
      lg: "var(--shadow-lg)"
    },
    extend: {
      maxWidth: {
        container: "var(--container-max)",
        measure: "var(--measure)"
      },
      height: {
        header: "var(--header-height)",
        control: "var(--control-height)"
      },
      width: {
        sidebar: "var(--cms-sidebar)"
      },
      backgroundImage: {
        scrim: "var(--scrim)",
        overlay: "var(--overlay)"
      },
      transitionTimingFunction: {
        out: "var(--ease-out)"
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)"
      }
    }
  }
};

const plugin = require('tailwindcss/plugin');
module.exports.plugins = [
  plugin(({ addUtilities }) => addUtilities({
    '.display-width': { fontVariationSettings: '"wdth" 92' },
    '.tabular': { fontVariantNumeric: 'tabular-nums' },
  })),
];
