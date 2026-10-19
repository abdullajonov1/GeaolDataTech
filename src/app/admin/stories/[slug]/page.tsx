import { StoryEditor } from '@/components/StoryEditor'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <StoryEditor slug={slug}/>
}
