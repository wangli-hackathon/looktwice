import Link from "next/link";

export default function NotFound() {
  return (
    <div className="border-2 border-ink bg-card p-5">
      <h1 className="font-serif text-3xl">That page is not in the app.</h1>
      <p className="mt-2 text-sm">The decision desk is still on the front page.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium underline">
        Back to a decision
      </Link>
    </div>
  );
}
