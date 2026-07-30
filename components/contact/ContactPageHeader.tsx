"use client"

import PageHeader from "@/components/PageHeader"
import { useT } from "@/components/i18n/LocaleProvider"

export default function ContactPageHeader() {
  const t = useT()
  return (
    <PageHeader
      label={t("contact.pageLabel")}
      title={t("contact.pageTitle")}
      subtitle={t("contact.pageSubtitle")}
    />
  )
}
