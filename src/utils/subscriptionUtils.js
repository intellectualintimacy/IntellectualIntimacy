// src/utils/subscriptionUtils.js
import { supabase } from '../lib/supabase';

/**
 * Check if a user has an active subscription
 * @param {string} userId - The user's profile ID
 * @returns {Promise<Object>} Subscription details or null
 */
export const getUserSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('member_subscriptions')
      .select(`
        *,
        tier:membership_tiers(*)
      `)
      .eq('profile_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - this is fine
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

/**
 * Check if user has access to a specific feature based on their tier
 * @param {string} userId - The user's profile ID
 * @param {string} feature - The feature to check (e.g., 'prayer_journal', 'sermon_archive')
 * @returns {Promise<boolean>}
 */
export const hasFeatureAccess = async (userId, feature) => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    // No subscription = free tier only
    return isFreeFeature(feature);
  }

  // Check tier slug for feature access
  const tierSlug = subscription.tier.slug;
  
  return hasFeatureInTier(feature, tierSlug);
};

/**
 * Check if a feature is available in free tier
 * @param {string} feature
 * @returns {boolean}
 */
const isFreeFeature = (feature) => {
  const freeFeatures = [
    'basic_prayer_tracking',
    'view_limited_sermons',
    'view_hymns',
    'basic_profile',
    'view_events',
    'browse_shop'
  ];
  
  return freeFeatures.includes(feature);
};

/**
 * Check if a feature is available in a specific tier
 * @param {string} feature
 * @param {string} tierSlug
 * @returns {boolean}
 */
const hasFeatureInTier = (feature, tierSlug) => {
  const tierFeatures = {
    'growing-seed': [
      'basic_prayer_tracking',
      'view_limited_sermons',
      'view_hymns',
      'basic_profile',
      'view_events',
      'browse_shop'
    ],
    'faithful-servant': [
      'basic_prayer_tracking',
      'view_limited_sermons',
      'view_hymns',
      'basic_profile',
      'view_events',
      'browse_shop',
      // New features
      'enhanced_prayer_tracking',
      'prayer_journal',
      'weekly_reports',
      'prayer_reminders',
      'full_sermon_archive',
      'downloadable_hymns',
      'monthly_devotionals',
      'member_forum',
      'shop_discount_15',
      'free_shipping_500',
      'early_access_24h',
      'faithful_badge',
      'quarterly_certificate'
    ],
    'devoted-disciple': [
      // All faithful servant features plus:
      'basic_prayer_tracking',
      'view_limited_sermons',
      'view_hymns',
      'basic_profile',
      'view_events',
      'browse_shop',
      'enhanced_prayer_tracking',
      'prayer_journal',
      'weekly_reports',
      'prayer_reminders',
      'full_sermon_archive',
      'downloadable_hymns',
      'monthly_devotionals',
      'member_forum',
      'shop_discount_15',
      'free_shipping_500',
      'early_access_24h',
      'faithful_badge',
      'quarterly_certificate',
      // New devoted disciple features
      'spiritual_insights',
      'scripture_study_plans',
      'virtual_counseling',
      'revelation_vault',
      'reverend_qa_monthly',
      'prayer_workshops',
      'sabbath_teachings',
      'shop_discount_25',
      'free_shipping_always',
      'exclusive_items',
      'early_access_48h',
      'devoted_badge',
      'annual_blessing_letter',
      'physical_certificate'
    ],
    'family-covenant': [
      // All devoted disciple features plus:
      'basic_prayer_tracking',
      'view_limited_sermons',
      'view_hymns',
      'basic_profile',
      'view_events',
      'browse_shop',
      'enhanced_prayer_tracking',
      'prayer_journal',
      'weekly_reports',
      'prayer_reminders',
      'full_sermon_archive',
      'downloadable_hymns',
      'monthly_devotionals',
      'member_forum',
      'shop_discount_15',
      'free_shipping_500',
      'early_access_24h',
      'faithful_badge',
      'quarterly_certificate',
      'spiritual_insights',
      'scripture_study_plans',
      'virtual_counseling',
      'revelation_vault',
      'reverend_qa_monthly',
      'prayer_workshops',
      'sabbath_teachings',
      'shop_discount_25',
      'free_shipping_always',
      'exclusive_items',
      'early_access_48h',
      'devoted_badge',
      'annual_blessing_letter',
      'physical_certificate',
      // New family features
      'family_dashboard',
      'family_devotionals',
      'family_challenges',
      'bulk_discount_30',
      'family_recognition',
      'family_certificate',
      'linked_profiles_6'
    ]
  };

  return tierFeatures[tierSlug]?.includes(feature) || false;
};

/**
 * Get subscription tier level (0 = free, 1-4 = paid tiers)
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getSubscriptionLevel = async (userId) => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return 0;
  
  const tierLevels = {
    'growing-seed': 0,
    'faithful-servant': 1,
    'devoted-disciple': 2,
    'family-covenant': 3
  };
  
  return tierLevels[subscription.tier.slug] || 0;
};

/**
 * Get shop discount percentage based on subscription
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getShopDiscount = async (userId) => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return 0;
  
  const discounts = {
    'growing-seed': 0,
    'faithful-servant': 15,
    'devoted-disciple': 25,
    'family-covenant': 30
  };
  
  return discounts[subscription.tier.slug] || 0;
};

/**
 * Check if user qualifies for free shipping
 * @param {string} userId
 * @param {number} orderTotal
 * @returns {Promise<boolean>}
 */
export const qualifiesForFreeShipping = async (userId, orderTotal) => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return false;
  
  const tierSlug = subscription.tier.slug;
  
  // Devoted Disciple and Family Covenant always get free shipping
  if (tierSlug === 'devoted-disciple' || tierSlug === 'family-covenant') {
    return true;
  }
  
  // Faithful Servant gets free shipping over R500
  if (tierSlug === 'faithful-servant' && orderTotal >= 500) {
    return true;
  }
  
  return false;
};

/**
 * Create a new subscription
 * @param {Object} subscriptionData
 * @returns {Promise<Object>}
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('member_subscriptions')
      .insert({
        profile_id: subscriptionData.userId,
        tier_id: subscriptionData.tierId,
        billing_cycle: subscriptionData.billingCycle,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        next_billing_date: calculateNextBillingDate(subscriptionData.billingCycle),
        current_period_end: calculateNextBillingDate(subscriptionData.billingCycle),
        auto_renew: true,
        payment_method: subscriptionData.paymentMethod || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, subscription: data };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId
 * @param {boolean} immediate - Cancel immediately or at period end
 * @returns {Promise<Object>}
 */
export const cancelSubscription = async (subscriptionId, immediate = false) => {
  try {
    const updateData = {
      cancel_at_period_end: !immediate,
      updated_at: new Date().toISOString()
    };

    if (immediate) {
      updateData.status = 'cancelled';
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('member_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, subscription: data };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate next billing date based on cycle
 * @param {string} billingCycle
 * @returns {string}
 */
const calculateNextBillingDate = (billingCycle) => {
  const now = new Date();
  
  if (billingCycle === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    now.setFullYear(now.getFullYear() + 1);
  }
  
  return now.toISOString().split('T')[0];
};

/**
 * Record a subscription payment
 * @param {Object} paymentData
 * @returns {Promise<Object>}
 */
export const recordPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('subscription_payments')
      .insert({
        subscription_id: paymentData.subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'ZAR',
        status: paymentData.status || 'completed',
        payment_date: new Date().toISOString(),
        payment_method: paymentData.paymentMethod,
        transaction_id: paymentData.transactionId,
        receipt_url: paymentData.receiptUrl || null,
        notes: paymentData.notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Award achievement badge to user
 * @param {string} userId
 * @param {string} achievementType
 * @param {string} achievementName
 * @param {string} description
 * @returns {Promise<Object>}
 */
export const awardAchievement = async (userId, achievementType, achievementName, description) => {
  try {
    const { data, error } = await supabase
      .from('member_achievements')
      .insert({
        profile_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description: description,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, achievement: data };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getUserSubscription,
  hasFeatureAccess,
  getSubscriptionLevel,
  getShopDiscount,
  qualifiesForFreeShipping,
  createSubscription,
  cancelSubscription,
  recordPayment,
  awardAchievement
};