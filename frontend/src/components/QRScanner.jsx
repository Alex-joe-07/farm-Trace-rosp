import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { QrCodeIcon, XMarkIcon, CameraIcon, FolderIcon, KeyIcon } from '@heroicons/react/24/outline';

const QRScanner = ({ onScan, onClose }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [scanResult, setScanResult] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize scanner when isScanning becomes true
    if (isScanning && !scannerRef.current) {
      initializeScanner();
    }

    return () => {
      // Cleanup only when component unmounts or scanning stops
      if (scannerRef.current && !isScanning) {
        cleanupScanner();
      }
    };
  }, [isScanning]);

  const initializeScanner = () => {
    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [] 
        },
        false // verbose = false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          console.log("QR Code scanned:", decodedText);
          // Show result instead of auto-redirecting
          setScanResult(`Scanned: ${decodedText}`);
          // Don't clear scanner here - let user see the result
        },
        (error) => {
          // Ignore most errors, they're usually just "no QR code found"
          if (!error.includes("No MultiFormat Readers")) {
            console.log("Scan error:", error);
          }
        }
      );

      scannerRef.current = html5QrcodeScanner;
      setScanner(html5QrcodeScanner);
    } catch (error) {
      console.error("Failed to initialize scanner:", error);
      setIsScanning(false);
      setShowOptions(true);
    }
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(error => {
          console.log("Scanner cleanup error:", error);
        });
        scannerRef.current = null;
        setScanner(null);
      } catch (error) {
        console.error("Error cleaning up scanner:", error);
      }
    }
  };

  const startCameraScanner = () => {
    setShowOptions(false);
    setIsScanning(true);
    setScanResult(''); // Clear any previous results
  };

  const handleSelectFromFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setScanResult(`File selected: ${file.name}`);
        setShowOptions(false);
        setIsScanning(false);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleManualEntry = () => {
    const productId = prompt('Enter Product ID manually:', 'P-ORG-APPLE-4903A');
    if (productId) {
      setScanResult(`Manual Entry: ${productId}`);
      setShowOptions(false);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    cleanupScanner();
    onClose();
  };

  const handleBackToOptions = () => {
    setIsScanning(false);
    setShowOptions(true);
    setScanResult('');
    cleanupScanner();
  };

  const handleViewProduct = () => {
    if (scanResult) {
      const productId = scanResult.replace('Scanned: ', '').replace('Manual Entry: ', '').replace('File selected: ', '');
      // Clean up scanner before navigating
      cleanupScanner();
      onScan(productId);
    }
  };

  const simulateQRScan = () => {
    const mockResult = 'P-ORG-APPLE-4903A';
    setScanResult(`Scanned: ${mockResult}`);
    // Don't stop scanning - camera stays open for more scans
  };

  // Options Selection Screen
  if (showOptions && !isScanning) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startCameraScanner}
              className="w-full p-4 border-2 border-emerald-500 rounded-xl flex items-center justify-between hover:bg-emerald-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <CameraIcon className="w-6 h-6 text-emerald-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Open Camera</p>
                  <p className="text-sm text-gray-600">Scan QR code using your camera</p>
                </div>
              </div>
              <QrCodeIcon className="w-5 h-5 text-emerald-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSelectFromFile}
              className="w-full p-4 border-2 border-blue-500 rounded-xl flex items-center justify-between hover:bg-blue-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <FolderIcon className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Select from File</p>
                  <p className="text-sm text-gray-600">Choose QR code image from your files</p>
                </div>
              </div>
              <QrCodeIcon className="w-5 h-5 text-blue-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualEntry}
              className="w-full p-4 border-2 border-purple-500 rounded-xl flex items-center justify-between hover:bg-purple-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <KeyIcon className="w-6 h-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Enter Manually</p>
                  <p className="text-sm text-gray-600">Type product ID manually</p>
                </div>
              </div>
              <QrCodeIcon className="w-5 h-5 text-purple-600" />
            </motion.button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Choose how you want to scan the QR code
          </p>
        </motion.div>
      </div>
    );
  }

  // Camera Scanning Screen
  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {scanResult ? 'QR Code Scanned!' : 'Scanning QR Code...'}
            </h3>
            <button
              onClick={handleBackToOptions}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">
              {scanResult ? scanResult : 'Point your camera at a product QR code'}
            </p>
          </div>

          {/* QR Scanner Container */}
          <div id="qr-reader" className="mb-4"></div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {scanResult ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewProduct}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition duration-200"
                >
                  View Product Journey
                </motion.button>
                <button
                  onClick={() => setScanResult('')}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
                >
                  Scan Another Code
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={simulateQRScan}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
                >
                  Simulate Scan (Demo)
                </button>
                <button
                  onClick={handleBackToOptions}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
                >
                  Back to Options
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Result Screen (for file selection and manual entry)
  if (scanResult && !isScanning) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Result</h3>
            
            <p className="text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
              {scanResult}
            </p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewProduct}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition duration-200 w-full"
              >
                View Product Journey
              </motion.button>
              
              <button 
                onClick={handleBackToOptions}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Scan Another Code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default QRScanner;