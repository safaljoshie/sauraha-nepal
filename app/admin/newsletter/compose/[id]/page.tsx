import AdminNewsletterComposer from "@/components/admin/AdminNewsletterComposer"

type PageProps = { params: Promise<{ id: string }> }

export default async function EditNewsletterCampaignPage({ params }: PageProps) {
  const { id } = await params
  return <AdminNewsletterComposer campaignId={id} />
}
