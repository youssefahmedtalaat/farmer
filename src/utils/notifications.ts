import { toast } from 'sonner@2.0.3';
import { activitiesApi } from './api';

/**
 * Notification utility for showing toast messages and logging activities
 */

interface NotificationOptions {
  logActivity?: boolean;
  activityDetail?: string;
  duration?: number;
}

export const notify = {
  /**
   * Success notification with optional activity logging
   */
  success: async (
    message: string,
    description?: string,
    options: NotificationOptions = {}
  ) => {
    toast.success(message, {
      description,
      duration: options.duration || 3000,
    });

    if (options.logActivity) {
      try {
        await activitiesApi.log({
          action: message,
          detail: options.activityDetail || description || '',
        });
      } catch (error) {
        // Failed to log activity - silently fail
      }
    }
  },

  /**
   * Error notification
   */
  error: (message: string, description?: string, duration?: number) => {
    toast.error(message, {
      description,
      duration: duration || 4000,
    });
  },

  /**
   * Warning notification
   */
  warning: (message: string, description?: string, duration?: number) => {
    toast.warning(message, {
      description,
      duration: duration || 3500,
    });
  },

  /**
   * Info notification
   */
  info: (message: string, description?: string, duration?: number) => {
    toast.info(message, {
      description,
      duration: duration || 3000,
    });
  },

  /**
   * Loading notification that returns a toast ID for updating later
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, { description });
  },

  /**
   * Promise-based notification for async operations
   */
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options: NotificationOptions = {}
  ): Promise<T> => {
    const result = await toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });

    if (options.logActivity) {
      try {
        await activitiesApi.log({
          action: messages.success,
          detail: options.activityDetail || '',
        });
      } catch (error) {
        // Failed to log activity - silently fail
      }
    }

    return result;
  },

  /**
   * Crop-related notifications
   */
  crop: {
    added: (cropName: string) => {
      notify.success('Crop Added', `${cropName} has been added to your inventory`, {
        logActivity: true,
        activityDetail: `Added ${cropName} to inventory`,
      });
    },

    updated: (cropName: string) => {
      notify.success('Crop Updated', `${cropName} information has been updated`, {
        logActivity: true,
        activityDetail: `Updated ${cropName} details`,
      });
    },

    deleted: (cropName: string) => {
      notify.success('Crop Removed', `${cropName} has been removed from inventory`, {
        logActivity: true,
        activityDetail: `Removed ${cropName} from inventory`,
      });
    },

    stockLow: (cropName: string, stockLevel: number) => {
      notify.warning(
        'Low Stock Alert',
        `${cropName} stock is at ${stockLevel}%. Consider restocking.`,
        4000
      );
    },

    stockCritical: (cropName: string, stockLevel: number) => {
      notify.error(
        'Critical Stock Alert',
        `${cropName} stock is critically low at ${stockLevel}%!`,
        5000
      );
    },
  },

  /**
   * Profile-related notifications
   */
  profile: {
    updated: () => {
      notify.success('Profile Updated', 'Your profile information has been saved successfully', {
        logActivity: true,
        activityDetail: 'Updated profile information',
      });
    },

    pictureUpdated: () => {
      notify.success('Profile Picture Updated', 'Your profile picture has been changed', {
        logActivity: true,
        activityDetail: 'Changed profile picture',
      });
    },

    error: (message?: string) => {
      notify.error(
        'Profile Update Failed',
        message || 'There was an error updating your profile. Please try again.'
      );
    },
  },

  /**
   * Subscription-related notifications
   */
  subscription: {
    subscribed: (planName: string) => {
      notify.success(
        'Subscription Successful',
        `You are now subscribed to the ${planName} plan!`,
        {
          logActivity: true,
          activityDetail: `Subscribed to ${planName} plan`,
          duration: 5000,
        }
      );
    },


    upgraded: (planName: string) => {
      notify.success('Plan Upgraded', `Successfully upgraded to ${planName}`, {
        logActivity: true,
        activityDetail: `Upgraded to ${planName} plan`,
      });
    },

    renewed: () => {
      notify.success('Subscription Renewed', 'Your subscription has been automatically renewed', {
        logActivity: true,
        activityDetail: 'Subscription auto-renewed',
      });
    },
  },

  /**
   * Authentication notifications
   */
  auth: {
    loginSuccess: (userName?: string) => {
      notify.success(
        'Welcome Back!',
        userName ? `Good to see you, ${userName}` : 'You have successfully logged in'
      );
    },

    signupSuccess: () => {
      notify.success(
        'Account Created',
        'Welcome to Farmer Assistant! Your 14-day free trial has started.',
        { duration: 5000 }
      );
    },

    logoutSuccess: () => {
      notify.info('Logged Out', 'You have been successfully logged out');
    },

    error: (message: string) => {
      notify.error('Authentication Error', message);
    },
  },

  /**
   * Marketplace notifications
   */
  marketplace: {
    viewed: (marketName: string) => {
      notify.info('Viewing Marketplace', `Showing details for ${marketName}`);
    },

    visited: (marketName: string) => {
      notify.success('Visit Logged', `Marked visit to ${marketName}`, {
        logActivity: true,
        activityDetail: `Visited ${marketName}`,
      });
    },
  },

  /**
   * AI Assistant notifications
   */
  ai: {
    recommendationViewed: () => {
      notify.info('AI Recommendation', 'Viewing detailed AI analysis and suggestions');
    },

    recommendationDismissed: () => {
      notify.success('Recommendation Dismissed', "You won't see this recommendation again");
    },

    messageReceived: () => {
      notify.info('FarmBot Response', 'Check the chat for AI-generated advice');
    },
  },
};

export default notify;
