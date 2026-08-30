import React from "react";

/**
 * Shared Button — the single source of truth for button styling across the ERP.
 * Encodes the enterprise standard: `rounded-lg` corners, blue primary, semantic
 * variants, consistent focus ring / hover / disabled behaviour.
 *
 * Usage:
 *   <Button onClick={save}>Save</Button>                    // primary
 *   <Button variant="danger" loading={busy}>Delete</Button>
 *   <Button variant="outline" size="sm" leftIcon={<FiPlus/>}>Add</Button>
 *   <Button variant="link">Learn more</Button>
 *   <Button block type="submit">Submit</Button>
 *
 * Props: variant (primary|secondary|outline|ghost|danger|success|warning|link),
 * size (sm|md|lg|icon), block, loading, disabled, leftIcon, rightIcon, type,
 * className (appended last so callers can still tweak), plus any button attrs.
 */

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
  outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400",
  link: "bg-transparent text-blue-600 hover:underline focus:ring-blue-500 !px-0 !py-0",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
  icon: "p-2", // square icon-only button
};

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    type = "button",
    className = "",
    children,
    ...rest
  },
  ref
) {
  const classes = [
    BASE,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
