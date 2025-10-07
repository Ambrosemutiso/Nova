// components/SystemStatus.tsx
export default function SystemStatus({ status = "All Good", color = "green" }) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium text-${color}-600 bg-${color}-50 px-3 py-1 rounded-full border border-${color}-200`}
    >
      <span className={`w-2.5 h-2.5 bg-${color}-500 rounded-full animate-pulse`} />
      {status}
    </div>
  );
}
