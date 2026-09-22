import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-on-surface">
      <p className="text-6xl font-black tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-xl font-bold">This page went to find itself in the mempool.</h1>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">
        It never came back. Either the link is wrong, or the page eloped with the liquidity.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary"
      >
        Take me home
      </Link>
    </main>
  );
}
