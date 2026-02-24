#!/usr/bin/env python3
"""
TAMBVRINI Product Filter Analysis
Specific test to analyze product filtering for tennis-club category and collections
"""

import requests
import sys
from datetime import datetime

class ProductFilterAnalyzer:
    def __init__(self, base_url="https://tambvrini-luxury-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def analyze_products(self):
        """Analyze products and filtering logic"""
        self.log("🔍 Starting Product Filter Analysis")
        
        try:
            # Step 1: Get all products with limit=100
            url = f"{self.base_url}/products?limit=100"
            self.log(f"📡 Calling: {url}")
            
            response = requests.get(url, timeout=30)
            
            if response.status_code != 200:
                self.log(f"❌ API call failed with status {response.status_code}")
                self.log(f"Response: {response.text}")
                return False
                
            data = response.json()
            products = data.get('products', [])
            total = data.get('total', 0)
            
            self.log(f"✅ API Response successful")
            self.log(f"📊 Total products in database: {total}")
            self.log(f"📦 Products returned in response: {len(products)}")
            
            # Step 2: Analyze filtering criteria
            filtered_out_products = []
            remaining_products = []
            
            for product in products:
                product_id = product.get('product_id', 'unknown')
                name = product.get('name', 'Unknown')
                category = product.get('category', [])
                collections = product.get('collections', [])
                
                # Check if product should be filtered out
                should_filter = False
                filter_reason = []
                
                # Check category for tennis-club
                if 'tennis-club' in category:
                    should_filter = True
                    filter_reason.append("category contains 'tennis-club'")
                
                # Check collections for tennis-club, resort-2026, atelier
                filter_collections = ['tennis-club', 'resort-2026', 'atelier']
                for collection in filter_collections:
                    if collection in collections:
                        should_filter = True
                        filter_reason.append(f"collections contains '{collection}'")
                
                if should_filter:
                    filtered_out_products.append({
                        'product_id': product_id,
                        'name': name,
                        'category': category,
                        'collections': collections,
                        'reason': ', '.join(filter_reason)
                    })
                else:
                    remaining_products.append({
                        'product_id': product_id,
                        'name': name,
                        'category': category,
                        'collections': collections
                    })
            
            # Step 3: Report results
            self.log("\n" + "="*80)
            self.log("📋 FILTERING ANALYSIS RESULTS")
            self.log("="*80)
            
            self.log(f"\n🔢 COUNTS:")
            self.log(f"   Total products: {len(products)}")
            self.log(f"   Filtered out: {len(filtered_out_products)}")
            self.log(f"   Remaining: {len(remaining_products)}")
            
            if filtered_out_products:
                self.log(f"\n❌ FILTERED OUT PRODUCTS ({len(filtered_out_products)}):")
                for product in filtered_out_products:
                    self.log(f"   • {product['product_id']} - {product['name']}")
                    self.log(f"     Category: {product['category']}")
                    self.log(f"     Collections: {product['collections']}")
                    self.log(f"     Reason: {product['reason']}")
                    self.log("")
            
            if remaining_products:
                self.log(f"\n✅ REMAINING PRODUCTS ({len(remaining_products)}):")
                for product in remaining_products:
                    self.log(f"   • {product['product_id']} - {product['name']}")
                    self.log(f"     Category: {product['category']}")
                    self.log(f"     Collections: {product['collections']}")
                    self.log("")
            
            # Step 4: Recommendations
            self.log("💡 RECOMMENDATIONS:")
            if len(remaining_products) < 12:
                self.log(f"   ⚠️  Only {len(remaining_products)} products remain after filtering (need 12)")
                self.log("   🔧 Suggested fixes:")
                self.log("      1. Adjust frontend filter rules:")
                self.log("         - Only filter 'tennis-club' category")
                self.log("         - Remove 'resort-2026' and 'atelier' collection filtering")
                self.log("      2. OR adjust backend seed data:")
                self.log("         - Add more products without these collections")
                self.log("         - Modify existing products to use different collections")
            else:
                self.log(f"   ✅ {len(remaining_products)} products remain - sufficient for 12-item grid")
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Network Error: {str(e)}")
            return False
        except Exception as e:
            self.log(f"❌ Unexpected Error: {str(e)}")
            return False

def main():
    """Main analysis execution"""
    analyzer = ProductFilterAnalyzer()
    success = analyzer.analyze_products()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())