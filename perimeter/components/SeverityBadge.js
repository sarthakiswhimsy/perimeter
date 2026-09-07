const STYLES = {
  CRITICAL: 'bg-critical/15 text-critical border-critical/40',
  HIGH: 'bg-high/15 text-high border-high/40',
  MEDIUM: 'bg-medium/15 text-medium border-medium/40',
  LOW: 'bg-low/15 text-low border-low/40',
  NONE: 'bg-faint/15 text-faint border-faint/40',
  UNKNOWN: 'bg-faint/15 text-faint border-faint/40',
};

export default function SeverityBadge({ severity, score }) {
  const key = (severity || 'UNKNOWN').toUpperCase();
  const style = STYLES[key] || STYLES.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium font-mono ${style}`}>
      {key}{typeof score === 'number' ? ` ${score.toFixed(1)}` : ''}
    </span>
  );
}
