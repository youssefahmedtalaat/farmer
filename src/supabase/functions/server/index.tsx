import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================
// AUTH ROUTES
// ============================================

// Sign up new user
app.post('/make-server-a88cdc1e/signup', async (c) => {
  try {
    const { email, password, fullName, farmName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json({ error: 'Email, password, and full name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        fullName,
        farmName: farmName || '',
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Profile will be auto-created by database trigger, but ensure it exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile if trigger didn't fire (fallback)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          farm_name: farmName || '',
        });

      if (profileError) {
        console.log(`Profile creation error: ${profileError.message}`);
      }
    }

    return c.json({ success: true, user: data.user }, 201);
  } catch (error) {
    console.log(`Error during signup: ${error}`);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// ============================================
// PROFILE ROUTES
// ============================================

// Get user profile
app.get('/make-server-a88cdc1e/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.log(`Error fetching profile: ${profileError.message}`);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Map database fields to API response format
    const profileResponse = {
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
      farmName: profile.farm_name || '',
      farmSize: profile.farm_size || '',
      location: profile.location || '',
      address: profile.address || '',
      bio: profile.bio || '',
      profileImage: profile.profile_image || '',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return c.json({ profile: profileResponse });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-a88cdc1e/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();

    // Map API fields to database fields
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.farmName !== undefined) dbUpdates.farm_name = updates.farmName;
    if (updates.farmSize !== undefined) dbUpdates.farm_size = updates.farmSize;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.log(`Error updating profile: ${updateError.message}`);
      return c.json({ error: 'Failed to update profile' }, 500);
    }

    // Map back to API format
    const profileResponse = {
      fullName: updatedProfile.full_name,
      email: updatedProfile.email,
      phone: updatedProfile.phone || '',
      farmName: updatedProfile.farm_name || '',
      farmSize: updatedProfile.farm_size || '',
      location: updatedProfile.location || '',
      address: updatedProfile.address || '',
      bio: updatedProfile.bio || '',
      profileImage: updatedProfile.profile_image || '',
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at,
    };

    return c.json({ success: true, profile: profileResponse });
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ============================================
// CROPS ROUTES
// ============================================

// Get all crops for a user
app.get('/make-server-a88cdc1e/crops', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: crops, error: cropsError } = await supabase
      .from('crops')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (cropsError) {
      console.log(`Error fetching crops: ${cropsError.message}`);
      return c.json({ error: 'Failed to fetch crops' }, 500);
    }

    // Map database fields to API response format
    const cropsResponse = (crops || []).map(crop => ({
      id: crop.id,
      name: crop.name,
      quantity: crop.quantity || '0',
      stock: crop.stock || 0,
      status: crop.status || 'Good',
      createdAt: crop.created_at,
      updatedAt: crop.updated_at,
    }));

    return c.json({ crops: cropsResponse });
  } catch (error) {
    console.log(`Error fetching crops: ${error}`);
    return c.json({ error: 'Failed to fetch crops' }, 500);
  }
});

// Add a new crop
app.post('/make-server-a88cdc1e/crops', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, quantity, stock, status } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Crop name is required' }, 400);
    }

    // Check for existing crop with same name (case-insensitive)
    const { data: existingCrops } = await supabase
      .from('crops')
      .select('id, name')
      .eq('user_id', user.id);

    const duplicate = existingCrops?.find((crop: any) => 
      crop.name?.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      return c.json({ error: 'A crop with this name already exists' }, 400);
    }

    const { data: newCrop, error: insertError } = await supabase
      .from('crops')
      .insert({
        user_id: user.id,
        name: name,
        quantity: quantity || '0',
        stock: stock || 0,
        status: status || 'Good',
      })
      .select()
      .single();

    if (insertError) {
      console.log(`Error adding crop: ${insertError.message}`);
      return c.json({ error: 'Failed to add crop' }, 500);
    }

    // Map to API format
    const cropResponse = {
      id: newCrop.id,
      name: newCrop.name,
      quantity: newCrop.quantity || '0',
      stock: newCrop.stock || 0,
      status: newCrop.status || 'Good',
      createdAt: newCrop.created_at,
      updatedAt: newCrop.updated_at,
    };

    return c.json({ success: true, crop: cropResponse }, 201);
  } catch (error) {
    console.log(`Error adding crop: ${error}`);
    return c.json({ error: 'Failed to add crop' }, 500);
  }
});

// Update a crop
app.put('/make-server-a88cdc1e/crops/:cropId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cropId = c.req.param('cropId');
    const updates = await c.req.json();

    // Verify the crop belongs to the user
    const { data: existingCrop, error: fetchError } = await supabase
      .from('crops')
      .select('id, user_id')
      .eq('id', cropId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !existingCrop) {
      return c.json({ error: 'Crop not found or unauthorized' }, 404);
    }

    // Prepare updates
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data: updatedCrop, error: updateError } = await supabase
      .from('crops')
      .update(dbUpdates)
      .eq('id', cropId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.log(`Error updating crop: ${updateError.message}`);
      return c.json({ error: 'Failed to update crop' }, 500);
    }

    // Map to API format
    const cropResponse = {
      id: updatedCrop.id,
      name: updatedCrop.name,
      quantity: updatedCrop.quantity || '0',
      stock: updatedCrop.stock || 0,
      status: updatedCrop.status || 'Good',
      createdAt: updatedCrop.created_at,
      updatedAt: updatedCrop.updated_at,
    };

    return c.json({ success: true, crop: cropResponse });
  } catch (error) {
    console.log(`Error updating crop: ${error}`);
    return c.json({ error: 'Failed to update crop' }, 500);
  }
});

// Delete a crop
app.delete('/make-server-a88cdc1e/crops/:cropId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cropId = c.req.param('cropId');

    // Verify the crop belongs to the user and delete
    const { error: deleteError } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting crop: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete crop' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting crop: ${error}`);
    return c.json({ error: 'Failed to delete crop' }, 500);
  }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

// Get user subscription
app.get('/make-server-a88cdc1e/subscription', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.log(`Error fetching subscription: ${subError.message}`);
      return c.json({ error: 'Failed to fetch subscription' }, 500);
    }

    if (!subscription) {
      return c.json({ subscription: null });
    }

    // Map to API format
    const subscriptionResponse = {
      userId: subscription.user_id,
      planId: subscription.plan_id,
      planName: subscription.plan_name,
      price: subscription.price,
      duration: subscription.duration,
      status: subscription.status,
      trialEndsAt: subscription.trial_ends_at,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    };

    return c.json({ subscription: subscriptionResponse });
  } catch (error) {
    console.log(`Error fetching subscription: ${error}`);
    return c.json({ error: 'Failed to fetch subscription' }, 500);
  }
});

// Create/Update subscription after payment
app.post('/make-server-a88cdc1e/subscription', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { planId, planName, price, duration } = await c.req.json();

    if (!planId || !planName) {
      return c.json({ error: 'Plan details are required' }, 400);
    }

    // Check for existing subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
    let endDate = new Date(startDate);

    // Calculate end date based on plan
    if (duration === '1 month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration === '6 months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (duration === '1 year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscriptionData = {
      user_id: user.id,
      plan_id: planId,
      plan_name: planName,
      price: price || 0,
      duration: duration,
      status: existingSubscription ? 'active' : 'trial',
      trial_ends_at: existingSubscription ? null : startDate.toISOString(),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    // Upsert subscription (update if exists, insert if not)
    const { data: subscription, error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.log(`Error creating subscription: ${upsertError.message}`);
      return c.json({ error: 'Failed to create subscription' }, 500);
    }

    // Map to API format
    const subscriptionResponse = {
      userId: subscription.user_id,
      planId: subscription.plan_id,
      planName: subscription.plan_name,
      price: subscription.price,
      duration: subscription.duration,
      status: subscription.status,
      trialEndsAt: subscription.trial_ends_at,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    };

    return c.json({ success: true, subscription: subscriptionResponse }, 201);
  } catch (error) {
    console.log(`Error creating subscription: ${error}`);
    return c.json({ error: 'Failed to create subscription' }, 500);
  }
});

// ============================================
// ACTIVITIES/LOGS ROUTES
// ============================================

// Get user activities
app.get('/make-server-a88cdc1e/activities', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (activitiesError) {
      console.log(`Error fetching activities: ${activitiesError.message}`);
      return c.json({ error: 'Failed to fetch activities' }, 500);
    }

    // Map to API format
    const activitiesResponse = (activities || []).map(activity => ({
      id: activity.id,
      action: activity.action,
      detail: activity.detail || '',
      timestamp: activity.timestamp,
    }));

    return c.json({ activities: activitiesResponse });
  } catch (error) {
    console.log(`Error fetching activities: ${error}`);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Log an activity
app.post('/make-server-a88cdc1e/activities', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { action, detail } = await c.req.json();

    if (!action) {
      return c.json({ error: 'Action is required' }, 400);
    }

    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        action: action,
        detail: detail || '',
      })
      .select()
      .single();

    if (insertError) {
      console.log(`Error logging activity: ${insertError.message}`);
      return c.json({ error: 'Failed to log activity' }, 500);
    }

    // Map to API format
    const activityResponse = {
      id: activity.id,
      action: activity.action,
      detail: activity.detail || '',
      timestamp: activity.timestamp,
    };

    return c.json({ success: true, activity: activityResponse }, 201);
  } catch (error) {
    console.log(`Error logging activity: ${error}`);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// Health check
app.get('/make-server-a88cdc1e/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
