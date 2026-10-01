import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/catalog/ProductCard'
import PostArtDraw from '@/components/posts/PostArtDraw'
import ReadingProgress from '@/components/posts/ReadingProgress'
import TitleReveal from '@/components/posts/TitleReveal'
import { POSTS, postBySlug, postDate, type Block } from '@/lib/posts'
import { PRODUCTS } from '@/lib/shop'
import Pw from '@/components/ui/Pw'

const headingId = (text: string) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'dj')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/objave/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = postBySlug(slug)
  return post
    ? { title: `${post.title} | Grand Company`, description: post.lead }
    : { title: 'Objava nije pronađena' }
}

function BodyBlock({ block, index }: { block: Block; index: number }) {
  if (block.t === 'h') return <h2 id={headingId(block.text)}>{block.text}</h2>
  if (block.t === 'p') return <p>{block.text}</p>
  if (block.t === 'list') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.t === 'note') {
    return (
      <aside className="note">
        <p>{block.text}</p>
      </aside>
    )
  }
  return (
    <dl className="spec">
      {block.rows.map(([term, value]) => (
        <div key={`${index}-${term}`}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Članak: naslov u sredini, crtež kao naslovna "fotografija", pa jedan centriran stub teksta.
// Sadržaj (lijevo, sitno) samo na širokom ekranu. Na kraju artikli iz teksta i sljedeća objava.
export default async function ArticlePage({ params }: PageProps<'/objave/[slug]'>) {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) notFound()

  const headings = post.body.filter((block) => block.t === 'h')
  const products = (post.skus ?? []).flatMap((sku) => {
    const product = PRODUCTS.find((item) => item.sku === sku)
    return product ? [product] : []
  })
  const index = POSTS.indexOf(post)
  const next = POSTS[index + 1] ?? POSTS[0]

  return (
    <article className="pb-[14dvh]">
      <ReadingProgress />
      <header className="px-5 pb-[8dvh] pt-[18dvh] text-center md:pt-[22dvh]">
        <p className="text-[14px] text-ink/50">
          {post.tag} · {postDate(post.date)} · {post.read} min čitanja
        </p>
        <TitleReveal className="display mx-auto mt-8 max-w-[16ch] text-[clamp(44px,7.4vw,128px)]"><Pw>{post.title}</Pw></TitleReveal>
        <p className="mx-auto mt-8 max-w-[42ch] text-[clamp(18px,1.5vw,23px)] italic leading-[1.45] text-ink/70">{post.lead}</p>
      </header>

      <div className="ed-art mx-5 bg-plate px-[6%] py-[5%] md:mx-10">
        <PostArtDraw kind={post.art} title={post.title} className="mx-auto h-[38vh] max-w-5xl md:h-[min(56vh,620px)]" />
      </div>

      <div className="relative mt-[12dvh] px-5 md:grid md:grid-cols-[1fr_minmax(0,64ch)_1fr] md:gap-x-12 md:px-10">
        {headings.length > 2 && (
          <nav aria-label="U tekstu" className="hidden self-start text-[13px] lg:sticky lg:top-28 lg:block lg:max-w-[220px]">
            <p className="label text-ink/45">U tekstu</p>
            <ul className="mt-4 space-y-2.5 text-ink/70">
              {headings.map((heading) => (
                <li key={heading.text}>
                  <Link href={`#${headingId(heading.text)}`} className="ulink hover:text-ink">
                    {heading.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="prose-ed mx-auto w-full max-w-[64ch] md:col-start-2">
          {post.body.map((block, blockIndex) => (
            <BodyBlock key={blockIndex} block={block} index={blockIndex} />
          ))}
        </div>
      </div>

      {products.length > 0 && (
        <section className="mt-[18dvh] px-5 md:px-10">
          <h2 className="display text-center text-[clamp(36px,4.6vw,80px)]"><Pw>
            Materijal za <em>ovaj posao</em>
          </Pw></h2>
          <div className="mx-auto mt-[8dvh] grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} view="grid" />
            ))}
          </div>
        </section>
      )}

      {next && next !== post && (
        <Link href={`/objave/${next.slug}`} className="group mt-[18dvh] block px-5 text-center" data-cursor="Čitaj">
          <p className="text-[14px] text-ink/50">Sljedeća objava</p>
          <p className="display mx-auto mt-5 max-w-[18ch] text-[clamp(36px,5vw,88px)] transition-colors duration-500 group-hover:text-signal"><Pw>
            {next.title}
          </Pw></p>
          <span className="mt-8 inline-block size-2 rounded-full bg-signal transition-transform duration-500 group-hover:scale-150" aria-hidden />
        </Link>
      )}
    </article>
  )
}
