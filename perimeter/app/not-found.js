import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-lg font-semibold text-ink">CVE not found</h1>
      <p className="mt-2 text-sm text-muted">Check the ID and try again — it may not be in the NVD yet.</p>
      <Link href="/" className="mt-6 inline-block text-sm text-low underline">Back to search</Link>
    </main>
  );
}
