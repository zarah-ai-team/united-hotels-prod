import { Link } from "react-router";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, MapPin, Sparkles, TrendingUp, Heart, Users, Home, Building2, Coffee } from "lucide-react";
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
            <Link to="/" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Destinations
            </Link>
            <Link to="/listing" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Hotels
            </Link>
            <Link to="/" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Neighborhoods
            </Link>
            <Link to="/blog" className="text-[#1abc9c] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]">
              Travel Guides
            </Link>
            <Link to="/support" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Support
            </Link>
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

export function BlogArticlePage() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      {/* Back Button */}
      <div className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10 py-4">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Travel Guides
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white">
        <div className="max-w-[1200px] mx-auto px-10 py-16">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="bg-[#1abc9c] text-white px-4 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-[14px]">
              Travel Tips
            </span>
          </div>

          {/* Title */}
          <h1 className="font-['Poppins:Bold',sans-serif] text-[56px] leading-[68px] text-[#3b3b3b] mb-6">
            Where to Stay in Turkey: Complete Neighborhood Guide
          </h1>

          {/* Meta Information */}
          <div className="flex items-center justify-between pb-8 border-b border-[#eaeaea] mb-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Calendar className="w-4.5 h-4.5" />
                <span className="font-['Inter:Regular',sans-serif] text-[15px]">February 28, 2025</span>
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Clock className="w-4.5 h-4.5" />
                <span className="font-['Inter:Regular',sans-serif] text-[15px]">8 min read</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 border border-[#eaeaea] rounded-lg hover:border-[#1abc9c] hover:text-[#1abc9c] transition-colors">
                <Share2 className="w-4.5 h-4.5" />
              </button>
              <button className="p-2.5 border border-[#eaeaea] rounded-lg hover:border-[#1abc9c] hover:text-[#1abc9c] transition-colors">
                <Bookmark className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl overflow-hidden mb-10">
            <img 
              src="https://images.unsplash.com/photo-1719147145383-9cbd4b382525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMHRyYXZlbCUyMGd1aWRlJTIwYmx1ZSUyMG1vc3F1ZXxlbnwxfHx8fDE3NzI3MDM2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Turkey Blue Mosque"
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            {/* Introduction */}
            <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#3b3b3b] leading-[32px] mb-8">
              Choosing where to stay in Turkey can make or break your trip. This ancient city straddles two continents and is divided into distinct neighborhoods, each with its own character, atmosphere, and advantages. Whether you're a first-time visitor or a returning traveler, this guide will help you find the perfect area for your Turkey stay.
            </p>

            {/* Section 1 */}
            <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6">
              Sultanahmet & Fatih: Historic Heart
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6">
              <strong>Best for:</strong> First-time visitors, history enthusiasts, and those who want to be walking distance from major landmarks.
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6">
              Sultanahmet is Turkey's Old City, home to iconic sites like the Blue Mosque, Hagia Sophia, and Topkapi Palace. This area puts you at the center of Byzantine and Ottoman history, with countless restaurants, cafes, and shops catering to tourists.
            </p>

            <div className="bg-[#f0fdf4] border-l-4 border-[#1abc9c] p-6 rounded-r-xl mb-8">
              <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#1abc9c] mb-2">
                💡 Local Tip
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b] leading-[24px]">
                While Sultanahmet is convenient for sightseeing, it can feel touristy. For a more authentic experience, explore nearby Fatih where locals live and shop.
              </p>
            </div>

            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mt-8 mb-4">
              Pros of Staying in Sultanahmet:
            </h3>
            <ul className="space-y-3 mb-8">
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Walking distance to major attractions</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Good public transport connections</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Wide range of hotel options and budgets</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Easy airport access via tramway</span>
              </li>
            </ul>

            {/* Section 2 */}
            <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6">
              Taksim & Beyoğlu: Modern Turkey
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6">
              <strong>Best for:</strong> Nightlife seekers, foodies, art lovers, and those who prefer modern city vibes.
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-8">
              Taksim Square and the surrounding Beyoğlu district represent modern Turkey. This area is known for Istiklal Street, a bustling pedestrian avenue lined with shops, cafes, restaurants, and historic buildings. It's the heart of Turkey's nightlife and cultural scene.
            </p>

            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mt-8 mb-4">
              Highlights:
            </h3>
            <ul className="space-y-3 mb-8">
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Vibrant nightlife with rooftop bars and clubs</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Excellent restaurants from street food to fine dining</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Art galleries and cultural centers</span>
              </li>
              <li className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] flex items-start gap-3">
                <span className="text-[#1abc9c] text-[20px] font-bold">•</span>
                <span>Great shopping from high-street brands to boutiques</span>
              </li>
            </ul>

            {/* Section 3 */}
            <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6">
              Kadıköy: Authentic Local Experience
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6">
              <strong>Best for:</strong> Travelers seeking authentic local life, food markets, and a relaxed atmosphere away from tourist crowds.
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-8">
              Located on the Asian side of Turkey, Kadıköy offers a more laid-back, authentic Turkey experience. This neighborhood is beloved by locals for its vibrant street markets, indie cafes, and waterfront promenade. While it requires a ferry ride to reach European-side attractions, many travelers find the authentic atmosphere worth it.
            </p>

            {/* Comparison Table */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl overflow-hidden my-10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      <th className="px-6 py-4 text-left font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">Neighborhood</th>
                      <th className="px-6 py-4 text-left font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">Avg. Price/Night</th>
                      <th className="px-6 py-4 text-left font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">Atmosphere</th>
                      <th className="px-6 py-4 text-left font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    <tr>
                      <td className="px-6 py-4 font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b]">Sultanahmet</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">$45-75</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">Historic, Touristy</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">First-timers</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b]">Taksim/Beyoğlu</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">$50-85</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">Modern, Vibrant</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">Nightlife lovers</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b]">Kadıköy</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">$35-60</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">Local, Authentic</td>
                      <td className="px-6 py-4 font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">Culture seekers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Recommendations */}
            <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[48px] text-[#3b3b3b] mt-12 mb-6">
              Our Recommendations
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-6">
              For first-time visitors on a short trip (3-5 days), we recommend staying in <strong>Sultanahmet</strong> to maximize sightseeing time. If you're returning or staying longer, consider <strong>Beyoğlu</strong> for a more vibrant local experience, or <strong>Kadıköy</strong> for authentic neighborhood life.
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#4b5563] leading-[30px] mb-8">
              No matter where you choose to stay, Turkey's excellent public transport system makes it easy to explore all neighborhoods during your visit.
            </p>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="py-16 bg-[#fafafa]">
        <div className="max-w-[1840px] mx-auto px-10">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#3b3b3b] mb-10">
            Related Articles
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                title: "Cheapest Neighborhoods in Turkey",
                excerpt: "Save money without sacrificing quality in these budget-friendly areas.",
                image: "https://images.unsplash.com/photo-1668858865404-1d38f27d4217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMHN0cmVldCUyMHZpZXd8ZW58MXx8fHwxNzcyNzAzNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080"
              },
              {
                title: "Best Time to Visit Turkey",
                excerpt: "Plan your trip with our month-by-month weather and events guide.",
                image: "https://images.unsplash.com/photo-1651468326487-212eda71a61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGJvc3Bob3J1cyUyMHN1bnNldHxlbnwxfHx8fDE3NzI2MTc4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
              },
              {
                title: "Turkish Breakfast Guide",
                excerpt: "Experience authentic kahvaltı at the best local spots.",
                image: "https://images.unsplash.com/photo-1772550863378-dfa7bf415278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc3RhbmJ1bCUyMGZvb2QlMjB0dXJraXNoJTIwY3Vpc2luZXxlbnwxfHx8fDE3NzI3MDM2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
              }
            ].map((article, index) => (
              <Link 
                key={index} 
                to="/blog"
                className="bg-white rounded-xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-2 group-hover:text-[#1abc9c] transition-colors">
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

      {/* CTA Section */}
      <section className="py-20 bg-[#1abc9c]">
        <div className="max-w-[800px] mx-auto px-10 text-center">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-white mb-6">
            Ready to Book Your Turkey Hotel?
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[18px] text-white/95 mb-8">
            Find the perfect hotel in your chosen neighborhood with our direct rates
          </p>
          
          <Link 
            to="/listing"
            className="inline-block bg-white text-[#1abc9c] px-10 py-4 rounded-xl hover:shadow-2xl transition-all font-['Inter:Bold',sans-serif] text-[16px]"
          >
            Browse Hotels in Turkey
          </Link>
        </div>
      </section>
    </div>
  );
}

export default BlogArticlePage;