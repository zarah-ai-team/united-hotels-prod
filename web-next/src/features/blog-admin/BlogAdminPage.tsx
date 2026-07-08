import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  PenSquare, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Eye, Save,
  Send, FileText, Image as ImageIcon, Quote, List as ListIcon, Heading,
  LogOut, ExternalLink, AlertCircle, CheckCircle2, X, Upload,
  Type, User, Minus, Bold, Italic, Link as LinkIcon, GripVertical,
  Table as TableIcon, Underline, Palette, AlignLeft, AlignCenter, AlignRight, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  blogService,
  type BlogBlock,
  type BlogPost,
  type BlogPostSummary,
  type BlockAlign,
  type ListStyle,
  type TableVariant,
} from "@/shared/api/services";
import { BlogBlocks } from "@/features/blog/components/BlogBlocks";

// Client-side slug preview (mirrors the backend's slugify). The server
// normalises again on save, so this is only for the live "/blog/…" hint.
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

interface FormState {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  readTime: string;
  status: "draft" | "published";
  body: BlogBlock[];
}

// New posts start fully composed of movable blocks: title → cover → byline →
// a first paragraph. The admin can reorder or delete any of them.
const freshForm = (): FormState => ({
  slug: "",
  title: "",
  excerpt: "",
  category: "",
  coverImage: "",
  authorName: "",
  authorTitle: "",
  authorAvatar: "",
  readTime: "",
  status: "draft",
  body: [
    { type: "title" },
    { type: "cover" },
    { type: "author" },
    { type: "paragraph", text: "" },
  ],
});

// A fresh block of the requested type with sensible empty defaults.
const newBlock = (type: BlogBlock["type"]): BlogBlock => {
  switch (type) {
    case "title":
      return { type: "title", text: "" };
    case "cover":
      return { type: "cover", url: "", caption: "" };
    case "author":
      return { type: "author" };
    case "divider":
      return { type: "divider" };
    case "heading":
      return { type: "heading", level: 2, text: "" };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "quote":
      return { type: "quote", text: "", label: "" };
    case "image":
      return { type: "image", url: "", caption: "", alt: "" };
    case "list":
      return { type: "list", items: [""] };
    case "faq":
      return { type: "faq", items: [{ q: "", a: "" }] };
    case "table":
      return { type: "table", headers: ["Column 1", "Column 2"], rows: [["", ""], ["", ""]] };
    default:
      return { type: "paragraph", text: "" };
  }
};

const inputCls =
  "w-full rounded-lg border border-[#e2e5ea] px-3.5 py-2.5 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
const labelCls = "block text-[13px] font-semibold text-[#374151] mb-1.5";

// Friendly labels shown on each block card.
const BLOCK_LABELS: Record<string, string> = {
  title: "Title",
  cover: "Cover",
  author: "Byline",
  divider: "Divider",
  heading: "Heading",
  paragraph: "Text",
  quote: "Tip",
  image: "Image",
  list: "List",
  faq: "FAQ",
  table: "Table",
};

export function BlogAdminPage() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState<FormState>(freshForm);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  // Drag-to-reorder blocks: index being dragged + the drop target being hovered.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isEditing = form.id != null;

  const loadPosts = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await blogService.listAdmin();
      setPosts(res.posts || []);
    } catch (e: any) {
      setBanner({
        kind: "err",
        text:
          e?.data?.error ||
          "Could not load posts. If this is the first run, apply the DB migration (node scripts/initBlog.js).",
      });
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Auto-dismiss the banner after a few seconds.
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // When creating a new post, mirror the title into the slug until the user
  // types their own slug.
  const onTitleChange = (value: string) => {
    setForm((f) => {
      const next = { ...f, title: value };
      if (!isEditing && (f.slug === "" || f.slug === slugify(f.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const startNew = () => {
    setForm(freshForm());
    setShowPreview(false);
    setBanner(null);
  };

  const editPost = async (id: number) => {
    setBanner(null);
    try {
      const post = await blogService.getAdminById(id);
      setForm({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        coverImage: post.coverImage,
        authorName: post.author?.name || "",
        authorTitle: post.author?.title || "",
        authorAvatar: post.author?.avatar || "",
        readTime: post.readTime,
        status: post.status,
        body: post.body || [],
      });
      setShowPreview(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setBanner({ kind: "err", text: e?.data?.error || "Could not open that post." });
    }
  };

  // ── Block editing ──────────────────────────────────────────────────────────
  const addBlock = (type: BlogBlock["type"]) =>
    set("body", [...form.body, newBlock(type)]);

  // Patch is intentionally loose: `keyof BlogBlock` (a union) collapses to the
  // common `type` key, so a typed partial can't express per-variant fields.
  const updateBlock = (index: number, patch: Record<string, unknown>) =>
    set(
      "body",
      form.body.map((b, i) => (i === index ? ({ ...b, ...patch } as BlogBlock) : b)),
    );

  const removeBlock = (index: number) =>
    set("body", form.body.filter((_, i) => i !== index));

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= form.body.length) return;
    const next = [...form.body];
    [next[index], next[target]] = [next[target], next[index]];
    set("body", next);
  };

  // Drop the currently-dragged block at `target`, shifting the rest.
  const dropBlock = (target: number) => {
    const from = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    if (from === null || from === target) return;
    setForm((f) => {
      const next = [...f.body];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      return { ...f, body: next };
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      setBanner({ kind: "err", text: "Add a title before saving." });
      return;
    }
    setSaving(true);
    setBanner(null);
    const payload = {
      slug: form.slug.trim() || undefined,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      coverImage: form.coverImage.trim(),
      author: {
        name: form.authorName.trim(),
        title: form.authorTitle.trim(),
        avatar: form.authorAvatar.trim(),
      },
      readTime: form.readTime.trim(),
      body: form.body,
      status,
    };
    try {
      const saved = isEditing
        ? await blogService.update(form.id!, payload)
        : await blogService.create(payload);
      setForm((f) => ({ ...f, id: saved.id, slug: saved.slug, status: saved.status }));
      setBanner({
        kind: "ok",
        text:
          status === "published"
            ? `Published — live at /blog/${saved.slug}`
            : "Draft saved.",
      });
      loadPosts();
    } catch (e: any) {
      setBanner({ kind: "err", text: e?.data?.error || "Could not save the post." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) return;
    try {
      await blogService.remove(id);
      if (form.id === id) startNew();
      setBanner({ kind: "ok", text: "Post deleted." });
      loadPosts();
    } catch (e: any) {
      setBanner({ kind: "err", text: e?.data?.error || "Could not delete the post." });
    }
  };

  const previewPost: BlogPost = useMemo(
    () => ({
      id: form.id ?? 0,
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      coverImage: form.coverImage,
      author: { name: form.authorName, title: form.authorTitle, avatar: form.authorAvatar },
      readTime: form.readTime,
      status: form.status,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
      body: form.body,
    }),
    [form],
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Top bar */}
      <header className="bg-[#111827] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PenSquare className="w-5 h-5 text-[#5DA0F8]" />
            <span className="font-['Poppins'] font-bold text-[16px]">United Hotels — Blog Studio</span>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <a
              href="/blog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition"
            >
              View blog <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-white/50">|</span>
            <span className="text-white/70">{user?.name || user?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* ── Posts list ─────────────────────────────────────────────── */}
        <aside className="bg-white rounded-2xl border border-[#e8eaee] p-4 h-fit lg:sticky lg:top-6">
          <button
            onClick={startNew}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-semibold text-[14px] py-2.5 transition mb-4"
          >
            <Plus className="w-4 h-4" /> New post
          </button>

          <div className="text-[12px] font-semibold uppercase tracking-wide text-[#9aa1ac] px-1 mb-2">
            Posts {posts.length ? `(${posts.length})` : ""}
          </div>

          {listLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 text-[#2F80ED] animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-[13px] text-[#9aa1ac] px-1 py-4">No posts yet. Create your first one.</p>
          ) : (
            <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
              {posts.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => editPost(p.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition group ${
                      form.id === p.id ? "bg-[#eaf2fe]" : "hover:bg-[#f5f6f8]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                          p.status === "published" ? "bg-[#22c55e]" : "bg-[#f59e0b]"
                        }`}
                        title={p.status}
                      />
                      <span className="text-[13.5px] font-medium text-[#1f2937] truncate">
                        {p.title || "Untitled"}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#9aa1ac] mt-0.5 pl-3.5 truncate">
                      /blog/{p.slug}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Editor ─────────────────────────────────────────────────── */}
        <main className="min-w-0">
          {banner && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-[14px] ${
                banner.kind === "ok"
                  ? "bg-[#ecfdf3] border border-[#abefc6] text-[#067647]"
                  : "bg-[#fef3f2] border border-[#fecdc9] text-[#b42318]"
              }`}
            >
              {banner.kind === "ok" ? (
                <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
              )}
              <span className="flex-1">{banner.text}</span>
              <button onClick={() => setBanner(null)} className="opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#e8eaee] p-6">
            {/* Editor header + actions */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2F80ED]" />
                <h1 className="font-['Poppins'] font-bold text-[19px] text-[#1f2937]">
                  {isEditing ? "Edit post" : "New post"}
                </h1>
                <span
                  className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    form.status === "published"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fef9c3] text-[#854d0e]"
                  }`}
                >
                  {form.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e5ea] px-3.5 py-2 text-[13.5px] font-medium text-[#374151] hover:border-[#2F80ED] hover:text-[#2F80ED] transition"
                >
                  <Eye className="w-4 h-4" /> {showPreview ? "Editing" : "Preview"}
                </button>
                {isEditing && (
                  <button
                    onClick={() => remove(form.id!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#fecdc9] text-[#b42318] px-3.5 py-2 text-[13.5px] font-medium hover:bg-[#fef3f2] transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                <button
                  onClick={() => save("draft")}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e5ea] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] hover:bg-[#f5f6f8] disabled:opacity-60 transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save draft
                </button>
                <button
                  onClick={() => save("published")}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white px-4 py-2 text-[13.5px] font-semibold disabled:opacity-60 transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish
                </button>
              </div>
            </div>

            {showPreview ? (
              <PreviewPane post={previewPost} />
            ) : (
              <div className="space-y-5">
                {/* Title + slug */}
                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Where to Stay in Istanbul: Complete Guide"
                  />
                </div>

                <div>
                  <label className={labelCls}>Page URL</label>
                  <div className="flex items-stretch rounded-lg border border-[#e2e5ea] overflow-hidden focus-within:ring-2 focus-within:ring-[#2F80ED]/30 focus-within:border-[#2F80ED]">
                    <span className="inline-flex items-center px-3 bg-[#f5f6f8] text-[13px] text-[#6b7280] border-r border-[#e2e5ea] whitespace-nowrap">
                      /
                    </span>
                    <input
                      className="flex-1 px-3 py-2.5 text-[14px] text-[#1f2937] focus:outline-none"
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      onBlur={() => set("slug", slugify(form.slug))}
                      placeholder="where-to-stay-istanbul"
                    />
                  </div>
                  <p className="text-[12px] text-[#9aa1ac] mt-1">
                    Published at{" "}
                    <span className="font-mono text-[#6b7280]">/{slugify(form.slug) || "…"}</span>{" "}
                    (no “/blog/” prefix)
                  </p>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category <span className="font-normal text-[#9aa1ac]">(optional)</span></label>
                    <input
                      className={inputCls}
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      placeholder="Travel Tips"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Read time <span className="font-normal text-[#9aa1ac]">(optional)</span></label>
                    <input
                      className={inputCls}
                      value={form.readTime}
                      onChange={(e) => set("readTime", e.target.value)}
                      placeholder="8 min read"
                    />
                  </div>
                </div>

                {/* Cover image */}
                <div>
                  <label className={labelCls}>Cover image</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      value={form.coverImage}
                      onChange={(e) => set("coverImage", e.target.value)}
                      placeholder="Paste an image URL or upload →"
                    />
                    <UploadButton
                      onUploaded={(url) => set("coverImage", url)}
                      onError={(text) => setBanner({ kind: "err", text })}
                    />
                  </div>
                  {form.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.coverImage}
                      alt="cover preview"
                      className="mt-2 h-40 w-full object-cover rounded-lg border border-[#e8eaee]"
                    />
                  ) : null}
                </div>

                {/* Excerpt */}
                <div>
                  <label className={labelCls}>Excerpt / summary</label>
                  <textarea
                    className={`${inputCls} min-h-[70px] resize-y`}
                    value={form.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    placeholder="One or two sentences shown on the blog card and in search results."
                  />
                </div>

                {/* Author (fake user) */}
                <div className="rounded-xl border border-[#e8eaee] p-4">
                  <div className="text-[13px] font-semibold text-[#374151] mb-3">Author byline</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Name</label>
                      <input
                        className={inputCls}
                        value={form.authorName}
                        onChange={(e) => set("authorName", e.target.value)}
                        placeholder="Elif Demir"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Title / role</label>
                      <input
                        className={inputCls}
                        value={form.authorTitle}
                        onChange={(e) => set("authorTitle", e.target.value)}
                        placeholder="Local Travel Expert"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Avatar image URL (optional)</label>
                    <input
                      className={inputCls}
                      value={form.authorAvatar}
                      onChange={(e) => set("authorAvatar", e.target.value)}
                      placeholder="https://…/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Body blocks */}
                <div>
                  <div className="mb-3">
                    <label className="text-[13px] font-semibold text-[#374151]">Article layout</label>
                    <p className="text-[11.5px] text-[#9aa1ac] mt-0.5">
                      Drag the ⠿ handle (or use ↑ ↓) to reorder any section. Text blocks
                      support <strong>bold</strong>, <em>italic</em> and links; images can crop or fit.
                      Title, Cover and Byline pull from the fields above.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {form.body.map((block, i) => (
                      <div
                        key={i}
                        onDragOver={(e) => {
                          if (dragIndex !== null) {
                            e.preventDefault();
                            setDragOverIndex(i);
                          }
                        }}
                        onDrop={() => dropBlock(i)}
                        className={`rounded-xl transition ${
                          dragOverIndex === i && dragIndex !== null && dragIndex !== i
                            ? "ring-2 ring-[#2F80ED] ring-offset-2"
                            : ""
                        } ${dragIndex === i ? "opacity-40" : ""}`}
                      >
                        <BlockEditor
                          block={block}
                          index={i}
                          total={form.body.length}
                          onChange={(patch) => updateBlock(i, patch)}
                          onMove={(dir) => moveBlock(i, dir)}
                          onRemove={() => removeBlock(i)}
                          onError={(text) => setBanner({ kind: "err", text })}
                          onDragStart={() => setDragIndex(i)}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setDragOverIndex(null);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add-block toolbar */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-[12.5px] text-[#9aa1ac] mr-1">Add block:</span>
                    <AddBtn icon={<Type className="w-3.5 h-3.5" />} label="Title" onClick={() => addBlock("title")} />
                    <AddBtn icon={<ImageIcon className="w-3.5 h-3.5" />} label="Cover" onClick={() => addBlock("cover")} />
                    <AddBtn icon={<User className="w-3.5 h-3.5" />} label="Byline" onClick={() => addBlock("author")} />
                    <AddBtn icon={<Heading className="w-3.5 h-3.5" />} label="Heading" onClick={() => addBlock("heading")} />
                    <AddBtn icon={<FileText className="w-3.5 h-3.5" />} label="Text" onClick={() => addBlock("paragraph")} />
                    <AddBtn icon={<ImageIcon className="w-3.5 h-3.5" />} label="Image" onClick={() => addBlock("image")} />
                    <AddBtn icon={<Quote className="w-3.5 h-3.5" />} label="Tip" onClick={() => addBlock("quote")} />
                    <AddBtn icon={<ListIcon className="w-3.5 h-3.5" />} label="List" onClick={() => addBlock("list")} />
                    <AddBtn icon={<HelpCircle className="w-3.5 h-3.5" />} label="FAQ" onClick={() => addBlock("faq")} />
                    <AddBtn icon={<TableIcon className="w-3.5 h-3.5" />} label="Table" onClick={() => addBlock("table")} />
                    <AddBtn icon={<Minus className="w-3.5 h-3.5" />} label="Divider" onClick={() => addBlock("divider")} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[12px] text-[#9aa1ac] mt-4">
            Signed in as staff · <Link to="/admin" className="underline hover:text-[#6b7280]">Main admin portal</Link>
          </p>
        </main>
      </div>
    </div>
  );
}

// ── Small building blocks ─────────────────────────────────────────────────────

function AddBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e5ea] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#374151] hover:border-[#2F80ED] hover:text-[#2F80ED] transition"
    >
      {icon}
      {label}
    </button>
  );
}

// A tidy row of preset text colours — one click applies instantly, no OS
// dialog. The last swatch opens the native picker for anything custom.
const PRESET_COLORS = ["#E11D48", "#EA580C", "#CA8A04", "#16A34A", "#2F80ED", "#7C3AED", "#0F172A"];

// Inline-formatting toolbar for a textarea. Wraps the current selection in the
// Markdown the public renderer understands: **bold**, *italic*, __underline__,
// [text](url), {c:#hex}coloured{/c}.
//
// Smoothness comes from never losing the selection: every button preventDefaults
// its mousedown, so the textarea keeps focus and the range stays live and
// visible while the mark is applied. The one control that must take focus (the
// native colour input) grabs the range on pointer-down first, so its colour
// still lands on the right text.
function FormatToolbar({
  taRef,
  value,
  onChange,
  noMargin,
}: {
  taRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (v: string) => void;
  noMargin?: boolean;
}) {
  const saved = useRef<{ s: number; e: number }>({ s: 0, e: 0 });
  const grab = () => {
    const ta = taRef.current;
    if (ta) saved.current = { s: ta.selectionStart ?? value.length, e: ta.selectionEnd ?? value.length };
  };
  // Live range if the textarea still holds focus (button path), else the range
  // we grabbed before focus left (colour-dialog path).
  const range = () => {
    const ta = taRef.current;
    if (ta && document.activeElement === ta) {
      return { s: ta.selectionStart ?? value.length, e: ta.selectionEnd ?? value.length };
    }
    return saved.current;
  };
  const reselect = (start: number, len: number) => {
    const ta = taRef.current;
    requestAnimationFrame(() => {
      ta?.focus();
      ta?.setSelectionRange(start, start + len);
    });
  };

  const wrap = (before: string, after: string) => {
    const { s, e } = range();
    const inner = value.slice(s, e) || "text";
    onChange(value.slice(0, s) + before + inner + after + value.slice(e));
    reselect(s + before.length, inner.length);
  };
  const insertLink = () => {
    const { s, e } = range();
    const inner = value.slice(s, e) || "link text";
    const url = window.prompt("Link URL", "https://");
    if (!url) {
      taRef.current?.focus();
      return;
    }
    onChange(value.slice(0, s) + `[${inner}](${url})` + value.slice(e));
    reselect(s + 1, inner.length);
  };
  const applyColor = (color: string) => {
    const { s, e } = range();
    const inner = value.slice(s, e) || "text";
    const open = `{c:${color}}`;
    onChange(value.slice(0, s) + open + inner + `{/c}` + value.slice(e));
    reselect(s + open.length, inner.length);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-0.5 rounded-lg border border-[#e6e8ec] bg-[#fafbfc] px-1.5 py-1 ${
        noMargin ? "" : "mb-2"
      }`}
    >
      <FmtBtn onClick={() => wrap("**", "**")} title="Bold"><Bold className="w-3.5 h-3.5" /></FmtBtn>
      <FmtBtn onClick={() => wrap("*", "*")} title="Italic"><Italic className="w-3.5 h-3.5" /></FmtBtn>
      <FmtBtn onClick={() => wrap("__", "__")} title="Underline"><Underline className="w-3.5 h-3.5" /></FmtBtn>
      <ToolDivider />
      <FmtBtn onClick={insertLink} title="Insert link"><LinkIcon className="w-3.5 h-3.5" /></FmtBtn>
      <ToolDivider />
      <div className="flex items-center gap-1 px-0.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={`Colour ${c}`}
            aria-label={`Apply colour ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyColor(c)}
            className="w-[15px] h-[15px] rounded-full border border-black/10 hover:scale-125 hover:shadow-sm transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
        {/* Custom colour — native picker. Grab the range on pointer-down, before
            the OS dialog takes focus, so the mark still lands on the selection. */}
        <label
          title="Custom colour"
          onMouseDown={grab}
          className="relative inline-flex items-center justify-center w-7 h-7 rounded-md text-[#6b7280] hover:bg-white hover:text-[#1f2937] hover:shadow-sm cursor-pointer transition"
        >
          <Palette className="w-3.5 h-3.5" />
          <input
            type="color"
            onClick={grab}
            onChange={(e) => applyColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Custom text colour"
          />
        </label>
      </div>
    </div>
  );
}

function ToolDivider() {
  return <span className="w-px h-5 bg-[#e6e8ec] mx-0.5" aria-hidden="true" />;
}

function FmtBtn({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      // Keep the textarea focused so the selection survives the click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[#6b7280] hover:bg-white hover:text-[#1f2937] hover:shadow-sm transition"
    >
      {children}
    </button>
  );
}

// Text alignment control for paragraph / heading blocks (text structuring).
function AlignToggle({
  value,
  onChange,
}: {
  value?: "left" | "center" | "right";
  onChange: (v: "left" | "center" | "right") => void;
}) {
  const cur = value || "left";
  const btn = (a: "left" | "center" | "right") =>
    `p-1.5 rounded transition ${cur === a ? "bg-[#2F80ED] text-white" : "text-[#6b7280] hover:bg-[#eef0f3]"}`;
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-[#e2e5ea] p-0.5">
      <button type="button" onClick={() => onChange("left")} className={btn("left")} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onChange("center")} className={btn("center")} title="Align center"><AlignCenter className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onChange("right")} className={btn("right")} title="Align right"><AlignRight className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// Small "B" toggle used in the table editor to bold a whole column or row.
function CellBoldToggle({ active, onClick, title }: { active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition ${
        active ? "bg-[#2F80ED] text-white" : "text-[#6b7280] hover:bg-[#eef0f3]"
      }`}
    >
      <Bold className="w-3.5 h-3.5" />
    </button>
  );
}

// Image display mode: Crop (object-cover — fills, may crop) vs Fit
// (object-contain — the whole image shows, letterboxed).
function FitToggle({
  value,
  onChange,
}: {
  value?: "cover" | "contain";
  onChange: (v: "cover" | "contain") => void;
}) {
  const isCover = value !== "contain";
  const btn = (active: boolean) =>
    `px-2.5 py-1 text-[12px] font-medium transition ${
      active ? "bg-[#2F80ED] text-white" : "bg-white text-[#6b7280] hover:bg-[#f5f6f8]"
    }`;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11.5px] text-[#9aa1ac]">Display:</span>
      <div className="inline-flex rounded-md border border-[#e2e5ea] overflow-hidden">
        <button type="button" onClick={() => onChange("cover")} className={btn(isCover)} title="Crop to fill the frame">
          Crop
        </button>
        <button type="button" onClick={() => onChange("contain")} className={btn(!isCover)} title="Fit the whole image">
          Fit
        </button>
      </div>
    </div>
  );
}

// Small "upload from computer" button — picks a file, uploads it, and hands
// back the public URL. Reused for the cover image and every image block.
function UploadButton({
  onUploaded,
  onError,
}: {
  onUploaded: (url: string) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await blogService.uploadImage(file);
      onUploaded(url);
    } catch (err: any) {
      onError(err?.data?.error || err?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e5ea] bg-white px-3 py-2 text-[13px] font-medium text-[#374151] hover:border-[#2F80ED] hover:text-[#2F80ED] disabled:opacity-60 transition whitespace-nowrap"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {busy ? "Uploading…" : "Upload"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </>
  );
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onError,
  onDragStart,
  onDragEnd,
}: {
  block: BlogBlock;
  index: number;
  total: number;
  onChange: (patch: Record<string, unknown>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onError: (msg: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const fieldCls =
    "w-full rounded-md border border-[#e2e5ea] px-3 py-2 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
  // Shared by the paragraph/quote textarea so the formatting toolbar can wrap
  // the current selection. Only one text block renders per BlockEditor.
  const taRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="rounded-xl border border-[#e8eaee] bg-[#fbfcfd] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Drag to reorder"
            className="cursor-grab active:cursor-grabbing text-[#c3c8d0] hover:text-[#6b7280] -ml-0.5"
          >
            <GripVertical className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa1ac]">
            {BLOCK_LABELS[block.type] || block.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn disabled={index === 0} onClick={() => onMove(-1)} title="Move up">
            <ArrowUp className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn disabled={index === total - 1} onClick={() => onMove(1)} title="Move down">
            <ArrowDown className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn onClick={onRemove} title="Remove" danger>
            <Trash2 className="w-3.5 h-3.5" />
          </IconBtn>
        </div>
      </div>

      {block.type === "title" && (
        <div>
          <input
            className={fieldCls}
            value={block.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Leave blank to use the post title above"
          />
          <p className="text-[11.5px] text-[#9aa1ac] mt-1.5">Renders as the page heading (H1) wherever you place it.</p>
        </div>
      )}

      {block.type === "cover" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className={fieldCls}
              value={block.url ?? ""}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="Blank uses the post cover image — or paste / upload another"
            />
            <UploadButton onUploaded={(url) => onChange({ url })} onError={onError} />
          </div>
          <input
            className={fieldCls}
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <FitToggle value={block.fit} onChange={(fit) => onChange({ fit })} />
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt=""
              className={`h-32 w-full rounded-md border border-[#e8eaee] ${
                block.fit === "contain" ? "object-contain bg-[#f1f5f9]" : "object-cover"
              }`}
            />
          ) : (
            <p className="text-[11.5px] text-[#9aa1ac]">Full-width hero image. Uses the “Cover image” set above unless you override it here.</p>
          )}
        </div>
      )}

      {block.type === "author" && (
        <p className="text-[12.5px] text-[#6b7280]">
          Shows the byline — author name, avatar, publish date and read time. Edit those in the fields above.
        </p>
      )}

      {block.type === "divider" && (
        <div className="border-t border-dashed border-[#d1d5db]" />
      )}

      {block.type === "heading" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              className="rounded-md border border-[#e2e5ea] px-2 py-2 text-[13px] text-[#374151] focus:outline-none"
              value={block.level ?? 2}
              onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 })}
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            <input
              className={fieldCls}
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Section heading"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-[#9aa1ac]">Align:</span>
            <AlignToggle value={block.align} onChange={(align) => onChange({ align })} />
          </div>
        </div>
      )}

      {block.type === "paragraph" && (
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <FormatToolbar taRef={taRef} value={block.text} onChange={(v) => onChange({ text: v })} noMargin />
            <AlignToggle value={block.align} onChange={(align) => onChange({ align })} />
          </div>
          <textarea
            ref={taRef}
            className={`${fieldCls} min-h-[80px] resize-y`}
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Write a paragraph… (select text, then Bold / Italic / Underline / Colour / Link)"
          />
        </div>
      )}

      {block.type === "quote" && (
        <div className="space-y-2">
          <input
            className={fieldCls}
            value={block.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Label (e.g. Local Tip) — optional"
          />
          <div>
            <FormatToolbar taRef={taRef} value={block.text} onChange={(v) => onChange({ text: v })} />
            <textarea
              ref={taRef}
              className={`${fieldCls} min-h-[60px] resize-y`}
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Callout / tip text"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-[#9aa1ac]">Background:</span>
            <input
              type="color"
              value={block.bg || "#f0fdf4"}
              onChange={(e) => onChange({ bg: e.target.value })}
              className="w-7 h-7 p-0.5 rounded-md border border-[#e2e5ea] bg-white cursor-pointer"
              title="Tip background colour"
            />
            {block.bg ? (
              <button type="button" onClick={() => onChange({ bg: undefined })} className="text-[11px] text-[#6b7280] hover:underline">
                reset
              </button>
            ) : null}
          </div>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className={fieldCls}
              value={block.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="Paste an image URL or upload →"
            />
            <UploadButton onUploaded={(url) => onChange({ url })} onError={onError} />
          </div>
          <input
            className={fieldCls}
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <FitToggle value={block.fit} onChange={(fit) => onChange({ fit })} />
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt={block.caption || ""}
              className={`h-32 w-full rounded-md border border-[#e8eaee] ${
                block.fit === "contain" ? "object-contain bg-[#f1f5f9]" : "object-cover"
              }`}
            />
          ) : null}
        </div>
      )}

      {block.type === "list" && (
        <ListBlockEditor
          items={block.items}
          style={block.style}
          onChange={(items) => onChange({ items })}
          onStyleChange={(style) => onChange({ style })}
        />
      )}

      {block.type === "faq" && (
        <FaqBlockEditor items={block.items} onChange={(items) => onChange({ items })} />
      )}

      {block.type === "table" && (
        <TableBlockEditor
          headers={block.headers}
          rows={block.rows}
          variant={block.variant}
          align={block.align}
          boldRows={block.boldRows}
          boldCols={block.boldCols}
          onChange={(patch) => onChange(patch)}
        />
      )}
    </div>
  );
}

const LIST_STYLE_OPTIONS: { value: ListStyle; label: string }[] = [
  { value: "bullet", label: "• Bullet" },
  { value: "number", label: "1. Numbered" },
  { value: "dash", label: "– Dash" },
  { value: "check", label: "✓ Check" },
];

function listMarker(style: ListStyle | undefined, i: number): string {
  switch (style) {
    case "number":
      return `${i + 1}.`;
    case "dash":
      return "–";
    case "check":
      return "✓";
    default:
      return "•";
  }
}

function ListBlockEditor({
  items,
  style,
  onChange,
  onStyleChange,
}: {
  items: string[];
  style?: ListStyle;
  onChange: (items: string[]) => void;
  onStyleChange: (style: ListStyle) => void;
}) {
  const fieldCls =
    "flex-1 rounded-md border border-[#e2e5ea] px-3 py-2 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[11.5px] text-[#9aa1ac]">Bullet style:</span>
        <select
          className="rounded-md border border-[#e2e5ea] px-2 py-1.5 text-[12.5px] text-[#374151] focus:outline-none"
          value={style ?? "bullet"}
          onChange={(e) => onStyleChange(e.target.value as ListStyle)}
        >
          {LIST_STYLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[#2F80ED] font-bold w-6 text-right shrink-0">{listMarker(style, i)}</span>
          <input
            className={fieldCls}
            value={item}
            onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value : it)))}
            placeholder={`List item ${i + 1}`}
          />
          <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} title="Remove item" danger>
            <X className="w-3.5 h-3.5" />
          </IconBtn>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#2F80ED] hover:text-[#1E5FBC] transition"
      >
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>
    </div>
  );
}

// FAQ block: a list of question/answer pairs. The question renders bold and the
// answer as normal text in the published article.
function FaqBlockEditor({
  items,
  onChange,
}: {
  items: { q: string; a: string }[];
  onChange: (items: { q: string; a: string }[]) => void;
}) {
  const fieldCls =
    "w-full rounded-md border border-[#e2e5ea] px-3 py-2 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
  const patch = (i: number, key: "q" | "a", v: string) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-[#eceef1] p-3 space-y-2 bg-[#fbfbfc]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#9aa1ac] shrink-0">Q{i + 1}</span>
            <input
              className={`${fieldCls} font-semibold`}
              value={item.q}
              onChange={(e) => patch(i, "q", e.target.value)}
              placeholder="Question (shown in bold)"
            />
            <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} title="Remove Q&A" danger>
              <X className="w-3.5 h-3.5" />
            </IconBtn>
          </div>
          <textarea
            className={`${fieldCls} min-h-[60px] resize-y`}
            value={item.a}
            onChange={(e) => patch(i, "a", e.target.value)}
            placeholder="Answer (normal text — supports **bold**, *italic*, [links](url))"
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { q: "", a: "" }])}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#2F80ED] hover:text-[#1E5FBC] transition"
      >
        <Plus className="w-3.5 h-3.5" /> Add question
      </button>
    </div>
  );
}

// Grid editor for a table block: a header row + body rows, with add/remove for
// both rows and columns. Columns stay aligned via a CSS grid whose last track
// holds the per-row remove button.
const TABLE_VARIANT_OPTIONS: { value: TableVariant; label: string }[] = [
  { value: "lined", label: "Lined" },
  { value: "striped", label: "Striped rows" },
  { value: "bordered", label: "Bordered" },
];

function TableBlockEditor({
  headers,
  rows,
  variant,
  align,
  boldRows,
  boldCols,
  onChange,
}: {
  headers: string[];
  rows: string[][];
  variant?: TableVariant;
  align?: BlockAlign[];
  boldRows?: number[];
  boldCols?: number[];
  onChange: (patch: {
    headers?: string[];
    rows?: string[][];
    variant?: TableVariant;
    align?: BlockAlign[];
    boldRows?: number[];
    boldCols?: number[];
  }) => void;
}) {
  const cols = headers.length;
  const cellCls =
    "w-full rounded-md border border-[#e2e5ea] px-2.5 py-1.5 text-[13px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr)) 64px`,
    gap: "6px",
    alignItems: "center",
  };

  const colAlign = (c: number): BlockAlign => (align && align[c]) || "left";
  const setColAlign = (c: number, a: BlockAlign) =>
    onChange({ align: Array.from({ length: cols }, (_, i) => (i === c ? a : colAlign(i))) });

  // Whole-column / whole-row bold toggles.
  const isColBold = (c: number) => (boldCols || []).includes(c);
  const isRowBold = (r: number) => (boldRows || []).includes(r);
  const toggleColBold = (c: number) =>
    onChange({ boldCols: isColBold(c) ? (boldCols || []).filter((x) => x !== c) : [...(boldCols || []), c].sort((a, b) => a - b) });
  const toggleRowBold = (r: number) =>
    onChange({ boldRows: isRowBold(r) ? (boldRows || []).filter((x) => x !== r) : [...(boldRows || []), r].sort((a, b) => a - b) });
  // When a row/column is deleted, drop its index and shift the higher ones down.
  const remapDrop = (list: number[] | undefined, removed: number) =>
    (list || []).filter((i) => i !== removed).map((i) => (i > removed ? i - 1 : i));
  const setHeader = (c: number, v: string) =>
    onChange({ headers: headers.map((h, i) => (i === c ? v : h)) });
  const setCell = (r: number, c: number, v: string) =>
    onChange({ rows: rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)) });
  const addColumn = () =>
    onChange({
      headers: [...headers, ""],
      rows: rows.map((r) => [...r, ""]),
      align: Array.from({ length: cols + 1 }, (_, i) => colAlign(i)),
    });
  const removeColumn = (c: number) => {
    if (cols <= 1) return;
    onChange({
      headers: headers.filter((_, i) => i !== c),
      rows: rows.map((r) => r.filter((_, i) => i !== c)),
      align: Array.from({ length: cols }, (_, i) => colAlign(i)).filter((_, i) => i !== c),
      boldCols: remapDrop(boldCols, c),
    });
  };
  const addRow = () => onChange({ rows: [...rows, Array.from({ length: cols }, () => "")] });
  const removeRow = (r: number) => onChange({ rows: rows.filter((_, i) => i !== r), boldRows: remapDrop(boldRows, r) });

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full space-y-1.5">
          {/* Header row */}
          <div style={gridStyle}>
            {headers.map((h, c) => (
              <div key={c} className="relative">
                <input
                  className={`${cellCls} pr-6 font-semibold bg-[#fafafa]`}
                  value={h}
                  onChange={(e) => setHeader(c, e.target.value)}
                  placeholder={`Column ${c + 1}`}
                />
                {cols > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColumn(c)}
                    title="Remove column"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#b42318] hover:bg-[#fef3f2] rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <div />
          </div>
          {/* Per-column: alignment + bold-whole-column toggle */}
          <div style={gridStyle}>
            {headers.map((_, c) => (
              <div key={c} className="flex justify-center items-center gap-1">
                <AlignToggle value={colAlign(c)} onChange={(a) => setColAlign(c, a)} />
                <CellBoldToggle active={isColBold(c)} onClick={() => toggleColBold(c)} title="Bold this column" />
              </div>
            ))}
            <div />
          </div>
          {/* Body rows */}
          {rows.map((row, r) => (
            <div key={r} style={gridStyle}>
              {row.map((cell, c) => (
                <input
                  key={c}
                  className={cellCls}
                  value={cell}
                  onChange={(e) => setCell(r, c, e.target.value)}
                  placeholder="—"
                />
              ))}
              <div className="flex items-center justify-end gap-0.5">
                <CellBoldToggle active={isRowBold(r)} onClick={() => toggleRowBold(r)} title="Bold this row" />
                <IconBtn onClick={() => removeRow(r)} title="Remove row" danger>
                  <X className="w-3.5 h-3.5" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#2F80ED] hover:text-[#1E5FBC] transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#2F80ED] hover:text-[#1E5FBC] transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add column
        </button>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-[11.5px] text-[#9aa1ac]">Style:</span>
          <select
            className="rounded-md border border-[#e2e5ea] px-2 py-1.5 text-[12.5px] text-[#374151] focus:outline-none"
            value={variant ?? "lined"}
            onChange={(e) => onChange({ variant: e.target.value as TableVariant })}
          >
            {TABLE_VARIANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </span>
      </div>
      <p className="text-[11px] text-[#9aa1ac]">
        First row is the header. Use the <span className="font-bold">B</span> toggles to bold a whole column or row.
        Cells also support **bold**, *italic* and [links](url).
      </p>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed ${
        danger ? "text-[#b42318] hover:bg-[#fef3f2]" : "text-[#6b7280] hover:bg-[#eef0f3]"
      }`}
    >
      {children}
    </button>
  );
}

// Preview reuses the exact public renderer, synthesising the same
// title/cover/byline fallbacks the live article page does — so what you see
// here matches what ships.
function PreviewPane({ post }: { post: BlogPost }) {
  const body = Array.isArray(post.body) ? post.body : [];
  const has = (t: BlogBlock["type"]) => body.some((b) => b.type === t);
  const synthetic: BlogBlock[] = [];
  if (!has("title")) synthetic.push({ type: "title" });
  if (!has("author")) synthetic.push({ type: "author" });
  if (!has("cover") && post.coverImage) synthetic.push({ type: "cover" });
  const renderBlocks = [...synthetic, ...body];

  const hasContent = renderBlocks.some(
    (b) => !["title", "cover", "author", "divider"].includes(b.type),
  );

  return (
    <div className="rounded-xl border border-[#e8eaee] overflow-hidden">
      <div className="bg-white p-8 max-w-[1000px] mx-auto">
        <BlogBlocks blocks={renderBlocks} post={post} />
        {!hasContent && (
          <p className="text-[#9aa1ac] text-[15px] mt-4">Add content blocks to see them here.</p>
        )}
      </div>
    </div>
  );
}

export default BlogAdminPage;
