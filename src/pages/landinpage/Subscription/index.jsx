// SubscriptionPage.js
import React, { useState, useMemo } from 'react';
import { PlanCard } from './components/PlanCard';
import { BillingToggle } from './components/BillingToggle';
import { SubscriptionService } from './services/SubscriptionService';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = useMemo(() => 
    SubscriptionService.getPlans(billingCycle), 
    [billingCycle]
  );

  const billingCycles = useMemo(() => 
    SubscriptionService.getBillingCycles(), 
    []
  );

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleBillingChange = (cycle) => {
    setBillingCycle(cycle);
  };

  const handleSubscribe = () => {
    const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
    console.log('Subscribing to:', selectedPlanData);
    // Handle subscription logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 pt-9">
      <div className="max-w-7xl mx-auto mt-9">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include a 30-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <BillingToggle
          cycles={billingCycles}
          selectedCycle={billingCycle}
          onCycleChange={handleBillingChange}
        />

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        {/* Subscription Actions */}
        <div className="text-center">
          <button 
            onClick={handleSubscribe}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Start Your Free Trial
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Features Comparison */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Plans
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="h-8">Projects</div>
                <div className="h-8">Storage</div>
                <div className="h-8">Support</div>
                <div className="h-8">Custom Domains</div>
                <div className="h-8">Team Collaboration</div>
                <div className="h-8">API Access</div>
              </div>
            </div>
            {plans.map(plan => (
              <div key={plan.id} className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">{plan.name}</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('project')) || '-'}
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('storage')) || '-'}
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('support')) || '-'}
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('domain')) ? '✓' : '✗'}
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('team')) ? '✓' : '✗'}
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    {plan.features.find(f => f.includes('API')) ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
