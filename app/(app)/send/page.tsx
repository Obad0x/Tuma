import { SendForm } from "@/components/send-form";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Send USDC to an X handle</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          They claim it with one login — no wallet needed until then.
        </p>
      </div>
      <SendForm />
    </main>
  );
}
