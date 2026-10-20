// src/components/dashboard/LogisticsDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../config/supabase";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  LogOut,
  RefreshCw,
  Plus,
  Navigation,
  Thermometer,
  Battery,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  Download,
  Zap,
  ArrowRight,
  ChevronDown,
  QrCode,
  Camera,
  Bell,
  Users,
  Route,
  Target,
  AlertCircle,
  Upload,
  Clipboard,
  FileText,
  Check,
  FileUp,
} from "lucide-react";

// Floating Background Component
const FloatingBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
    <div className="absolute top-60 right-10 w-96 h-96 bg-cyan-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-100/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
  </div>
);

// Success Message Component
const SuccessMessage = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center space-x-3 animate-slide-in">
    <CheckCircle className="w-6 h-6" />
    <span className="font-bold">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-green-600 rounded-lg">
      <X className="w-4 h-4" />
    </button>
  </div>
);

// QR Scanner Modal Component with Camera, Upload & Paste options
const QRScannerModal = ({ isOpen, onClose, onScan, scanType, user }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'camera'
  const [scanning, setScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState({ error: '', success: '', data: null });
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  const DEMO_FARMER_QR = JSON.stringify({
    product_id: "c8165be5-31fe-4ad4-84f3-00696a41fbad",
    product_name: "tomatos",
    batch_number: "BATCH-2026-8",
    category: "fruits",
    farm: "rakesh farm",
    farm_location: "banaras",
    harvest_date: "2026-07-12",
    status: "shipped",
    generated_at: "2026-10-12T06:01:26.080Z"
  }, null, 2);

  const getScanTitle = () => {
    switch(scanType) {
      case 'receive': return 'Receive Products from Farmer';
      case 'checkpoint': return 'Update Checkpoint Location';
      case 'delivery': return 'Deliver to Retailer';
      default: return 'Scan QR Code';
    }
  };

  // Decode QR from an Image File using jsQR & Html5Qrcode
  const decodeQRFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, canvas.width, canvas.height, {
              inversionAttempts: "dontInvert"
            });
            if (code && code.data) {
              return resolve(code.data);
            }
            // Second attempt with inverted colors
            const codeInvert = jsQR(imgData.data, canvas.width, canvas.height, {
              inversionAttempts: "onlyInvert"
            });
            if (codeInvert && codeInvert.data) {
              return resolve(codeInvert.data);
            }
            reject(new Error("No QR code detected in this image. Please upload a clear QR code image."));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image file."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  };

  const handleProcessFile = async (file) => {
    if (!file) return;
    setProcessing(true);
    setScanStatus({ error: '', success: '', data: null });

    try {
      const decodedText = await decodeQRFromFile(file);
      await handleScanSuccess(decodedText);
    } catch (err) {
      console.warn("jsQR decode error, trying Html5Qrcode fallback:", err);
      // Fallback to Html5Qrcode
      try {
        const scannerId = "qr-temp-" + Date.now();
        const tempDiv = document.createElement("div");
        tempDiv.id = scannerId;
        document.body.appendChild(tempDiv);
        const scanner = new Html5Qrcode(scannerId, false);
        const decoded = await scanner.scanFile(file, false);
        scanner.clear();
        tempDiv.remove();
        if (decoded) {
          await handleScanSuccess(decoded);
          return;
        }
      } catch (h5Err) {
        console.error("Html5Qrcode file scan failed:", h5Err);
      }
      setScanStatus({ error: "Could not read QR code from image. Please ensure the image is clear or paste the QR text below.", success: '', data: null });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Listen for Clipboard Paste (Ctrl+V) anywhere inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleProcessFile(file);
            return;
          }
        }
      }

      const text = e.clipboardData?.getData('text');
      if (text && (text.includes('product_id') || text.includes('BATCH-') || text.includes('{'))) {
        setManualText(text);
        setActiveTab('paste');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const startQRScanner = async () => {
    try {
      setScanning(true);
      setScanStatus({ error: '', success: '', data: null });

      setTimeout(async () => {
        if (!qrRef.current) {
          setScanning(false);
          return;
        }

        try {
          const qrScanner = new Html5Qrcode(qrRef.current.id);
          setHtml5QrCode(qrScanner);

          await qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            () => {}
          );
        } catch (err) {
          console.warn("Camera start error, switching to upload mode:", err);
          setScanning(false);
          setActiveTab('upload');
          setScanStatus({ error: 'Camera is unavailable or permission was blocked. Please upload the QR image or paste the QR text below.', success: '', data: null });
        }
      }, 100);
    } catch (err) {
      setScanning(false);
      setActiveTab('upload');
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(decodedText);
      } catch (e) {
        // Plain text QR
      }

      const prodId = parsed.product_id || decodedText;
      const prodName = parsed.product_name || "Organic Product";
      const batchNo = parsed.batch_number || "BATCH-" + Math.floor(1000 + Math.random() * 9000);
      const farmName = parsed.farm || "Organic Farm";
      const temperature = (2.5 + Math.random() * 4.5).toFixed(1);

      const scanData = {
        productId: prodId,
        productName: prodName,
        batchNumber: batchNo,
        farm: farmName,
        temperature: temperature,
        timestamp: new Date().toISOString(),
        scanType: scanType,
        raw: decodedText
      };

      setScanStatus({
        error: '',
        success: `Verified: ${prodName} (${batchNo})`,
        data: scanData
      });

      // Save to logistics_qr_scans table
      try {
        await supabase
          .from('logistics_qr_scans')
          .insert([{
            user_id: user?.id,
            scan_type: scanType,
            product_data: scanData,
            scanned_data: decodedText,
            qr_data: decodedText,
            location: 'Checkpoint Station',
            temperature: parseFloat(temperature),
            handler_name: user?.email?.split('@')[0] || 'Handler',
            scanned_by: user?.email
          }]);
      } catch (dbErr) {
        console.warn("Scan recorded in frontend, DB warning:", dbErr);
      }

      await stopQRScanner();

      // Short delay so user sees confirmation before closing
      setTimeout(() => {
        onScan(scanData);
        onClose();
      }, 1200);

    } catch (error) {
      console.error('Error in handleScanSuccess:', error);
      setScanStatus({ error: 'Failed to process QR data: ' + error.message, success: '', data: null });
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) {
      setScanStatus({ error: 'Please enter or paste QR code text or JSON.', success: '', data: null });
      return;
    }
    handleScanSuccess(manualText.trim());
  };

  useEffect(() => {
    if (isOpen) {
      setScanStatus({ error: '', success: '', data: null });
      setManualText('');
      if (activeTab === 'camera') {
        startQRScanner();
      }
    } else {
      stopQRScanner();
    }
    return () => {
      stopQRScanner();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{getScanTitle()}</h3>
              <p className="text-xs text-gray-500">Scan, upload, or paste product QR code</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopQRScanner();
              onClose();
            }} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-6 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              stopQRScanner();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'upload' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopQRScanner();
              setActiveTab('paste');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'paste' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste QR Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'camera' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Status Alerts */}
        {scanStatus.error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">{scanStatus.error}</div>
          </div>
        )}

        {scanStatus.success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-green-900">{scanStatus.success}</p>
              {scanStatus.data && (
                <p className="text-xs text-green-700 mt-0.5">
                  Farm: {scanStatus.data.farm} • Temp: {scanStatus.data.temperature}°C
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Upload Image (Dropzone) */}
        {activeTab === 'upload' && (
          <div className="space-y-4 mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-3 shadow-inner">
                <FileUp className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">
                Click to browse or drag & drop QR image
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Supports PNG, JPG, JPEG, WEBP files (including farmer QR downloads)
              </p>
              <span className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                Select QR Image File
              </span>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 flex items-center justify-between">
              <span>💡 Tip: You can also press <strong>Ctrl+V</strong> to paste copied QR images!</span>
            </div>
          </div>
        )}

        {/* Tab 2: Paste QR Data / Manual Entry */}
        {activeTab === 'paste' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Paste QR Code Text or JSON Data
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder='Paste raw QR code text or JSON here (e.g. {"product_id":"...","product_name":"tomatos",...})'
                className="w-full p-3.5 border border-gray-300 rounded-2xl text-xs font-mono text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[110px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setManualText(DEMO_FARMER_QR)}
                className="flex-1 py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <span>⚡ Use Farmer's Demo QR (Tomatoes)</span>
              </button>

              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={processing || !manualText.trim()}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                Process QR Code
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Live Camera */}
        {activeTab === 'camera' && (
          <div className="bg-gray-100 rounded-2xl p-4 mb-6 text-center">
            {scanning ? (
              <div>
                <div id="qr-reader" ref={qrRef} className="w-full h-72 border-4 border-blue-300 rounded-2xl bg-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-semibold">Scanning for QR code...</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopQRScanner}
                  className="mt-3 text-xs text-red-600 font-bold hover:underline"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-base font-bold text-gray-800">Camera not active</p>
                <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                  If camera permissions are blocked on your laptop, use the <strong>Upload Image</strong> or <strong>Paste QR Data</strong> tabs instead!
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={startQRScanner}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
                  >
                    Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-300"
                  >
                    Switch to Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex space-x-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              stopQRScanner();
              onClose();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Vehicle Management Modal
const VehicleManagementModal = ({ isOpen, onClose, vehicles = [], user }) => {
  const [newVehicle, setNewVehicle] = useState({
    license_plate: '',
    vehicle_type: 'Truck',
    capacity: '',
    status: 'available'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleAddVehicle = async () => {
    if (!newVehicle.license_plate?.trim()) {
      setModalError('Please enter a license plate number.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      const plate = newVehicle.license_plate.trim();
      const { data, error } = await supabase
        .from('logistics_vehicles')
        .insert([{
          user_id: user?.id,
          license_plate: plate,
          vehicle_number: plate,
          vehicle_type: newVehicle.vehicle_type || 'Truck',
          capacity: newVehicle.capacity?.trim() || 'Standard',
          status: newVehicle.status || 'available'
        }])
        .select();

      if (error) throw error;

      setNewVehicle({ license_plate: '', vehicle_type: 'Truck', capacity: '', status: 'available' });
      onClose(true, "Vehicle added successfully!");
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setModalError(error.message || "Error adding vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const { error } = await supabase
        .from('logistics_vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;
      onClose(true, "Vehicle removed successfully!");
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setModalError(error.message || "Error deleting vehicle");
    }
  };

  if (!isOpen) return null;

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Manage Vehicles</h3>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {modalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
            <span>{modalError}</span>
            <button onClick={() => setModalError('')} className="text-red-500 hover:text-red-700 text-xs font-bold">DISMISS</button>
          </div>
        )}

        {/* Add New Vehicle Form */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Add New Vehicle</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
              <input 
                type="text" 
                value={newVehicle.license_plate}
                onChange={(e) => {
                  setNewVehicle({...newVehicle, license_plate: e.target.value});
                  if (modalError) setModalError('');
                }}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., DL-01-AB-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select 
                value={newVehicle.vehicle_type}
                onChange={(e) => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="Truck">Truck</option>
                <option value="Refrigerated Truck">Refrigerated Truck</option>
                <option value="Van">Van</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input 
                type="text" 
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., 2000 kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={newVehicle.status}
                onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="in_use">In Use</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleAddVehicle}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50"
          >
            {isSubmitting ? "ADDING VEHICLE..." : "ADD VEHICLE"}
          </button>
        </div>

        {/* Vehicles List */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">Your Registered Vehicles</h4>
          <div className="space-y-3">
            {vehicleList.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl bg-white hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">
                      {vehicle.license_plate || vehicle.vehicle_number || "Unnamed Vehicle"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {vehicle.vehicle_type || "Vehicle"} {vehicle.capacity ? `• ${vehicle.capacity}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-xl font-bold text-xs ${
                    vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                    vehicle.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {(vehicle.status || 'available').toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete vehicle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {vehicleList.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No vehicles registered yet</p>
                <p className="text-gray-400 text-xs">Add your first vehicle using the form above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Route Planning Modal
const RoutePlanningModal = ({ isOpen, onClose, shipments }) => {
  const [selectedShipment, setSelectedShipment] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  const handleOptimizeRoute = () => {
    if (!selectedShipment) return;

    const shipment = shipments.find(s => s.id === selectedShipment);
    if (!shipment) return;

    // Simulate route optimization
    const mockRoute = {
      shipment: shipment.shipment_id,
      origin: shipment.origin,
      destination: shipment.destination,
      totalDistance: `${Math.floor(Math.random() * 500) + 200} km`,
      estimatedTime: `${Math.floor(Math.random() * 8) + 4} hours`,
      waypoints: [
        `${shipment.origin} Warehouse`,
        'Distribution Center A',
        'Highway Checkpoint',
        `${shipment.destination} Terminal`
      ],
      fuelCost: `₹${Math.floor(Math.random() * 200) + 100}`,
      optimalSpeed: '65-75 km/h'
    };

    setOptimizedRoute(mockRoute);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Plan Delivery Route</h3>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Shipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Shipment</label>
            <select 
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a shipment</option>
              {shipments.filter(s => s.status === 'pending' || s.status === 'in_transit').map(shipment => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.shipment_id} - {shipment.origin} → {shipment.destination}
                </option>
              ))}
            </select>
          </div>

          {/* Optimize Route Button */}
          <button 
            onClick={handleOptimizeRoute}
            disabled={!selectedShipment}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            OPTIMIZE DELIVERY ROUTE
          </button>

          {/* Optimized Route Results */}
          {optimizedRoute && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Route Optimized Successfully!
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Distance</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.totalDistance}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Estimated Time</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Fuel Cost</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.fuelCost}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Optimal Speed</p>
                  <p className="text-lg font-bold text-green-900">{optimizedRoute.optimalSpeed}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-green-700 font-medium mb-2">Route Waypoints:</p>
                <div className="space-y-2">
                  {optimizedRoute.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center space-x-3 text-green-800">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span>{waypoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Route Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h5 className="font-bold text-blue-900 mb-2">Route Optimization Tips</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Consider traffic patterns during planning</li>
              <li>• Account for rest stops every 4 hours</li>
              <li>• Check weather conditions along the route</li>
              <li>• Plan refueling stops for long distances</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Available Vehicles Section Component - FIXED NON-CLASHING VERSION
const AvailableVehiclesSection = ({ vehicles, user, onOpenManage }) => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch ALL vehicles from database
  const fetchAllVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setAllVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllVehicles();
    }
  }, [user]);

  // Real-time subscription for vehicle updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('vehicles_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logistics_vehicles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Vehicle update:', payload);
          fetchAllVehicles(); // Refresh vehicles list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Update vehicle status with optimistic UI update
  const handleUpdateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      setUpdatingId(vehicleId);
      setAllVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));

      const { error } = await supabase
        .from('logistics_vehicles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) throw error;
      await fetchAllVehicles();
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      await fetchAllVehicles();
      return { success: false, error };
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-5">
        <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center">
          <Truck className="w-5 h-5 text-green-500 mr-2.5" />
          ALL VEHICLES
        </h3>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="ml-3 text-sm text-gray-500 font-medium">Loading fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-5 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-base leading-tight">FLEET VEHICLES</h3>
            <span className="text-[11px] text-gray-500 font-medium">{allVehicles.length} registered</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button 
            type="button"
            onClick={fetchAllVehicles}
            className="p-2 bg-gray-100/80 rounded-xl hover:bg-gray-200 transition-colors text-gray-600"
            title="Refresh fleet"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onOpenManage && (
            <button
              type="button"
              onClick={onOpenManage}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors"
            >
              + Manage
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Cards Stack */}
      <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden pr-0.5">
        {allVehicles.length === 0 ? (
          <div className="text-center py-6 px-3 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-700 text-sm font-bold">No vehicles registered</p>
            <p className="text-gray-400 text-xs mt-0.5 mb-3">Add vehicles to manage logistics fleet</p>
            {onOpenManage && (
              <button
                type="button"
                onClick={onOpenManage}
                className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Register First Vehicle
              </button>
            )}
          </div>
        ) : (
          allVehicles.map((vehicle) => {
            const plate = vehicle.license_plate || vehicle.vehicle_number || "DL-01-AB-1234";
            const isAvailable = vehicle.status === 'available';
            const isInUse = vehicle.status === 'in_use';
            const isMaintenance = vehicle.status === 'maintenance';

            return (
              <div 
                key={vehicle.id} 
                className="bg-white border border-gray-200/80 hover:border-blue-300 rounded-2xl p-3.5 shadow-sm hover:shadow transition-all duration-200 space-y-3"
              >
                {/* Plate & Status Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAvailable ? 'bg-emerald-100 text-emerald-700' :
                      isInUse ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-black text-gray-900 text-sm tracking-wider truncate">
                        {plate}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black uppercase shrink-0 border ${
                    isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    isInUse ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isInUse ? 'IN USE' : isAvailable ? 'READY' : 'MAINT.'}
                  </span>
                </div>

                {/* Specs Box */}
                <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400 font-medium text-[11px]">Type:</span>
                    <span className="font-bold text-gray-800 truncate max-w-[150px]">
                      {vehicle.vehicle_type || 'Truck'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-gray-400 font-medium text-[11px]">Capacity:</span>
                    <span className="font-bold text-gray-800">
                      {vehicle.capacity || 'Standard'}
                    </span>
                  </div>
                  {vehicle.current_location && (
                    <div className="flex justify-between items-center text-gray-600 pt-1 border-t border-gray-200/50">
                      <span className="text-gray-400 font-medium text-[11px]">Location:</span>
                      <span className="font-medium text-gray-700 truncate max-w-[140px]">
                        📍 {vehicle.current_location}
                      </span>
                    </div>
                  )}

                  {/* Fuel Meter */}
                  {vehicle.fuel_level !== undefined && vehicle.fuel_level !== null && (
                    <div className="pt-1.5 border-t border-gray-200/50">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1">
                        <span>FUEL LEVEL</span>
                        <span className={vehicle.fuel_level > 25 ? 'text-gray-800' : 'text-red-600'}>
                          {vehicle.fuel_level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            vehicle.fuel_level > 50 ? 'bg-emerald-500' :
                            vehicle.fuel_level > 20 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, vehicle.fuel_level))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Switcher (Segmented Control - Full Width, No Overflow) */}
                <div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100/90 rounded-xl">
                    <button
                      type="button"
                      disabled={updatingId === vehicle.id}
                      onClick={() => handleUpdateVehicleStatus(vehicle.id, 'in_use')}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                        isInUse 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-white/70'
                      }`}
                    >
                      In Use
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === vehicle.id}
                      onClick={() => handleUpdateVehicleStatus(vehicle.id, 'available')}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                        isAvailable 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-white/70'
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === vehicle.id}
                      onClick={() => handleUpdateVehicleStatus(vehicle.id, 'maintenance')}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                        isMaintenance 
                          ? 'bg-amber-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-amber-600 hover:bg-white/70'
                      }`}
                    >
                      Maint.
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Fleet Stats Summary (Fits Cleanly in Sidebar) */}
      {allVehicles.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/80 border border-emerald-100/80 rounded-xl py-2 px-1">
              <p className="text-xl font-black text-emerald-700 leading-tight">
                {allVehicles.filter(v => v.status === 'available').length}
              </p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">Ready</p>
            </div>
            <div className="bg-blue-50/80 border border-blue-100/80 rounded-xl py-2 px-1">
              <p className="text-xl font-black text-blue-700 leading-tight">
                {allVehicles.filter(v => v.status === 'in_use').length}
              </p>
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mt-0.5">In Use</p>
            </div>
            <div className="bg-amber-50/80 border border-amber-100/80 rounded-xl py-2 px-1">
              <p className="text-xl font-black text-amber-700 leading-tight">
                {allVehicles.filter(v => v.status === 'maintenance').length}
              </p>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">Maint.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, trend, color, onClick }) => {
  const colors = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-500", text: "text-blue-700", change: "text-blue-600" },
    green: { bg: "bg-green-50", iconBg: "bg-green-500", text: "text-green-700", change: "text-green-600" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-500", text: "text-purple-700", change: "text-purple-600" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-500", text: "text-amber-700", change: "text-amber-600" },
  };

  const colorSet = colors[color] || colors.blue;

  return (
    <div onClick={onClick} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-base font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight truncate">{value}</p>
          {change && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${colorSet.change}`}>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${colorSet.iconBg} rounded-2xl flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

// Temperature Alert Component
const TemperatureAlert = ({ currentTemp, optimalRange }) => {
  const [min, max] = optimalRange;
  const isCritical = currentTemp < min - 2 || currentTemp > max + 2;
  const isWarning = (currentTemp < min || currentTemp > max) && !isCritical;

  if (!isCritical && !isWarning) return null;

  return (
    <div className={`p-4 rounded-2xl border ${
      isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    } flex items-center space-x-3`}>
      <AlertCircle className={`w-6 h-6 ${isCritical ? 'text-red-600' : 'text-amber-600'}`} />
      <div>
        <p className={`font-bold ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
          Temperature {isCritical ? 'Critical' : 'Warning'}
        </p>
        <p className={`text-sm ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
          Current: {currentTemp}°C | Optimal: {min}-{max}°C
        </p>
      </div>
    </div>
  );
};

// Steps Guide Component
const StepsGuide = () => {
  const [expanded, setExpanded] = useState(false);

  const steps = [
    {
      step: 1,
      title: "Receive Products",
      description: "Scan QR code when receiving from farmer",
      details: "Records: 'Received at Warehouse, 8°C'"
    },
    {
      step: 2,
      title: "Update During Transit",
      description: "Scan at each checkpoint (warehouse/transfers)",
      details: "Records temperature, location, and handler"
    },
    {
      step: 3,
      title: "Final Delivery",
      description: "Scan QR when delivering to retailer",
      details: "Retailer confirms receipt on arrival"
    },
    {
      step: 4,
      title: "Verification",
      description: "End-to-end transparent cold-chain trail",
      details: "Full traceability from farm to fork"
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-5">
      <div 
        className="flex items-center justify-between cursor-pointer select-none" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-base leading-tight">STEPS GUIDE</h3>
            <span className="text-[11px] text-gray-500 font-medium">4 steps to delivery</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg">
            {expanded ? "Hide" : "View"}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-2.5 pt-3 border-t border-gray-100">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start space-x-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100/80">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                <p className="text-gray-600 text-xs mt-0.5">{step.description}</p>
                <p className="text-gray-500 text-[11px] mt-0.5 italic">{step.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Shipment Card Component
const ShipmentCard = React.memo(({ shipment, onUpdateLocation, onScanQR, user }) => {
  const [expanded, setExpanded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [currentScanType, setCurrentScanType] = useState('checkpoint');

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      in_transit: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      received: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || colors.pending;
  };

  const latestTracking = shipment.logistics_tracking?.[0] || {
    location_name: "No tracking data",
    temperature: "N/A",
    battery_level: "N/A",
    speed_kmh: "N/A",
    created_at: new Date().toISOString(),
  };

  const handleScan = async (scanData) => {
    try {
      // Save QR scan to database
      const { data, error } = await supabase
        .from('logistics_qr_scans')
        .insert([{
          user_id: user?.id,
          shipment_id: shipment?.id,
          scan_type: currentScanType,
          product_data: scanData,
          qr_data: scanData.raw || scanData.productId || JSON.stringify(scanData),
          scanned_data: scanData.raw || scanData.productId || JSON.stringify(scanData),
          location: latestTracking?.location_name || 'Checkpoint Location',
          temperature: parseFloat(scanData.temperature) || 4.0,
          handler_name: user?.email?.split('@')[0] || 'Handler',
          scanned_by: user?.email
        }])
        .select();

      if (error) console.warn('Warning saving shipment scan:', error);

      // Update shipment status based on scan type
      let newStatus = shipment.status;
      if (currentScanType === 'receive') newStatus = 'received';
      if (currentScanType === 'delivery') newStatus = 'delivered';

      if (newStatus !== shipment.status) {
        await supabase
          .from('logistics_shipments')
          .update({ status: newStatus })
          .eq('id', shipment.id);
      }

      onScanQR(scanData);
    } catch (error) {
      console.error('Error saving QR scan:', error);
    }
  };

  const openScanner = (scanType) => {
    setCurrentScanType(scanType);
    setShowScanner(true);
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 sm:p-6 cursor-pointer bg-gradient-to-r from-white to-gray-50/50 hover:to-blue-50/30 transition-all duration-300 gap-4" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-blue-600">
              <Package className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h4 className="font-bold text-gray-900 text-lg tracking-wide truncate">{shipment.shipment_id}</h4>
                <span className={`px-3 py-0.5 text-xs rounded-full font-bold border ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700 truncate">{shipment.origin} → {shipment.destination}</p>
              {shipment.product_type && <p className="text-xs text-gray-500 mt-0.5">📦 {shipment.product_type} • {shipment.quantity}</p>}
              {latestTracking && <p className="text-xs text-gray-500 mt-0.5">📍 {latestTracking.location_name} • 🕒 {new Date(latestTracking.created_at).toLocaleTimeString()}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
            <button onClick={(e) => { e.stopPropagation(); openScanner('checkpoint'); }} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-md transition-all duration-200 shadow-sm flex items-center space-x-2 text-sm">
              <QrCode className="w-4 h-4" />
              <span>Scan QR</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); onUpdateLocation(shipment.id); }} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-md transition-all duration-200 shadow-sm flex items-center space-x-2 text-sm">
              <Navigation className="w-4 h-4" />
              <span>Update</span>
            </button>

            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="p-6 space-y-6">
              {latestTracking.temperature && <TemperatureAlert currentTemp={latestTracking.temperature} optimalRange={[2, 8]} />}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Thermometer className="w-6 h-6 text-blue-500" /><p className="text-gray-600 font-bold text-lg">Temperature</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.temperature || "N/A"}°C</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Battery className="w-6 h-6 text-green-500" /><p className="text-gray-600 font-bold text-lg">Battery</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.battery_level || "N/A"}%</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Navigation className="w-6 h-6 text-purple-500" /><p className="text-gray-600 font-bold text-lg">Speed</p></div>
                  <p className="text-3xl font-bold text-gray-900">{latestTracking.speed_kmh || "N/A"} km/h</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3"><Clock className="w-6 h-6 text-amber-500" /><p className="text-gray-600 font-bold text-lg">Last Update</p></div>
                  <p className="text-xl font-bold text-gray-900">{new Date(latestTracking.created_at).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => openScanner('receive')} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Receive</span>
                </button>
                <button onClick={() => openScanner('checkpoint')} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Checkpoint</span>
                </button>
                <button onClick={() => openScanner('delivery')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Delivery</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QRScannerModal 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
        onScan={handleScan} 
        scanType={currentScanType}
        user={user}
      />
    </>
  );
});

// Header Component
const Header = React.memo(({ user, onRefresh, refreshing, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="relative bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <div className="flex items-center space-x-3.5 shrink-0">
            <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-md">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-none">LOGISTICS PRO</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Supply Chain Management Platform</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyPress={handleSearch} 
                placeholder="Search shipments, vehicles, routes..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300/80 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-inner text-sm font-medium" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button onClick={onRefresh} disabled={refreshing} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50" title="Refresh data">
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right max-w-[160px] sm:max-w-[200px] hidden sm:block">
                <p className="font-bold text-gray-900 text-sm truncate">{user?.email}</p>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Logistics Manager</p>
              </div>
              <button onClick={onLogout} className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all" title="Sign out">
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Quick Actions Component
const QuickActions = React.memo(({ actions }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
    <h3 className="font-black text-gray-900 text-xl mb-6 flex items-center">
      <Zap className="w-6 h-6 text-yellow-500 mr-3" />
      QUICK ACTIONS
    </h3>
    <div className="space-y-3">
      {actions.map((action, index) => (
        <button 
          key={action.label} 
          onClick={action.onClick} 
          disabled={action.disabled}
          className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 border shadow-sm group ${
            action.disabled 
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
              : 'bg-gradient-to-r from-white to-gray-50/50 border-transparent hover:border-gray-200 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-300 ${
            action.disabled 
              ? 'bg-gray-200' 
              : `${action.bgColor} group-hover:scale-110`
          }`}>
            <action.icon className={`w-6 h-6 ${action.disabled ? 'text-gray-400' : action.textColor}`} />
          </div>
          <div className="flex-1 text-left">
            <span className={`font-bold text-lg block ${
              action.disabled ? 'text-gray-500' : 'text-gray-900'
            }`}>{action.label}</span>
            <span className={`text-base block ${
              action.disabled ? 'text-gray-400' : 'text-gray-600'
            }`}>{action.description}</span>
          </div>
          <ArrowRight className={`w-5 h-5 ${
            action.disabled ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-600'
          } transition-colors`} />
        </button>
      ))}
    </div>
  </div>
));

// Main LogisticsDashboard Component
const LogisticsDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [showVehicleManagement, setShowVehicleManagement] = useState(false);
  const [showRoutePlanning, setShowRoutePlanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newShipment, setNewShipment] = useState({
    origin: '',
    destination: '',
    product_type: '',
    quantity: ''
  });
  const navigate = useNavigate();

  // Memoized data fetching function
  const fetchDashboardData = useCallback(async (userId) => {
    try {
      setRefreshing(true);

      // Fetch shipments with tracking data
      try {
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('logistics_shipments')
          .select(`
            *,
            logistics_tracking (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (shipmentsError) console.error('Shipments error:', shipmentsError);
        
        setShipments(shipmentsData || []);
        setActiveShipments(shipmentsData?.filter(s => s.status === 'in_transit') || []);

        // Calculate stats
        const totalShipments = shipmentsData?.length || 0;
        const activeShipmentsCount = shipmentsData?.filter(s => s.status === 'in_transit').length || 0;
        const deliveredToday = shipmentsData?.filter(s => {
          const today = new Date().toDateString();
          const deliveredDate = new Date(s.updated_at).toDateString();
          return s.status === 'delivered' && deliveredDate === today;
        }).length || 0;

        setStats({
          totalShipments,
          activeShipments: activeShipmentsCount,
          deliveredToday,
          pending: Math.max(0, totalShipments - activeShipmentsCount - deliveredToday),
          totalDistance: 1250
        });
      } catch (sErr) {
        console.error('Shipments fetch error:', sErr);
      }

      // Fetch vehicles
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('logistics_vehicles')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (vehiclesError) console.error('Vehicles error:', vehiclesError);
        setVehicles(vehiclesData || []);
      } catch (vErr) {
        console.error('Vehicles fetch error:', vErr);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate("/login"); return; }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }

        setUser(user);
        await fetchDashboardData(user.id);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [fetchDashboardData, navigate]);

  // Optimized real-time subscription - only subscribe once
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('tracking_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'logistics_tracking',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New tracking update:', payload);
          // Only update specific shipment instead of refreshing all data
          setShipments(prev => prev.map(shipment => 
            shipment.id === payload.new.shipment_id 
              ? { 
                  ...shipment, 
                  logistics_tracking: [payload.new, ...(shipment.logistics_tracking || [])].slice(0, 5) 
                }
              : shipment
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const simulateTrackingUpdate = async (shipmentId) => {
    try {
      const trackingData = {
        user_id: user.id,
        shipment_id: shipmentId,
        latitude: 34.0522 + (Math.random() - 0.5) * 2,
        longitude: -118.2437 + (Math.random() - 0.5) * 2,
        location_name: `Checkpoint ${Math.floor(Math.random() * 50) + 1}`,
        temperature: 4 + Math.random() * 4,
        humidity: 60 + Math.random() * 20,
        speed_kmh: 50 + Math.random() * 40,
        battery_level: 70 + Math.random() * 25,
        event_type: "location_update"
      };

      const { data, error } = await supabase
        .from('logistics_tracking')
        .insert([trackingData])
        .select();

      if (error) throw error;

      // Optimized update - only update the specific shipment
      setShipments(prev => prev.map(shipment => 
        shipment.id === shipmentId 
          ? { 
              ...shipment, 
              logistics_tracking: [data[0], ...(shipment.logistics_tracking || [])].slice(0, 5) 
            }
          : shipment
      ));

      setSuccessMessage("Location updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      console.error('Error updating location:', error);
      setSuccessMessage("Error updating location");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCreateShipment = async () => {
    try {
      const shipmentData = {
        user_id: user.id,
        shipment_id: `SHIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        origin: newShipment.origin,
        destination: newShipment.destination,
        product_type: newShipment.product_type,
        quantity: newShipment.quantity,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('logistics_shipments')
        .insert([shipmentData])
        .select();

      if (error) throw error;

      setShowCreateShipment(false);
      setNewShipment({ origin: '', destination: '', product_type: '', quantity: '' });
      
      // Add new shipment to state instead of refetching all data
      const newShipmentData = data[0];
      setShipments(prev => [newShipmentData, ...prev]);
      setActiveShipments(prev => [newShipmentData, ...prev]);
      
      // Show success message
      setSuccessMessage("Shipment created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalShipments: prev.totalShipments + 1,
        pending: prev.pending + 1
      }));
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      setSuccessMessage("Error creating shipment. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleQRScan = (scanData) => {
    setSuccessMessage(`QR Scan Successful! ${scanData.productName} recorded at ${scanData.temperature}°C`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Export data function
  const handleExport = () => {
    const dataToExport = activeShipments.map(shipment => ({
      'Shipment ID': shipment.shipment_id,
      'Origin': shipment.origin,
      'Destination': shipment.destination,
      'Product Type': shipment.product_type,
      'Quantity': shipment.quantity,
      'Status': shipment.status,
      'Last Location': shipment.logistics_tracking?.[0]?.location_name || 'N/A',
      'Temperature': shipment.logistics_tracking?.[0]?.temperature || 'N/A',
      'Last Update': shipment.logistics_tracking?.[0]?.created_at || 'N/A'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSuccessMessage("Data exported successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Filter shipments function
  const handleFilter = () => {
    // Toggle between all shipments and active shipments
    if (activeShipments.length === shipments.filter(s => s.status === 'in_transit').length) {
      // Show all shipments
      setActiveShipments(shipments);
      setSuccessMessage("Showing all shipments");
    } else {
      // Show only active shipments
      setActiveShipments(shipments.filter(s => s.status === 'in_transit'));
      setSuccessMessage("Filtered to show active shipments only");
    }
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Quick actions handlers
  const handleScanQRAction = () => {
    setShowQRScanner(true);
  };

  const handleManageVehicles = () => {
    setShowVehicleManagement(true);
  };

  const handlePlanRoute = () => {
    setShowRoutePlanning(true);
  };

  const handleVehicleModalClose = (success, message) => {
    setShowVehicleManagement(false);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    if (success) {
      fetchDashboardData(user.id);
    }
  };

  const handleRouteModalClose = (success) => {
    setShowRoutePlanning(false);
    if (success) {
      setSuccessMessage("Route optimized successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleQuickActionQRScan = (scanData) => {
    setSuccessMessage(`QR Scan Successful! ${scanData.productName} recorded`);
    setTimeout(() => setSuccessMessage(""), 3000);
    setShowQRScanner(false);
  };

  // Memoized quick actions - ALL BUTTONS ENABLED AND FUNCTIONAL
  const quickActions = React.useMemo(() => [
    {
      icon: QrCode,
      label: "Scan QR Code",
      description: "Scan product QR for receiving",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: handleScanQRAction,
      disabled: false
    },
    {
      icon: Truck,
      label: "Manage Vehicles",
      description: "View and manage your vehicle fleet",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: handleManageVehicles,
      disabled: false
    },
    {
      icon: Route,
      label: "Plan Route",
      description: "Optimize delivery routes",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: handlePlanRoute,
      disabled: false
    },
    {
      icon: Plus,
      label: "New Shipment",
      description: "Create a new logistics shipment",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      onClick: () => setShowCreateShipment(true),
      disabled: false
    },
  ], []);

  // Memoized dashboard stats with functionality
  const dashboardStats = React.useMemo(() => [
    {
      label: "Total Shipments",
      value: stats.totalShipments || 0,
      icon: Package,
      change: "+12% this month",
      trend: "up",
      color: "blue",
      onClick: () => {
        setActiveShipments(shipments);
        setSuccessMessage("Showing all shipments");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Active Now",
      value: stats.activeShipments || 0,
      icon: Navigation,
      change: "In transit",
      trend: "up",
      color: "green",
      onClick: () => {
        setActiveShipments(shipments.filter(s => s.status === 'in_transit'));
        setSuccessMessage("Showing active shipments only");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Delivered Today",
      value: stats.deliveredToday || 0,
      icon: CheckCircle,
      change: "On schedule",
      trend: "up",
      color: "purple",
      onClick: () => {
        const today = new Date().toDateString();
        const deliveredToday = shipments.filter(s => {
          const deliveredDate = new Date(s.updated_at).toDateString();
          return s.status === 'delivered' && deliveredDate === today;
        });
        setActiveShipments(deliveredToday);
        setSuccessMessage("Showing deliveries from today");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    {
      label: "Total Distance",
      value: `${stats.totalDistance || 0} km`,
      icon: MapPin,
      change: "This month",
      trend: "up",
      color: "amber",
      onClick: () => {
        setSuccessMessage("Total distance tracked: 1,250 km this month");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
  ], [stats, shipments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-700 font-bold text-2xl">Loading Logistics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50">
      <FloatingBackground />
      
      {/* Success Message */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage("")} 
        />
      )}
      
      <Header user={user} onRefresh={() => fetchDashboardData(user?.id)} refreshing={refreshing} onLogout={handleLogout} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-[350px] xl:w-[370px] shrink-0 space-y-6">
            <QuickActions actions={quickActions} />
            <StepsGuide />
            
            {/* Available Vehicles Section */}
            <AvailableVehiclesSection 
              vehicles={vehicles} 
              user={user} 
              onOpenManage={() => setShowVehicleManagement(true)}
            />
          </div>

          {/* Main Content */}
          <div className="w-full lg:flex-1 min-w-0 space-y-8">
            {/* Active Shipments Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    ACTIVE SHIPMENTS
                  </h2>
                  <p className="text-gray-600 mt-2 text-lg font-medium">Real-time tracking and monitoring</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleFilter}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-5 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 shadow-sm"
                  >
                    <Filter className="w-5 h-5" />
                    <span>FILTER</span>
                  </button>
                  <button 
                    onClick={handleExport}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center space-x-3 shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    <span>EXPORT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {activeShipments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">NO ACTIVE SHIPMENTS</h3>
                    <p className="text-gray-600 mb-6 text-lg">All shipments are currently delivered or pending</p>
                    <button 
                      onClick={() => setShowCreateShipment(true)} 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-black hover:shadow-lg transition-all duration-200 shadow-md text-lg"
                    >
                      CREATE NEW SHIPMENT
                    </button>
                  </div>
                ) : (
                  activeShipments.map((shipment) => (
                    <ShipmentCard 
                      key={shipment.id} 
                      shipment={shipment} 
                      onUpdateLocation={simulateTrackingUpdate} 
                      onScanQR={handleQRScan} 
                      user={user} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreateShipment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Shipment</h3>
              <button onClick={() => setShowCreateShipment(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                <input type="text" value={newShipment.origin} onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Farm A, California" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input type="text" value={newShipment.destination} onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Market B, San Francisco" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <input type="text" value={newShipment.product_type} onChange={(e) => setNewShipment({...newShipment, product_type: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Fresh Tomatoes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input type="text" value={newShipment.quantity} onChange={(e) => setNewShipment({...newShipment, quantity: e.target.value})} className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 500 kg" />
              </div>
            </div>

            <button onClick={handleCreateShipment} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors mt-6">
              CREATE SHIPMENT
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Management Modal */}
      <VehicleManagementModal 
        isOpen={showVehicleManagement}
        onClose={handleVehicleModalClose}
        vehicles={vehicles}
        user={user}
      />

      {/* Route Planning Modal */}
      <RoutePlanningModal 
        isOpen={showRoutePlanning}
        onClose={handleRouteModalClose}
        shipments={shipments}
      />

      {/* QR Scanner Modal for Quick Action */}
      <QRScannerModal 
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQuickActionQRScan}
        scanType="checkpoint"
        user={user}
      />
    </div>
  );
};

export default LogisticsDashboard;