export default function Logo({ size = 30 }) {
  const id = `mg${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A59"/>
          <stop offset="100%" stopColor="#C22A48"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id})`}/>
      <path d="M32 47C31 46 16 37 16 25.5C16 19.3 20.8 14.5 27 14.5C29.8 14.5 32 16.8 32 16.8C32 16.8 34.2 14.5 37 14.5C43.2 14.5 48 19.3 48 25.5C48 37 33 46 32 47Z" fill="white"/>
    </svg>
  )
}
