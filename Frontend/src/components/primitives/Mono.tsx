import type { CSSProperties, ReactNode } from 'react';

interface MonoProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Mono({ children, style, className }: MonoProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 11,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
