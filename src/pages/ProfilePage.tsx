// src/pages/ProfilePage.tsx

import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Save,
  Mail,
  Phone,
  Building,
  Globe,
  Map,
  Camera,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Lock,
  Bell,
  Calendar,
  Award,
  Sparkles,
  Gem,
  X,
  Home,
  Briefcase,
  Globe as Earth,
  Shield,
  CreditCard,
  ShoppingBag,
  Clock,
  Star,
  Check,
  AlertCircle,
  Upload,
  MapPin as MapPinIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

import Container from "../components/layout/Container";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Avatar from "../components/ui/Avatar";

import { AuthContext } from "../context/AuthContext";
import {
  getMyProfile,
  upsertProfile,
  uploadAvatar,
  type Profile,
} from "../api/account.api";
import {
  getCustomer,
  updateCustomer,
  getCustomerAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Customer,
} from "../api/customer.api";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "../api/wishlist.api";
import { getNotifications } from "../api/notifications.api";

/* ======================================================
   TYPES
====================================================== */

interface Address {
  id: string;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default_billing: boolean;
  is_default_shipping: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

type TabId = "profile" | "contact" | "addresses" | "wishlist" | "settings" | "notifications";

/* ======================================================
   COMPONENTS
====================================================== */

const ProfileHeader = React.memo(function ProfileHeader({
  user,
  profile,
  customer,
  avatarUploading,
  onAvatarChange,
}: {
  user: any;
  profile: Profile | null;
  customer: Customer | null;
  avatarUploading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const displayName = profile?.public_name || user?.full_name || customer?.name || "My Account";
  const memberSince = new Date(user?.created_at || Date.now()).getFullYear();

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-8 -mt-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
          <div className="flex items-end gap-6">
            {/* Avatar with Upload */}
            <div className="relative group">
              <Avatar
                src={profile?.avatar_url || undefined}
                alt={displayName}
                size="xl"
                className="border-4 border-white shadow-xl"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {avatarUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="outline" icon={<ShoppingBag className="h-4 w-4" />}>
              View Orders
            </Button>
            <Button variant="outline" icon={<CreditCard className="h-4 w-4" />}>
              Payment Methods
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

const StatsCard = React.memo(function StatsCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold mt-1">24</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Wishlist Items</p>
            <p className="text-2xl font-bold mt-1">12</p>
          </div>
          <div className="p-3 bg-pink-100 rounded-full">
            <Heart className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-2xl font-bold mt-1">2023</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Award className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
});

const ProfileTab = React.memo(function ProfileTab({
  profile,
  profileForm,
  setProfileForm,
  saving,
  onSave,
}: {
  profile: Profile | null;
  profileForm: any;
  setProfileForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </h3>

            <form onSubmit={onSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={profileForm.public_name}
                    onChange={(e) =>
                      setProfileForm((p: any) => ({
                        ...p,
                        public_name: e.target.value,
                      }))
                    }
                    placeholder="Your public name"
                    icon={<User className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm((p: any) => ({
                        ...p,
                        location: e.target.value,
                      }))
                    }
                    placeholder="City, Country"
                    icon={<MapPin className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <Input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) =>
                      setProfileForm((p: any) => ({
                        ...p,
                        company: e.target.value,
                      }))
                    }
                    placeholder="Your company"
                    icon={<Building className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) =>
                      setProfileForm((p: any) => ({
                        ...p,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((p: any) => ({
                      ...p,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h4 className="font-medium mb-4">Profile Completion</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Basic Info</span>
                  <span className="font-medium">80%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="font-medium mb-4">Account Status</h4>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Verified Account</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your account is active and verified. All features are available.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

const ContactTab = React.memo(function ContactTab({
  contactForm,
  setContactForm,
  saving,
  onSave,
}: {
  contactForm: any;
  setContactForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <div className="max-w-2xl">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </h3>

          <form onSubmit={onSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm((p: any) => ({ ...p, name: e.target.value }))
                }
                placeholder="John Doe"
                icon={<User className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((p: any) => ({ ...p, email: e.target.value }))
                }
                placeholder="john@example.com"
                icon={<Mail className="h-4 w-4" />}
              />
              <p className="text-xs text-gray-500 mt-1">
                This email will be used for account notifications and password resets.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm((p: any) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1 (555) 123-4567"
                icon={<Phone className="h-4 w-4" />}
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Email Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span className="text-sm">Product updates and announcements</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span className="text-sm">Promotional offers</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm">Newsletter</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              >
                {saving ? "Saving..." : "Save Contact Info"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
});

const AddressesTab = React.memo(function AddressesTab({
  addresses,
  loading,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}: {
  addresses: Address[];
  loading: boolean;
  onAddAddress: () => void;
  onEditAddress: (id: string) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string, type: 'shipping' | 'billing') => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button icon={<Plus className="h-4 w-4" />} onClick={onAddAddress}>
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">No Addresses Saved</h4>
          <p className="text-gray-500 mb-6">
            Add your first address to make checkout faster
          </p>
          <Button icon={<Plus className="h-4 w-4" />} onClick={onAddAddress}>
            Add Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{address.label || 'Address'}</span>
                    {address.is_default_shipping && (
                      <Badge variant="success" size="sm">Default Shipping</Badge>
                    )}
                    {address.is_default_billing && (
                      <Badge variant="blue" size="sm">Default Billing</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditAddress(address.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAddress(address.id)}
                      className="p-1 hover:bg-gray-100 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p className="text-gray-600">{address.line1}</p>
                  {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-600">{address.phone}</p>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  {!address.is_default_shipping && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefault(address.id, 'shipping')}
                    >
                      Set as Shipping
                    </Button>
                  )}
                  {!address.is_default_billing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefault(address.id, 'billing')}
                    >
                      Set as Billing
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});

const WishlistTab = React.memo(function WishlistTab({
  wishlist,
  loading,
  onRemove,
}: {
  wishlist: WishlistItem[];
  loading: boolean;
  onRemove: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium mb-2">Your Wishlist is Empty</h4>
        <p className="text-gray-500 mb-6">
          Save items you love for later
        </p>
        <Button onClick={() => window.location.href = '/products'}>
          Browse Products
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">My Wishlist</h3>
          <p className="text-gray-500 text-sm">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button variant="outline">
          Share Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <Card key={item.id} className="group">
            <div className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.product_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-12 w-12" />
                  </div>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium line-clamp-2">{item.product_title}</h4>
                {item.price && (
                  <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

const SettingsTab = React.memo(function SettingsTab({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm" icon={<Lock className="h-4 w-4" />}>
                  Change
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Login History</p>
                  <p className="text-sm text-gray-500">View recent account activity</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between py-3 border-b">
                <span>Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between py-3 border-b">
                <span>Push Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between py-3">
                <span>SMS Alerts</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>
        </Card>

        <Card className="border-red-100 bg-red-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-red-600">
                    Permanently remove your account and all data
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Log Out</p>
                  <p className="text-sm text-gray-600">
                    Sign out from all devices
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<LogOut className="h-4 w-4" />}
                  onClick={onLogout}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

const NotificationsTab = React.memo(function NotificationsTab({
  notifications,
  loading,
}: {
  notifications: Notification[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No Notifications</h4>
            <p className="text-gray-500">You're all caught up!</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  notification.type === 'order' ? 'bg-green-100' :
                  notification.type === 'promotion' ? 'bg-purple-100' :
                  'bg-blue-100'
                }`}>
                  {notification.type === 'order' ? (
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                  ) : notification.type === 'promotion' ? (
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
});

/* ======================================================
   PAGE
====================================================== */

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  const user = auth?.user;
  const isLoggedIn = !!auth?.isLoggedIn;
  const logout = auth?.logout;

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [profileForm, setProfileForm] = useState({
    public_name: "",
    bio: "",
    location: "",
    company: "",
    website: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const [profileRes, customerRes, addressesRes, wishlistRes, notificationsRes] = await Promise.all([
        getMyProfile(),
        getCustomer(),
        getCustomerAddresses(),
        getWishlist(),
        getNotifications(),
      ]);

      if (profileRes.ok && profileRes.profile) {
        setProfile(profileRes.profile);
        setProfileForm({
          public_name: profileRes.profile.public_name || "",
          bio: profileRes.profile.bio || "",
          location: profileRes.profile.location || "",
          company: profileRes.profile.company || "",
          website: profileRes.profile.website || "",
        });
      }

      if (customerRes.ok && customerRes.customer) {
        setCustomer(customerRes.customer);
        setContactForm({
          name: customerRes.customer.name || "",
          email: customerRes.customer.email || "",
          phone: customerRes.customer.phone || "",
        });
      }

      if (addressesRes.ok && addressesRes.addresses) {
        setAddresses(addressesRes.addresses);
      }

      if (wishlistRes.ok && wishlistRes.wishlist?.items) {
        setWishlist(wishlistRes.wishlist.items);
      }

      if (notificationsRes.ok && notificationsRes.notifications) {
        setNotifications(notificationsRes.notifications);
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      const res = await uploadAvatar(file);
      if (res.ok && res.avatar_url) {
        setProfile(prev => prev ? { ...prev, avatar_url: res.avatar_url } : null);
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await upsertProfile(profileForm);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleContactSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateCustomer(contactForm);
      if (res.ok && res.customer) {
        setCustomer(res.customer);
        toast.success("Contact information updated");
      }
    } catch (error) {
      toast.error("Failed to update contact information");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      setWishlist(prev => prev.filter(item => item.id !== itemId));
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  };

  const handleAddAddress = () => {
    // Implement address modal/form
    toast("Address form coming soon");
  };

  const handleEditAddress = (id: string) => {
    // Implement address edit
    toast("Edit address coming soon");
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        toast.success("Address deleted");
      } catch (error) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleSetDefaultAddress = (id: string, type: 'shipping' | 'billing') => {
    // Implement set default address
    toast(`Set as default ${type} address`);
  };

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  if (loading && !profile && !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="lg:col-span-3">
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          profile={profile}
          customer={customer}
          avatarUploading={avatarUploading}
          onAvatarChange={handleAvatarChange}
        />

        {/* Stats Card */}
        <StatsCard />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <Card className="p-4 lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Gem className="h-5 w-5" />
                  <span className="font-medium">Premium Member</span>
                </div>
                <p className="text-sm opacity-90">
                  Enjoy exclusive benefits and early access
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                saving={saving}
                onSave={handleProfileSave}
              />
            )}

            {activeTab === "contact" && (
              <ContactTab
                contactForm={contactForm}
                setContactForm={setContactForm}
                saving={saving}
                onSave={handleContactSave}
              />
            )}

            {activeTab === "addresses" && (
              <AddressesTab
                addresses={addresses}
                loading={loading}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
              />
            )}

            {activeTab === "wishlist" && (
              <WishlistTab
                wishlist={wishlist}
                loading={loading}
                onRemove={handleRemoveFromWishlist}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                notifications={notifications}
                loading={loading}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab onLogout={handleLogout} />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}