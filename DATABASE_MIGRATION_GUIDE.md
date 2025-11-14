# Database Migration Guide - KV Store to Native Supabase Tables

This guide will help you migrate from the key-value store approach to proper Supabase database tables.

## 📋 Overview

**Before**: Data stored in a single KV table (`kv_store_a88cdc1e`)  
**After**: Data stored in proper relational tables:
- `profiles` - User profile information
- `crops` - Crop management data
- `subscriptions` - Subscription plans
- `activities` - User activity logs

## 🚀 Migration Steps

### Step 1: Run SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/brhudpbktxafvarmobwl
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create:
- All necessary tables
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updating timestamps
- Auto-profile creation trigger

### Step 2: Migrate Existing Data (Optional)

If you have existing data in the KV store, you can migrate it using this script:

```sql
-- Migration script to move data from KV store to new tables
-- Run this AFTER creating the new tables

-- Migrate profiles
INSERT INTO profiles (id, full_name, email, phone, farm_name, farm_size, location, address, bio, profile_image, created_at, updated_at)
SELECT 
  (value->>'id')::uuid as id,
  value->>'fullName' as full_name,
  value->>'email' as email,
  COALESCE(value->>'phone', '') as phone,
  COALESCE(value->>'farmName', '') as farm_name,
  COALESCE(value->>'farmSize', '') as farm_size,
  COALESCE(value->>'location', '') as location,
  COALESCE(value->>'address', '') as address,
  COALESCE(value->>'bio', '') as bio,
  COALESCE(value->>'profileImage', '') as profile_image,
  COALESCE((value->>'createdAt')::timestamptz, NOW()) as created_at,
  COALESCE((value->>'updatedAt')::timestamptz, NOW()) as updated_at
FROM kv_store_a88cdc1e
WHERE key LIKE 'profile:%'
ON CONFLICT (id) DO NOTHING;

-- Migrate crops
INSERT INTO crops (id, user_id, name, quantity, stock, status, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  (regexp_split_to_array(key, ':'))[2]::uuid as user_id,
  value->>'name' as name,
  COALESCE(value->>'quantity', '0') as quantity,
  COALESCE((value->>'stock')::integer, 0) as stock,
  COALESCE(value->>'status', 'Good') as status,
  COALESCE((value->>'createdAt')::timestamptz, NOW()) as created_at,
  COALESCE((value->>'updatedAt')::timestamptz, NOW()) as updated_at
FROM kv_store_a88cdc1e
WHERE key LIKE 'crop:%'
ON CONFLICT DO NOTHING;

-- Migrate subscriptions
INSERT INTO subscriptions (user_id, plan_id, plan_name, price, duration, status, trial_ends_at, start_date, end_date, created_at, updated_at)
SELECT 
  (regexp_split_to_array(key, ':'))[2]::uuid as user_id,
  value->>'planId' as plan_id,
  value->>'planName' as plan_name,
  COALESCE((value->>'price')::numeric, 0) as price,
  value->>'duration' as duration,
  COALESCE(value->>'status', 'trial') as status,
  CASE WHEN value->>'trialEndsAt' IS NOT NULL THEN (value->>'trialEndsAt')::timestamptz ELSE NULL END as trial_ends_at,
  (value->>'startDate')::timestamptz as start_date,
  (value->>'endDate')::timestamptz as end_date,
  COALESCE((value->>'createdAt')::timestamptz, NOW()) as created_at,
  COALESCE((value->>'updatedAt')::timestamptz, NOW()) as updated_at
FROM kv_store_a88cdc1e
WHERE key LIKE 'subscription:%'
ON CONFLICT (user_id) DO NOTHING;

-- Migrate activities
INSERT INTO activities (user_id, action, detail, timestamp)
SELECT 
  (regexp_split_to_array(key, ':'))[2]::uuid as user_id,
  value->>'action' as action,
  COALESCE(value->>'detail', '') as detail,
  COALESCE((value->>'timestamp')::timestamptz, NOW()) as timestamp
FROM kv_store_a88cdc1e
WHERE key LIKE 'activity:%'
ON CONFLICT DO NOTHING;
```

### Step 3: Deploy Updated Backend

The backend Edge Function has been updated to use native tables. Deploy it:

1. Make sure your Edge Function environment variables are set:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (from Supabase Dashboard > Settings > API)

2. Deploy the function using Supabase CLI:
   ```bash
   supabase functions deploy make-server-a88cdc1e
   ```

   Or deploy via the Supabase Dashboard:
   - Go to Edge Functions
   - Update the function code with the new `index.tsx`

### Step 4: Update Frontend (if needed)

The frontend API calls should work without changes, but crop IDs will now be UUIDs instead of strings like `crop:userId:timestamp`.

**Important**: If you have any frontend code that parses crop IDs expecting the old format, update it to handle UUIDs.

### Step 5: Test Everything

1. **Test Signup**: Create a new account
2. **Test Profile**: Update profile information
3. **Test Crops**: Add, update, and delete crops
4. **Test Subscriptions**: Create/update subscription
5. **Test Activities**: Log activities and view them

## 🔍 Verification

After migration, verify the tables exist:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'crops', 'subscriptions', 'activities');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'crops', 'subscriptions', 'activities');

-- Check data counts
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM crops) as crops_count,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions_count,
  (SELECT COUNT(*) FROM activities) as activities_count;
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your data before migration
2. **RLS Policies**: Row Level Security is enabled - users can only access their own data
3. **Auto-Profile Creation**: Profiles are automatically created when users sign up (via trigger)
4. **Crop ID Format**: Crop IDs are now UUIDs, not strings
5. **Backward Compatibility**: The old KV store table can be kept for reference, but new data will go to the new tables

## 🐛 Troubleshooting

### Issue: "Table does not exist"
- Make sure you ran the SQL migration script
- Check that you're in the correct database

### Issue: "Permission denied"
- Check RLS policies are correctly set
- Verify the user is authenticated
- Check service role key is correct

### Issue: "Duplicate key error"
- The migration script uses `ON CONFLICT DO NOTHING` to prevent duplicates
- If you see this, the data might already exist

### Issue: "Profile not found after signup"
- Check the trigger `on_auth_user_created` is created
- Manually create profile if trigger didn't fire

## 📊 Benefits of Native Tables

1. **Better Performance**: Indexed queries are faster
2. **Type Safety**: Proper data types and constraints
3. **Relationships**: Can add foreign keys and relationships
4. **Querying**: Easier to write complex queries
5. **Scalability**: Better for large datasets
6. **Security**: Row Level Security at database level

## 🔄 Rollback Plan

If you need to rollback:

1. The old KV store code is still in `kv_store.tsx`
2. You can revert `index.tsx` to use KV store
3. Data in new tables will remain (you can migrate back if needed)

## 📝 Next Steps

After successful migration:

1. Monitor the application for any issues
2. Consider adding more indexes if needed
3. Set up database backups
4. Consider adding database functions for complex operations
5. Remove old KV store code once confident everything works

---

**Need Help?** Check the Supabase documentation or review the code comments in the migration SQL file.

