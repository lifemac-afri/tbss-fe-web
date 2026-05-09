import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Check, MoreVertical } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';
import Spinner from '../../components/Spinner';

const regions = ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Ahafo', 'Bono East', 'Oti', 'Savannah', 'North East', 'Western North'];

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    state_province: 'Greater Accra',
    postal_code: '0000',
    country: 'Ghana',
    is_default: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/users/me/addresses/');
      const data = await res.json();
      let list = [];
      if (Array.isArray(data.results)) {
        list = data.results;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setAddresses(list);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await api.put(`/api/users/me/addresses/${editingId}/`, form);
      } else {
        res = await api.post('/api/users/me/addresses/', form);
      }

      if (res.ok) {
        toast.success(editingId ? 'Address updated' : 'Address added');
        setShowForm(false);
        setEditingId(null);
        setForm({
          full_name: '',
          phone_number: '',
          street_address: '',
          city: '',
          state_province: 'Greater Accra',
          postal_code: '0000',
          country: 'Ghana',
          is_default: false,
        });
        fetchAddresses();
      } else {
        const d = await res.json();
        toast.error(d.detail || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await api.del(`/api/users/me/addresses/${id}/`);
      if (res.ok) {
        toast.success('Address deleted');
        fetchAddresses();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.post(`/api/users/me/addresses/${id}/set-default/`);
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (err) {
      toast.error('Failed to update default');
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Delivery Addresses</h1>
          <p className="text-sm text-gray-500">Manage your shipping locations for faster checkout.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#F46B03] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#C15300] transition-colors"
          >
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="font-bold text-gray-800 mb-6">{editingId ? 'Edit Address' : 'New Delivery Address'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Full Name</label>
              <input
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] outline-none"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Receiver's full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Phone Number</label>
              <input
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] outline-none"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+233..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Street Address / Landmark</label>
              <input
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] outline-none"
                value={form.street_address}
                onChange={(e) => setForm({ ...form, street_address: e.target.value })}
                placeholder="House No, Street name, Landmark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">City</label>
              <input
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] outline-none"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Accra, Kumasi, etc."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Region</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] outline-none bg-white"
                value={form.state_province}
                onChange={(e) => setForm({ ...form, state_province: e.target.value })}
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_default"
                className="w-4 h-4 accent-[#F46B03] rounded border-gray-300"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              <label htmlFor="is_default" className="text-sm text-gray-600 cursor-pointer">Set as default delivery address</label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#F46B03] text-white py-3 rounded-xl font-bold hover:bg-[#C15300] transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <MapPin size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">You haven't saved any addresses yet.</p>
              <button onClick={() => setShowForm(true)} className="text-[#F46B03] text-sm font-semibold hover:underline mt-2">
                Add your first address
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className={`group bg-white rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
                  addr.is_default ? 'border-[#F46B03]/30 bg-orange-50/10' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {addr.is_default && (
                  <div className="absolute top-0 right-0 bg-[#F46B03] text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl">
                    Default
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F46B03]">
                    <MapPin size={20} />
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(addr.id);
                        setForm(addr);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <MoreVertical size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900">{addr.full_name}</p>
                  <p className="text-sm text-gray-500">{addr.street_address}</p>
                  <p className="text-sm text-gray-500">{addr.city}, {addr.state_province}</p>
                  <p className="text-sm text-gray-500 font-medium pt-1">📱 {addr.phone_number}</p>
                </div>
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-wider"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
