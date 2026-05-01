import { useState } from "react";
import { Link } from "react-router";
import { MapPin, Calendar, Clock, ArrowRight, Search } from "lucide-react";
import svgPaths from "../../imports/svg-nnzqmx1xjq";

// Navigation Component
function Navigation() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-[1840px] mx-auto px-10">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-[26px] w-[28px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                <mask fill="white" id="path-1-inside-1_20_512">
                  <path d={svgPaths.p32095b00} />
                </mask>
                <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
              </svg>
            </div>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1abc9c]">
              United Hotels
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            <a href="/#home" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Home
            </a>
            <a href="/#why-choose-united-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Why Choose United Hotels
            </a>
            <a href="/#featured-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Featured Hotels
            </a>
            <a href="/#quality" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Quality
            </a>
            <a href="/#faqs" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              FAQ
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <Link to="/portal" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors text-[14px] font-['Inter:Medium',sans-serif]">
              Login / Register
            </Link>
            <Link to="/listing" className="bg-[#1abc9c] text-white px-6 py-2.5 rounded-lg hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]">
              Find Hotels
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Blog Article Card
interface BlogCardProps {
  image: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

function BlogCard({ image, category, title, excerpt, date, readTime, slug }: BlogCardProps) {
  return (
    <Link to={`/blog/${slug}`} className="group">
      <article className="bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-[#1abc9c] text-white px-3 py-1.5 rounded-lg font-['Inter:SemiBold',sans-serif] text-[13px]">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <Calendar className="w-4 h-4" />
              <span className="font-['Inter:Regular',sans-serif] text-[13px]">{date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <Clock className="w-4 h-4" />
              <span className="font-['Inter:Regular',sans-serif] text-[13px]">{readTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-3 group-hover:text-[#1abc9c] transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] leading-[24px] mb-4">
            {excerpt}
          </p>

          {/* Read More */}
          <div className="flex items-center gap-2 text-[#1abc9c] font-['Inter:SemiBold',sans-serif] text-[14px]">
            Read More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// Main Blog Page Component
export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Neighborhoods", "Travel Tips", "Budget Travel", "Food & Dining", "Culture"];

  const articles: BlogCardProps[] = [
    {
      image: "https://images.unsplash.com/photo-1719147145383-9cbd4b382525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMHRyYXZlbCUyMGd1aWRlJTIwYmx1ZSUyMG1vc3F1ZXxlbnwxfHx8fDE3NzI3MDM2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Travel Tips",
      title: "Where to Stay in Turkey: Complete Neighborhood Guide",
      excerpt: "Discover the best areas to stay in Turkey based on your travel style, from historic Sultanahmet to vibrant Beyoğlu.",
      date: "Feb 28, 2025",
      readTime: "8 min read",
      slug: "where-to-stay-istanbul-guide"
    },
    {
      image: "https://images.unsplash.com/photo-1668858865404-1d38f27d4217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMG5laWdoYm9yaG9vZCUyMHN0cmVldCUyMHZpZXd8ZW58MXx8fHwxNzcyNzAzNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Budget Travel",
      title: "Cheapest Neighborhoods in Turkey for Budget Travelers",
      excerpt: "Save money without sacrificing quality. Our guide to Turkey's most affordable yet authentic neighborhoods.",
      date: "Feb 25, 2025",
      readTime: "6 min read",
      slug: "cheapest-neighborhoods-istanbul"
    },
    {
      image: "https://images.unsplash.com/photo-1651468326487-212eda71a61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGJvc3Bob3J1cyUyMHN1bnNldHxlbnwxfHx8fDE3NzI2MTc4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Travel Tips",
      title: "Best Time to Visit Turkey: Month-by-Month Guide",
      excerpt: "Plan your Turkey trip with our comprehensive weather, events, and pricing guide throughout the year.",
      date: "Feb 22, 2025",
      readTime: "10 min read",
      slug: "best-time-visit-istanbul"
    },
    {
      image: "https://images.unsplash.com/photo-1589900586776-53db57559c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGJhemFhciUyMG1hcmtldHxlbnwxfHx8fDE3NzI3MDM2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Culture",
      title: "Exploring Turkey's Grand Bazaar: Insider Shopping Guide",
      excerpt: "Navigate one of the world's oldest markets like a local with our expert tips and hidden gem recommendations.",
      date: "Feb 20, 2025",
      readTime: "7 min read",
      slug: "grand-bazaar-shopping-guide"
    },
    {
      image: "https://images.unsplash.com/photo-1772550863378-dfa7bf415278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGZvb2QlMjB0dXJraXNoJTIwY3Vpc2luZXxlbnwxfHx8fDE3NzI3MDM2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Food & Dining",
      title: "Turkish Breakfast Guide: Best Places for Kahvaltı in Turkey",
      excerpt: "Experience authentic Turkish breakfast culture at the best local spots across Turkey.",
      date: "Feb 18, 2025",
      readTime: "5 min read",
      slug: "turkish-breakfast-guide"
    },
    {
      image: "https://images.unsplash.com/photo-1696711068208-f8c902832e65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGdhbGF0YSUyMHRvd2VyfGVufDF8fHx8MTc3MjcwMzYwNnww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Neighborhoods",
      title: "Galata & Karaköy: Turkey's Hippest Neighborhood Guide",
      excerpt: "Discover trendy cafes, art galleries, and historic landmarks in Turkey's most creative district.",
      date: "Feb 15, 2025",
      readTime: "9 min read",
      slug: "galata-karakoy-guide"
    }
  ];

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="font-['Poppins:Bold',sans-serif] text-[56px] leading-[68px] text-[#3b3b3b] mb-6">
              Turkey Travel Guides
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[20px] text-[#6b7280] leading-[32px] mb-10">
              Expert insights, local tips, and comprehensive guides to help you experience Turkey like a local
            </p>

            {/* Search Bar */}
            <div className="relative max-w-[600px] mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
              <input
                type="text"
                placeholder="Search travel guides..."
                className="w-full pl-12 pr-4 py-4 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white py-6 border-b border-[#eaeaea] sticky top-[72px] z-40">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-lg font-['Inter:SemiBold',sans-serif] text-[14px] whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[#1abc9c] text-white'
                    : 'bg-white border border-[#eaeaea] text-[#3b3b3b] hover:border-[#1abc9c]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="grid grid-cols-3 gap-10">
            {filteredArticles.map((article, index) => (
              <BlogCard key={index} {...article} />
            ))}
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280]">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-10 text-center">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-[#3b3b3b] mb-4">
            Get Turkey Travel Tips
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280] mb-8">
            Subscribe to our newsletter for insider tips, hotel deals, and local recommendations
          </p>
          
          <div className="flex gap-3 max-w-[500px] mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20"
            />
            <button className="bg-[#1abc9c] text-white px-8 py-4 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[16px]">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogPage;