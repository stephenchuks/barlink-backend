#!/bin/bash

set -e

# Optionally load from .env.local
[ -f .env.local ] && source .env.local

echo "📊 Querying Barlink Snapshot..."

# 🏢 Superadmin - List Restaurants
echo ""
echo "🏢 Superadmin: List all restaurants"
curl -s -X GET http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" | jq .

# 📋 Owner - List Menus
echo ""
echo "📋 Owner: List Menus"
curl -s -X GET http://localhost:5000/api/menus \
  -H "Authorization: Bearer $OWNER_TOKEN" | jq .

# 📦 Owner - Orders by Restaurant
echo ""
echo "📦 Owner: List Orders for Restaurant"
curl -s -X GET http://localhost:5000/api/orders/restaurant/$RESTAURANT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | jq .

# 📈 Owner - Analytics
echo ""
echo "📈 Owner: Dashboard Analytics"
curl -s -X GET http://localhost:5000/api/analytics/restaurant/$RESTAURANT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | jq .

# 🧑‍💼 Manager - View Staff
echo ""
echo "🧑‍💼 Manager: List Staff"
curl -s -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq .

# 🎁 Server - Promotions
echo ""
echo "🎁 Server: View Active Promotions"
curl -s -X GET http://localhost:5000/api/promotions/active \
  -H "Authorization: Bearer $SERVER_TOKEN" | jq .

# 🔥 Public - Popular Items
echo ""
echo "🔥 Customer: View Popular Items"
curl -s -X GET http://localhost:5000/api/menus/popular | jq .

# ⭐ Public - Ratings Summary (safe item lookup)
echo ""
echo "⭐ Customer: Ratings Summary for First Item (example)"
FIRST_ITEM_ID=$(curl -s -X GET http://localhost:5000/api/menus \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq -r '.[0].subcategories[0].items[0]._id // empty')

if [ -n "$FIRST_ITEM_ID" ]; then
  curl -s -X GET http://localhost:5000/api/ratings/item/$FIRST_ITEM_ID/summary | jq .
else
  echo "⚠️  Could not extract FIRST_ITEM_ID — ratings summary skipped."
fi

# ❤️ Public - Favorite Count
echo ""
echo "❤️ Customer: Favorite Count"
if [ -n "$FIRST_ITEM_ID" ]; then
  curl -s -X GET http://localhost:5000/api/favorites/count/$FIRST_ITEM_ID | jq .
else
  echo "⚠️  Could not extract FIRST_ITEM_ID — favorite count skipped."
fi

echo ""
echo "✅ All queries completed!"
