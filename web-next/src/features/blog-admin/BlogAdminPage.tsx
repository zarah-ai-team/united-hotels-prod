import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  PenSquare, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Eye, Save,
  Send, FileText, Image as ImageIcon, Quote, List as ListIcon, Heading,
  LogOut, ExternalLink, AlertCircle, CheckCircle2, X, Upload,
  Type, User, Minus,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  blogService,
  type BlogBlock,
  type BlogPost,
  type BlogPostSummary,
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
};

export function BlogAdminPage() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState<FormState>(freshForm);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
                    <label className={labelCls}>Category</label>
                    <input
                      className={inputCls}
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      placeholder="Travel Tips"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Read time</label>
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
                      The whole article is built from these blocks — drag order with ↑ ↓, or delete any of them.
                      Title, Cover and Byline pull from the fields above; the rest is your content.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {form.body.map((block, i) => (
                      <BlockEditor
                        key={i}
                        block={block}
                        index={i}
                        total={form.body.length}
                        onChange={(patch) => updateBlock(i, patch)}
                        onMove={(dir) => moveBlock(i, dir)}
                        onRemove={() => removeBlock(i)}
                        onError={(text) => setBanner({ kind: "err", text })}
                      />
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
}: {
  block: BlogBlock;
  index: number;
  total: number;
  onChange: (patch: Record<string, unknown>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onError: (msg: string) => void;
}) {
  const fieldCls =
    "w-full rounded-md border border-[#e2e5ea] px-3 py-2 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";

  return (
    <div className="rounded-xl border border-[#e8eaee] bg-[#fbfcfd] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa1ac]">
          {BLOCK_LABELS[block.type] || block.type}
        </span>
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
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt="" className="h-32 w-full object-cover rounded-md border border-[#e8eaee]" />
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
      )}

      {block.type === "paragraph" && (
        <textarea
          className={`${fieldCls} min-h-[80px] resize-y`}
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Write a paragraph…"
        />
      )}

      {block.type === "quote" && (
        <div className="space-y-2">
          <input
            className={fieldCls}
            value={block.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Label (e.g. Local Tip) — optional"
          />
          <textarea
            className={`${fieldCls} min-h-[60px] resize-y`}
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Callout / tip text"
          />
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
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt={block.caption || ""}
              className="h-32 w-full object-cover rounded-md border border-[#e8eaee]"
            />
          ) : null}
        </div>
      )}

      {block.type === "list" && (
        <ListBlockEditor items={block.items} onChange={(items) => onChange({ items })} />
      )}
    </div>
  );
}

function ListBlockEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const fieldCls =
    "flex-1 rounded-md border border-[#e2e5ea] px-3 py-2 text-[14px] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition";
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[#2F80ED] font-bold">•</span>
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
