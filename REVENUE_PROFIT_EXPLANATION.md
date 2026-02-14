# Revenue and Profit Calculation Explanation

## Overview
The admin dashboard calculates two separate metrics:
1. **Total Revenue** - From subscription payments
2. **Total Profit** - From farmer crop sales

These are **completely independent** calculations.

---

## 📊 Revenue Calculation (From Subscriptions)

### Formula
```
Total Revenue = Sum of all active subscription prices
```

### Rules
- ✅ Only counts subscriptions with status: `'active'` or `'trial'`
- ✅ Only counts subscriptions that haven't expired (endDate hasn't passed)
- ✅ Includes Free Trials (price = 0 EGP, but still counted as active)
- ❌ Excludes farmers with "No Subscription"
- ❌ Excludes expired subscriptions

### Your Data Analysis

Based on your farmers list:

| Farmer | Subscription | Price | Status | Counts in Revenue? |
|--------|-------------|-------|--------|-------------------|
| Ibrahim Talat | Premium (1 year) | 15,000 EGP | Active | ✅ Yes |
| Raneem Ibrahem | Basic (1 month) | 4,000 EGP | Active | ✅ Yes |
| Adhm Azoz | Free Trial (2 weeks) | 0 EGP | Trial | ✅ Yes (but adds 0) |
| Nada Azoz | No Subscription | - | - | ❌ No |
| Malak Samir | No Subscription | - | - | ❌ No |
| Ahmed Alaa | Premium (1 year) | 15,000 EGP | Active | ✅ Yes |
| Demo Farmer | Pro (6 months) | 9,000 EGP | Active | ✅ Yes |

### Revenue Calculation
```
Total Revenue = 15,000 + 4,000 + 0 + 15,000 + 9,000
              = 43,000 EGP
```

**Note:** Free trials (0 EGP) are counted as active subscriptions but don't contribute to revenue.

---

## 💰 Profit Calculation (From Crops)

### Formula
For each crop:
```
Revenue = Quantity (in tons) × Price per ton
Cost = Revenue × 0.7 (70% of revenue)
Profit = Revenue - Cost = Revenue × 0.3 (30% of revenue)
```

### Crop Price Table
The system uses fixed prices per ton for different crops:

| Crop | Price per Ton (EGP) |
|------|-------------------|
| Wheat | 8,500 |
| Corn | 7,200 |
| Rice | 12,000 |
| Soybeans | 9,500 |
| Tomato | 15,000 |
| Potatoes | 6,000 |
| Onion | 7,000 |
| Cucumber | 9,000 |
| Other crops | 8,000 (default) |

### Your Data Analysis

| Farmer | Total Profit | How It's Calculated |
|--------|-------------|-------------------|
| Ibrahim Talat | 0 EGP | No crops or crops with 0 quantity |
| Raneem Ibrahem | 11,880 EGP | Sum of profits from all their crops |
| Adhm Azoz | 8,100 EGP | Sum of profits from all their crops |
| Nada Azoz | 8,640 EGP | Sum of profits from all their crops |
| Malak Samir | 25,200 EGP | Sum of profits from all their crops |
| Ahmed Alaa | 26,880 EGP | Sum of profits from all their crops |
| Demo Farmer | 31,725 EGP | Sum of profits from all their crops |

### Example Profit Calculation

Let's say a farmer has:
- **Wheat**: 2.0 tons
- **Tomatoes**: 1.5 tons

**Wheat Profit:**
```
Revenue = 2.0 × 8,500 = 17,000 EGP
Cost = 17,000 × 0.7 = 11,900 EGP
Profit = 17,000 - 11,900 = 5,100 EGP
```

**Tomatoes Profit:**
```
Revenue = 1.5 × 15,000 = 22,500 EGP
Cost = 22,500 × 0.7 = 15,750 EGP
Profit = 22,500 - 15,750 = 6,750 EGP
```

**Total Profit for this farmer:**
```
5,100 + 6,750 = 11,850 EGP
```

### Total Profit Calculation
```
Total Profit = Sum of all individual farmer profits
             = 0 + 11,880 + 8,100 + 8,640 + 25,200 + 26,880 + 31,725
             = 112,425 EGP
```

---

## 🔑 Key Points

1. **Revenue ≠ Profit**
   - Revenue comes from subscription payments
   - Profit comes from crop sales
   - They are completely independent

2. **Revenue Calculation**
   - Only active, non-expired subscriptions count
   - Free trials count as active but add 0 to revenue
   - No subscription = 0 revenue contribution

3. **Profit Calculation**
   - Based on actual crop quantities and prices
   - Uses 30% profit margin (70% cost, 30% profit)
   - Each farmer's profit is the sum of all their crop profits

4. **Subscription Status Matters**
   - Only `'active'` and `'trial'` subscriptions are counted
   - Expired subscriptions are excluded
   - "No Subscription" farmers don't contribute to revenue

---

## 📈 Summary for Your Data

**Total Revenue:** 43,000 EGP
- From 5 active subscriptions (2 Premium, 1 Basic, 1 Pro, 1 Free Trial)
- 2 farmers have no subscription (don't count)

**Total Profit:** 112,425 EGP
- From all 7 farmers' crop sales
- Independent of subscription status
- Each farmer's profit calculated from their individual crops

---

## 💡 Why These Numbers?

- **Ibrahim Talat** has 0 profit because they have no crops or crops with 0 quantity
- **Demo Farmer** has the highest profit (31,725 EGP) because they have more/larger crop quantities
- **Revenue** only reflects subscription payments, not crop sales
- **Profit** reflects actual farming business performance

