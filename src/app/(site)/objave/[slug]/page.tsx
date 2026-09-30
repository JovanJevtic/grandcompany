import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/catalog/ProductCard'
import PostArtDraw from '@/components/posts/PostArtDraw'
import ReadingProgress from '@/components/posts/ReadingProgress'
import TitleReveal from '@/components/posts/TitleReveal'
import StepBand from '@/components/ui/StepBand'
import { POSTS, postBySlug, postDate, type Block } from '@/lib/posts'
import { PRODUCTS } from '@/lib/shop'

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
  if (block.t === 'p') return <p className="mt-6">{block.text}</p>
  if (block.t === 'list') {
    return <ul className="mt-6 space-y-3">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
  }
  if (block.t === 'note') {
    return (
      <aside className="my-10 border-l-8 border-accent bg-navy p-6 text-bg">
        <p className="font-mono text-sm uppercase">Napomena</p>
        <p className="mt-3">{block.text}</p>
      </aside>
    )
  }
  return (
    <dl className="my-10 border-t-2 border-ink font-mono text-xs uppercase">
      {block.rows.map(([term, value]) => (
        <div key={`${index}-${term}`} className="grid grid-cols-[minmax(100px,1fr)_2fr] gap-4 border-b border-ink py-4">
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

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
  const previous = POSTS[index - 1]
  const next = POSTS[index + 1]

  return (
    <article>
      <ReadingProgress />
      <header className="gutter py-16 md:py-24">
        <p className="font-mono text-xs uppercase">{post.tag} · {postDate(post.date)} · {post.read} min čitanja</p>
        <TitleReveal className="mt-8 max-w-[14ch] text-[clamp(50px,9vw,150px)] uppercase leading-[.88] tracking-[-.03em]">
          {post.title}
        </TitleReveal>
        <p className="mt-10 max-w-[50ch] text-xl uppercase leading-tight">{post.lead}</p>
      </header>
      <StepBand profile="diag-rev" tone="navy" className="gutter py-14">
        <PostArtDraw kind={post.art} title={post.title} className="mx-auto h-[45vh] max-w-5xl" />
      </StepBand>
      <div className="gutter grid gap-12 py-24 md:grid-cols-[220px_minmax(0,720px)] md:justify-center">
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <p className="font-mono text-[11px] uppercase opacity-60">U tekstu</p>
            <nav className="mt-4 flex flex-col">
              {headings.map((heading) => (
                <Link
                  key={heading.text}
                  href={`#${headingId(heading.text)}`}
                  className="border-t border-ink py-3 font-mono text-[11px] uppercase"
                >
                  {heading.text}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className="article-copy">
          {post.body.map((block, blockIndex) => <BodyBlock key={blockIndex} block={block} index={blockIndex} />)}
        </div>
      </div>
      {products.length > 0 && (
        <section className="gutter pb-24">
          <p className="font-mono text-xs uppercase">Artikli iz teksta</p>
          <h2 className="mt-5 text-title uppercase">Materijal za ovaj posao</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} view="grid" />)}
          </div>
        </section>
      )}
      <nav className="grid border-y-2 border-ink md:grid-cols-2">
        {previous ? (
          <Link href={`/objave/${previous.slug}`} className="p-8 md:p-16">
            <span className="font-mono text-xs uppercase">← Prethodna</span>
            <strong className="mt-4 block text-3xl uppercase">{previous.title}</strong>
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/objave/${next.slug}`} className="border-t-2 border-ink p-8 text-right md:border-l-2 md:border-t-0 md:p-16">
            <span className="font-mono text-xs uppercase">Sljedeća →</span>
            <strong className="mt-4 block text-3xl uppercase">{next.title}</strong>
          </Link>
        )}
      </nav>
    </article>
  )
}
