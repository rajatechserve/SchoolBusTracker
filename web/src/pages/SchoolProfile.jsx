import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function SchoolProfile() {
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    county: '',
    phone: '',
    mobile: '',
    logo: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const user = getAuthUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/schools');
      if (res.data?.data && res.data.data.length > 0) {
        const school = res.data.data[0];
        setSchoolId(school.id);
        setForm({
          name: school.name || '',
          address: school.address || '',
          city: school.city || '',
          state: school.state || '',
          county: school.county || '',
          phone: school.phone || '',
          mobile: school.mobile || '',
          logo: school.logo || '',
          photo: school.photo || ''
        });
      }
    } catch (e) {
      setError('Failed to load profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.name.trim()) {
      setError('School name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/schools/${schoolId}`, form);
      setSuccess('Profile updated successfully');
      
      // Refresh user session data
      const schoolRes = await api.get('/schools');
      if (schoolRes.data?.data && schoolRes.data.data.length > 0) {
        const updatedSchool = schoolRes.data.data[0];
        const currentUser = getAuthUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: updatedSchool.name,
            logo: updatedSchool.logo
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.location.reload(); // Refresh to update sidebar logo
        }
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Banner file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">School Profile</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {/* Theme Preference */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Appearance</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Theme Preference
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="font-medium">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('auto')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                theme === 'auto'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Auto</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {theme === 'auto' ? 'Theme follows your system preference' : `Currently using ${theme} mode`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
        {/* School Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            School Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter school name"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter full address"
          />
        </div>

        {/* City, State, County */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              State
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              County
            </label>
            <input
              type="text"
              value={form.county}
              onChange={(e) => setForm({ ...form, county: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="County"
            />
          </div>
        </div>

        {/* Phone, Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mobile
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            School Logo
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max size: 2MB. Recommended: 200x200px</p>
            </div>
            {form.logo && (
              <div className="w-24 h-24 border border-slate-300 dark:border-slate-600 rounded overflow-hidden bg-slate-50 dark:bg-slate-700">
                <img src={form.logo} alt="Logo preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Banner Image
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded p-2 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Max size: 5MB. Recommended: 1200x300px</p>
            {form.photo && (
              <div className="w-full h-48 border border-slate-300 dark:border-slate-600 rounded overflow-hidden bg-slate-50 dark:bg-slate-700">
                <img src={form.photo} alt="Banner preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={loadProfile}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
