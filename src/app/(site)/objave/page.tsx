import { Suspense } from 'react'
import Link from 'next/link'
import PostArtDraw from '@/components/posts/PostArtDraw'
import PostList from '@/components/posts/PostList'
import StepBand from '@/components/ui/StepBand'
import { POSTS, postDate } from '@/lib/posts'

export const metadata = {
  title: 'Objave | Grand Company',
  description: 'Praktični vodiči o suhoj gradnji, izolaciji, fasadi i isporuci.',
}

export default function PostsPage() {
  const [featured, ...rest] = POSTS
  return (
    <>
      <section className="gutter flex min-h-[55vh] flex-col justify-end py-16">
        <p className="font-mono text-xs uppercase">Znanje sa stovarišta</p>
        <h1 className="mt-6 text-[clamp(68px,13vw,220px)] uppercase leading-[.88] tracking-[-.03em]">Objave</h1>
        <p className="mt-8 max-w-[50ch] text-xl uppercase">
          Kratki vodiči za izbor, obračun, montažu i isporuku materijala.
        </p>
      </section>
      <StepBand profile="flat-top" tone="navy" className="grid md:grid-cols-2">
        <Link href={`/objave/${featured.slug}`} className="flex flex-col justify-between p-5 py-16 md:p-[8.33vw]">
          <p className="font-mono text-xs uppercase text-accent">Najnovije · {featured.tag}</p>
          <div>
            <h2 className="mt-10 text-title uppercase">{featured.title}</h2>
            <p className="mt-6 max-w-[42ch] font-medium">{featured.lead}</p>
            <p className="mt-8 font-mono text-xs uppercase">
              {postDate(featured.date)} · {featured.read} min čitanja →
            </p>
          </div>
        </Link>
        <div className="min-h-[50vh] border-t border-bg/30 p-5 md:border-l md:border-t-0 md:p-12">
          <PostArtDraw kind={featured.art} className="h-full" />
        </div>
      </StepBand>
      <Suspense fallback={<div className="gutter py-20">Učitavanje…</div>}>
        <PostList posts={rest} />
      </Suspense>
    </>
  )
}
