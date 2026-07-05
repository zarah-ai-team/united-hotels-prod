import { Calendar, Clock } from "lucide-react";
import type { BlogBlock, BlogPost } from "@/shared/api/services";

// Context the positional blocks (title/cover/author) render from.
type PostContext = Partial<
  Pick<BlogPost, "title" | "category" | "coverImage" | "author" | "publishedAt" | "readTime">
>;

const formatDate = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "UH";

function TitleBlock({ text, category }: { text: string; category?: string }) {
  return (
    <div className="mb-6">
      {category ? (
        <div className="mb-6">
          <span className="bg-[#2F80ED] text-white px-4 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-[14px]">
            {category}
          </span>
        </div>
      ) : null}
      <h1 className="font-['Poppins:Bold',sans-serif] text-[56px] leading-[68px] text-[#3b3b3b]">
        {text}
      </h1>
    </div>
  );
}

function CoverBlock({ url, alt, caption }: { url: string; alt: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="w-full h-[500px] object-cover" />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function AuthorBlock({ post }: { post: PostContext }) {
  const author = post.author;
  const hasAny = author?.name || post.publishedAt || post.readTime;
  if (!hasAny) return null;
  return (
    <div className="flex items-center gap-4 py-6 border-y border-[#eaeaea] my-8 flex-wrap">
      {author?.name ? (
        <div className="flex items-center gap-3">
          {author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={author.name} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#2F80ED] text-white flex items-center justify-center font-['Inter:SemiBold',sans-serif] text-[15px]">
              {initials(author.name)}
            </div>
          )}
          <div>
            <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
              {author.name}
            </div>
            {author.title ? (
              <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                {author.title}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-6 pl-2">
        {post.publishedAt ? (
          <div className="flex items-center gap-2 text-[#6b7280]">
            <Calendar className="w-4.5 h-4.5" />
            <span className="font-['Inter:Regular',sans-serif] text-[15px]">{formatDate(post.publishedAt)}</span>
          </div>
        ) : null}
        {post.readTime ? (
          <div className="flex items-center gap-2 text-[#6b7280]">
            <Clock className="w-4.5 h-4.5" />
            <span className="font-['Inter:Regular',sans-serif] text-[15px]">{post.readTime}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Renders an ordered list of blog content blocks into styled article markup.
 * Every value goes through React's normal escaping (no dangerouslySetInnerHTML),
 * so admin-authored content can never inject markup or scripts.
 *
 * Positional blocks (title/cover/author) pull from `post` so the whole article
 * layout — header included — is reorderable.
 */
export function BlogBlocks({ blocks, post = {} }: { blocks: BlogBlock[]; post?: PostContext }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="prose max-w-none">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "title":
            return <TitleBlock key={i} text={block.text || post.title || ""} category={post.category} />;

          case "cover": {
            const url = block.url || post.coverImage || "";
            if (!url) return null;
            return <CoverBlock key={i} url={url} alt={post.title || ""} caption={block.caption} />;
          }

          case "author":
            return <AuthorBlock key={i} post={post} />;

          case "divider":
            return <hr key={i} className="my-10 border-t border-[#eaeaea]" />;

          case "heading":
            return block.level === 3 ? (
              <h3
                key={i}
                className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mt-8 mb-4"
              >
                {block.text}
              </h3>
            ) : (
              <h2
                key={i}
                className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6"
              >
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p
                key={i}
                className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6"
              >
                {block.text}
              </p>
            );

          case "quote":
            return (
              <div
                key={i}
                className="bg-[#f0fdf4] border-l-4 border-[#2F80ED] p-6 rounded-r-xl mb-8"
              >
                {block.label ? (
                  <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#2F80ED] mb-2">
                    💡 {block.label}
                  </p>
                ) : null}
                <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b] leading-[24px]">
                  {block.text}
                </p>
              </div>
            );

          case "image":
            return (
              <figure key={i} className="my-8">
                <div className="rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.url}
                    alt={block.alt || block.caption || ""}
                    className="w-full max-h-[520px] object-cover"
                    loading="lazy"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="mt-3 text-center font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "list":
            return (
              <ul key={i} className="space-y-3 mb-8">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3"
                  >
                    <span className="text-[#2F80ED] text-[20px] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlogBlocks;
