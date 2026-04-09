import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const ShareButton = ({ href, label, icon, color }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 ${color}`}>
    {icon}
    <span>{label}</span>
  </a>
);

const RelatedCard = ({ article }) => {
  const authorName = article.author
    ? [article.author.first_name, article.author.last_name].filter(Boolean).join(' ') || article.author.username
    : 'TBSS Team';
  return (
    <Link to={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        {article.hero_image
          ? <img src={article.hero_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-orange-50"><span className="text-3xl">📖</span></div>}
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-semibold text-[#F46B03] bg-orange-50 rounded-full px-2.5 py-0.5 mb-2">
          {article.category_display || article.category}
        </span>
        <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#F46B03] transition-colors line-clamp-2 mb-1">{article.title}</h4>
        <p className="text-xs text-gray-400">{authorName} · {article.read_time_minutes} min read</p>
      </div>
    </Link>
  );
};

const BlogArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/blog/${slug}/`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'not_found' : `HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message === 'not_found' ? 'not_found' : 'error');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />
        <div className="aspect-[16/7] bg-gray-100 rounded-2xl mb-8" />
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">📰</p>
        <h1 className="text-2xl font-bold font-poppins text-gray-900">Article not found</h1>
        <p className="text-gray-500 text-sm">This article may have been removed or the link is incorrect.</p>
        <button onClick={() => navigate('/blog')}
          className="mt-2 px-6 py-2.5 bg-[#F46B03] text-white rounded-full font-semibold text-sm hover:bg-[#C15300] transition-colors">
          Back to Blog
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-500">Failed to load article. <button onClick={() => window.location.reload()} className="underline">Retry</button></p>
      </div>
    );
  }

  const authorName = article.author
    ? [article.author.first_name, article.author.last_name].filter(Boolean).join(' ') || article.author.username
    : 'TBSS Team';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <>
      <Helmet>
        <title>{article.title} — TBSS Literary Hub</title>
        <meta name="description" content={article.content?.slice(0, 160)} />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-[#F46B03]">Home</Link>
            <span className="text-gray-300">›</span>
            <Link to="/blog" className="hover:text-[#F46B03]">Literary Hub</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium line-clamp-1">{article.title}</span>
          </nav>

          {/* Hero image */}
          {article.hero_image && (
            <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-8 shadow-md bg-gray-100">
              <img src={article.hero_image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Category badge */}
          <span className="inline-block text-xs font-semibold text-[#F46B03] bg-orange-50 rounded-full px-3 py-1 mb-4">
            {article.category_display || article.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 font-poppins leading-tight mb-4">{article.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-200 pb-6">
            <span>By <strong className="text-gray-700">{authorName}</strong></span>
            {dateStr && <span>{dateStr}</span>}
            <span>{article.read_time_minutes} min read</span>
          </div>

          {/* Content */}
          <div
            className="prose prose-sm prose-gray max-w-none mb-10 leading-relaxed [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-[#F46B03] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, '<br />') || '' }}
          />

          {/* Share */}
          <div className="border-t border-gray-200 pt-6 mb-10">
            <p className="text-sm font-semibold text-gray-700 mb-3">Share this article</p>
            <div className="flex flex-wrap gap-3">
              <ShareButton
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                label="WhatsApp"
                icon={<WhatsAppIcon />}
                color="bg-[#25D366]"
              />
              <ShareButton
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                label="Share on X"
                icon={<TwitterXIcon />}
                color="bg-black"
              />
              <ShareButton
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                label="Facebook"
                icon={<FacebookIcon />}
                color="bg-[#1877F2]"
              />
            </div>
          </div>

          {/* Related articles */}
          {article.related_posts?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {article.related_posts.map((rel) => (
                  <RelatedCard key={rel.id} article={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogArticlePage;
