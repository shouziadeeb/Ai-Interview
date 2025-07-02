import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-900 via-purple-900 to-gray-900 text-white px-4">
      <div className="max-w-2xl w-full text-center space-y-8 py-16">
        <Image src="/globe.svg" alt="Interview AI" width={80} height={80} className="mx-auto mb-4 animate-bounce" />
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow mb-2">AI Interview Coach</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">Practice, record, and get instant feedback on your interview answers. Level up your career with AI-powered mock interviews!</p>
        <Link
          href="/interview"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg text-xl font-semibold hover:scale-105 hover:from-purple-600 hover:to-blue-600 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 animate-fadeIn"
        >
          Start Interview AI
        </Link>
      </div>
    </main>
  );
}
