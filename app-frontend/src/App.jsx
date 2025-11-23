import React, { useState, useMemo } from 'react';

// --- Icons (Inline SVGs for stability) ---
const CalculatorIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="16" y1="10" x2="12" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line>
  </svg>
);

const PackageIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>
  </svg>
);

const PillIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path>
  </svg>
);

const DownloadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// --- Constants ---
const MULTIPLIERS = {
  maleSupport: { Yes: 1.45, No: 1 },
  productShape: { 'Capsules/Tablets': 1, 'Softgels/Chews': 1, 'Powder/Creamy': 1, 'Gummies': 1.1, 'Liquid': 1.1, 'Injection': 1.2 },
  bottleSize: { Small: 0.9, Normal: 1, Big: 1.1, Massive: 1.2 },
  packingMaterial: { Plastic: 1, Glass: 1.1, Paper: 1.06 },
  importOrigin: { US: 1, UK: 1.27, EU: 1.13, NZ: 0.72 }
};

// IMPORTANT: Update this URL before deploying to Production!
// For Local Docker Compose, use: "http://localhost:5000/calculate"
// For AWS Production, use: "http://<YOUR_EC2_IP>:5000/calculate"
const API_URL = "http://localhost:5000/calculate";

const PricingCalculator = () => {
  const [category, setCategory] = useState('supplement');
  const [apiResults, setApiResults] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [inputs, setInputs] = useState({
    purchasePrice: 44, fxRate: 50, count: 120, dailyDose: 2, weightGrams: 100,
    productShape: 'Capsules/Tablets', packingMaterial: 'Paper', bottleSize: 'Normal',
    isMaleSupport: 'No', importFrom: 'US', lengthCm: 10, widthCm: 45, heightCm: 20, weightKg: 0.3
  });

  const handleInputChange = (field, value) => {
    setApiResults(null);
    setApiError(null);
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // --- API Logic ---
  const calculatePriceFromAPI = async () => {
    setIsLoading(true);
    setApiResults(null);
    setApiError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, category: category }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setApiResults(data);
    } catch (error) {
      console.error("Error:", error);
      setApiError("Failed to connect to Backend. Make sure Docker is running!");
    } finally {
      setIsLoading(false);
    }
  };

  const results = apiResults; // Only show results if API returns them

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      {/* Navbar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <CalculatorIcon className="w-8 h-8 opacity-90" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EGV Pricing Calculator</h1>
            <p className="text-blue-200 text-sm">Professional Cost & Margin Analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">

        {/* Category Tabs */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setCategory('supplement')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${category === 'supplement'
              ? 'bg-white text-blue-700 ring-2 ring-blue-600 shadow-md scale-[1.02]'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
          >
            <PillIcon className="w-5 h-5" /> Supplement
          </button>
          <button
            onClick={() => setCategory('device')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${category === 'device'
              ? 'bg-white text-blue-700 ring-2 ring-blue-600 shadow-md scale-[1.02]'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
          >
            <PackageIcon className="w-5 h-5" /> Device
          </button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Left Column: Inputs */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Base Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Purchase Price (USD)</label>
                  <input type="number" value={inputs.purchasePrice} onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">FX Rate (EGP)</label>
                  <input type="number" value={inputs.fxRate} onChange={(e) => handleInputChange('fxRate', parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Dynamic Inputs based on Category */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">{category === 'supplement' ? 'Product Details' : 'Dimensions'}</h3>
              <div className="space-y-4">
                {category === 'supplement' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-gray-500">Count</label><input type="number" value={inputs.count} onChange={(e) => handleInputChange('count', parseFloat(e.target.value))} className="w-full mt-1 p-2 border rounded-lg bg-gray-50" /></div>
                      <div><label className="text-xs font-bold text-gray-500">Weight (g)</label><input type="number" value={inputs.weightGrams} onChange={(e) => handleInputChange('weightGrams', parseFloat(e.target.value))} className="w-full mt-1 p-2 border rounded-lg bg-gray-50" /></div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Shape</label>
                      <select value={inputs.productShape} onChange={(e) => handleInputChange('productShape', e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-gray-50">
                        {Object.keys(MULTIPLIERS.productShape).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-xs">L (cm)</label><input type="number" value={inputs.lengthCm} onChange={(e) => handleInputChange('lengthCm', parseFloat(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                    <div><label className="text-xs">W (cm)</label><input type="number" value={inputs.widthCm} onChange={(e) => handleInputChange('widthCm', parseFloat(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                    <div><label className="text-xs">H (cm)</label><input type="number" value={inputs.heightCm} onChange={(e) => handleInputChange('heightCm', parseFloat(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculatePriceFromAPI}
              disabled={isLoading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? 'Calculating...' : 'Calculate Price'}
            </button>

            {apiError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">{apiError}</div>}
          </div>

          {/* Right Column: Results */}
          <div className="md:col-span-7">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                <CalculatorIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>Enter details and click calculate to see results</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Main Price Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-blue-300 font-medium mb-1 uppercase tracking-widest text-xs">Recommended Retail Price</div>
                    <div className="text-5xl font-bold tracking-tight">EGP {results.finalPrice}</div>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-bold uppercase">Total Cost</div>
                    <div className="text-2xl font-bold text-gray-800">{results.totalCost}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <div className="text-green-600 text-xs font-bold uppercase">Profit Amount</div>
                    <div className="text-2xl font-bold text-green-700">+{results.markup}</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                    <div className="text-blue-600 text-xs font-bold uppercase">Profit Margin</div>
                    <div className="text-2xl font-bold text-blue-700">{results.markupPercentage}%</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-bold uppercase">Base Cost</div>
                    <div className="text-xl font-semibold text-gray-600">{results.baseCost}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;