import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-brand-navy-900">EEPISTORE</h1>
        <p className="mt-2 text-neutral-500">Marketplace Jual Beli Mahasiswa PENS</p>
      </div>
      <Link
        href="/products"
        className="rounded-lg bg-brand-navy-900 px-6 py-3 text-white transition-colors hover:bg-brand-navy-700"
      >
        Mulai Belanja
      </Link>
    </main>
  );
}
