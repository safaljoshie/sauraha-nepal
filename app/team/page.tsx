import Image from "next/image"
import TeamLoginForm from "@/components/team/TeamLoginForm"

export const metadata = {
  title: "Team Login | Sauraha Nepal",
  robots: { index: false, follow: false },
}

export default function TeamLoginPage() {
  return (
    <main className="team-shell flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="w-full max-w-md rounded-[20px] border border-border-brand bg-white p-6 shadow-[0_8px_32px_rgba(26,92,42,0.08)] sm:p-10">
        <div className="mb-6 text-center sm:mb-8">
          <Image
            src="/one.png"
            alt="Sauraha Nepal"
            width={72}
            height={72}
            className="mx-auto h-14 w-14 rounded-full object-cover sm:h-[72px] sm:w-[72px]"
          />
          <h1 className="team-title mt-4">Team Portal</h1>
          <p className="team-subtitle mt-1">
            Enter the team password to access calendar, resources and itineraries
          </p>
        </div>
        <TeamLoginForm />
      </div>
    </main>
  )
}
