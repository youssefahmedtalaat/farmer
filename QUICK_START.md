# Quick Start Guide

## Understanding ERR_CONNECTION_REFUSED

**Error:** `ERR_CONNECTION_REFUSED` on port 3001

**Meaning:** The backend server is not running. The frontend is trying to connect to `http://localhost:3001` but nothing is listening on that port.

## Solution

### Option 1: Use START_APPLICATION.bat (Recommended)
1. Double-click `START_APPLICATION.bat`
2. This will:
   - Install dependencies (if needed)
   - Start the backend server on port 3001
   - Start the frontend server on port 3000
   - Open your browser automatically

### Option 2: Start Servers Manually

**Backend Server (Port 3001):**
```bash
cd server
npm run dev
```

**Frontend Server (Port 3000):**
```bash
npm run dev
```

## Important Notes

- **Keep both server windows open** while using the application
- The backend server must be running before the frontend can connect
- If you see `ERR_CONNECTION_REFUSED`, check:
  1. Is the backend server running? (Look for the server window)
  2. Is port 3001 available? (Check if another app is using it)
  3. Are there any errors in the server console?

## Stopping Servers

- Close the server windows, OR
- Run `STOP_SERVERS.bat`


