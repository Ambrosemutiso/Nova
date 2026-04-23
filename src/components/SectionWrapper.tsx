'use client'

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-white">{children}</div>
      <div className="h-2 bg-gray-100 w-full" />
    </>
  );
}