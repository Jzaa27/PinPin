import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#E60023] flex flex-col items-center justify-between p-6 text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#E60023] text-3xl font-bold shadow-lg mb-6">
          P
        </div>
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Temukan ide dan inspirasi visualmu
        </h1>
        <p className="text-white/80 text-lg">
          Simpan hal-hal yang kamu suka dari berbagai belahan dunia.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        <Link
          href="/login"
          className="w-full py-3.5 bg-white text-black font-semibold rounded-full text-center shadow-md hover:bg-gray-100 transition"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="w-full py-3.5 bg-transparent border-2 border-white text-white font-semibold rounded-full text-center hover:bg-white/10 transition"
        >
          Daftar
        </Link>
      </div>
    </main>
  );
}