export default function ProgressBar({ current, total, barColor = '#4D1E22', bgColor = '#E6E4E1' }) {
  const percentage = (current / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: bgColor }}>
      <div className="h-1 transition-all duration-300 ease-out" style={{
        width: `${percentage}%`,
        backgroundColor: barColor
      }} />
    </div>
  );
}
