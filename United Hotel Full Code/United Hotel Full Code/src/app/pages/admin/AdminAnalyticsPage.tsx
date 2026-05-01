import { AdminLayout } from '../../components/admin/AdminLayout';
import { DollarSign, TrendingUp, BarChart2, Globe } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { memo } from 'react';

// Mock data for channel comparison donut chart - stable module-level constant
const channelDataStatic = [
  { id: 'ch1', name: 'Direct', value: 64, color: '#1ABC9C' },
  { id: 'ch2', name: 'OTA', value: 36, color: '#8C8C8C' },
];

// Mock data for monthly comparison - stable module-level constant
const monthlyDataStatic = [
  { id: 'm1', month: 'Jan', direct: 98000, ota: 52000 },
  { id: 'm2', month: 'Feb', direct: 105000, ota: 48000 },
  { id: 'm3', month: 'Mar', direct: 118000, ota: 66000 },
];

// Channel breakdown table data
const channelBreakdown = [
  { channel: 'Direct', bookings: 798, revenue: '$118,080', avgValue: '$148', commission: '$0', savings: '$24,750', color: '#1ABC9C' },
  { channel: 'Booking.com', bookings: 312, revenue: '$46,800', avgValue: '$150', commission: '$7,020', savings: '-', color: '#8C8C8C' },
  { channel: 'Expedia', bookings: 137, revenue: '$19,620', avgValue: '$143', commission: '$3,924', savings: '-', color: '#8C8C8C' },
];

export function AdminAnalyticsPage() {
  return (
    <AdminLayout title="Analytics & Reports" breadcrumb="Admin > Analytics">
      <div className="space-y-8">
        {/* Hero Stat Card - OTA Savings */}
        <div className="bg-gradient-to-br from-[#1ABC9C] to-[#16A085] rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/90 text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                This Month's OTA Commission Savings
              </p>
              <h2 className="text-5xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                $24,750
              </h2>
              <p className="text-white/80 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                By driving <strong>64%</strong> of bookings through your direct channel
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-8 w-8" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Revenue KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="admin-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10 mb-4">
              <DollarSign className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-[#8C8C8C] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              $184,500
            </p>
          </div>

          <div className="admin-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10 mb-4">
              <BarChart2 className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-[#8C8C8C] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Average Daily Rate (ADR)
            </p>
            <p className="text-3xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              $148
            </p>
          </div>

          <div className="admin-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10 mb-4">
              <TrendingUp className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-[#8C8C8C] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              RevPAR
            </p>
            <p className="text-3xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              $115
            </p>
          </div>

          <div className="admin-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10 mb-4">
              <Globe className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-[#8C8C8C] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Avg Booking Value
            </p>
            <p className="text-3xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              $148
            </p>
          </div>
        </div>

        {/* Channel Comparison Section */}
        <div className="admin-card p-6">
          <h3 className="text-xl font-semibold text-[#3B3B3B] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Channel Performance
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Donut Chart */}
            <div key="pie-chart-container">
              <h4 className="text-sm font-semibold text-[#3B3B3B] mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                Booking Distribution
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelDataStatic}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {channelDataStatic.map((entry, index) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      formatter={(value: number) => `${value}%`}
                    />
                    <Legend 
                      wrapperStyle={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div key="bar-chart-container">
              <h4 className="text-sm font-semibold text-[#3B3B3B] mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                Monthly Revenue Comparison
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyDataStatic} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#8C8C8C"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                      tick={{ fill: '#8C8C8C' }}
                      tickLine={false}
                      axisLine={{ stroke: '#EAEAEA' }}
                    />
                    <YAxis 
                      stroke="#8C8C8C"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                      tick={{ fill: '#8C8C8C' }}
                      tickLine={false}
                      axisLine={{ stroke: '#EAEAEA' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #EAEAEA',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px'
                      }}
                    />
                    <Bar dataKey="direct" fill="#1ABC9C" name="Direct" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="ota" fill="#8C8C8C" name="OTA" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Channel Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Avg Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Net Savings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EAEAEA]">
                {channelBreakdown.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="text-sm font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {row.channel}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {row.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {row.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {row.avgValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#EF4444] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {row.commission}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {row.savings === '-' ? (
                        <span className="text-[#8C8C8C]">-</span>
                      ) : (
                        <span className="text-[#22C55E]">{row.savings}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-[#3B3B3B] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Top Guest Countries
            </h3>
            <div className="space-y-3">
              {[
                { country: 'United States', percentage: 32, count: 398 },
                { country: 'United Kingdom', percentage: 24, count: 299 },
                { country: 'Germany', percentage: 18, count: 224 },
                { country: 'France', percentage: 15, count: 187 },
                { country: 'Others', percentage: 11, count: 137 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-[#3B3B3B] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.country}
                    </span>
                    <span className="text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.count} bookings ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EAEAEA] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#1ABC9C] h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-[#3B3B3B] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Booking Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                <div>
                  <p className="text-sm text-[#8C8C8C] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Average Booking Lead Time
                  </p>
                  <p className="text-2xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    18 days
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                <div>
                  <p className="text-sm text-[#8C8C8C] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Average Length of Stay
                  </p>
                  <p className="text-2xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    3.2 nights
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                <div>
                  <p className="text-sm text-[#8C8C8C] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Peak Booking Day
                  </p>
                  <p className="text-2xl font-bold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Thursday
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}