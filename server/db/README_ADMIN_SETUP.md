# Admin Account Setup

This guide explains how to create an admin account to access the admin dashboard.

## Method 1: Using Node.js Script (Recommended)

Run the seed script to automatically create an admin account:

```bash
cd server
npm run seed:admin
```

Or directly:

```bash
cd server
node db/seed_admin.js
```

This will create an admin account with the following default credentials:

- **Email:** `admin@farmer.com`
- **Password:** `admin123`
- **Role:** `admin`

⚠️ **IMPORTANT:** Change the password after your first login!

## Method 2: Using SQL Script

You can also run the SQL script directly in phpMyAdmin or MySQL command line:

```bash
mysql -u root -p farmer_assistant < db/seed_admin.sql
```

Or copy and paste the contents of `seed_admin.sql` into phpMyAdmin's SQL tab.

## Method 3: Manual Signup (Current System)

With the current system, you can also create an admin account through the signup endpoint by setting `role: 'admin'` in the request body. However, this is a security vulnerability and should be restricted in production.

## Default Admin Credentials

```
Email:    admin@farmer.com
Password: admin123
Role:     admin
```

## Security Note

The current system allows anyone to create an admin account through the signup endpoint. For production use, you should:

1. Restrict admin account creation to existing admins only
2. Require a secret key or environment variable to create admin accounts
3. Implement proper role-based access control

## Troubleshooting

If you get an error that the admin already exists:
- The account may have been created previously
- You can either use the existing account or reset the password
- To reset, you can delete the user from the database and run the seed script again

