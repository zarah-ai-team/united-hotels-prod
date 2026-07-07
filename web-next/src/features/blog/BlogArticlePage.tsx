import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Share2, Bookmark, Loader2, ArrowRight } from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { ZarahBadge } from "@/shared/components/ZarahBadge";
import { useSEO, breadcrumbLd } from "@/shared/hooks/useSEO";
import { blogService, type BlogBlock, type BlogPost, type BlogPostSummary } from "@/shared/api/services";
import { BlogBlocks } from "./components/BlogBlocks";

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPostSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPost(null);

    if (!slug) {
      setStatus("notfound");
      return;
    }

    blogService
      .getBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        if (!found) {
          setStatus("notfound");
          return;
        }
        setPost(found);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("notfound");
      });

    blogService
      .listPublic()
      .then((res) => {
        if (cancelled) return;
        setRelated((res.posts || []).filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useSEO({
    title: post ? `${post.title} | Book United Hotels` : "Travel Guide | Book United Hotels",
    description:
      post?.excerpt ||
      "Travel guides, neighborhood picks, and tips for planning your stay in Turkey.",
    canonical: `/${slug || ""}`,
    ogType: "article",
    jsonLd: breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      ...(post ? [{ name: post.title, url: `/${post.slug}` }] : []),
    ]),
  });

  // The article layout is entirely block-driven. For posts that don't carry
  // explicit title/cover/author blocks (e.g. legacy posts), we synthesise them
  // up top so every article still has an H1, byline and hero — and so SEO
  // always finds a title. Posts authored with their own positional blocks are
  // rendered exactly in the admin's order.
  const renderBlocks: BlogBlock[] = useMemo(() => {
    if (!post) return [];
    const body = Array.isArray(post.body) ? post.body : [];
    const has = (t: BlogBlock["type"]) => body.some((b) => b.type === t);
    const synthetic: BlogBlock[] = [];
    if (!has("title")) synthetic.push({ type: "title" });
    if (!has("author")) synthetic.push({ type: "author" });
    if (!has("cover") && post.coverImage) synthetic.push({ type: "cover" });
    return [...synthetic, ...body];
  }, [post]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      {/* Back Button */}
      <div className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10 py-4 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#2F80ED] hover:text-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Travel Guides
          </Link>
          <div className="flex items-center gap-4">
            <ZarahBadge className="hidden sm:inline-flex" />
            {status === "ready" && (
              <div className="flex items-center gap-3">
                <button className="p-2.5 border border-[#eaeaea] rounded-lg hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors">
                  <Share2 className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 border border-[#eaeaea] rounded-lg hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors">
                  <Bookmark className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="max-w-[1200px] mx-auto px-10 py-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2F80ED] animate-spin" />
        </div>
      )}

      {status === "notfound" && (
        <div className="max-w-[800px] mx-auto px-10 py-28 text-center">
          <h1 className="font-['Poppins:Bold',sans-serif] text-[40px] text-[#3b3b3b] mb-4">
            Article not found
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#6b7280] mb-8">
            This travel guide may have been moved or unpublished.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-6 py-3 rounded-xl hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]"
          >
            Browse all guides
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {status === "ready" && post && (
        <>
          <article className="bg-white">
            <div className="max-w-[1200px] mx-auto px-10 py-16">
              <BlogBlocks blocks={renderBlocks} post={post} />
            </div>
          </article>

          {related.length > 0 && (
            <section className="py-16 bg-[#fafafa]">
              <div className="max-w-[1840px] mx-auto px-10">
                <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#3b3b3b] mb-10">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {related.map((article) => (
                    <Link
                      key={article.id}
                      to={`/${article.slug}`}
                      className="bg-white rounded-xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-shadow group"
                    >
                      <div className="h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-2 group-hover:text-[#2F80ED] transition-colors">
                          {article.title}
                        </h3>
                        <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                          {article.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="py-20 bg-[#2F80ED]">
            <div className="max-w-[800px] mx-auto px-10 text-center">
              <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-white mb-6">
                Ready to Book Your Turkey Hotel?
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[18px] text-white/95 mb-8">
                Find the perfect hotel in your chosen neighborhood with our direct rates
              </p>
              <Link
                to="/listing"
                className="inline-block bg-white text-[#2F80ED] px-10 py-4 rounded-xl hover:shadow-2xl transition-all font-['Inter:Bold',sans-serif] text-[16px]"
              >
                Browse Hotels in Turkey
              </Link>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}

export default BlogArticlePage;
