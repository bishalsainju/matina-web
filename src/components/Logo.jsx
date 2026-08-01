export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#1E3A8A" />
      <circle cx="32" cy="32" r="26" fill="#FAFAF7" />
      <path d="M10 44 L22 24 L29 34 L38 18 L54 44 Z" fill="#1E3A8A" />
      <circle cx="42" cy="22" r="5" fill="#DC2626" />
    </svg>
  )
}
