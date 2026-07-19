"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-dashed border-[var(--brand)]" />
    </div>
  );
}
