'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { POST_TAGS, postDate, type Post } from '@/lib/posts'
import PostArtDraw from './PostArtDraw'

// Filter po temi (tihi tekstualni izbor u sredini) i mreža objava sa crtežom na polju boje papira.
export default function PostList({ posts }: { posts: Post[] }) {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tag = search.get('tema') ?? 'sve'
  const shown = tag === 'sve' ? posts : posts.filter((post) => post.tag === tag)

  const setTag = (value: string) => {
    const query = new URLSearchParams(search.toString())
    if (value === 'sve') query.delete('tema')
    else query.set('tema', value)
    router.replace(`${pathname}${query.size ? `?${query}` : ''}`, { scroll: false })
  }

  const tags = ['sve', ...POST_TAGS]

  return (
    <section className="mt-[18dvh]">
      <div role="tablist" aria-label="Tema" className="flex flex-wrap justify-center gap-x-8 gap-y-3 px-5 text-[16px]">
        {tags.map((item) => {
          const on = tag === item
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTag(item)}
              className={`relative flex items-center gap-2 transition-colors ${on ? 'italic text-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              <span className={`spark size-2.5 transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} aria-hidden />
              {item === 'sve' ? 'Sve teme' : item}
            </button>
          )
        })}
      </div>

      <div className="mt-[8dvh] grid gap-x-8 gap-y-20 px-5 md:grid-cols-2 md:px-10 xl:grid-cols-3">
        {shown.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/objave/${post.slug}`} className="block" data-cursor="Čitaj">
              <div className="ed-art aspect-[4/3] bg-plate p-[9%]">
                <PostArtDraw kind={post.art} className="h-full transition-transform duration-1000 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
              </div>
              <p className="mt-6 text-[14px] text-ink/50">
                {post.tag} · {post.read} min
              </p>
              <h2 className="mt-2 max-w-[22ch] text-[clamp(24px,2vw,32px)] leading-[1.1] tracking-[-0.02em] transition-[font-style] group-hover:italic">
                {post.title}
              </h2>
              <p className="sr-only">{postDate(post.date)}</p>
            </Link>
          </article>
        ))}
      </div>
      {!shown.length && <p className="mt-16 text-center italic text-ink/50">Nema objava za ovu temu.</p>}
    </section>
  )
}
