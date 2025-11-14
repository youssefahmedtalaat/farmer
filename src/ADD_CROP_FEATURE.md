# Add Crop Feature Documentation

## Overview
The "Add Crop" feature allows farmers to add new crops to their inventory through an intuitive dialog form. All crops are saved to the Supabase database and displayed in real-time on the dashboard.

## Components Created

### 1. AddCropDialog Component (`/components/AddCropDialog.tsx`)
A comprehensive dialog form for adding new crops with the following features:

#### Form Fields
- **Crop Name** (Required): Text input for crop name (e.g., Wheat, Corn, Rice)
- **Quantity** (Required): Numeric input with unit selector
  - Units available: tons, kg, lbs, bushels
  - Step value of 0.1 for precise measurements
- **Stock Level** (Required): Range slider from 0-100%
  - Visual color coding:
    - Red (0-25%): Critical
    - Orange (26-50%): Low
    - Green (51-100%): Good
  - Real-time preview of status

#### Features
- **Form Validation**: 
  - Ensures all required fields are filled
  - Validates positive numbers for quantity
  - Validates stock level range (0-100)
  
- **Preview Section**: 
  - Shows a live preview of the crop being added
  - Displays status based on stock level
  
- **Duplicate Prevention**: 
  - Backend checks for existing crops with the same name
  - Shows error notification if duplicate detected
  
- **Activity Logging**: 
  - Automatically logs crop addition to user's activity timeline
  
- **Notifications**: 
  - Success notification on crop addition
  - Error notifications for validation or server errors
  - Uses centralized notification system

## Dashboard Integration

### Updates to `/pages/Dashboard.tsx`

#### New State Management
```typescript
const [crops, setCrops] = useState<any[]>([]);
const [isLoadingCrops, setIsLoadingCrops] = useState(true);
const [showAddCropDialog, setShowAddCropDialog] = useState(false);
```

#### Data Fetching
- **loadCrops()**: Fetches crops from database on component mount
- Falls back to default demo crops if database is empty
- Adds color coding based on stock levels
- Handles errors gracefully

#### UI States
1. **Loading State**: Shows animated skeleton cards while fetching
2. **Empty State**: Shows friendly message with call-to-action button
3. **Populated State**: Displays crop cards with hover effects

#### Dynamic Statistics
- Total crops count updates automatically
- Average stock level calculated from all crops
- Active alerts count based on crops below 50% stock

## Backend API

### Endpoint: POST `/make-server-a88cdc1e/crops`

#### Request Body
```json
{
  "name": "Wheat",
  "quantity": "2 tons",
  "stock": 80,
  "status": "Good"
}
```

#### Response
```json
{
  "success": true,
  "crop": {
    "id": "crop:userId:timestamp",
    "name": "Wheat",
    "quantity": "2 tons",
    "stock": 80,
    "status": "Good",
    "createdAt": "2025-10-30T..."
  }
}
```

#### Features
- **Authentication**: Requires valid access token
- **Duplicate Prevention**: Checks for existing crops with same name (case-insensitive)
- **User Isolation**: Each user only sees their own crops
- **Automatic Timestamps**: CreatedAt added automatically

## User Experience Flow

1. **Opening Dialog**: User clicks "Add Crop" button on dashboard
2. **Filling Form**: User enters crop details with real-time validation
3. **Preview**: User sees live preview of the crop being added
4. **Submission**: 
   - Dialog shows "Adding..." state with disabled inputs
   - Request sent to backend
   - Activity logged automatically
5. **Success**:
   - Success notification appears
   - Dialog closes
   - Crops list refreshes automatically
   - New crop appears in dashboard
6. **Error Handling**:
   - Validation errors shown immediately
   - Server errors shown in notifications
   - Form remains open for corrections

## Notifications Used

### Success Notifications
- `notify.crop.added(cropName)`: Shown when crop successfully added

### Error Notifications
- Validation errors: "Missing Information", "Invalid Quantity", etc.
- Duplicate error: "A crop with this name already exists"
- Generic error: "Failed to Add Crop"

### Activity Logging
- Action: "Crop added"
- Detail: "CropName - Quantity"

## Design System

### Colors
- Primary: `#2D6A4F` (Forest Green)
- Success: `#2D6A4F` (Good status)
- Warning: `#BC6C25` (Low status)
- Error: `#ef4444` (Critical status)
- Background: `#FAF9F6` (Cream)

### Components
- Uses ShadCN UI components for consistency
- Rounded buttons (rounded-full)
- Soft shadows and hover effects
- Responsive design (mobile-friendly)

## Future Enhancements

Potential features to add:
1. **Edit Crop**: Allow users to modify existing crops
2. **Delete Crop**: Remove crops from inventory
3. **Crop Photos**: Upload images of crops
4. **Batch Import**: Add multiple crops at once via CSV
5. **Crop History**: Track stock level changes over time
6. **Harvest Tracking**: Log harvests and calculate yields
7. **Price Tracking**: Monitor market prices for each crop
8. **Weather Integration**: Show weather alerts for specific crops
9. **Planting Calendar**: Suggest optimal planting times
10. **Crop Rotation**: Recommend crop rotation strategies

## Testing Checklist

- [x] Form validation works for all fields
- [x] Duplicate crops are prevented
- [x] Database integration works correctly
- [x] Success notifications appear
- [x] Error notifications appear
- [x] Activity logging works
- [x] Dialog opens and closes properly
- [x] Crop list refreshes after addition
- [x] Statistics update correctly
- [x] Loading states display properly
- [x] Empty state displays when no crops
- [x] Mobile responsive design
- [x] Color coding based on stock levels
