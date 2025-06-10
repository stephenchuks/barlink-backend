#!/bin/bash
set -e

echo "🌐 Registering SUPERADMIN..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@barlink.com", "password": "admin123", "role": "superadmin"}'

echo "🔐 Logging in SUPERADMIN..."
export SUPERADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@barlink.com", "password": "admin123"}' | jq -r .token)

if [ "$SUPERADMIN_TOKEN" == "null" ] || [ -z "$SUPERADMIN_TOKEN" ]; then
  echo "❌ Failed to login SUPERADMIN"
  exit 1
fi
echo "🔑 SUPERADMIN_TOKEN=$SUPERADMIN_TOKEN"

echo "🏢 Creating RESTAURANT..."
RESTAURANT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "La Pasta",
    "email": "la@pasta.com",
    "domainSlug": "la-pasta",
    "address": "123 Pasta Blvd",
    "phone": "+1234567890",
    "category": "Italian"
  }')
echo "Raw restaurant response: $RESTAURANT_RESPONSE"

export RESTAURANT_ID=$(echo "$RESTAURANT_RESPONSE" | jq -r '._id')
if [ "$RESTAURANT_ID" == "null" ] || [ -z "$RESTAURANT_ID" ]; then
  echo "❌ Failed to extract restaurant ID"
  exit 1
fi
echo "🏢 RESTAURANT_ID=$RESTAURANT_ID"

echo "👤 Registering OWNER..."
OWNER_REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@pasta.com", "password": "pass123", "role": "owner", "restaurant": "'"$RESTAURANT_ID"'"}')
echo "Raw owner register response: $OWNER_REGISTER"

export OWNER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@pasta.com", "password": "pass123"}' | jq -r .token)
if [ "$OWNER_TOKEN" == "null" ] || [ -z "$OWNER_TOKEN" ]; then
  echo "❌ Failed to login OWNER"
  exit 1
fi
echo "🔑 OWNER_TOKEN=$OWNER_TOKEN"

echo "👔 Registering MANAGER..."
MANAGER_CREATE=$(curl -s -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@pasta.com", "password": "pass123", "role": "manager", "restaurant": "'"$RESTAURANT_ID"'"}')
echo "Raw manager create response: $MANAGER_CREATE"

export MANAGER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@pasta.com", "password": "pass123"}' | jq -r .token)
if [ "$MANAGER_TOKEN" == "null" ] || [ -z "$MANAGER_TOKEN" ]; then
  echo "❌ Failed to login MANAGER"
  exit 1
fi
echo "🔑 MANAGER_TOKEN=$MANAGER_TOKEN"

echo "🍽️ Registering SERVER..."
SERVER_CREATE=$(curl -s -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "server@pasta.com", "password": "pass123", "role": "server", "restaurant": "'"$RESTAURANT_ID"'"}')
echo "Raw server create response: $SERVER_CREATE"

export SERVER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "server@pasta.com", "password": "pass123"}' | jq -r .token)
if [ "$SERVER_TOKEN" == "null" ] || [ -z "$SERVER_TOKEN" ]; then
  echo "❌ Failed to login SERVER"
  exit 1
fi
echo "🔑 SERVER_TOKEN=$SERVER_TOKEN"

echo "📋 Creating Menu..."
MENU_RESPONSE=$(curl -s -X POST http://localhost:5000/api/menus \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": { "name": "Pasta Classics", "slug": "pasta-classics" },
    "description": "Classic pasta dishes",
    "subcategories": [
      {
        "name": "Creamy",
        "items": [
          {
            "name": "Fettuccine Alfredo",
            "description": "Rich creamy sauce with Parmesan",
            "price": 14.99,
            "available": true,
            "image": "https://source.unsplash.com/featured/?fettuccine",
            "tags": ["Vegetarian"],
            "options": [
              { "label": "Add Chicken", "price": 4.0 },
              { "label": "Add Shrimp", "price": 6.0 }
            ]
          }
        ]
      }
    ]
  }')
echo "Raw menu response: $MENU_RESPONSE"

export MENU_ID=$(echo "$MENU_RESPONSE" | jq -r '._id')
if [ "$MENU_ID" == "null" ] || [ -z "$MENU_ID" ]; then
  echo "❌ Failed to extract menu ID"
  exit 1
fi
echo "📋 MENU_ID=$MENU_ID"

echo "🎁 Creating Promotion..."
PROMO_RESPONSE=$(curl -s -X POST http://localhost:5000/api/promotions \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Creamy Pasta Special",
    "description": "10% off creamy pastas this week!",
    "tag": "Special",
    "items": [{ "menuId": "'"$MENU_ID"'", "itemId": "'"$MENU_ID"'" }]
  }')
echo "Raw promo response: $PROMO_RESPONSE"

echo "✅ Done seeding!"

echo ""
echo "💾 Exported to shell session:"
echo "export SUPERADMIN_TOKEN=$SUPERADMIN_TOKEN"
echo "export OWNER_TOKEN=$OWNER_TOKEN"
echo "export MANAGER_TOKEN=$MANAGER_TOKEN"
echo "export SERVER_TOKEN=$SERVER_TOKEN"
echo "export RESTAURANT_ID=$RESTAURANT_ID"
echo "export MENU_ID=$MENU_ID"

echo "Saving environment variables to .env.local..."
cat > .env.local <<EOF
export SUPERADMIN_TOKEN=$SUPERADMIN_TOKEN
export OWNER_TOKEN=$OWNER_TOKEN
export MANAGER_TOKEN=$MANAGER_TOKEN
export SERVER_TOKEN=$SERVER_TOKEN
export RESTAURANT_ID=$RESTAURANT_ID
export MENU_ID=$MENU_ID
EOF

