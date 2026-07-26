export function FuturisticNetworkBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="glow-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--network-node)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--network-node)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bg-glow" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="0.25" />
          <stop offset="50%" stopColor="var(--accent-glow)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow" cx="25%" cy="65%" r="50%">
          <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1440" height="900" fill="var(--background)" />

      <rect width="1440" height="900" fill="url(#bg-glow)" />
      <rect width="1440" height="900" fill="url(#hero-glow)" />

      <g stroke="var(--network-line)" strokeWidth="0.5">
        <line x1="100" y1="200" x2="300" y2="100" />
        <line x1="300" y1="100" x2="500" y2="250" />
        <line x1="500" y1="250" x2="300" y2="400" />
        <line x1="300" y1="400" x2="100" y2="200" />
        <line x1="300" y1="100" x2="200" y2="350" />
        <line x1="500" y1="250" x2="200" y2="600" />
        <line x1="200" y1="600" x2="400" y2="700" />
        <line x1="400" y1="700" x2="600" y2="500" />
        <line x1="600" y1="500" x2="500" y2="250" />
        <line x1="200" y1="600" x2="100" y2="200" />
        <line x1="400" y1="700" x2="200" y2="350" />
        <line x1="800" y1="150" x2="1000" y2="80" />
        <line x1="1000" y1="80" x2="1200" y2="200" />
        <line x1="1200" y1="200" x2="1100" y2="400" />
        <line x1="1100" y1="400" x2="900" y2="350" />
        <line x1="900" y1="350" x2="800" y2="150" />
        <line x1="1000" y1="80" x2="950" y2="300" />
        <line x1="1200" y1="200" x2="1300" y2="500" />
        <line x1="1300" y1="500" x2="1100" y2="650" />
        <line x1="1100" y1="650" x2="900" y2="550" />
        <line x1="900" y1="550" x2="900" y2="350" />
        <line x1="1100" y1="650" x2="950" y2="300" />
        <line x1="900" y1="550" x2="1000" y2="80" />
        <line x1="200" y1="800" x2="400" y2="850" />
        <line x1="400" y1="850" x2="600" y2="780" />
        <line x1="600" y1="780" x2="700" y2="700" />
        <line x1="700" y1="700" x2="600" y2="500" />
        <line x1="1000" y1="750" x2="1200" y2="800" />
        <line x1="1200" y1="800" x2="1350" y2="700" />
        <line x1="1350" y1="700" x2="1300" y2="500" />
        <line x1="200" y1="800" x2="600" y2="780" />
        <line x1="600" y1="780" x2="1000" y2="750" />
      </g>

      <g opacity="0.6">
        <circle cx="100" cy="200" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0s" }} />
        <circle cx="300" cy="100" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="500" cy="250" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "1s" }} />
        <circle cx="200" cy="600" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "1.5s" }} />
        <circle cx="400" cy="700" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.3s" }} />
        <circle cx="600" cy="500" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.8s" }} />
        <circle cx="800" cy="150" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "1.2s" }} />
        <circle cx="1000" cy="80" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.2s" }} />
        <circle cx="1200" cy="200" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.7s" }} />
        <circle cx="1100" cy="650" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "1.8s" }} />
        <circle cx="900" cy="550" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.4s" }} />
        <circle cx="1300" cy="500" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "1.3s" }} />
        <circle cx="200" cy="800" r="3" fill="var(--network-node)" className="animate-node-pulse" style={{ animationDelay: "0.9s" }} />
      </g>

      {[100, 300, 500, 200, 400, 600].map((cx, i) => (
        <circle key={cx} cx={cx} cy={[200, 100, 250, 600, 700, 500][i]} r="20" fill="url(#glow-node)" opacity="0.3" />
      ))}

      <line x1="720" y1="0" x2="720" y2="900" stroke="var(--network-line)" strokeWidth="0.3" strokeDasharray="4 8" opacity="0.4" />
    </svg>
  );
}