import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, AtSign, Phone, Save, Plus, Trash, Home, Building, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, addUserAddress, updateUserAddress, deleteUserAddress, getUserProfile } from '@/services/userService';
import type { Address } from '@/services/userService';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  
  // New address form data
  const [addressType, setAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  // Load user profile data
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userProfile = await getUserProfile(user.uid);
        
        if (userProfile) {
          // Initialize state with data from Firestore
          setDisplayName(userProfile.displayName || user.displayName || '');
          setPhone(userProfile.phone || '');
          setAddresses(userProfile.addresses || []);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, [user]);
  
  // Update profile information
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await updateUserProfile(user.uid, {
        displayName,
        phone
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newAddress: Address = {
        type: addressType,
        street,
        city,
        state,
        zip,
        isDefault
      };
      
      if (editingAddress) {
        // Update existing address
        const index = addresses.findIndex(addr => 
          addr.street === editingAddress.street && 
          addr.city === editingAddress.city
        );
        
        if (index !== -1) {
          await updateUserAddress(user.uid, index, newAddress);
          
          // Update local state
          const updatedAddresses = [...addresses];
          updatedAddresses[index] = newAddress;
          setAddresses(updatedAddresses);
        }
      } else {
        // Add new address
        await addUserAddress(user.uid, newAddress);
        
        // Update local state
        setAddresses([...addresses, newAddress]);
      }
      
      // Reset form
      setAddressType('shipping');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setIsDefault(false);
      setEditingAddress(null);
      setAddressFormVisible(false);
      
      setSuccess('Address saved successfully');
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Remove address
  const handleRemoveAddress = async (index: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteUserAddress(user.uid, index);
      
      // Update local state
      const updatedAddresses = [...addresses];
      updatedAddresses.splice(index, 1);
      setAddresses(updatedAddresses);
      
      setSuccess('Address removed successfully');
    } catch (err) {
      console.error('Error removing address:', err);
      setError('Failed to remove address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Edit address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressType(address.type);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZip(address.zip);
    setIsDefault(address.isDefault);
    setAddressFormVisible(true);
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Personal Information Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium flex items-center mb-4">
          <User className="w-5 h-5 mr-2 text-gray-500" />
          Personal Information
        </h3>
        
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="displayName">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="displayName"
                  type="text"
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="pl-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
                  value={user?.email || ''}
                  disabled
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center bg-hotpink hover:bg-hotpink/90 text-white py-2 px-4 rounded transition"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Addresses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            Your Addresses
          </h3>
          
          <button
            onClick={() => {
              setEditingAddress(null);
              setAddressType('shipping');
              setStreet('');
              setCity('');
              setState('');
              setZip('');
              setIsDefault(false);
              setAddressFormVisible(!addressFormVisible);
            }}
            className="inline-flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded transition"
          >
            <Plus className="w-4 h-4 mr-1" />
            {addressFormVisible ? 'Cancel' : 'Add Address'}
          </button>
        </div>
        
        {/* Address Form */}
        {addressFormVisible && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="font-medium mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h4>
            
            <form onSubmit={handleAddAddress}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-hotpink"
                        name="addressType"
                        value="shipping"
                        checked={addressType === 'shipping'}
                        onChange={() => setAddressType('shipping')}
                      />
                      <span className="ml-2">Shipping</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-hotpink"
                        name="addressType"
                        value="billing"
                        checked={addressType === 'billing'}
                        onChange={() => setAddressType('billing')}
                      />
                      <span className="ml-2">Billing</span>
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="street">
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                    placeholder="Street address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip">
                    ZIP Code
                  </label>
                  <input
                    id="zip"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-hotpink focus:outline-none focus:ring-1 focus:ring-hotpink"
                    placeholder="ZIP code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-hotpink"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span className="ml-2">Set as default {addressType} address</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center bg-hotpink hover:bg-hotpink/90 text-white py-2 px-4 rounded transition"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>You don't have any saved addresses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    {address.type === 'shipping' ? (
                      <Home className="w-4 h-4 mr-2 text-gray-500" />
                    ) : (
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                    )}
                    <span className="font-medium capitalize">{address.type} Address</span>
                    {address.isDefault && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-gray-500 hover:text-hotpink"
                      aria-label="Edit address"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveAddress(index)}
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Remove address"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zip}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Account Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={async () => {
              try {
                await logout();
                navigate('/');
              } catch (err) {
                console.error('Error logging out:', err);
                setError('Failed to log out. Please try again.');
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
} 