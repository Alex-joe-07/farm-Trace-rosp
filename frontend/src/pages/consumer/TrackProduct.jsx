import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Leaf, Truck, CheckCircle2, Calendar, MapPin } from 'lucide-react';

export default function TrackProduct() {
  const { productId } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 selection:bg-emerald-500/20 selection:text-emerald-900">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to farmTrace Network</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically Verified Provenance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Product Provenance Journey
          </h1>
          <p className="text-sm text-slate-600">
            Batch Reference ID: <code className="font-mono bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs font-bold">{productId || "FT-BATCH-DEMO"}</code>
          </p>
        </div>

        {/* Provenance Details Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
            Verified Checkpoints & Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Cultivation & Origin</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Certified Organic Soil</p>
                <p className="text-[11px] text-slate-400 mt-0.5">100% Non-GMO & Pesticide Free</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Cold-Chain Transit</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Maintained 4°C - 6°C</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Active Sensor Telemetry Logged</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Quality Compliance</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">ISO 22000 & Organic Seal</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Independent Auditor Sign-Off</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-purple-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Retail Destination</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Verified Retail Shelf</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Stocked within 24h of Dispatch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Public Notice */}
        <p className="text-center text-xs text-slate-400">
          Public verification endpoint powered by <strong className="text-slate-600">farmTrace</strong>. Zero login required for consumer audit.
        </p>
      </div>
    </div>
  );
}