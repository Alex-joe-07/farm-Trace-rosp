// src/components/dashboard/FarmerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../config/supabase";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  QrCode,
  Package,
  BarChart3,
  Calendar,
  Truck,
  Store,
  Leaf,
  Users,
  ArrowRight,
  Eye,
  Download,
  X,
  RefreshCw,
  LogOut,
  ScanLine,
  Sprout,
  Camera,
  MapPin,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Home,
  Crop,
  Ship,
  FileText,
  ChevronDown,
  Star,
  Shield,
  Globe,
  Target,
  Zap,
} from "lucide-react";

// Products Section Component
const ProductsSection = ({ 
  products, 
  onUpdateStatus, 
  onGenerateQR, 
  onImageUpload, 
  uploadingImage,
  expandedProduct,
  setExpandedProduct,
  onAddProduct 
}) => {
  const getStatusInfo = (status) => {
    const statusInfo = {
      harvested: { color: 'bg-orange-100 text-orange-700', icon: '🌱', nextAction: 'pack' },
      packed: { color: 'bg-blue-100 text-blue-700', icon: '📦', nextAction: 'ship' },
      shipped: { color: 'bg-purple-100 text-purple-700', icon: '🚚', nextAction: null },
      delivered: { color: 'bg-green-100 text-green-700', icon: '✅', nextAction: null }
    };
    return statusInfo[status] || { color: 'bg-gray-100 text-gray-700', icon: '📝', nextAction: null };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Product Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </motion.button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start by registering your first harvest. Add product details, upload photos, and track through the supply chain.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddProduct}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
          >
            Register First Harvest
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const statusInfo = getStatusInfo(product.status);
            const isExpanded = expandedProduct === product.id;
            
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) onImageUpload(product.id, file);
                          }}
                          disabled={uploadingImage === product.id}
                        />
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                            uploadingImage === product.id ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                        >
                          {uploadingImage === product.id ? (
                            <RefreshCw className="w-3 h-3 text-white animate-spin" />
                          ) : (
                            <Camera className="w-3 h-3 text-white" />
                          )}
                        </motion.div>
                      </label>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{product.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {product.farms?.name} • {product.category} • Batch: {product.batch_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                      <span className="mr-1">{statusInfo.icon}</span>
                      {product.status}
                    </span>
                    
                    {!product.qr_generated && product.status === 'packed' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateQR(product.id);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Generate QR
                      </motion.button>
                    )}

                    {product.qr_generated && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateQR(product.id);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                      >
                        View QR
                      </motion.button>
                    )}

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Harvest Date</p>
                            <p className="font-medium text-gray-800">
                              {product.harvest_date ? new Date(product.harvest_date).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Farm</p>
                            <p className="font-medium text-gray-800">{product.farms?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Location</p>
                            <p className="font-medium text-gray-800">{product.farms?.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Created</p>
                            <p className="font-medium text-gray-800">
                              {new Date(product.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {product.certifications && product.certifications.length > 0 && (
                          <div>
                            <p className="text-gray-600 text-sm mb-2">Certifications</p>
                            <div className="flex flex-wrap gap-2">
                              {product.certifications.map((cert, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-3 pt-2">
                          {statusInfo.nextAction && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onUpdateStatus(
                                product.id, 
                                statusInfo.nextAction === 'pack' ? 'packed' : 'shipped'
                              )}
                              className={`px-4 py-2 rounded-lg font-medium text-white ${
                                statusInfo.nextAction === 'pack' 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              } transition-colors shadow-sm`}
                            >
                              Mark as {statusInfo.nextAction === 'pack' ? 'Packed' : 'Shipped'}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// Shipments Section Component
const ShipmentsSection = ({ shipments, onScheduleShipment }) => {
  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'bg-amber-100 text-amber-700', icon: Calendar },
      in_transit: { color: 'bg-blue-100 text-blue-700', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-700', icon: X }
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Truck className="w-5 h-5 mr-2 text-orange-600" />
          Shipment Tracking
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onScheduleShipment}
          className="bg-orange-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:bg-orange-700 transition-all duration-200 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Shipment</span>
        </motion.button>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shipments Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Schedule your first shipment to track your products through the supply chain with real-time updates.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScheduleShipment}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
          >
            Schedule First Shipment
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const statusConfig = getStatusConfig(shipment.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <motion.div
                key={shipment.id}
                whileHover={{ x: 4 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${statusConfig.color} rounded-2xl flex items-center justify-center`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {shipment.products?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Batch: {shipment.products?.batch_number} • Farm: {shipment.products?.farms?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusConfig.color}`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-gray-800 font-semibold text-sm">Origin</p>
                    <p className="text-gray-600 text-xs">{shipment.origin}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-gray-800 font-semibold text-sm">Destination</p>
                    <p className="text-gray-600 text-xs">{shipment.destination}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-gray-800 font-semibold text-sm">Carrier</p>
                    <p className="text-gray-600 text-xs">{shipment.carrier || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <span>Scheduled: {new Date(shipment.scheduled_date).toLocaleDateString()}</span>
                  <span>Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
                </div>

                {shipment.tracking_number && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-800 font-medium text-sm flex items-center">
                      <ScanLine className="w-4 h-4 mr-2" />
                      Tracking: {shipment.tracking_number}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// Add Farm Modal
const AddFarmModal = ({ onClose, onSave, userEmail }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    type: "organic",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.location) {
      setSaving(true);
      await onSave(formData);
      setSaving(false);
    }
  };

  const farmTypes = [
    { value: "organic", label: "🌱 Organic Farm", description: "Natural farming methods" },
    { value: "conventional", label: "🏭 Conventional Farm", description: "Traditional farming" },
    { value: "hydroponic", label: "💧 Hydroponic Farm", description: "Soil-less cultivation" },
    { value: "greenhouse", label: "🏡 Greenhouse Farm", description: "Controlled environment" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-green-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Add New Farm</h3>
            <p className="text-sm text-gray-600">Set up your farm profile</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter farm name"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="City, State, Country"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (acres)
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Size"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                disabled={saving}
              >
                {farmTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Describe your farm..."
              disabled={saving}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-md"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Create Farm"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Add Product Modal
const AddProductModal = ({ onClose, onSave, farms, userEmail }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    name: "",
    category: "",
    description: "",
    harvestDate: "",
    batchNumber: "",
    certifications: [],
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: "vegetables", label: "🥦 Vegetables" },
    { value: "fruits", label: "🍎 Fruits" },
    { value: "grains", label: "🌾 Grains" },
    { value: "herbs", label: "🌿 Herbs" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.farmId && formData.batchNumber) {
      setSaving(true);
      await onSave(formData);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-blue-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Register New Harvest</h3>
            <p className="text-sm text-gray-600">Add your product details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Farm *
            </label>
            <select
              required
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              disabled={saving}
            >
              <option value="">Choose a farm</option>
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Organic Tomatoes"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Batch Number *
              </label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., BATCH-2024-001"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={saving}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Harvest Date
              </label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Describe your product..."
              disabled={saving}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-md"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                "Register Harvest"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Shipment Modal Component
const ShipmentModal = ({ onClose, onSave, products, userEmail }) => {
  const [formData, setFormData] = useState({
    productId: "",
    origin: "",
    destination: "",
    scheduledDate: "",
    estimatedDelivery: "",
    carrier: "",
    trackingNumber: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  const carriers = [
    "UPS",
    "FedEx",
    "DHL",
    "USPS",
    "Local Carrier"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error scheduling shipment:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDateForInput = (date) => {
      return date.toISOString().slice(0, 16);
    };

    setFormData(prev => ({
      ...prev,
      scheduledDate: formatDateForInput(now),
      estimatedDelivery: formatDateForInput(tomorrow)
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Schedule Shipment</h3>
            <p className="text-sm text-gray-600">Ship your products to market</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Product to Ship *
            </label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
              disabled={saving}
            >
              <option value="">Choose a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Batch: {product.batch_number}) - {product.farms?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Origin Address *
              </label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Farm address or storage location"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Destination *
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Market, distributor, or retailer address"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Scheduled Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estimated Delivery *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Carrier/Transport
              </label>
              <select
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                disabled={saving}
              >
                <option value="">Select carrier</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tracking Number
              </label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Optional tracking number"
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-md"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Scheduling...
                </>
              ) : (
                "Schedule Shipment"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// QR Modal Component
const QRModal = ({ product, onClose, onDownload }) => {
  const qrRef = useRef(null);

  // Build the QR payload — a URL that encodes all product traceability info
  const traceData = JSON.stringify({
    product_id: product.id,
    product_name: product.name,
    batch_number: product.batch_number,
    category: product.category,
    farm: product.farms?.name || '',
    farm_location: product.farms?.location || '',
    harvest_date: product.harvest_date,
    status: product.status,
    generated_at: new Date().toISOString(),
  });

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `qr-${product.name}-${product.batch_number}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">QR Code Generated! 🎉</h3>
            <p className="text-sm text-gray-600">Scan this to verify product origin</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          {/* Real scannable QR code */}
          <div
            ref={qrRef}
            className="flex items-center justify-center mx-auto mb-4 p-4 bg-white rounded-2xl border-2 border-purple-200 shadow-inner"
            style={{ width: 'fit-content' }}
          >
            <QRCodeSVG
              value={traceData}
              size={220}
              bgColor="#ffffff"
              fgColor="#3b0764"
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-y-1 mb-6">
            <p className="text-gray-800 font-semibold text-lg">{product.name}</p>
            <p className="text-gray-500 text-sm">
              Batch: <span className="font-medium text-gray-700">{product.batch_number}</span>
              {product.farms?.name && (
                <> • Farm: <span className="font-medium text-gray-700">{product.farms.name}</span></>
              )}
            </p>
            <p className="text-xs text-purple-500 mt-1">📱 Scan with any QR reader to verify traceability</p>
          </div>

          <div className="flex space-x-3">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Close
            </motion.button>
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main FarmerDashboard Component
const FarmerDashboard = () => {
  const [farms, setFarms] = useState([]);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [user, setUser] = useState(null);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
      await Promise.all([
        fetchUserFarms(user.id),
        fetchUserProducts(user.id),
        fetchUserShipments(user.id)
      ]);
    }
     catch (error) {
      console.error("Error in checkAuthAndFetchData:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFarms = async (userId) => {
    try {
      const { data: userFarms, error } = await supabase
        .from("farms")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFarms(userFarms || []);
    } catch (error) {
      console.error("Error fetching farms:", error);
      setFarms([]);
    }
  };

  const fetchUserProducts = async (userId) => {
    try {
      const { data: userProducts, error } = await supabase
        .from("products")
        .select(`
          *,
          farms (
            name,
            location
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(userProducts || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const fetchUserShipments = async (userId) => {
    try {
      const { data: userShipments, error } = await supabase
        .from("shipments")
        .select(`
          *,
          products (
            name,
            batch_number,
            category,
            farms (
              name,
              location
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments(userShipments || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      setShipments([]);
    }
  };

  const handleAddFarm = async (farmData) => {
    try {
      if (!user) return;

      const newFarm = {
        user_id: user.id,
        name: farmData.name,
        location: farmData.location,
        size: farmData.size,
        type: farmData.type,
        description: farmData.description,
        product_count: 0,
        status: "active",
      };

      const { data, error } = await supabase
        .from("farms")
        .insert([newFarm])
        .select();

      if (error) throw error;
      
      await fetchUserFarms(user.id);
      setShowAddFarm(false);
    } catch (error) {
      console.error("Error adding farm:", error);
      alert("Error adding farm: " + error.message);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      if (!user) return;

      const newProduct = {
        user_id: user.id,
        farm_id: productData.farmId,
        name: productData.name,
        category: productData.category,
        description: productData.description,
        harvest_date: productData.harvestDate,
        batch_number: productData.batchNumber,
        certifications: productData.certifications,
        status: "harvested",
        qr_generated: false,
        current_location: "Farm Storage",
      };

      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select();

      if (error) throw error;
      
      await fetchUserProducts(user.id);
      setShowAddProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product: " + error.message);
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (error) throw error;
      
      await fetchUserProducts(user.id);
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Error updating status: " + error.message);
    }
  };

  const handleImageUpload = async (productId, file) => {
    try {
      setUploadingImage(productId);
      
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${productId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      await fetchUserProducts(user.id);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(null);
    }
  };

  const generateQRCode = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const qrData = JSON.stringify({
        product_id: productId,
        product_name: product.name,
        batch_number: product.batch_number,
        category: product.category,
        farm: product.farms?.name || '',
        farm_location: product.farms?.location || '',
        harvest_date: product.harvest_date,
        status: product.status,
        farm_id: product.farm_id,
        generated_at: new Date().toISOString()
      });
      
      const { error } = await supabase
        .from("products")
        .update({ 
          qr_code_data: qrData,
          qr_code: qrData,
          qr_generated: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (error) throw error;
      
      // Re-fetch the specific product with the farms join for the modal
      const { data: freshProduct } = await supabase
        .from("products")
        .select(`*, farms ( name, location )`)
        .eq("id", productId)
        .single();
      await fetchUserProducts(user.id);
      setSelectedProduct(freshProduct ? { ...freshProduct, qr_code_data: qrData } : { ...product, qr_code_data: qrData });
      setShowQRModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Error generating QR code: " + error.message);
    }
  };

  const scheduleShipment = async (shipmentData) => {
    try {
      if (!user) return;

      const formatDateForSupabase = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString();
      };

      const newShipment = {
        user_id: user.id,
        product_id: shipmentData.productId,
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        scheduled_date: formatDateForSupabase(shipmentData.scheduledDate),
        estimated_delivery: formatDateForSupabase(shipmentData.estimatedDelivery),
        carrier: shipmentData.carrier || 'Not specified',
        tracking_number: shipmentData.trackingNumber || null,
        status: 'scheduled',
        notes: shipmentData.notes || ''
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert([newShipment])
        .select();

      if (error) throw error;

      await updateProductStatus(shipmentData.productId, 'shipped');
      await fetchUserShipments(user.id);
      setShowShipmentModal(false);
      
      alert('Shipment scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling shipment:', error);
      alert('Error scheduling shipment: ' + error.message);
    }
  };

  // downloadQRCode is handled inside QRModal directly via canvas rendering
  const downloadQRCode = () => {}; // kept for prop compatibility

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await Promise.all([
      fetchUserFarms(user.id),
      fetchUserProducts(user.id),
      fetchUserShipments(user.id)
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = [
    {
      label: "Total Farms",
      value: farms.length,
      icon: Sprout,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Products",
      value: products.length,
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "QR Codes",
      value: products.filter(p => p.qr_generated).length,
      icon: QrCode,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Shipments",
      value: shipments.length,
      icon: Truck,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: "Add Product",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => setShowAddProduct(true),
    },
    {
      icon: QrCode,
      label: "Generate QR",
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => {
        const productsWithoutQR = products.filter(p => p.status === 'packed' && !p.qr_generated);
        if (productsWithoutQR.length === 0) {
          alert("No packed products available for QR generation.");
          return;
        }
        generateQRCode(productsWithoutQR[0].id);
      },
    },
    {
      icon: Truck,
      label: "Schedule Shipment",
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => {
        const productsReadyToShip = products.filter(p => p.status === 'packed' && p.qr_generated);
        if (productsReadyToShip.length === 0) {
          alert("No products ready for shipment.");
          return;
        }
        setShowShipmentModal(true);
      },
    },
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-700 font-medium text-lg"
          >
            Loading your farm dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-60 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{ 
            x: [0, 120, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Sprout className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  FarmTrace
                </h1>
                <p className="text-gray-600 text-sm">Welcome back, {user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white text-gray-700 px-4 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-gray-50 border border-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddFarm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Farm</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps - Simple Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">Your Farming Journey</h3>
                <p className="text-gray-600 text-sm">
                  {farms.length} farms • {products.length} products • {shipments.length} shipments
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-white text-red-600 px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:bg-red-50 border border-red-200 transition-all duration-200 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Simple Steps */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { step: 1, title: "Add Farm", icon: Home },
              { step: 2, title: "Register Harvest", icon: Crop },
              { step: 3, title: "Pack Products", icon: Package },
              { step: 4, title: "Generate QR", icon: QrCode },
              { step: 5, title: "Schedule Shipment", icon: Truck },
              { step: 6, title: "Track Delivery", icon: Target },
            ].map(({ step, title, icon: Icon }) => (
              <motion.div
                key={step}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-gray-900 transition-colors">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 shadow-sm group"
                  >
                    <div className={`w-12 h-12 ${action.bgColor} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-gray-800 block">{action.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-8">
            {/* Farms Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                  Your Farms
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddFarm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Farm</span>
                </motion.button>
              </div>

              {farms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Sprout className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Start Your Farming Journey
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Add your first farm to begin tracking and managing your agricultural products.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddFarm(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 shadow-md"
                  >
                    Create Your First Farm
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.map((farm) => (
                    <motion.div
                      key={farm.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 text-lg group-hover:text-gray-900 transition-colors">
                          {farm.name}
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium group-hover:bg-green-200 transition-colors">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 text-sm flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {farm.location}
                        </p>
                        {farm.size && (
                          <p className="text-gray-600 text-sm">
                            📏 {farm.size} acres
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Products Section */}
            <ProductsSection 
              products={products} 
              onUpdateStatus={updateProductStatus}
              onGenerateQR={generateQRCode}
              onImageUpload={handleImageUpload}
              uploadingImage={uploadingImage}
              expandedProduct={expandedProduct}
              setExpandedProduct={setExpandedProduct}
              onAddProduct={() => setShowAddProduct(true)}
            />

            {/* Shipments Section */}
            <ShipmentsSection 
              shipments={shipments}
              onScheduleShipment={() => setShowShipmentModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddFarm && (
          <AddFarmModal
            onClose={() => setShowAddFarm(false)}
            onSave={handleAddFarm}
            userEmail={user?.email}
          />
        )}

        {showAddProduct && (
          <AddProductModal
            onClose={() => setShowAddProduct(false)}
            onSave={handleAddProduct}
            farms={farms}
            userEmail={user?.email}
          />
        )}

        {showQRModal && selectedProduct && (
          <QRModal
            product={selectedProduct}
            onClose={() => setShowQRModal(false)}
            onDownload={downloadQRCode}
          />
        )}

        {showShipmentModal && (
          <ShipmentModal
            onClose={() => setShowShipmentModal(false)}
            onSave={scheduleShipment}
            products={products.filter(p => p.status === 'packed' && p.qr_generated)}
            userEmail={user?.email}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerDashboard;