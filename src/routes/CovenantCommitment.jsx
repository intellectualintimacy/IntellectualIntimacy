import React, { useState, useEffect } from 'react';
import { 
  Check, X, Flame, Star, Users, Crown, Sparkles, 
  TrendingUp, Shield, Book, Heart, Zap, Gift,
  ChevronRight, Loader, CheckCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CovenantCommitmentPage = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [prayerStats, setPrayerStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setCurrentUser(session.user);

        // Fetch user's current subscription
        const { data: subData } = await supabase
          .from('member_subscriptions')
          .select(`
            *,
            tier:membership_tiers(*)
          `)
          .eq('profile_id', session.user.id)
          .eq('status', 'active')
          .single();

        setCurrentSubscription(subData);

        // Fetch prayer stats to suggest tier
        const { data: prayerLogs } = await supabase
          .from('prayer_logs')
          .select('*')
          .eq('member_id', session.user.id)
          .order('prayer_date', { ascending: false });

        if (prayerLogs && prayerLogs.length > 0) {
          const stats = calculatePrayerStats(prayerLogs);
          setPrayerStats(stats);
        }
      }

      // Fetch all tiers
      const { data: tiersData, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTiers(tiersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrayerStats = (logs) => {
    const dateMap = {};
    logs.forEach(log => {
      if (!dateMap[log.prayer_date]) {
        dateMap[log.prayer_date] = [];
      }
      dateMap[log.prayer_date].push(log.prayer_time);
    });

    const sortedDates = Object.keys(dateMap).sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        if (sortedDates[i] === today || isYesterday(sortedDates[i])) {
          currentStreak = 1;
        } else {
          break;
        }
      } else {
        const prevDate = sortedDates[i - 1];
        if (isConsecutiveDay(sortedDates[i], prevDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, totalPrayers: logs.length };
  };

  const isYesterday = (dateString) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === yesterday.toISOString().split('T')[0];
  };

  const isConsecutiveDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  const getTierIcon = (slug) => {
    switch(slug) {
      case 'growing-seed': return Sparkles;
      case 'faithful-servant': return Flame;
      case 'devoted-disciple': return Star;
      case 'family-covenant': return Users;
      default: return Shield;
    }
  };

  const getTierColor = (slug) => {
    switch(slug) {
      case 'growing-seed': return 'from-slate-600 to-slate-800';
      case 'faithful-servant': return 'from-orange-600 to-orange-800';
      case 'devoted-disciple': return 'from-yellow-600 to-yellow-800';
      case 'family-covenant': return 'from-blue-600 to-blue-800';
      default: return 'from-slate-600 to-slate-800';
    }
  };

  const getTierBorderColor = (slug) => {
    switch(slug) {
      case 'growing-seed': return 'border-slate-700';
      case 'faithful-servant': return 'border-orange-500/50';
      case 'devoted-disciple': return 'border-yellow-500/50';
      case 'family-covenant': return 'border-blue-500/50';
      default: return 'border-slate-700';
    }
  };

  const getSuggestedTier = () => {
    if (!prayerStats) return null;
    
    if (prayerStats.currentStreak >= 30) {
      return tiers.find(t => t.slug === 'devoted-disciple');
    } else if (prayerStats.currentStreak >= 7) {
      return tiers.find(t => t.slug === 'faithful-servant');
    }
    return null;
  };

  const handleSelectTier = (tier) => {
    if (!currentUser) {
      alert('Please log in to subscribe');
      navigate('/login');
      return;
    }

    if (tier.monthly_price === 0) {
      alert('You already have free access as a verified member!');
      return;
    }

    setSelectedTier(tier);
    // In real implementation, this would redirect to payment page
    // For now, we'll just show selection
  };

  const formatPrice = (price) => {
    return `R${price.toFixed(2)}`;
  };

  const calculateSavings = (monthly, yearly) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return savings;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading covenant tiers...</p>
        </div>
      </div>
    );
  }

  const suggestedTier = getSuggestedTier();

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <div className="inline-block mb-6">
            <div className="px-6 py-2 bg-blue-600/10 border border-blue-500/30">
              <span className="text-blue-400 text-xs tracking-[0.3em]">COVENANT COMMITMENT</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-white mb-6">
            Deepen Your <span className="font-normal bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent">Spiritual Walk</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join committed members growing daily through the 12 times of prayer. 
            Access enhanced spiritual tools, exclusive teachings, and community benefits.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-light text-orange-400 mb-1">12</div>
              <div className="text-sm text-slate-500">Prayer Times Daily</div>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-3xl font-light text-blue-400 mb-1">100+</div>
              <div className="text-sm text-slate-500">Years of Heritage</div>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-3xl font-light text-green-400 mb-1">1000+</div>
              <div className="text-sm text-slate-500">Active Members</div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-900/60 border border-slate-800 p-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm tracking-wider transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-sm tracking-wider transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] px-2 py-0.5">
                SAVE
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Suggested Tier Alert */}
      {suggestedTier && !currentSubscription && (
        <div className="max-w-7xl mx-auto px-8 mb-8">
          <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-500/30 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <h3 className="text-white font-light text-lg mb-1">
                  Recommended Based on Your Prayer Journey
                </h3>
                <p className="text-slate-400 text-sm">
                  You've maintained a {prayerStats.currentStreak}-day prayer streak! 
                  The <strong>{suggestedTier.name}</strong> tier is perfect for your commitment level.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const element = document.getElementById(`tier-${suggestedTier.slug}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap transition-all flex items-center gap-2"
            >
              View Tier
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Current Subscription Alert */}
      {currentSubscription && (
        <div className="max-w-7xl mx-auto px-8 mb-8">
          <div className="bg-green-900/20 border border-green-500/30 p-6 flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-white font-light text-lg mb-1">
                Active Covenant: {currentSubscription.tier.name}
              </h3>
              <p className="text-slate-400 text-sm">
                Your commitment is active and will renew on {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => {
            const TierIcon = getTierIcon(tier.slug);
            const price = billingCycle === 'monthly' ? tier.monthly_price : tier.yearly_price;
            const savings = calculateSavings(tier.monthly_price, tier.yearly_price);
            const isCurrentTier = currentSubscription?.tier.id === tier.id;
            const isSuggested = suggestedTier?.id === tier.id;

            return (
              <div
                key={tier.id}
                id={`tier-${tier.slug}`}
                className={`relative border transition-all ${
                  isSuggested 
                    ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-105' 
                    : getTierBorderColor(tier.slug)
                } ${
                  index === 1 ? 'lg:scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {index === 1 && !isSuggested && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 tracking-wider">
                    MOST POPULAR
                  </div>
                )}

                {/* Suggested Badge */}
                {isSuggested && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-xs px-4 py-1 tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    RECOMMENDED FOR YOU
                  </div>
                )}

                {/* Current Tier Badge */}
                {isCurrentTier && (
                  <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs px-4 py-1 tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    CURRENT
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${getTierColor(tier.slug)} mb-6 flex items-center justify-center`}>
                    <TierIcon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-light text-white mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 min-h-[60px]">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="text-4xl font-light text-white">Free</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-light text-white">{formatPrice(price)}</span>
                          <span className="text-slate-500 text-sm">
                            / {billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <p className="text-green-400 text-sm mt-2">
                            Save {formatPrice(savings)} per year
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectTier(tier)}
                    disabled={isCurrentTier}
                    className={`w-full py-3 mb-6 transition-all flex items-center justify-center gap-2 ${
                      isCurrentTier
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : price === 0
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : isSuggested
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isCurrentTier ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Current Plan
                      </>
                    ) : price === 0 ? (
                      'Free Access'
                    ) : (
                      <>
                        Choose Plan
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features && Array.isArray(tier.features) && tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Doctrine Safe Message */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-blue-900/20 border border-blue-800/30 p-8 text-center">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-light text-white mb-4">
            Covenant Commitment is NOT Required for Salvation
          </h3>
          <p className="text-slate-400 leading-relaxed mb-4">
            Your subscription supports the church and provides enhanced tools for spiritual growth. 
            It does NOT affect your salvation, blessings, or standing before God. 
            All members are welcome to worship, pray, and participate in church life.
          </p>
          <p className="text-slate-500 text-sm">
            "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God" 
            - Ephesians 2:8
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-light text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: "Is this required for salvation or church membership?",
              a: "No. Covenant Commitment is completely optional. Your salvation and church membership are not dependent on subscription. This system provides enhanced tools and benefits for those who wish to support the church and deepen their spiritual practice."
            },
            {
              q: "What if I can't afford a subscription?",
              a: "We understand that financial situations vary. Basic church access, services, and community are always free. If you're experiencing hardship but want to subscribe, please speak with church leadership about scholarship options."
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. You can cancel your subscription at any time. Your access will continue until the end of your current billing period. There are no cancellation fees or penalties."
            },
            {
              q: "Where does the subscription money go?",
              a: "All funds support church operations including: digital infrastructure, content creation, teaching materials, merchandise inventory, and ministry programs. The Church of the Holy Ghost does not accept outside donations - we rely solely on our members."
            },
            {
              q: "What's the difference between monthly and yearly billing?",
              a: "Yearly billing offers 2 months free (16% savings). For example, Faithful Servant costs R150/month or R1,500/year - saving you R300. You can switch between billing cycles when you renew."
            },
            {
              q: "Can I upgrade or downgrade my tier?",
              a: "Yes. You can change your tier at any time. Upgrades take effect immediately. Downgrades take effect at your next billing date. The difference will be prorated."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-6">
              <h3 className="text-white font-light text-lg mb-3">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-8 py-16 text-center">
        <h2 className="text-4xl font-light text-white mb-6">
          Ready to Deepen Your <span className="text-orange-400">Spiritual Journey?</span>
        </h2>
        <p className="text-slate-400 text-lg mb-8">
          Join committed members who are growing daily through the 12 times of prayer
        </p>
        <button
          onClick={() => {
            if (!currentUser) {
              navigate('/login');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="px-12 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center gap-3 mx-auto"
        >
          {currentUser ? 'Choose Your Covenant' : 'Sign In to Get Started'}
          <ArrowRight className="w-5 h-5" />
        </button>

        {!currentUser && (
          <p className="text-slate-500 text-sm mt-4">
            Need an account? <a href="/register" className="text-blue-400 hover:text-blue-300">Register here</a>
          </p>
        )}
      </section>
    </div>
  );
};

export default CovenantCommitmentPage;