'use client'

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-white px-4 py-5">{children}</div>
      <div className="h-2 bg-gray-100 w-full" />
    </>
  );
}