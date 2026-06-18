/* ─── Globe: pure SVG, zero JS, zero requestAnimationFrame ─── */
export function Globe() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[500px]"
        style={{ overflow: "visible" }}
        aria-label="VoxAgent global reach"
      >
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FFC6" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#007BFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sphereFill" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0b2340" />
            <stop offset="55%" stopColor="#050f23" />
            <stop offset="100%" stopColor="#010510" />
          </radialGradient>
          <radialGradient id="specular" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="92%" stopColor="#00FFC6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#007BFF" stopOpacity="0.05" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx="200" cy="200" r="155" />
          </clipPath>
          <style>{`
            @keyframes globe-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes arc-draw {
              0%   { stroke-dashoffset: 500; opacity: 0; }
              20%  { opacity: 0.9; }
              80%  { opacity: 0.9; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
            .globe-spin {
              transform-origin: 200px 200px;
              animation: globe-spin 28s linear infinite;
            }
            .arc-anim { stroke-dasharray: 500; animation: arc-draw 5s ease-in-out infinite; }
            .arc-1  { animation-delay: 0s; }
            .arc-2  { animation-delay: 1.2s; }
            .arc-3  { animation-delay: 2.4s; }
            .arc-4  { animation-delay: 3.6s; }
            .arc-5  { animation-delay: 0.6s; }
          `}</style>
        </defs>

        {/* Outer glow */}
        <circle cx="200" cy="200" r="200" fill="url(#globeGlow)" />

        {/* Sphere body */}
        <circle cx="200" cy="200" r="155" fill="url(#sphereFill)" />

        {/* Grid lines — clipped to sphere */}
        <g clipPath="url(#globeClip)" opacity="0.2">
          {/* Latitude rings */}
          {[-100, -60, -20, 20, 60, 100].map((offset, i) => (
            <ellipse key={i} cx="200" cy={200 + offset} rx="155" ry={Math.abs(offset) < 20 ? 40 : Math.abs(offset) < 60 ? 28 : 14} fill="none" stroke="#00FFC6" strokeWidth="0.6" />
          ))}
          {/* Longitude arcs — rotating */}
          <g className="globe-spin">
            {[0, 30, 60, 90, 120, 150].map((angle, i) => (
              <ellipse key={i} cx="200" cy="200" rx={Math.abs(Math.cos(angle * Math.PI / 180)) * 155 + 4} ry="155" fill="none" stroke="#007BFF" strokeWidth="0.5"
                transform={`rotate(${angle} 200 200)`} />
            ))}
          </g>
        </g>

        {/* Specular highlight */}
        <circle cx="200" cy="200" r="155" fill="url(#specular)" />

        {/* Atmosphere rim */}
        <circle cx="200" cy="200" r="155" fill="url(#rim)" />
        <circle cx="200" cy="200" r="162" fill="none" stroke="#00FFC6" strokeWidth="1" opacity="0.07" />
        <circle cx="200" cy="200" r="170" fill="none" stroke="#007BFF" strokeWidth="1" opacity="0.04" />

        {/* Animated arcs — CSS keyframe only, 5 total */}
        <g clipPath="url(#globeClip)">
          <path className="arc-anim arc-1" d="M 100 140 Q 200 60 300 150" fill="none" stroke="#00FFC6" strokeWidth="1.2" />
          <path className="arc-anim arc-2" d="M 80 220 Q 200 120 310 200" fill="none" stroke="#007BFF" strokeWidth="1.2" />
          <path className="arc-anim arc-3" d="M 130 280 Q 220 180 320 240" fill="none" stroke="#00FFC6" strokeWidth="1" />
          <path className="arc-anim arc-4" d="M 90 170 Q 180 80 290 180" fill="none" stroke="#007BFF" strokeWidth="1" />
          <path className="arc-anim arc-5" d="M 120 250 Q 230 140 330 260" fill="none" stroke="#00FFC6" strokeWidth="1.2" />
        </g>

        {/* City dots */}
        {[
          [140, 145], [290, 155], [260, 170], [180, 185],
          [310, 220], [100, 200], [230, 260], [160, 235],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={i % 2 === 0 ? "#00FFC6" : "#007BFF"} opacity="0.7" />
        ))}
      </svg>
    </div>
  );
}
