'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { POST_TAGS, postDate, type Post } from '@/lib/posts'
import PostArtDraw from './PostArtDraw'

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

  return (
    <>
      <div className="gutter flex flex-wrap gap-2 border-b-2 border-ink py-5">
        <button
          type="button"
          onClick={() => setTag('sve')}
          className={`min-h-10 border-2 border-ink px-4 font-mono text-[11px] uppercase ${tag === 'sve' ? 'bg-navy text-bg' : ''}`}
        >
          Sve teme
        </button>
        {POST_TAGS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTag(item)}
            className={`min-h-10 border-2 border-ink px-4 font-mono text-[11px] uppercase ${tag === item ? 'bg-navy text-bg' : ''}`}
          >
            ■ {item}
          </button>
        ))}
      </div>
      <div className="gutter grid gap-x-5 gap-y-14 py-16 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((post) => (
          <article key={post.slug} className="group border-t-2 border-ink pt-4">
            <Link href={`/objave/${post.slug}`}>
              <div className="h-64 bg-well transition-colors group-hover:bg-navy group-hover:text-bg">
                <PostArtDraw kind={post.art} className="h-full p-4" />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase">
                {post.tag} · {postDate(post.date)} · {post.read} min
              </p>
              <h2 className="mt-3 text-[clamp(27px,3vw,48px)] uppercase leading-[.94] tracking-[-.02em]">{post.title}</h2>
              <p className="mt-4 font-medium leading-snug">{post.lead}</p>
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}
