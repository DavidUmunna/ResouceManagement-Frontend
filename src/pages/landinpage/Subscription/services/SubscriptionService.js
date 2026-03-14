// services/subscriptionService.js
export class SubscriptionService {
  static getPlans(billingType) {
    const basePlans = [
      {
        id: 'basic',
        name: 'Basic',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        features: ['10 projects', '5GB storage', 'Basic support']
      },
      {
        id: 'pro',
        name: 'Professional',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        features: ['50 projects', '50GB storage', 'Priority support', 'Custom domains'],
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: 49.99,
        yearlyPrice: 499.99,
        features: ['Unlimited projects', '500GB storage', '24/7 support', 'API access']
      }
    ];

    return basePlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: billingType === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
      originalPrice: billingType === 'yearly' ? plan.monthlyPrice * 12 : undefined,
      features: plan.features,
      popular: plan.popular
    }));
  }

  static getBillingCycles() {
    return [
      { type: 'monthly' },
      { type: 'yearly', discount: 20 }
    ];
  }
}