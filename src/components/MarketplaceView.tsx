import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Tag,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  ShieldCheck,
  Star,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFarm } from '../context/FarmContext';
import { Product } from '../types';
import { api } from '../services/api';

export const MarketplaceView: React.FC = () => {
  const { t } = useFarm();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    orders,
    placeOrder,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [couponInput, setCouponInput] = useState('KISAN2026');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Checkout modal fields
  const [shippingAddress, setShippingAddress] = useState(
    'Farm Parcel A, Near Boriavi Primary School, Anand, Gujarat - 388001'
  );
  const [paymentMethod, setPaymentMethod] = useState('Kisan Credit Card (0% Interest)');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'orders'>('store');

  const categories = [
    { id: 'All', label: t('filter_all') },
    { id: 'Seeds', label: t('filter_seeds') },
    { id: 'Fertilizers', label: t('filter_fertilizers') },
    { id: 'Pesticides', label: t('filter_pesticides') },
    { id: 'Tools & Sensors', label: t('filter_tools') },
    { id: 'Irrigation', label: t('filter_irrigation') },
  ];

  useEffect(() => {
    const fetchProds = async () => {
      try {
        const data = await api.getProducts(selectedCategory === 'All' ? undefined : selectedCategory, searchQuery);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    fetchProds();
  }, [selectedCategory, searchQuery]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponMessage(res.message);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const order = await placeOrder(shippingAddress, paymentMethod);
      setOrderSuccessId(order.id);
      setActiveTab('orders');
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct Agricultural Supply</span>
          <h2 className="text-2xl font-bold text-slate-900">{t('agri_marketplace')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Certified seeds, bio-fertilizers, and smart farm equipment delivered directly to your farm gate.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('orders_history')}</span>
              {orders.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('cart')} ({totalItems})</span>
          </button>
        </div>
      </div>

      {activeTab === 'store' ? (
        <>
          {/* Search & Category Filter Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search seeds, fertilizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.organicCertified && (
                      <span className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Organic Certified
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                      {product.unit}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{product.category}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-medium font-mono text-[11px]">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {product.dosageGuide && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100/80">
                        <strong>Dosage:</strong> {product.dosageGuide}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="text-lg font-bold font-mono text-slate-900">₹{product.price}</span>
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('add_to_cart')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Orders History Tab */
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('orders_history')}</h3>
              <p className="text-xs text-slate-500">Real-time dispatched tracking for your farm parcels</p>
            </div>
            <button
              onClick={() => setActiveTab('store')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              ← Back to Marketplace
            </button>
          </div>

          {orderSuccessId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Order placed successfully! Tracking ref: <strong>{orderSuccessId}</strong></span>
              </div>
              <button onClick={() => setOrderSuccessId(null)} className="text-emerald-700 hover:text-emerald-900">
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order) => {
              const statusSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
              const currentStepIndex = statusSteps.indexOf(order.status);

              return (
                <div key={order.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">#{order.id}</span>
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} · Tracking: <strong className="font-mono">{order.trackingNumber}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Billed</span>
                      <span className="text-base font-bold font-mono text-slate-900">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Status Progress Pipeline */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {statusSteps.map((st, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={st} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                isCurrent
                                  ? 'bg-emerald-600'
                                  : isDone
                                  ? 'bg-emerald-400'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span
                              className={`text-[10px] block truncate ${
                                isCurrent ? 'font-bold text-emerald-800' : 'text-slate-400'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="space-y-1 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/60">
                    <span className="font-semibold text-slate-900 block mb-1">Package Contents:</span>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
                        <span>
                          {item.product.name} × <strong className="font-mono">{item.quantity}</strong>
                        </span>
                        <span className="font-mono text-slate-800">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Delivering to: {order.deliveryAddress}</span>
                    <span>Paid via: {order.paymentMethod}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg font-bold text-slate-900">{t('cart')} ({totalItems})</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Your farm resource cart is currently empty.
                </div>
              ) : (
                <div className="mt-4 space-y-4 divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 leading-tight">{item.product.name}</h4>
                        <span className="text-[11px] font-mono text-slate-500">₹{item.product.price} / {item.product.unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-4 text-xs">
                {/* Coupon Code */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon (e.g. KISAN2026)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <p className={`text-[11px] ${appliedCoupon ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMessage}
                  </p>
                )}

                {/* Subtotal calculation */}
                <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{cart.reduce((a, b) => a + b.product.price * b.quantity, 0)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Kisan Subsidy Discount (15%):</span>
                      <span className="font-mono font-bold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total Payable:</span>
                    <span className="font-mono text-emerald-800">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Shipping & Payment details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Delivery Address</label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    >
                      <option value="Kisan Credit Card (0% Interest)">Kisan Credit Card (0% Interest)</option>
                      <option value="UPI / Bharat QR">Instant UPI / Bharat QR</option>
                      <option value="Cash on Delivery at Farm Gate">Cash on Delivery at Farm Gate</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                >
                  {isPlacingOrder ? 'Processing Order...' : `Place Farm Order (₹${totalAmount})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
