import Image from "next/image"
import TeamLoginForm from "@/components/team/TeamLoginForm"

export const metadata = {
  title: "Team Content Calendar | Sauraha Nepal",
  robots: { index: false, follow: false },
}

export default function TeamLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-[20px] border border-border-brand bg-white p-10 shadow-[0_8px_32px_rgba(26,92,42,0.08)]">
        <div className="mb-8 text-center">
          <Image
            src="/one.png"
            alt="Sauraha Nepal"
            width={72}
            height={72}
            className="mx-auto h-[72px] w-[72px] rounded-full object-cover"
          />
          <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
            Team Content Calendar
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Enter the team password to view this month&apos;s plan
          </p>
        </div>
        <TeamLoginForm />
      </div>
    </main>
  )
}
