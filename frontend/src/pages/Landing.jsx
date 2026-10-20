import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import {
  Users,
  Truck,
  Store,
  QrCode,
  Smartphone,
  X,
  ArrowRight,
  Eye,
  Camera,
  FolderOpen,
  Shield,
  Leaf,
  Zap,
  Sparkles,
  CheckCircle,
  Star,
  Globe,
  Target,
  BarChart3,
  Clock,
  MapPin,
} from "lucide-react";

// --- QR Scanner Component ---
const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [scanResult, setScanResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Stop camera function
  const stopCamera = useCallback(() => {
    console.log("Stopping camera...");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    setCameraActive(false);
    setIsScanning(false);
    setIsVideoReady(false);
  }, []);

  // Safe video play function
  const safePlayVideo = useCallback(async () => {
    if (!videoRef.current) {
      console.log("Video ref not available");
      return;
    }

    try {
      if (!document.contains(videoRef.current)) {
        console.log("Video element no longer in DOM");
        return;
      }

      if (!videoRef.current.srcObject) {
        console.log("Video has no source object");
        return;
      }

      await videoRef.current.play();
      console.log("Video playback started successfully");
      setIsVideoReady(true);
      setScanResult("Camera ready - Point at QR code to scan");
    } catch (playError) {
      console.error("Error playing video:", playError);
      if (playError.name === "AbortError") {
        console.log("Video play was aborted - component likely unmounting");
      } else {
        setError(
          "Camera started but needs interaction. Click anywhere to continue."
        );
      }
    }
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      stopCamera();

      setError(null);
      setIsScanning(true);
      setShowOptions(false);
      setShowResult(false);
      setIsVideoReady(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      console.log("Requesting camera permission...");
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      console.log("Camera permission granted");

      streamRef.current = mediaStream;
      setCameraActive(true);

      await new Promise((resolve) => setTimeout(resolve, 50));

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        const videoElement = videoRef.current;

        const handleLoadedMetadata = async () => {
          console.log("Video metadata loaded");
          await safePlayVideo();
        };

        const handleCanPlay = async () => {
          console.log("Video can play");
          if (!isVideoReady) {
            await safePlayVideo();
          }
        };

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.addEventListener("canplay", handleCanPlay);

        if (videoElement.readyState >= 3) {
          await safePlayVideo();
        }

        const playTimeout = setTimeout(async () => {
          if (videoElement && !isVideoReady) {
            await safePlayVideo();
          }
        }, 500);

        return () => {
          videoElement.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
          videoElement.removeEventListener("canplay", handleCanPlay);
          clearTimeout(playTimeout);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      handleCameraError(err);
    }
  }, [stopCamera, safePlayVideo, isVideoReady]);

  // Handle camera errors
  const handleCameraError = (err) => {
    let errorMessage = "Failed to access camera";

    if (
      err.name === "NotAllowedError" ||
      err.name === "PermissionDeniedError"
    ) {
      errorMessage =
        "Camera access was denied. Please allow camera permissions in your browser settings and try again.";
    } else if (
      err.name === "NotFoundError" ||
      err.name === "OverconstrainedError"
    ) {
      errorMessage =
        "No suitable camera found. Please check if your device has a camera.";
    } else if (err.name === "NotSupportedError") {
      errorMessage =
        "Camera not supported in this browser. Try using Chrome, Firefox, or Safari.";
    } else {
      errorMessage = `Camera error: ${err.message || "Unknown error"}`;
    }

    setError(errorMessage);
    stopCamera();
    setShowOptions(true);
  };

  // Handle back to options
  const handleBackToOptions = useCallback(() => {
    console.log("Going back to options");
    stopCamera();
    setShowResult(false);
    setShowOptions(true);
    setScanResult("");
    setError(null);
  }, [stopCamera]);

  // Handle view product
  const handleViewProduct = () => {
    if (scanResult) {
      const productId = scanResult
        .replace("Scanned: ", "")
        .replace("Manual Entry: ", "")
        .replace("File selected: ", "");
      console.log("Product ID to view:", productId);
      stopCamera();
      onScan(productId);
    }
  };

  // Handle close
  const handleClose = () => {
    console.log("Closing scanner");
    stopCamera();
    onClose();
  };

  // Handle file selection
  const handleSelectFromFile = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setScanResult(`File selected: ${file.name}`);
        setShowOptions(false);
        setIsScanning(false);
        setShowResult(true);
        console.log("File selected:", file.name);
      }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleManualEntry = () => {
    const productId = window.prompt(
      "Enter Product ID manually:",
      "P-ORG-APPLE-4903A"
    );
    if (productId) {
      setScanResult(`Manual Entry: ${productId}`);
      setShowOptions(false);
      setIsScanning(false);
      setShowResult(true);
    }
  };

  const simulateQRScan = () => {
    const mockResult = "P-ORG-APPLE-4903A";
    setScanResult(`Scanned: ${mockResult}`);
    setShowOptions(false);
    setIsScanning(false);
    setShowResult(true);
  };

  // Safe video click handler
  const handleVideoClick = async () => {
    if (videoRef.current && videoRef.current.paused && cameraActive) {
      try {
        await safePlayVideo();
      } catch (err) {
        console.log("Video play on click failed:", err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Scanner component unmounting - cleaning up");
      stopCamera();
    };
  }, [stopCamera]);

  // Add CSS for scanning animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes scan-line {
        0% { top: 0%; }
        100% { top: 100%; }
      }
      .animate-scan-line {
        animation: scan-line 2s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Options Selection Screen
  if (showOptions) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white p-6 rounded-3xl shadow-2xl shadow-emerald-700/30 max-w-md w-full border-4 border-emerald-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <QrCode className="w-6 h-6 mr-2 text-emerald-600" />
              Scan QR Code
            </h2>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={initializeCamera}
              className="w-full p-4 border-2 border-emerald-500 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <Camera className="w-6 h-6 text-emerald-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Open Camera</p>
                  <p className="text-sm text-gray-600">
                    Scan QR code using your camera
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600 transition" />
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSelectFromFile}
              className="w-full p-4 border-2 border-blue-500 rounded-2xl flex items-center justify-between hover:bg-blue-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    Select from File
                  </p>
                  <p className="text-sm text-gray-600">
                    Choose QR code image from your files
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 transition" />
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 20px rgba(147, 51, 234, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualEntry}
              className="w-full p-4 border-2 border-purple-500 rounded-2xl flex items-center justify-between hover:bg-purple-50 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Enter Manually</p>
                  <p className="text-sm text-gray-600">
                    Type product ID manually
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 transition" />
            </motion.button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6 pt-4 border-t border-gray-100">
            <Eye className="w-4 h-4 inline mr-1" />
            Choose how you want to track your product
          </p>
        </motion.div>
      </div>
    );
  }

  // Camera Scanning Screen
  if (isScanning) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-emerald-600" />
              Camera Scanner
            </h2>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBackToOptions}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <div
            className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden mb-6 cursor-pointer"
            onClick={handleVideoClick}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform scale-x-[-1]"
              playsInline
              muted
            />
            {cameraActive && !error && isVideoReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="absolute inset-4 border-[6px] border-white/50 rounded-lg pointer-events-none">
                  <div className="w-full h-1 bg-red-500 absolute top-0 animate-scan-line shadow-red-500/80" />
                </div>
              </div>
            )}
            {!isVideoReady && cameraActive && !error && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                  }}
                  className="text-white text-center p-4 text-lg font-medium"
                >
                  <Camera className="w-8 h-8 mx-auto mb-2 text-emerald-400 animate-pulse" />
                  Initializing camera...
                  <br />
                  <span className="text-sm text-gray-300">
                    Tap to manually start video if needed
                  </span>
                </motion.p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-red-100/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-red-700 font-medium text-lg mb-4">
                    {error}
                  </p>
                  <button
                    onClick={handleBackToOptions}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
                  >
                    Back to Options
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-gray-700 p-2 bg-gray-100 rounded-lg">
              {scanResult ||
                (isVideoReady
                  ? "Point camera at QR code to scan..."
                  : "Awaiting video stream...")}
            </p>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(16, 185, 129, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={simulateQRScan}
              className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg w-full sm:w-auto"
            >
              Simulate QR Scan (Demo)
            </motion.button>

            <button
              onClick={handleBackToOptions}
              className="text-sm text-gray-500 hover:text-gray-700 underline block mx-auto pt-2"
            >
              Cancel Scan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Result Screen
  if (showResult) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-emerald-100"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <QrCode className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Scan Successful!
            </h3>

            <p className="text-gray-700 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 break-all text-sm font-mono">
              {scanResult}
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(16, 185, 129, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewProduct}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition w-full shadow-lg"
              >
                View Product Journey
              </motion.button>

              <button
                onClick={handleBackToOptions}
                className="text-base text-gray-600 hover:text-gray-800 font-medium transition"
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

// Enhanced StyledUserTypeCard with better animations and design
// In your Landing.jsx - Find the StyledUserTypeCard component and update it:

const StyledUserTypeCard = ({
  Icon,
  title,
  description,
  link,
  color,
  role,
  features,
}) => {
  const navigate = useNavigate();

  const colorConfig = {
    emerald: {
      bg: "bg-white",
      border: "border-slate-200/90 hover:border-emerald-500/50",
      iconBg: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-700",
      accent: "text-emerald-700",
      button: "text-slate-800 group-hover:text-emerald-700",
    },
    blue: {
      bg: "bg-white",
      border: "border-slate-200/90 hover:border-blue-500/50",
      iconBg: "bg-blue-50 border border-blue-100",
      iconColor: "text-blue-700",
      accent: "text-blue-700",
      button: "text-slate-800 group-hover:text-blue-700",
    },
    purple: {
      bg: "bg-white",
      border: "border-slate-200/90 hover:border-purple-500/50",
      iconBg: "bg-purple-50 border border-purple-100",
      iconColor: "text-purple-700",
      accent: "text-purple-700",
      button: "text-slate-800 group-hover:text-purple-700",
    },
  }[color];

  const handleCardClick = () => {
    console.log(`🔄 Navigating to login with role: ${role}`);

    // Store the selected role for signup process
    localStorage.setItem("selectedRole", role);

    // Navigate to login page
    navigate("/login");
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-8 rounded-2xl border ${colorConfig.border} ${colorConfig.bg} transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer flex flex-col justify-between`}
      onClick={handleCardClick}
    >
      <div className="relative z-10">
        <div
          className={`w-14 h-14 ${colorConfig.iconBg} rounded-xl flex items-center justify-center mb-5 mx-auto transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon
            className={`w-7 h-7 ${colorConfig.iconColor}`}
            strokeWidth={1.8}
          />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
          {title}
        </h3>
        <p className="text-xs text-slate-600 mb-6 text-center leading-relaxed">
          {description}
        </p>

        {/* Features list */}
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center text-sm text-gray-500"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              {feature}
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ x: 5 }}
          className={`flex items-center justify-center font-semibold transition duration-300 group ${colorConfig.button} space-x-2`}
        >
          <span>Login as {role}</span>{" "}
          {/* Changed text from "Join as" to "Login as" */}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  step,
  title,
  description,
  icon: Icon,
  color,
  delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="relative p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-colors">
          <Icon className="w-6 h-6 text-slate-800 group-hover:text-emerald-700 transition-colors" strokeWidth={1.8} />
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Step 0{step}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// New Component: Stats counter
const StatCard = ({ number, label, icon: Icon, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = number / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCount(Math.min(Math.floor(stepValue * currentStep), number));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center p-6"
    >
      <div
        className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
};

export default function Landing() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  // Authentication check - if user is already logged in, redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // If user is already logged in, redirect them to dashboard
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleScan = (decodedText) => {
    console.log("QR Code scanned:", decodedText);
    setShowScanner(false);
    // Show product journey - you can implement this based on your needs
    alert(
      `Product Journey for: ${decodedText}\n\nThis would show the complete farm-to-table journey in a real implementation.`
    );
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  // Enhanced data arrays
  const userTypes = [
    {
      Icon: Users,
      title: "For Farmers",
      description:
        "Digitize your harvest, generate tamper-proof QR codes, and prove the organic journey from the very first seed.",
      link: "/signup?role=farmer",
      color: "emerald",
      role: "Farmer",
      features: [
        "QR Code Generation",
        "Crop Tracking",
        "Organic Certification",
        "Supply Chain Visibility",
      ],
    },
    {
      Icon: Truck,
      title: "For Logistics",
      description:
        "Efficiently track and update product locations in real-time. Ensure cold-chain integrity and accountability during transport.",
      link: "/signup?role=logistics",
      color: "blue",
      role: "Logistics",
      features: [
        "Real-time Tracking",
        "Temperature Monitoring",
        "Route Optimization",
        "Delivery Verification",
      ],
    },
    {
      Icon: Store,
      title: "For Retailers",
      description:
        "Verify authenticity instantly, reduce spoilage, and provide customers with the full product story to build unparalleled trust.",
      link: "/signup?role=retailer",
      color: "purple",
      role: "Retailer",
      features: [
        "Authenticity Verification",
        "Inventory Management",
        "Customer Insights",
        "Brand Trust Building",
      ],
    },
  ];

  const features = [
    {
      step: 1,
      title: "Scan QR Code",
      description:
        "Use your phone camera or upload an image to scan any product QR code on packaging.",
      icon: QrCode,
      color: "emerald",
      delay: 0.1,
    },
    {
      step: 2,
      title: "See Journey",
      description:
        "View the complete, tamper-proof farm-to-table story instantly on the blockchain ledger.",
      icon: MapPin,
      color: "blue",
      delay: 0.2,
    },
    {
      step: 3,
      title: "Build Trust",
      description:
        "Verify organic certifications, origin details, and product authenticity with unchangeable data.",
      icon: Shield,
      color: "purple",
      delay: 0.3,
    },
  ];

  const stats = [
    {
      number: 50,
      label: "Verified Farms",
      icon: Leaf,
      color: "bg-emerald-500",
    },
    {
      number: 100,
      label: "Products Tracked",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      number: 25,
      label: "Partner Stores",
      icon: Store,
      color: "bg-purple-500",
    },
    {
      number: 1000,
      label: "Happy Customers",
      icon: Star,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Subtle floating background elements */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
      `}</style>

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 cursor-pointer py-4"
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
                <span className="text-base font-black text-emerald-400">f</span>
                <span className="text-xs font-bold text-slate-200">T</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  farm<span className="text-emerald-600 font-extrabold">Trace</span>
                </span>
                <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  v2.0
                </span>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-2 sm:space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowScanner(true)}
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition duration-150 shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Scan QR</span>
              </motion.button>

              <Link
                to="/login"
                className="text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl transition duration-150 hover:bg-slate-100/80"
              >
                Sign In
              </Link>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/signup"
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition duration-150 shadow-sm flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Get Started</span>
                </Link>
              </motion.div>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Hero Section */}
      <div className="relative pt-32 pb-24 sm:pb-32 overflow-hidden bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-white px-3.5 py-1 rounded-full border border-slate-200/90 shadow-sm mb-6"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">
              Decentralized Provenance & Traceability Ledger
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight"
          >
            From Seed to Fork,
            <br />
            <span className="text-slate-900">
              Verifiably <span className="text-emerald-600 underline decoration-emerald-500/30">Transparent</span>.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm sm:text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Scan any batch QR code to audit tamper-proof logs across farmers, cold-chain transporters, and verified grocery shelves in real time.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3.5 justify-center items-center"
          >
            <motion.button
              onClick={() => setShowScanner(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border border-slate-300 text-slate-900 px-6 py-3 rounded-xl font-semibold text-sm shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all duration-150 flex items-center space-x-2"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Scan Product QR Code</span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/signup"
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-slate-800 transition duration-150 flex items-center space-x-2"
              >
                <span>Register Business Node</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced User Types Section */}
      <div className="relative py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Unified Network for the Complete Food Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Empowering farmers, freight carriers, and retailers with cryptographically secured traceability.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {userTypes.map((userType, index) => (
              <StyledUserTypeCard key={index} {...userType} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced How It Works Section */}
      <div className="relative py-28 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              How farm<span className="text-emerald-600">Trace</span> Operates
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Three seamless phases to guarantee origin, safety, and verifiable authenticity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative bg-slate-950 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-2.5 mb-4"
          >
            <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-white">
              <span className="text-sm font-black text-emerald-400">f</span>
              <span className="text-[10px] font-bold text-slate-300">T</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              farm<span className="text-emerald-400 font-extrabold">Trace</span>
            </span>
          </motion.div>

          <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-xl mx-auto">
            Decentralized agricultural and organic food supply chain traceability platform. Ensuring farm-to-table integrity.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-slate-400">
            <span className="hover:text-emerald-400 transition cursor-pointer">
              Enterprise Docs
            </span>
            <span className="hover:text-emerald-400 transition cursor-pointer">
              Provenance Ledger
            </span>
            <span className="hover:text-emerald-400 transition cursor-pointer">
              QR Verification
            </span>
            <span className="hover:text-emerald-400 transition cursor-pointer">
              System Architecture
            </span>
          </div>

          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} farmTrace. All rights reserved. Built for academic & enterprise research.
          </p>
        </div>
      </footer>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner onScan={handleScan} onClose={handleScannerClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
