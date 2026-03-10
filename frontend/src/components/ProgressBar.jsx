export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}
