interface SparkLineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function SparkLine({ data, color = '#10b981', width = 72, height = 28, fill = false }: SparkLineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 6) - 3,
  ]);
  const pathD = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  const fillD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible', display: 'block', flexShrink: 0 }}
    >
      {fill && <path d={fillD} fill={color} opacity="0.13" />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}
