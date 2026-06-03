interface LiveDotProps {
  color?: string;
  size?: number;
}

export function LiveDot({ color = 'var(--accent)', size = 8 }: LiveDotProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          animation: 'bookrPing 1.8s cubic-bezier(0,0,.2,1) infinite',
        }}
      />
      <span
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
        }}
      />
    </span>
  );
}
