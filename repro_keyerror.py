
import sys
import os
from unittest.mock import MagicMock

# Mock modules
sys.modules['flask'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_sqlalchemy'] = MagicMock()

# Mock SQLAlchemy db object because app.py uses it
mock_db = MagicMock()
mock_db.Model = object
sys.modules['flask_sqlalchemy'].SQLAlchemy = MagicMock(return_value=mock_db)

# Add app-backend to path
sys.path.append(os.path.join(os.getcwd(), 'app-backend'))

# Now import app
from app import calculate_supplement_price, calculate_device_price, MULTIPLIERS

print("Testing MULTIPLIERS access...")
try:
    print(MULTIPLIERS['productShape'])
    print(MULTIPLIERS['packingMaterial'])
    print(MULTIPLIERS['bottleSize'])
    print(MULTIPLIERS['maleSupport'])
    print(MULTIPLIERS['importOrigin'])
    print("MULTIPLIERS access OK")
except KeyError as e:
    print(f"KeyError accessing MULTIPLIERS: {e}")

print("\nTesting calculate_supplement_price...")
try:
    inputs = {}
    calculate_supplement_price(inputs)
    print("calculate_supplement_price with empty inputs OK")
except KeyError as e:
    print(f"KeyError in calculate_supplement_price: {e}")
except Exception as e:
    print(f"Error in calculate_supplement_price: {e}")

print("\nTesting calculate_device_price...")
try:
    inputs = {}
    calculate_device_price(inputs)
    print("calculate_device_price with empty inputs OK")
except KeyError as e:
    print(f"KeyError in calculate_device_price: {e}")
except Exception as e:
    print(f"Error in calculate_device_price: {e}")
