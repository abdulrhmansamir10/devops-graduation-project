import math
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
# Enable CORS to allow your React app to call this API
CORS(app)
# --- Database Configuration ---
db_user = os.getenv('POSTGRES_USER', 'user')
db_password = os.getenv('POSTGRES_PASSWORD', 'password')
db_host = os.getenv('POSTGRES_HOST', 'db')
db_port = os.getenv('POSTGRES_PORT', 5432)
db_name = os.getenv('POSTGRES_DB', 'db')
db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Calculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # We need this column because our save logic uses it!
    category = db.Column(db.String(50), nullable=False) 
    inputs = db.Column(db.JSON, nullable=False)
    results = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Calculation {self.id} - {self.category}>'

with app.app_context():
    db.create_all()

# --- Logic from your NEW React code, ported to Python ---

# Pricing multipliers from VB code
MULTIPLIERS = {
  'maleSupport': { 'Yes': 1.45, 'No': 1 },
  'productShape': {
    'Capsules/Tablets': 1,
    'Softgels/Chews': 1,
    'Powder/Creamy': 1,
    'Gummies': 1.1,
    'Liquid': 1.1,
    'Injection': 1.2
  },
  'bottleSize': { 'Small': 0.9, 'Normal': 1, 'Big': 1.1, 'Massive': 1.2 },
  'packingMaterial': { 'Plastic': 1, 'Glass': 1.1, 'Paper': 1.06 },
  'importOrigin': { 'US': 1, 'UK': 1.27, 'EU': 1.13, 'NZ': 0.72 }
}

def calculate_supplement_price(inputs):
    # Get all inputs, providing defaults for safety from your React state
    purchasePrice = float(inputs.get('purchasePrice', 44))
    fxRate = float(inputs.get('fxRate', 50)) # Updated default to 50
    productShape = inputs.get('productShape', 'Capsules/Tablets')
    packingMaterial = inputs.get('packingMaterial', 'Paper')
    bottleSize = inputs.get('bottleSize', 'Normal')
    isMaleSupport = inputs.get('isMaleSupport', 'No')
    importFrom = inputs.get('importFrom', 'US')
    count = float(inputs.get('count', 120))
    dailyDose = float(inputs.get('dailyDose', 2))
    weightGrams = float(inputs.get('weightGrams', 100))

    # Apply multipliers (xfactor in VB code)
    shapeMultiplier = MULTIPLIERS['productShape'].get(productShape, 1)
    packingMultiplier = MULTIPLIERS['packingMaterial'].get(packingMaterial, 1)
    sizeMultiplier = MULTIPLIERS['bottleSize'].get(bottleSize, 1)
    maleSupportMultiplier = MULTIPLIERS['maleSupport'].get(isMaleSupport, 1)
    importMultiplier = MULTIPLIERS['importOrigin'].get(importFrom, 1)
    
    # Calculate total multiplier (xfactor)
    xfactor = shapeMultiplier * packingMultiplier * sizeMultiplier * maleSupportMultiplier * importMultiplier
    
    # Calculate dosage factor
    if dailyDose == 0:
        dailyDose = 1 # Safety check
    
    daysSupply = count / dailyDose
    
    if daysSupply == 0:
        monthsSupply = 0
        dose = 3 # Avoid division by zero, default to max
    else:
        monthsSupply = daysSupply / 30
        if monthsSupply == 0:
            dose = 3 # Avoid division by zero, default to max
        else:
            dose = 3 / monthsSupply

    dosage = min(dose, 3)
    
    # Excel Formula: Cost = (380 + (1.4 * ((purchase * xfactor * FX) + (weight * 32 * FX / 1000))) + (50 * (3 - dosage)))
    baseCost = 380
    productCost = (purchasePrice * xfactor * fxRate) + (weightGrams * 32 * fxRate / 1000)
    adjustedCost = 1.4 * productCost
    dosageAdjustment = 50 * (3 - dosage)
    totalCost = baseCost + adjustedCost + dosageAdjustment
    
    # --- THIS IS THE NEW LOGIC YOU REQUESTED ---
    # Price = Cost * 1.05, rounded up to nearest 10
    price_before_rounding = totalCost * 1.05
    # Use math.ceil() for rounding up, same as Math.ceil() in JS
    finalPrice = math.ceil(price_before_rounding / 10.0) * 10.0
    # --- END OF NEW LOGIC ---
    
    # Calculate markup
    markup = finalPrice - totalCost
    
    if totalCost == 0:
        markupPercentage = 0 # Safety check
    else:
        markupPercentage = (markup / totalCost) * 100
    
    return {
      'baseCost': round(baseCost, 2),
      'xfactor': round(xfactor, 3),
      'productCost': round(productCost, 2),
      'adjustedCost': round(adjustedCost, 2),
      'dosageAdjustment': round(dosageAdjustment, 2),
      'dosage': round(dosage, 2),
      'daysSupply': round(daysSupply, 1),
      'totalCost': round(totalCost, 2),
      'finalPrice': round(finalPrice, 2),
      'markup': round(markup, 2),
      'markupPercentage': round(markupPercentage, 2)
    }

def calculate_device_price(inputs):
    # Get all inputs, providing defaults
    purchasePrice = float(inputs.get('purchasePrice', 44))
    fxRate = float(inputs.get('fxRate', 50)) # Updated default
    lengthCm = float(inputs.get('lengthCm', 10))
    widthCm = float(inputs.get('widthCm', 45))
    heightCm = float(inputs.get('heightCm', 20))
    weightKg = float(inputs.get('weightKg', 0.3))
    isMaleSupport = inputs.get('isMaleSupport', 'No')
    importFrom = inputs.get('importFrom', 'US')

    # Base cost in EGP
    baseCost = purchasePrice * fxRate
    
    # Dimensional factor (volume in cubic meters * 1000 + weight)
    volumeFactor = (lengthCm * widthCm * heightCm) / 1000000 # m³
    dimensionalMultiplier = 1 + (volumeFactor * 1000) + (weightKg * 10)
    
    # Apply multipliers
    maleSupportMultiplier = MULTIPLIERS['maleSupport'].get(isMaleSupport, 1)
    importMultiplier = MULTIPLIERS['importOrigin'].get(importFrom, 1)
    
    # Total cost
    totalCost = baseCost * dimensionalMultiplier * maleSupportMultiplier * importMultiplier
    
    # Price with 10% markup
    finalPrice = totalCost * 1.1
    
    # Profit
    profit = finalPrice - totalCost
    
    if totalCost == 0:
        profitMargin = 0 # Safety check
    else:
        profitMargin = (profit / totalCost) * 100
    
    return {
      'baseCost': round(baseCost, 2),
      'dimensionalMultiplier': round(dimensionalMultiplier, 3),
      'totalCost': round(totalCost, 2),
      'finalPrice': round(finalPrice, 2),
      'profit': round(profit, 2),
      'profitMargin': round(profitMargin, 2)
    }

# --- API Endpoint ---
@app.route('/calculate', methods=['POST'])
def handle_calculate():
    # Get the JSON data sent from the React front-end
    data = request.json
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    # The React app now sends the category!
    category = data.get('category', 'supplement')
    
    try:
        if category == 'supplement':
            results = calculate_supplement_price(data)
        else:
            results = calculate_device_price(data)

    # create new memory
        new_cal = Calculation(category=category, inputs=data, results=results)
        db.session.add(new_cal)
        db.session.commit()
        
        # Return the results as JSON
        return jsonify(results)
    except Exception as e:
        # Log the error (in a real app)
        print(f"Error during calculation: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

if __name__ == '__main__':
    # Run the API server, accessible from any device on your network
    # (0.0.0.0) on port 5000.
    app.run(debug=True, host='0.0.0.0', port=5000)