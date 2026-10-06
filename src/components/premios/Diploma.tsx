/** Diploma enrollado con sello: premio por subir de nivel académico */
export default function Diploma({ tamano = 120, className = "" }: { tamano?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" width={tamano} height={(tamano * 100) / 120} aria-hidden className={`overflow-visible ${className}`}>
      {/* Pergamino */}
      <rect x="14" y="18" width="92" height="60" rx="4" fill="#FEF3C7" />
      <rect x="14" y="18" width="92" height="60" rx="4" fill="none" stroke="#D6B26E" strokeWidth="2" />
      <rect x="8" y="14" width="10" height="68" rx="5" fill="#E9C98A" />
      <rect x="102" y="14" width="10" height="68" rx="5" fill="#E9C98A" />
      {/* Líneas de texto */}
      <rect x="34" y="28" width="52" height="5" rx="2.5" fill="#1E3A8A" />
      {[42, 50, 58].map((y, i) => (
        <rect key={y} x="28" y={y} width={i === 2 ? 40 : 64} height="3" rx="1.5" fill="#D6B26E" />
      ))}
      {/* Cintas y sello */}
      <path d="M78 66 L72 92 L80 86 L86 94 L88 68 Z" fill="#CE1126" />
      <path d="M90 66 L96 92 L88 86 L82 94 L80 68 Z" fill="#003893" />
      <circle cx="84" cy="66" r="11" fill="#F5B700" />
      <circle cx="84" cy="66" r="7.5" fill="none" stroke="#FEF3C7" strokeWidth="1.6" />
      <path d="M84 61 L85.6 64.4 L89.2 64.7 L86.4 67 L87.3 70.6 L84 68.6 L80.7 70.6 L81.6 67 L78.8 64.7 L82.4 64.4 Z" fill="#FEF3C7" />
    </svg>
  );
}
