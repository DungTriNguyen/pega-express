import type { Destination } from "@/domain/schemas";

/**
 * Bản đồ đường bay tối giản: các vòng cung cam (gợi vòng cung logo) tự vẽ từ SGN ra 9 nước.
 * SVG tĩnh + CSS animation (globals.css .route-path) → không tốn JS, chạy sau khi tiêu đề đã hiện.
 */
const SGN = { x: 241, y: 220 };
const VIEW = { x: 170, y: 60, w: 620, h: 260 };

function arc(to: { x: number; y: number }) {
  const mx = (SGN.x + to.x) / 2;
  const my = (SGN.y + to.y) / 2;
  const dx = to.x - SGN.x;
  const dy = to.y - SGN.y;
  const dist = Math.hypot(dx, dy);
  const lift = Math.min(140, 30 + dist * 0.35);
  // điểm điều khiển lệch vuông góc lên trên
  const cx = mx + (dy / dist) * lift * 0.4;
  const cy = my - lift;
  return {
    d: `M${SGN.x} ${SGN.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`,
    len: Math.round(dist * 1.35 + lift),
  };
}

export function RouteMap({
  destinations,
  className,
}: {
  destinations: Pick<Destination, "id" | "iata" | "map">[];
  className?: string;
}) {
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className={className}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.18" />
        </pattern>
      </defs>
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill="url(#dots)" />
      {destinations.map((d, i) => {
        const { d: path, len } = arc(d.map);
        return (
          <g key={d.id} style={{ ["--i" as string]: i, ["--len" as string]: len }}>
            <path d={path} className="route-path" stroke="var(--route-line)" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx={d.map.x} cy={d.map.y} r="3" fill="var(--route-line)" />
            <circle cx={d.map.x} cy={d.map.y} r="3" fill="var(--route-line)" className="route-ping" />
            <text
              x={d.map.x + 6}
              y={d.map.y - 6}
              fill="currentColor"
              fontSize="10"
              fontFamily="var(--font-mono-family), monospace"
              letterSpacing="1.5"
              opacity="0.85"
            >
              {d.iata}
            </text>
          </g>
        );
      })}
      <circle cx={SGN.x} cy={SGN.y} r="5" fill="var(--route-line)" />
      <circle cx={SGN.x} cy={SGN.y} r="10" stroke="var(--route-line)" strokeWidth="1" opacity="0.6" />
      <text
        x={SGN.x - 32}
        y={SGN.y + 22}
        fill="currentColor"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-mono-family), monospace"
        letterSpacing="2"
      >
        SGN
      </text>
    </svg>
  );
}
