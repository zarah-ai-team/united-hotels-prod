-- Blog CMS schema — standalone, admin-authored travel articles.
-- Runs independently from the main hotel schema so it can be applied on its own
-- (see scripts/initBlog.js). Safe to re-run: everything is IF NOT EXISTS /
-- CREATE OR REPLACE.

BEGIN;

-- Shared trigger fn (also defined in schema.sql). Redeclared here so this file
-- can be applied to a fresh database on its own.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS blog_posts (
  id            bigserial PRIMARY KEY,
  -- The URL path segment the post is published at: /blog/<slug>.
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  excerpt       text,
  category      text,
  cover_image   text,
  -- "Fake user" byline. No FK to users — these are editorial personas the
  -- admin team types in, not real accounts.
  author_name   text,
  author_avatar text,
  author_title  text,
  read_time     text,
  -- Ordered content blocks (heading / paragraph / image / quote / list).
  -- Stored as JSONB so the editor round-trips structure without HTML injection.
  body          jsonb NOT NULL DEFAULT '[]'::jsonb,
  status        text  NOT NULL DEFAULT 'draft',
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published'))
);

COMMENT ON TABLE  blog_posts IS 'Admin-authored blog articles surfaced at /blog and /blog/:slug.';
COMMENT ON COLUMN blog_posts.slug IS 'URL path segment — the post publishes at /blog/<slug>. Unique.';
COMMENT ON COLUMN blog_posts.body IS 'Ordered JSONB content blocks: {type: heading|paragraph|image|quote|list, ...}.';
COMMENT ON COLUMN blog_posts.author_name IS 'Editorial byline persona (not a real user account).';

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);

DROP TRIGGER IF EXISTS trg_blog_posts_set_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_set_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
