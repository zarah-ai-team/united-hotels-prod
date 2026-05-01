import { AdminLayout } from '../../components/admin/AdminLayout';
import { User, Users, Bell, CreditCard, Settings as SettingsIcon, Upload, Mail, Plus, Paintbrush, Sun, Moon, Check } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/admin/Modal';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'profile' | 'team' | 'notifications' | 'payment' | 'general' | 'appearance';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'team' as TabType, label: 'Team & Roles', icon: Users },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'payment' as TabType, label: 'Payment & Billing', icon: CreditCard },
    { id: 'general' as TabType, label: 'General', icon: SettingsIcon },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Paintbrush },
  ];

  return (
    <AdminLayout title="Settings" breadcrumb="Admin > Settings">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-[#EAEAEA] p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-[#1ABC9C] text-white'
                      : 'text-[#3B3B3B] hover:bg-[#FAFAFA]'
                    }
                  `}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <h3 className="text-lg font-semibold text-[#3B3B3B] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Profile Settings
              </h3>
              
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1ABC9C] text-white text-2xl font-semibold">
                      AH
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EAEAEA] bg-white text-sm font-medium text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors">
                      <Upload className="h-4 w-4" strokeWidth={1.5} />
                      Upload New Photo
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    defaultValue="Admin User"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      defaultValue="admin@unitedhotels.com"
                      className="w-full rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    defaultValue="+90 555 123 4567"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Change Password */}
                <div className="pt-4 border-t border-[#EAEAEA]">
                  <h4 className="text-base font-semibold text-[#3B3B3B] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] placeholder:text-[#8C8C8C] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] placeholder:text-[#8C8C8C] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] placeholder:text-[#8C8C8C] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button className="px-6 py-3 rounded-lg bg-[#1ABC9C] font-semibold text-white hover:bg-[#16A085] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team & Roles Tab */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Team Members
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1ABC9C] font-semibold text-white hover:bg-[#16A085] transition-colors" onClick={() => setShowInviteModal(true)}>
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Invite Team Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {[
                      { name: 'Admin User', email: 'admin@unitedhotels.com', role: 'Super Admin', status: 'active' },
                      { name: 'John Manager', email: 'john@unitedhotels.com', role: 'Hotel Admin', status: 'active' },
                      { name: 'Sarah Staff', email: 'sarah@unitedhotels.com', role: 'Staff', status: 'active' },
                      { name: 'Mike Assistant', email: 'mike@unitedhotels.com', role: 'Staff', status: 'invited' },
                    ].map((member, index) => (
                      <tr key={index} className="hover:bg-[#FAFAFA]">
                        <td className="px-6 py-4 text-sm text-[#3B3B3B] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {member.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {member.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#1ABC9C]/10 text-[#1ABC9C]">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`
                            inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${member.status === 'active' 
                              ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                              : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            }
                          `}>
                            {member.status === 'active' ? 'Active' : 'Invited'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-[#1ABC9C] hover:text-[#16A085] font-medium">
                            {member.status === 'invited' ? 'Resend' : 'Edit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <h3 className="text-lg font-semibold text-[#3B3B3B] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'New booking notification', description: 'Receive alerts when new bookings are made', checked: true },
                  { label: 'Cancellation alert', description: 'Get notified when bookings are cancelled', checked: true },
                  { label: 'Daily summary email', description: 'Daily digest of bookings and revenue', checked: true },
                  { label: 'Low availability warning', description: 'Alert when rooms available < 3', checked: true },
                  { label: 'Weekly analytics digest', description: 'Weekly performance report', checked: false },
                  { label: 'Guest review notification', description: 'Notify when guests leave reviews', checked: false },
                ].map((notification, index) => (
                  <div key={index} className="flex items-start justify-between p-4 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3B3B3B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {notification.label}
                      </p>
                      <p className="text-xs text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {notification.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={notification.checked}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#EAEAEA] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1ABC9C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ABC9C]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Billing Tab */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <h3 className="text-lg font-semibold text-[#3B3B3B] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Payment & Billing
              </h3>

              <div className="space-y-6">
                {/* Payment Gateway Status */}
                <div className="bg-[#FAFAFA] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-semibold text-[#3B3B3B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Razorpay Account
                      </h4>
                      <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Payment gateway integration
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-[#22C55E]/10 text-[#22C55E]">
                      Connected
                    </span>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8C8C8C]">Transaction fee:</span>
                      <span className="text-[#3B3B3B] font-medium">2.5% + $0.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8C8C]">Payout schedule:</span>
                      <span className="text-[#3B3B3B] font-medium">T+3 days</span>
                    </div>
                  </div>
                </div>

                {/* Recent Payouts */}
                <div>
                  <h4 className="text-base font-semibold text-[#3B3B3B] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Recent Payouts
                  </h4>
                  <div className="space-y-3">
                    {[
                      { date: 'Mar 31, 2026', amount: '$18,450', status: 'Completed' },
                      { date: 'Mar 24, 2026', amount: '$21,230', status: 'Completed' },
                      { date: 'Mar 17, 2026', amount: '$19,870', status: 'Completed' },
                    ].map((payout, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {payout.amount}
                          </p>
                          <p className="text-xs text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {payout.date}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#22C55E]">
                          {payout.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <h3 className="text-lg font-semibold text-[#3B3B3B] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                General Settings
              </h3>

              <div className="space-y-6">
                {/* Platform Name */}
                <div>
                  <label htmlFor="platformName" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Platform Name
                  </label>
                  <input
                    id="platformName"
                    type="text"
                    defaultValue="United Hotels"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Currency */}
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>TRY - Turkish Lira</option>
                    <option>GBP - British Pound</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option>(GMT+03:00) Turkey</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+01:00) Paris</option>
                    <option>(GMT-05:00) New York</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Language Preference
                  </label>
                  <select
                    id="language"
                    className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option>English</option>
                    <option>Türkçe</option>
                    <option>Français</option>
                    <option>Deutsch</option>
                  </select>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-[#EAEAEA]">
                  <h4 className="text-base font-semibold text-[#EF4444] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Danger Zone
                  </h4>
                  <div className="bg-[#EF4444]/5 rounded-xl p-4 border border-[#EF4444]/20">
                    <p className="text-sm text-[#3B3B3B] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Deactivating your hotel will make it unavailable to guests. This action can be reversed.
                    </p>
                    <button className="px-4 py-2 rounded-lg border border-[#EF4444] bg-white font-medium text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors">
                      Deactivate Hotel
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button className="px-6 py-3 rounded-lg bg-[#1ABC9C] font-semibold text-white hover:bg-[#16A085] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
              <h3 className="text-lg font-semibold text-[#3B3B3B] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Appearance
              </h3>
              <p className="text-sm text-[#8C8C8C] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Customize how the dashboard and website look. Your preference is saved locally.
              </p>

              {/* Theme Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Light Theme Card */}
                <button
                  onClick={() => setTheme('light')}
                  className={`relative rounded-xl border-2 p-1 transition-all ${
                    theme === 'light'
                      ? 'border-[#1ABC9C] shadow-lg shadow-[#1ABC9C]/10'
                      : 'border-[#EAEAEA] hover:border-[#8C8C8C]'
                  }`}
                >
                  {theme === 'light' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1ABC9C] rounded-full flex items-center justify-center z-10">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {/* Light Preview */}
                  <div className="rounded-lg overflow-hidden">
                    <div className="bg-white p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-[#1ABC9C]"></div>
                        <div className="h-2 w-16 bg-gray-200 rounded"></div>
                        <div className="h-2 w-12 bg-gray-200 rounded ml-auto"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-full bg-gray-100 rounded"></div>
                        <div className="h-2.5 w-3/4 bg-gray-100 rounded"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-8 flex-1 bg-[#fafafa] rounded border border-gray-100"></div>
                          <div className="h-8 flex-1 bg-[#fafafa] rounded border border-gray-100"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3">
                    <Sun className="w-4 h-4 text-[#FFA500]" />
                    <span className="text-sm font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Light
                    </span>
                  </div>
                </button>

                {/* Dark Theme Card */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`relative rounded-xl border-2 p-1 transition-all ${
                    theme === 'dark'
                      ? 'border-[#1ABC9C] shadow-lg shadow-[#1ABC9C]/10'
                      : 'border-[#EAEAEA] hover:border-[#8C8C8C]'
                  }`}
                >
                  {theme === 'dark' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1ABC9C] rounded-full flex items-center justify-center z-10">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {/* Dark Preview */}
                  <div className="rounded-lg overflow-hidden">
                    <div className="bg-[#0f1419] p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-[#1ABC9C]"></div>
                        <div className="h-2 w-16 bg-[#374151] rounded"></div>
                        <div className="h-2 w-12 bg-[#374151] rounded ml-auto"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-full bg-[#1a1f2e] rounded"></div>
                        <div className="h-2.5 w-3/4 bg-[#1a1f2e] rounded"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-8 flex-1 bg-[#1a1f2e] rounded border border-[#2d3748]"></div>
                          <div className="h-8 flex-1 bg-[#1a1f2e] rounded border border-[#2d3748]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3">
                    <Moon className="w-4 h-4 text-[#818CF8]" />
                    <span className="text-sm font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Dark
                    </span>
                  </div>
                </button>
              </div>

              {/* Quick Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                <div>
                  <p className="text-sm font-medium text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Dark Mode
                  </p>
                  <p className="text-xs text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {theme === 'dark' ? 'Currently using dark theme' : 'Switch to dark theme for reduced eye strain'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#EAEAEA] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1ABC9C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ABC9C]"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Team Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        description="Enter the email address of the team member you want to invite."
      >
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-[#3B3B3B] placeholder:text-[#8C8C8C] focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/20"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button className="px-6 py-3 rounded-lg bg-[#1ABC9C] font-semibold text-white hover:bg-[#16A085] transition-colors">
            Send Invitation
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}