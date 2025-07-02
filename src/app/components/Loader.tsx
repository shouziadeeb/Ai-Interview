"use client";
export default function Loader() {
  return (
    <div className="fixed top-0 w-screen h-full flex items-center justify-center bg-white/70 backdrop-blur-sm z-50 ">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
    </div>
  );
}
