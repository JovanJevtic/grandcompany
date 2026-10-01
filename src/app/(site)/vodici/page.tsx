import { Suspense } from 'react'
import Link from 'next/link'
import PostList from '@/components/posts/PostList'
import { POSTS, postDate, postPhoto } from '@/lib/posts'
import Pw, { pw } from '@/components/ui/Pw'

export const metadata = {
  title: 'Vodiči | Grand Company',
  description: 'Praktični vodiči o suhoj gradnji, izolaciji, fasadi i isporuci.',
}

// Vodiči (ranije "Objave"): naslov u sredini, jedna istaknuta objava preko cijele širine (crtež lijevo, tekst desno),
// pa mirna mreža ostalih. Crteži ostaju — to je jedino mjesto uz "Po namjeni" i brendove gdje ih ima.
export default function PostsPage() {
  const [featured, ...rest] = POSTS
  return (
    <div className="pb-[16dvh]">
      <header className="px-5 pb-[10dvh] pt-[18dvh] text-center md:pt-[22dvh]">
        <h1 className="display text-[clamp(56px,11vw,190px)]"><Pw>
          Znanje sa <em>gradilišta</em>
        </Pw></h1>
        <p className="mx-auto mt-12 max-w-[38ch] text-[13px] text-ink/70">
          Kratki vodiči za izbor, obračun i montažu materijala.
        </p>
      </header>

      <Link
        href={`/vodici/${featured.slug}`}
        className="group mx-5 grid items-center gap-10 md:mx-10 md:grid-cols-[1.25fr_1fr] md:gap-[6vw]"
        data-cursor="Čitaj"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-plate md:aspect-[16/11]">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotografija iz /public, već u WebP */}
          <img decoding="async" src={postPhoto(featured.slug)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
        </div>
        <div className="max-w-[540px] md:pr-[4vw]">
          <p className="label text-ink/50">Najnovije · {featured.tag}</p>
          <h2 className="font-pretty mt-5 text-[clamp(36px,3.8vw,68px)] leading-[1.02] transition-colors duration-500 group-hover:text-signal">
            {pw(featured.title)}
          </h2>
          <p className="mt-6 max-w-[40ch] text-[12.5px] leading-[1.5] text-ink/70">{featured.lead}</p>
          <p className="mt-8 flex items-center gap-3 text-[14px] text-ink/55">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden />
            {postDate(featured.date)} · {featured.read} min čitanja
          </p>
        </div>
      </Link>

      <Suspense fallback={<div className="py-20 text-center text-ink/50">Učitavanje…</div>}>
        <PostList posts={rest} />
      </Suspense>
    </div>
  )
}
