# Troubleshooting Guide

## Common Errors and Solutions

### ERR_CONNECTION_REFUSED on Port 3001

**Error:** `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Meaning:** The backend server is not running on port 3001.

**Solution:**
1. **Quick Fix:** Double-click `START_APPLICATION.bat`
   - This starts both frontend and backend servers
   - Keep both server windows open

2. **Manual Start:**
   ```bash
   # Terminal 1 - Backend Server
   cd server
   npm run dev
   
   # Terminal 2 - Frontend Server (in project root)
   npm run dev
   ```

3. **Check if server is running:**
   - Look for a window titled "Backend Server (Port 3001)"
   - Should show: `🚀 Server running on port 3001`
   - Should show: `✅ Database connected successfully`

### Chrome Extension Error (Harmless)

**Error:** `A listener indicated an asynchronous response by returning true...`

**Meaning:** This is usually from a browser extension (like React DevTools, Redux DevTools, etc.)

**Solution:** 
- This error is harmless and can be ignored
- It doesn't affect your application
- To remove it, disable browser extensions temporarily

### Database Connection Issues

**Error:** `500 Internal Server Error` or `Database connection error`

**Check:**
1. Is MySQL running? (Check XAMPP Control Panel)
2. Does the `server/.env` file exist?
3. Is the database name correct? (should be `farmsystem`)
4. Check the server console for specific error messages

**Solution:**
- Ensure MySQL is running in XAMPP
- Verify `.env` file has correct `DATABASE_URL`
- Restart the backend server after fixing `.env`

## Quick Checklist

Before reporting issues, check:
- [ ] Backend server is running (port 3001)
- [ ] Frontend server is running (port 3000)
- [ ] MySQL is running (port 3306)
- [ ] `server/.env` file exists
- [ ] Database `farmsystem` exists
- [ ] No error messages in server console windows

## Getting Help

If issues persist:
1. Check the server console windows for error messages
2. Check browser console (F12) for specific errors
3. Verify all services are running
4. Try restarting all servers

