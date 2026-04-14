import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CheckCircle, MapPin, CreditCard, ShoppingBag, ArrowLeft, Copy } from 'lucide-react';
import CheckoutSdk from '@hubteljs/checkout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import logo from '../assets/logo/logo.png';
import api from '../lib/api';

const DELIVERY_FEE = 0;
const STEPS = ['Delivery', 'Review', 'Payment', 'Done'];

const regions = ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Ahafo', 'Bono East', 'Oti', 'Savannah', 'North East', 'Western North'];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F46B03]/30 focus:border-[#F46B03] transition-colors";

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-1 mb-8">
    {STEPS.map((label, i) => {
      const done = i < step;
      const active = i === step;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              done ? 'bg-green-500 text-white' : active ? 'bg-[#F46B03] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${active ? 'text-[#F46B03]' : done ? 'text-green-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-10 flex-shrink-0 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

const OrderSummaryPanel = ({ cartItems, subtotal }) => (
  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Summary</p>
    <div className="space-y-2 max-h-52 overflow-y-auto">
      {cartItems.map((item) => (
        <div key={item.id} className="flex items-center gap-2.5">
          <img src={item.coverImage} alt={item.title} className="w-10 h-13 object-cover rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.title}</p>
            <p className="text-[10px] text-gray-400">Qty {item.quantity}</p>
          </div>
          <p className="text-xs font-bold text-gray-800">₵{item.price * item.quantity}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-200 pt-2 space-y-1">
      <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₵{subtotal}</span></div>
      <div className="flex justify-between text-xs text-gray-500"><span>Delivery</span><span>₵{DELIVERY_FEE}</span></div>
      <div className="flex justify-between text-sm font-bold text-gray-800 pt-1"><span>Total</span><span>₵{subtotal + DELIVERY_FEE}</span></div>
    </div>
  </div>
);

const DeliveryStep = ({ form, setForm, onNext, addresses, selectedAddressId, setSelectedAddressId, isAddingNew, setIsAddingNew }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.street.trim()) e.street = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[#F46B03]" />
          <h2 className="font-bold text-gray-900">Delivery Information</h2>
        </div>
        {addresses.length > 0 && (
          <button 
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="text-xs font-semibold text-[#F46B03] hover:underline"
          >
            {isAddingNew ? "Select Saved Address" : "Add New Address"}
          </button>
        )}
      </div>

      {!isAddingNew && addresses.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Choose a delivery address</p>
          <div className="grid gap-3">
            {addresses.map((addr) => (
              <label 
                key={addr.id}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  selectedAddressId === addr.id ? 'border-[#F46B03] bg-orange-50/30' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="address" 
                  checked={selectedAddressId === addr.id}
                  onChange={() => {
                    setSelectedAddressId(addr.id);
                    setForm({
                      name: addr.full_name,
                      phone: addr.phone_number,
                      street: addr.street_address,
                      city: addr.city,
                      region: addr.state_province,
                      note: form.note
                    });
                  }}
                  className="mt-1 accent-[#F46B03]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-800">{addr.full_name}</p>
                    {addr.is_default && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{addr.street_address}</p>
                  <p className="text-xs text-gray-400">{addr.city}, {addr.state_province} · {addr.phone_number}</p>
                </div>
              </label>
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="w-full py-3 bg-[#F46B03] text-white font-semibold rounded-xl hover:bg-[#C15300] transition-colors flex items-center justify-center gap-2 mt-4"
          >
            Continue to Review <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Full Name" required>
        <input className={`${inputCls} ${errors.name ? 'border-red-300' : ''}`} placeholder="Kwame Mensah"
          value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
      </Field>

      <Field label="Phone Number" required>
        <input className={`${inputCls} ${errors.phone ? 'border-red-300' : ''}`} placeholder="+233 24 000 0000"
          value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
      </Field>

      <Field label="Street / Landmark" required>
        <input className={`${inputCls} ${errors.street ? 'border-red-300' : ''}`} placeholder="12 Liberation Road, near Total station"
          value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
        {errors.street && <p className="text-xs text-red-500 mt-0.5">{errors.street}</p>}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City / Town" required>
          <input className={`${inputCls} ${errors.city ? 'border-red-300' : ''}`} placeholder="Accra"
            value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
        </Field>
        <Field label="Region">
          <select className={inputCls} value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Delivery Note (optional)">
        <textarea className={inputCls} rows={2} placeholder="E.g. call when you arrive, gate code, etc."
          value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer mt-2">
        <input 
          type="checkbox" 
          checked={form.saveAddress} 
          onChange={(e) => setForm(f => ({ ...f, saveAddress: e.target.checked }))}
          className="w-4 h-4 accent-[#F46B03] rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">Save this address for future orders</span>
      </label>

          <button onClick={handleNext}
            className="w-full py-3 bg-[#F46B03] text-white font-semibold rounded-xl hover:bg-[#C15300] transition-colors flex items-center justify-center gap-2 mt-2">
            Continue to Review <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewStep = ({ form, cartItems, subtotal, onBack, onPay, paying }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 mb-2">
      <ShoppingBag size={18} className="text-[#F46B03]" />
      <h2 className="font-bold text-gray-900">Review Your Order</h2>
    </div>

    {/* Delivery summary */}
    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivering to</p>
      <p className="text-sm font-semibold text-gray-800">{form.name}</p>
      <p className="text-sm text-gray-600">{form.street}</p>
      <p className="text-sm text-gray-600">{form.city}, {form.region}</p>
      <p className="text-sm text-gray-600">{form.phone}</p>
      {form.note && <p className="text-xs text-gray-400 mt-1 italic">Note: {form.note}</p>}
    </div>

    {/* Items */}
    <div className="space-y-2">
      {cartItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
          <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.author}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.tag} · Qty {item.quantity}</p>
          </div>
          <p className="text-sm font-bold text-gray-800 flex-shrink-0">₵{item.price * item.quantity}</p>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
      <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₵{subtotal}</span></div>
      <div className="flex justify-between text-sm text-gray-600"><span>Delivery Fee</span><span>₵{DELIVERY_FEE}</span></div>
      <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-200">
        <span>Total</span><span>₵{subtotal + DELIVERY_FEE}</span>
      </div>
    </div>

    <div className="flex gap-3">
      <button onClick={onBack} disabled={paying} className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
        <ArrowLeft size={16} /> Back
      </button>
      <button onClick={onPay} disabled={paying} className="flex-1 py-3 bg-[#F46B03] text-white font-semibold rounded-xl hover:bg-[#C15300] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
        {paying ? 'Processing...' : `Pay Now ₵${subtotal + DELIVERY_FEE}`} <ChevronRight size={18} />
      </button>
    </div>
  </div>
);


const ConfirmationStep = ({ orderId, form, cartItems, subtotal, paymentMethod }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
        <p className="text-gray-500 text-sm mt-2">
          Thank you, {form.name.split(' ')[0]}! Your books are on their way.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Reference</p>
          <button onClick={copyId} className="flex items-center gap-1 text-xs text-[#F46B03] hover:underline">
            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="font-mono text-lg font-bold text-gray-800">{orderId}</p>
        <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-400">Delivering to</p>
            <p className="font-medium text-gray-700 text-xs mt-0.5">{form.street}, {form.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Payment</p>
            <p className="font-medium text-gray-700 text-xs mt-0.5">{paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Items</p>
            <p className="font-medium text-gray-700 text-xs mt-0.5">{cartItems.length} book{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Paid</p>
            <p className="font-bold text-gray-800 text-sm mt-0.5">₵{subtotal + DELIVERY_FEE}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">Estimated delivery: <span className="font-semibold text-gray-600">2–3 business days</span></p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard/orders" className="flex-1 py-3 bg-[#F46B03] text-white font-semibold rounded-xl hover:bg-[#C15300] transition-colors text-center text-sm">
          Track My Order
        </Link>
        <button onClick={() => navigate('/shop')} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Keep Shopping
        </button>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', street: '', city: '', region: 'Greater Accra', note: '',
    saveAddress: true,
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [waitForPayment, setWaitForPayment] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  useEffect(() => {
    if (user) {
      api.get('/api/users/me/addresses/')
        .then(res => res.json())
        .then(data => {
          setAddresses(data.results || data);
          const def = (data.results || data).find(a => a.is_default);
          if (def) {
            setSelectedAddressId(def.id);
            setForm({
              name: def.full_name,
              phone: def.phone_number,
              street: def.street_address,
              city: def.city,
              region: def.state_province,
              note: '',
            });
          } else if (data.length > 0) {
            setIsAddingNew(false);
          } else {
            setIsAddingNew(true);
          }
        })
        .catch(err => console.error("Error fetching addresses:", err));
    } else {
      setIsAddingNew(true);
    }
  }, [user]);


  const handlePay = async () => {
    setPaying(true);

    const payload = {
      customer_details: {
        name: form.name,
        phone: form.phone,
        street: form.street,
        city: form.city,
        region: form.region,
        note: form.note,
      },
      shipping_address: {
        name: form.name,
        phone: form.phone,
        address_line_1: form.street,
        city: form.city,
        region: form.region,
      },
    };

    try {
      // 1. Save address if requested
      if (isAddingNew && form.saveAddress && user) {
        await api.post('/api/users/me/addresses/', {
          full_name: form.name,
          phone_number: form.phone,
          street_address: form.street,
          city: form.city,
          state_province: form.region,
          postal_code: '0000',
          country: 'Ghana',
          is_default: addresses.length === 0,
        });
      }

      // 2. Create Order & Get Hubtel Config
      const res = await api.post('/api/orders/', payload);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Failed to create order. Please try again.");
        setPaying(false);
        return;
      }

      if (data.order && data.order.id) {
        setOrderId(data.order.id);

        const checkout = new CheckoutSdk();

        checkout.openModal({
          purchaseInfo: data.purchaseInfo,
          config: data.config,
          callBacks: {
            onInit: () => console.log('Hubtel Checkout initialized'),
            onPaymentSuccess: (paymentData) => {
              console.log('Payment Success', paymentData);
              // Mark flow complete
              clearCart();
              setStep(2);
              setPaying(false);
            },
            onPaymentFailure: (paymentData) => {
              console.log('Payment Failure', paymentData);
              toast.error("Payment failed or cancelled.");
            },
            onClose: () => {
              setPaying(false);
            }
          }
        });
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("A network error occurred. Please check your connection.");
      setPaying(false);
    }
  };

  if (cartItems.length === 0 && step < 2) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some books before checking out.</p>
          <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-[#F46B03] text-white rounded-full font-semibold hover:bg-[#C15300] transition-colors">
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="TBSS" className="h-8 w-auto" />
          </Link>
          {step < 3 && (
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> {step === 0 ? 'Back to Cart' : 'Back'}
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm">
            {step === 0 && (
              <DeliveryStep 
                form={form} 
                setForm={setForm} 
                onNext={() => setStep(1)} 
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                isAddingNew={isAddingNew}
                setIsAddingNew={setIsAddingNew}
              />
            )}
            {step === 1 && <ReviewStep form={form} cartItems={cartItems} subtotal={subtotal} onBack={() => setStep(0)} onPay={handlePay} paying={paying} />}
            {step === 2 && <ConfirmationStep orderId={orderId} form={form} cartItems={cartItems} subtotal={subtotal} paymentMethod="Hubtel Checkout" />}
          </div>

          {/* Summary sidebar — hidden on confirmation */}
          {step < 2 && (
            <div className="lg:col-span-1">
              <OrderSummaryPanel cartItems={cartItems} subtotal={subtotal} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
