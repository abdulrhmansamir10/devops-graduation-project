import React, { useState, useMemo } from 'react';

// --- Replaced Lucide Icons with Inline SVGs ---
const Calculator = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="16" y1="10" x2="12" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line>
  </svg>
);

const Download = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const Package = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>
  </svg>
);

const Pill = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path>
  </svg>
);
// --- End of SVG Icons ---


// Pricing multipliers from VB code
const MULTIPLIERS = {
  maleSupport: { Yes: 1.45, No: 1 },
  productShape: {
    'Capsules/Tablets': 1,
    'Softgels/Chews': 1,
    'Powder/Creamy': 1,
    'Gummies': 1.1,
    'Liquid': 1.1,
    'Injection': 1.2
  },
  bottleSize: { Small: 0.9, Normal: 1, Big: 1.1, Massive: 1.2 },
  packingMaterial: { Plastic: 1, Glass: 1.1, Paper: 1.06 },
  importOrigin: { US: 1, UK: 1.27, EU: 1.13, NZ: 0.72 }
};

// This is the main React Component (our "Face")
const PricingCalculator = () => {
  const [category, setCategory] = useState('supplement');
  const [inputs, setInputs] = useState({
    // Common inputs
    purchasePrice: 44,
    fxRate: 50,
    
    // Supplement-specific
    count: 120,
    dailyDose: 2,
    weightGrams: 100,
    productShape: 'Capsules/Tablets',
    packingMaterial: 'Paper',
    bottleSize: 'Normal',
    isMaleSupport: 'No',
    importFrom: 'US',
    
    // Device-specific
    lengthCm: 10,
    widthCm: 45,
    heightCm: 20,
    weightKg: 0.3
  });

  // This state will hold the results from our API
  // For now, it's null, but we'll use it later.
  const [apiResults, setApiResults] = useState(null);
  // --- NEW --- Add state to hold API error messages
  const [apiError, setApiError] = useState(null);

  // This function is what we'll call to talk to our Python API
  // We're not using it *yet*, but it's ready for when we are.
  const calculatePriceFromAPI = async () => {
    // We'll replace this URL with our real server URL later
    const API_URL = "http://127.0.0.1:5000/calculate"; 
    
    // --- NEW --- Clear previous errors and results
    setApiResults(null);
    setApiError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the *entire* input state to the API
        body: JSON.stringify({ ...inputs, category: category }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResults(data); // Save the results from the API
      console.log("Got results from API:", data);

    } catch (error) {
      console.error("Error fetching from API:", error);
      // --- UPDATED --- Set a user-friendly error message
      setApiError("Failed to connect to API. Is the Python server running?");
    }
  };


  // LOCAL calculation for testing the UI
  // We keep this here so the UI works *before* the API is built.
  const localResults = useMemo(() => {
    const calculateSupplementPrice = () => {
      const { purchasePrice, fxRate, productShape, packingMaterial, 
              bottleSize, isMaleSupport, importFrom, count, dailyDose, weightGrams } = inputs;
      
      const shapeMultiplier = MULTIPLIERS.productShape[productShape];
      const packingMultiplier = MULTIPLIERS.packingMaterial[packingMaterial];
      const sizeMultiplier = MULTIPLIERS.bottleSize[bottleSize];
      const maleSupportMultiplier = MULTIPLIERS.maleSupport[isMaleSupport];
      const importMultiplier = MULTIPLIERS.importOrigin[importFrom];
      
      const xfactor = shapeMultiplier * packingMultiplier * sizeMultiplier * maleSupportMultiplier * importMultiplier;
      
      const daysSupply = count / (dailyDose || 1);
      const monthsSupply = daysSupply / 30;
      let dose = 3 / (monthsSupply || 1);
      const dosage = Math.min(dose, 3);
      
      const baseCost = 380;
      const productCost = (purchasePrice * xfactor * fxRate) + (weightGrams * 32 * fxRate / 1000);
      const adjustedCost = 1.4 * productCost;
      const dosageAdjustment = 50 * (3 - dosage);
      const totalCost = baseCost + adjustedCost + dosageAdjustment;
      
      const priceBeforeRounding = totalCost * 1.05;
      const finalPrice = Math.ceil(priceBeforeRounding / 10) * 10;
      
      const markup = finalPrice - totalCost;
      const markupPercentage = (markup / (totalCost || 1)) * 100;
      
      return {
        baseCost: baseCost.toFixed(2),
        xfactor: xfactor.toFixed(3),
        productCost: productCost.toFixed(2),
        adjustedCost: adjustedCost.toFixed(2),
        dosageAdjustment: dosageAdjustment.toFixed(2),
        dosage: dosage.toFixed(2),
        daysSupply: daysSupply.toFixed(1),
        totalCost: totalCost.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        markup: markup.toFixed(2),
        markupPercentage: markupPercentage.toFixed(2)
      };
    };

    const calculateDevicePrice = () => {
      const { purchasePrice, fxRate, lengthCm, widthCm, heightCm, 
              weightKg, isMaleSupport, importFrom } = inputs;
      
      const baseCost = purchasePrice * fxRate;
      const volumeFactor = (lengthCm * widthCm * heightCm) / 1000000;
      const dimensionalMultiplier = 1 + (volumeFactor * 1000) + (weightKg * 10);
      const maleSupportMultiplier = MULTIPLIERS.maleSupport[isMaleSupport];
      const importMultiplier = MULTIPLIERS.importOrigin[importFrom];
      const totalCost = baseCost * dimensionalMultiplier * maleSupportMultiplier * importMultiplier;
      const finalPrice = totalCost * 1.1;
      const profit = finalPrice - totalCost;
      const profitMargin = (profit / (totalCost || 1)) * 100;
      
      return {
        baseCost: baseCost.toFixed(2),
        dimensionalMultiplier: dimensionalMultiplier.toFixed(3),
        totalCost: totalCost.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        profit: profit.toFixed(2),
        profitMargin: profitMargin.toFixed(2)
      };
    };

    return category === 'supplement' ? calculateSupplementPrice() : calculateDevicePrice();
  }, [category, inputs]);


  // IMPORTANT: This decides what results to show.
  // If we got results from the API, show those.
  // Otherwise, fall back to the local calculation.
  const results = apiResults || localResults;


  const handleInputChange = (field, value) => {
    setApiResults(null); // Clear API results on any input change
    setApiError(null); // --- NEW --- Clear error on input change
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (newCategory) => {
    setApiResults(null); // Clear API results on category change
    setApiError(null); // --- NEW --- Clear error on category change
    setCategory(newCategory);
  };

  const exportResults = () => {
    const data = {
      category,
      inputs,
      results,
      timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-${category}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // The JSX (HTML) for the component
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              <h1 className="text-3xl font-bold">EGV Pricing Calculator</h1>
            </div>
            <p className="mt-2 text-blue-100">Calculate pricing for supplements and devices with real-time updates</p>
          </div>

          {/* Category Selector */}
          <div className="p-6 border-b bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">Product Category</label>
            <div className="flex gap-4">
              <button
                onClick={() => handleCategoryChange('supplement')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  category === 'supplement'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <Pill className="w-5 h-5" />
                Supplement
              </button>
              <button
                onClick={() => handleCategoryChange('device')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  category === 'device'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <Package className="w-5 h-5" />
                Device
              </button>
            </div>
          </div>

            {/* API Calculation Button */}
          {/* We add this button to test our API call! */}
          <div className="p-6 text-center bg-gray-100">
            <button
              onClick={calculatePriceFromAPI}
              className="w-full md:w-1/2 py-3 px-6 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all text-lg"
            >
              Get Price from API
            </button>
            {/* --- UPDATED --- Show success or error messages */}
            {apiResults && (
              <p className="text-green-700 mt-2 font-medium">
                Success! Results updated from API.
              </p>
            )}
            {apiError && (
              <p className="text-red-600 mt-2 font-medium">
                Error: {apiError}
              </p>
            )}
            {/* --- END OF UPDATE --- */}
          </div>


          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Input Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Input Parameters</h2>
              
              {/* Common Inputs */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-blue-900">Base Parameters</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (USD)</label>
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FX Rate (USD to EGP)</label>
                  <input
                    type="number"
                    value={inputs.fxRate}
                    onChange={(e) => handleInputChange('fxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Import From</label>
                  <select
                    value={inputs.importFrom}
                    onChange={(e) => handleInputChange('importFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(MULTIPLIERS.importOrigin).map(origin => (
                      <option key={origin} value={origin}>{origin}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Male Support?</label>
                  <select
                    value={inputs.isMaleSupport}
                    onChange={(e) => handleInputChange('isMaleSupport', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(MULTIPLIERS.maleSupport).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Supplement-specific inputs */}
              {category === 'supplement' && (
                <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-purple-900">Supplement Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                    <input
                      type="number"
                      value={inputs.count}
                      onChange={(e) => handleInputChange('count', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Dose</label>
                    <input
                      type="number"
                      value={inputs.dailyDose}
                      onChange={(e) => handleInputChange('dailyDose', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Grams)</label>
                    <input
                      type="number"
                      value={inputs.weightGrams}
                      onChange={(e) => handleInputChange('weightGrams', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Shape</label>
                    <select
                      value={inputs.productShape}
                      onChange={(e) => handleInputChange('productShape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Object.keys(MULTIPLIERS.productShape).map(shape => (
                        <option key={shape} value={shape}>{shape}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Packing Material</label>
                    <select
                      value={inputs.packingMaterial}
                      onChange={(e) => handleInputChange('packingMaterial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Object.keys(MULTIPLIERS.packingMaterial).map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Size</label>
                    <select
                      value={inputs.bottleSize}
                      onChange={(e) => handleInputChange('bottleSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Object.keys(MULTIPLIERS.bottleSize).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Device-specific inputs */}
              {category === 'device' && (
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-green-900">Device Dimensions</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (CM)</label>
                    <input
                      type="number"
                      value={inputs.lengthCm}
                      onChange={(e) => handleInputChange('lengthCm', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (CM)</label>
                    <input
                      type="number"
                      value={inputs.widthCm}
                      onChange={(e) => handleInputChange('widthCm', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (CM)</label>
                    <input
                      type="number"
                      value={inputs.heightCm}
                      onChange={(e) => handleInputChange('heightCm', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      value={inputs.weightKg}
                      onChange={(e) => handleInputChange('weightKg', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Pricing Results</h2>
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl text-white shadow-xl">
                <div className="text-sm opacity-90 mb-1">Final Selling Price</div>
                <div className="text-4xl font-bold">EGP {results.finalPrice}</div>
              </div>

              {category === 'supplement' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Base Cost</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.baseCost}</div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Product Cost</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.productCost}</div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Adjusted Cost</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.adjustedCost}</div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Dosage Adjustment</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.dosageAdjustment}</div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <div className="text-sm text-green-700 mb-1">Total Cost</div>
                      <div className="text-2xl font-bold text-green-800">EGP {results.totalCost}</div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <div className="text-sm text-green-700 mb-1">Markup</div>
                      <div className="text-2xl font-bold text-green-800">EGP {results.markup}</div>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                      <div className="text-sm text-purple-700 mb-1">Days Supply</div>
                      <div className="text-2xl font-bold text-purple-800">{results.daysSupply}</div>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                      <div className="text-sm text-purple-700 mb-1">Dosage Factor</div>
                      <div className="text-2xl font-bold text-purple-800">{results.dosage}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Base Cost</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.baseCost}</div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                      <div className="text-2xl font-bold text-gray-800">EGP {results.totalCost}</div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <div className="text-sm text-green-700 mb-1">Profit</div>
                      <div className="text-2xl font-bold text-green-800">EGP {results.profit}</div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <div className="text-sm text-green-700 mb-1">Profit Margin</div>
                      <div className="text-2xl font-bold text-green-800">{results.profitMargin}%</div>
                    </div>
                  </div>
                </>
              )}

              {/* Multiplier Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Calculation Breakdown</h3>
                <div className="space-y-2 text-sm">
                  {category === 'supplement' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">X-Factor (Total Multiplier):</span>
                        <span className="font-medium">{results.xfactor}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shape ({inputs.productShape}):</span>
                        <span className="font-medium">{MULTIPLIERS.productShape[inputs.productShape]}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packing ({inputs.packingMaterial}):</span>
                        <span className="font-medium">{MULTIPLIERS.packingMaterial[inputs.packingMaterial]}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size ({inputs.bottleSize}):</span>
                        <span className="font-medium">{MULTIPLIERS.bottleSize[inputs.bottleSize]}x</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensional Multiplier:</span>
                      <span className="font-medium">{results.dimensionalMultiplier}x</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Male Support ({inputs.isMaleSupport}):</span>
                    <span className="font-medium">{MULTIPLIERS.maleSupport[inputs.isMaleSupport]}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Import ({inputs.importFrom}):</span>
                    <span className="font-medium">{MULTIPLIERS.importOrigin[inputs.importFrom]}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;