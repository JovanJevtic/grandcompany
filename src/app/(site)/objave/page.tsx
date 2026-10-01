import { Suspense } from 'react'
import Link from 'next/link'
import PostArtDraw from '@/components/posts/PostArtDraw'
import PostList from '@/components/posts/PostList'
import { POSTS, postDate } from '@/lib/posts'
import Pw from '@/components/ui/Pw'

export const metadata = {
  title: 'Objave | Grand Company',
  description: 'Praktični vodiči o suhoj gradnji, izolaciji, fasadi i isporuci.',
}

// Objave: naslov u sredini, jedna istaknuta objava preko cijele širine (crtež lijevo, tekst desno),
// pa mirna mreža ostalih. Crteži ostaju — to je jedino mjesto uz "Po namjeni" i brendove gdje ih ima.
export default function PostsPage() {
  const [featured, ...rest] = POSTS
  return (
    <div className="pb-[16dvh]">
      <header className="px-5 pb-[10dvh] pt-[18dvh] text-center md:pt-[22dvh]">
        <h1 className="display text-[clamp(56px,11vw,190px)]"><Pw>
          Znanje sa <em>gradilišta</em>
        </Pw></h1>
        <p className="mx-auto mt-12 max-w-[38ch] text-[clamp(17px,1.35vw,21px)] italic text-ink/70">
          Kratki vodiči za izbor, obračun i montažu materijala.
        </p>
      </header>

      <Link
        href={`/objave/${featured.slug}`}
        className="group mx-5 grid items-center gap-10 md:mx-10 md:grid-cols-[1.25fr_1fr] md:gap-[6vw]"
        data-cursor="Čitaj"
      >
        <div className="ed-art aspect-[4/3] bg-plate p-[7%] transition-colors duration-700 md:aspect-[16/11]">
          <PostArtDraw kind={featured.art} className="h-full" />
        </div>
        <div className="max-w-[540px] md:pr-[4vw]">
          <p className="label text-ink/50">Najnovije · {featured.tag}</p>
          <h2 className="mt-5 text-[clamp(34px,3.6vw,64px)] leading-[1.02] tracking-[-0.03em] transition-[font-style] group-hover:italic">
            {featured.title}
          </h2>
          <p className="mt-6 max-w-[40ch] text-[17px] leading-[1.5] text-ink/70">{featured.lead}</p>
          <p className="mt-8 flex items-center gap-3 text-[14px] text-ink/55">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden />
            {postDate(featured.date)} · {featured.read} min čitanja
          </p>
        </div>
      </Link>

      <Suspense fallback={<div className="py-20 text-center italic text-ink/50">Učitavanje…</div>}>
        <PostList posts={rest} />
      </Suspense>
    </div>
  )
}
