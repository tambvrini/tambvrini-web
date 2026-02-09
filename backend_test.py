#!/usr/bin/env python3
"""
TAMBVRINI Backend API Testing Suite
Tests all critical endpoints for the luxury fashion ecommerce backend
"""

import requests
import sys
import time
from datetime import datetime
import json

class TambvriniAPITester:
    def __init__(self, base_url="https://tambvrini-luxury-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {"Content-Type": "application/json"}
        
        if self.token:
            test_headers["Authorization"] = f"Bearer {self.token}"
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == "GET":
                response = self.session.get(url, headers=test_headers, timeout=30)
            elif method == "POST":
                response = self.session.post(url, json=data, headers=test_headers, timeout=30)
            elif method == "PUT":
                response = self.session.put(url, json=data, headers=test_headers, timeout=30)
            elif method == "DELETE":
                response = self.session.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                try:
                    return False, response.json()
                except:
                    return False, response.text

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Network Error: {str(e)}")
            self.failed_tests.append(f"{name}: Network Error - {str(e)}")
            return False, {}

    def test_products_endpoints(self):
        """Test products API endpoints"""
        self.log("\n📦 TESTING PRODUCTS ENDPOINTS")
        
        # Test get all products
        success, data = self.run_test(
            "Get All Products", "GET", "/products", 200
        )
        if success and isinstance(data, dict):
            products = data.get('products', [])
            total = data.get('total', 0)
            self.log(f"   Found {total} products, returned {len(products)}")
            
            if len(products) > 0:
                # Test get single product
                product_id = products[0].get('product_id')
                if product_id:
                    self.run_test(
                        "Get Single Product", "GET", f"/products/{product_id}", 200
                    )
        
        # Test product filters
        self.run_test(
            "Filter by Gender", "GET", "/products?gender=hombre", 200
        )
        
        self.run_test(
            "Filter by Category", "GET", "/products?category=novedades", 200
        )
        
        self.run_test(
            "Filter Featured Products", "GET", "/products?is_featured=true", 200
        )
        
        self.run_test(
            "Sort by Price", "GET", "/products?sort=price_asc", 200
        )

        # Test search
        self.run_test(
            "Search Products", "GET", "/products?search=polo", 200
        )

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("\n🔐 TESTING AUTH ENDPOINTS")
        
        # Generate unique test user
        timestamp = int(time.time())
        test_email = f"test.user.{timestamp}@tambvrini.com"
        test_name = f"Test User {timestamp}"
        test_password = "TestPassword123!"
        
        # Test user registration
        success, register_data = self.run_test(
            "User Registration", "POST", "/auth/register", 200,
            data={
                "email": test_email,
                "password": test_password,
                "name": test_name
            }
        )
        
        if success and isinstance(register_data, dict):
            self.token = register_data.get('token')
            self.log(f"   Registered user: {test_email}")
            
            # Test get current user
            self.run_test(
                "Get Current User", "GET", "/auth/me", 200
            )
            
            # Test logout
            self.run_test(
                "User Logout", "POST", "/auth/logout", 200
            )
            
            # Clear token for login test
            self.token = None
            
            # Test user login
            success, login_data = self.run_test(
                "User Login", "POST", "/auth/login", 200,
                data={
                    "email": test_email,
                    "password": test_password
                }
            )
            
            if success and isinstance(login_data, dict):
                self.token = login_data.get('token')
                self.log(f"   Logged in user: {test_email}")
        
        # Test invalid credentials
        self.run_test(
            "Invalid Login", "POST", "/auth/login", 401,
            data={
                "email": "invalid@test.com",
                "password": "wrongpassword"
            }
        )

    def test_newsletter_endpoint(self):
        """Test newsletter subscription"""
        self.log("\n📧 TESTING NEWSLETTER ENDPOINT")
        
        timestamp = int(time.time())
        test_email = f"newsletter.test.{timestamp}@tambvrini.com"
        
        # Test newsletter subscription
        success, data = self.run_test(
            "Newsletter Subscription", "POST", "/newsletter/subscribe", 200,
            data={"email": test_email}
        )
        
        if success:
            self.log(f"   Subscribed: {test_email}")
            
            # Test duplicate subscription
            self.run_test(
                "Duplicate Newsletter Subscription", "POST", "/newsletter/subscribe", 200,
                data={"email": test_email}
            )

    def test_checkout_endpoints(self):
        """Test checkout functionality"""
        self.log("\n💳 TESTING CHECKOUT ENDPOINTS")
        
        # Get a product for checkout test
        success, products_data = self.run_test(
            "Get Products for Checkout", "GET", "/products?limit=1", 200
        )
        
        if success and isinstance(products_data, dict):
            products = products_data.get('products', [])
            if products:
                product = products[0]
                
                # Test create checkout session
                success, checkout_data = self.run_test(
                    "Create Checkout Session", "POST", "/checkout/create-session", 200,
                    data={
                        "items": [{
                            "product_id": product.get('product_id'),
                            "quantity": 1,
                            "size": "M",
                            "color": "Negro"
                        }],
                        "origin_url": "https://tambvrini-luxury-1.preview.emergentagent.com"
                    }
                )
                
                if success and isinstance(checkout_data, dict):
                    session_id = checkout_data.get('session_id')
                    if session_id:
                        self.log(f"   Created checkout session: {session_id}")
                        
                        # Test get checkout status
                        self.run_test(
                            "Get Checkout Status", "GET", f"/checkout/status/{session_id}", 200
                        )

    def test_seed_endpoint(self):
        """Test seed endpoint"""
        self.log("\n🌱 TESTING SEED ENDPOINT")
        
        self.run_test(
            "Seed Products", "POST", "/seed", 200
        )

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        self.log("🚀 Starting TAMBVRINI API Test Suite")
        self.log(f"🎯 Target URL: {self.base_url}")
        
        start_time = time.time()
        
        try:
            # Test core endpoints
            self.test_products_endpoints()
            self.test_auth_endpoints() 
            self.test_newsletter_endpoint()
            self.test_checkout_endpoints()
            self.test_seed_endpoint()
            
        except KeyboardInterrupt:
            self.log("\n⏹️  Test suite interrupted")
            return 1
        except Exception as e:
            self.log(f"\n💥 Unexpected error: {str(e)}")
            return 1
        
        # Print results
        end_time = time.time()
        duration = end_time - start_time
        
        self.log("\n" + "="*60)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("="*60)
        self.log(f"⏱️  Duration: {duration:.2f} seconds")
        self.log(f"🎯 Total Tests: {self.tests_run}")
        self.log(f"✅ Passed: {self.tests_passed}")
        self.log(f"❌ Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            self.log("\n💥 FAILED TESTS:")
            for failure in self.failed_tests:
                self.log(f"   • {failure}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            self.log("🎉 Backend APIs are functioning well!")
            return 0
        else:
            self.log("⚠️  Backend has critical issues that need attention")
            return 1

def main():
    """Main test execution"""
    tester = TambvriniAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())