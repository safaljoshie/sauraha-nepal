import { Suspense } from "react"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  )
}
