import type { BlogBlock, BlogPost as ServiceBlogPost } from '@/shared/api/services';
import type { BlogPost, BlogPostSummary } from '@/shared/server/blog';
import { SITE, abs, breadcrumbLd, blogPostingLd } from '@/shared/lib/seo';
import { BlogBlocks } from './BlogBlocks';

// Fully server-rendered blog article. Every piece of content — H1, cover, byline,
// body blocks, related links, CTA — is in the initial HTML with NO client fetch,
// so crawlers (and no-JS clients) get the complete article and Google can index
// it. Interactivity isn't needed on a content page; links are real <a href>.
//
// Pure server component (no 'use client', no hooks). Reuses <BlogBlocks>, which
// is itself hook-free and safe to render on the server.
export default function BlogArticleServer({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPostSummary[];
}) {
  const body: BlogBlock[] = Array.isArray(post.body) ? post.body : [];

  // Synthesise the positional header blocks the same way the client page does,
  // so posts without explicit title/author/cover blocks still get an H1, byline
  // and hero (and therefore an on-page <h1> for SEO).
  const has = (t: BlogBlock['type']) => body.some((b) => b?.type === t);
  const synthetic: BlogBlock[] = [];
  if (!has('title')) synthetic.push({ type: 'title' });
  if (!has('author')) synthetic.push({ type: 'author' });
  if (!has('cover') && post.coverImage) synthetic.push({ type: 'cover' });
  const blocks: BlogBlock[] = [...synthetic, ...body];

  const url = abs(`/${post.slug}`);
  const jsonLd = [
    blogPostingLd({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      authorName: post.author?.name,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
      section: post.category,
    }),
    breadcrumbLd([
      { href: '/', label: 'Home' },
      { href: '/blog', label: 'Travel Guides' },
      { href: `/${post.slug}`, label: post.title },
    ]),
  ];

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}

      {/* Lightweight server header (matches the destination/landing pages). */}
      <header className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/united-hotels-logo.png"
              alt="United Hotels - bookunitedhotels.com"
              width={851}
              height={392}
              style={{ height: 34, width: 'auto' }}
            />
          </a>
          <a
            href="/listing"
            style={{
              background: '#2F80ED',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Search hotels
          </a>
        </div>
      </header>

      {/* Breadcrumb — crawlable internal links matching the JSON-LD trail. */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-[#eaeaea]">
        <ol className="max-w-[1200px] mx-auto px-5 md:px-10 py-3 flex flex-wrap gap-2 text-[13px] text-[#6b7280] list-none">
          <li><a href="/" className="hover:text-[#2F80ED]">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/blog" className="hover:text-[#2F80ED]">Travel Guides</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-[#3b3b3b]">{post.title}</li>
        </ol>
      </nav>

      {/* The article itself — full content in the server HTML. */}
      <article className="bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-16">
          <BlogBlocks blocks={blocks} post={post as unknown as ServiceBlogPost} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-10 md:py-16 bg-[#fafafa]">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[36px] text-[#3b3b3b] mb-6 md:mb-10">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {related.map((article) => (
                <a
                  key={article.id}
                  href={`/${article.slug}`}
                  className="bg-white rounded-xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-shadow group block"
                >
                  {article.coverImage ? (
                    <div className="h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-2 group-hover:text-[#2F80ED] transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt ? (
                      <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                        {article.excerpt}
                      </p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conversion CTA into the booking funnel. */}
      <section className="py-12 md:py-20 bg-[#2F80ED]">
        <div className="max-w-[800px] mx-auto px-5 md:px-10 text-center">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] leading-[34px] md:text-[40px] md:leading-[52px] text-white mb-4 md:mb-6">
            Ready to Book Your Turkey Hotel?
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] md:text-[18px] text-white/95 mb-6 md:mb-8">
            Find the perfect hotel in your chosen neighborhood with our direct rates
          </p>
          <a
            href="/listing"
            className="inline-block bg-white text-[#2F80ED] px-8 py-3.5 md:px-10 md:py-4 rounded-xl hover:shadow-2xl transition-all font-['Inter:Bold',sans-serif] text-[15px] md:text-[16px]"
          >
            Browse Hotels in Turkey
          </a>
        </div>
      </section>

      {/* Business identity — local-SEO signal in crawlable text. */}
      <footer className="bg-white border-t border-[#eaeaea]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 text-[13px] text-[#6b7280]">
          <strong className="text-[#3b3b3b]">{SITE.name}</strong>
          <address className="not-italic mt-1">
            {SITE.address.streetAddress}, {SITE.address.addressLocality}, {SITE.address.addressRegion}{' '}
            {SITE.address.postalCode}, Türkiye — <a className="hover:text-[#2F80ED]" href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a>
          </address>
          <p className="mt-2">
            <a className="hover:text-[#2F80ED]" href="/blog">All travel guides</a> ·{' '}
            <a className="hover:text-[#2F80ED]" href="/listing">Browse hotels</a> ·{' '}
            <a className="hover:text-[#2F80ED]" href="/">Home</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
