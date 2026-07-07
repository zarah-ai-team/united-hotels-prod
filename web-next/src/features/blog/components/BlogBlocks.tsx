import type { ReactNode, CSSProperties } from "react";
import { Calendar, Clock } from "lucide-react";
import type { BlogBlock, BlogPost } from "@/shared/api/services";

// Context the positional blocks (title/cover/author) render from.
type PostContext = Partial<
  Pick<BlogPost, "title" | "category" | "coverImage" | "author" | "publishedAt" | "readTime">
>;

type Align = "left" | "center" | "right";

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

const alignClass = (a?: Align): string =>
  a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

// ── Inline formatting ─────────────────────────────────────────────────────────
// A tiny, SAFE Markdown-ish subset, rendered to real React elements (never
// dangerouslySetInnerHTML) so admin text can't inject markup:
//   **bold**  *italic*  __underline__  [label](url)  {c:#ff0000}coloured{/c}
// Formatting nests (e.g. **{c:red}bold red{/c}**). Link URLs are validated to
// http(s)/relative/mailto and colours to hex/named; anything unsafe renders as
// plain text.
const INLINE_RE =
  /\{c:([^}]+)\}([\s\S]*?)\{\/c\}|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([\s\S]+?)\*/;
const isSafeHref = (u: string): boolean => /^(https?:\/\/|\/|mailto:)/i.test(u.trim());
const isSafeColor = (c: string): boolean =>
  /^#[0-9a-fA-F]{3,8}$/.test(c.trim()) || /^[a-zA-Z]{3,20}$/.test(c.trim());

function renderInline(text: string, keyPrefix = "i"): ReactNode {
  if (!text || !/[*[_{]/.test(text)) return text; // fast path — no markers
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const m = INLINE_RE.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const k = `${keyPrefix}-${key++}`;
    if (m[1] !== undefined) {
      const color = m[1].trim();
      out.push(
        isSafeColor(color) ? (
          <span key={k} style={{ color }}>
            {renderInline(m[2], k)}
          </span>
        ) : (
          renderInline(m[2], k)
        ),
      );
    } else if (m[3] !== undefined) {
      const url = m[4];
      out.push(
        isSafeHref(url) ? (
          <a
            key={k}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2F80ED] underline underline-offset-2 hover:text-[#1E5FBC]"
          >
            {renderInline(m[3], k)}
          </a>
        ) : (
          renderInline(m[3], k)
        ),
      );
    } else if (m[5] !== undefined) {
      out.push(<strong key={k}>{renderInline(m[5], k)}</strong>);
    } else if (m[6] !== undefined) {
      out.push(<u key={k}>{renderInline(m[6], k)}</u>);
    } else if (m[7] !== undefined) {
      out.push(<em key={k}>{renderInline(m[7], k)}</em>);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out.length === 1 ? out[0] : out;
}

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

function CoverBlock({
  url,
  alt,
  caption,
  fit,
}: {
  url: string;
  alt: string;
  caption?: string;
  fit?: "cover" | "contain";
}) {
  return (
    <figure className="my-8">
      <div className={`rounded-2xl overflow-hidden ${fit === "contain" ? "bg-[#f1f5f9]" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className={`w-full h-[500px] ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
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
        {/* Read time is optional — only shown when set. */}
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

// Bullet glyph for a list style. `number` is handled separately (shows index).
const LIST_MARKER: Record<string, string> = { bullet: "•", dash: "–", check: "✓" };

/**
 * Renders an ordered list of blog content blocks into styled article markup.
 * Every value goes through React's normal escaping (no dangerouslySetInnerHTML),
 * so admin-authored content can never inject markup or scripts.
 */
export function BlogBlocks({ blocks, post = {} }: { blocks: BlogBlock[]; post?: PostContext }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  // The category badge belongs to the article as a whole — show it once (on the
  // first title block), never after every section.
  const firstTitleIdx = blocks.findIndex((b) => b.type === "title");

  return (
    <div className="prose max-w-none">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "title":
            return (
              <TitleBlock
                key={i}
                text={block.text || post.title || ""}
                category={i === firstTitleIdx ? post.category : undefined}
              />
            );

          case "cover": {
            const url = block.url || post.coverImage || "";
            if (!url) return null;
            return <CoverBlock key={i} url={url} alt={post.title || ""} caption={block.caption} fit={block.fit} />;
          }

          case "author":
            return <AuthorBlock key={i} post={post} />;

          case "divider":
            return <hr key={i} className="my-10 border-t border-[#eaeaea]" />;

          case "heading": {
            const cls = alignClass(block.align);
            return block.level === 3 ? (
              <h3
                key={i}
                className={`font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mt-8 mb-4 ${cls}`}
              >
                {renderInline(block.text)}
              </h3>
            ) : (
              <h2
                key={i}
                className={`font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6 ${cls}`}
              >
                {renderInline(block.text)}
              </h2>
            );
          }

          case "paragraph":
            return (
              <p
                key={i}
                className={`font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6 ${alignClass(
                  block.align,
                )}`}
              >
                {renderInline(block.text)}
              </p>
            );

          case "quote": {
            // Custom background (validated hex/named) falls back to the mint default.
            const bgOk = block.bg && isSafeColor(block.bg);
            const style: CSSProperties = bgOk ? { backgroundColor: block.bg } : {};
            return (
              <div
                key={i}
                style={style}
                className={`border-l-4 border-[#2F80ED] p-6 rounded-r-xl mb-8 ${bgOk ? "" : "bg-[#f0fdf4]"}`}
              >
                {block.label ? (
                  <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#2F80ED] mb-2">
                    💡 {block.label}
                  </p>
                ) : null}
                <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b] leading-[24px]">
                  {renderInline(block.text)}
                </p>
              </div>
            );
          }

          case "image":
            return (
              <figure key={i} className="my-8">
                <div className={`rounded-2xl overflow-hidden ${block.fit === "contain" ? "bg-[#f1f5f9]" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.url}
                    alt={block.alt || block.caption || ""}
                    className={`w-full max-h-[520px] ${block.fit === "contain" ? "object-contain" : "object-cover"}`}
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

          case "list": {
            const numbered = block.style === "number";
            const marker = LIST_MARKER[block.style || "bullet"] || "•";
            return (
              <ul key={i} className="space-y-3 mb-8">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3"
                  >
                    <span className="text-[#2F80ED] font-bold shrink-0 min-w-[1.2em] text-[18px]">
                      {numbered ? `${j + 1}.` : marker}
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case "table": {
            const showHead = block.headers.some((h) => h && h.trim());
            const striped = block.variant === "striped";
            const bordered = block.variant === "bordered";
            const cellBorder = bordered ? "border border-[#eaeaea]" : "";
            const colAlign = (c: number) => alignClass(block.align?.[c]);
            return (
              <div key={i} className="my-10 rounded-2xl border border-[#eaeaea] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    {showHead ? (
                      <thead className="bg-[#fafafa]">
                        <tr>
                          {block.headers.map((h, j) => (
                            <th
                              key={j}
                              className={`px-6 py-4 font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#3b3b3b] ${colAlign(
                                j,
                              )} ${cellBorder}`}
                            >
                              {renderInline(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    ) : null}
                    <tbody className={bordered ? "" : "divide-y divide-[#eaeaea]"}>
                      {block.rows.map((row, r) => (
                        <tr key={r} className={striped && r % 2 === 1 ? "bg-[#fafafa]" : ""}>
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className={`px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#4b5563] align-top ${colAlign(
                                c,
                              )} ${cellBorder}`}
                            >
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlogBlocks;
