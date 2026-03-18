import UnifiedHeader from '@/components/public/UnifiedHeader'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UnifiedHeader />
      {children}
    </>
  )
}
