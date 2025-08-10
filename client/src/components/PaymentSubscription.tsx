import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentSubscription() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments', user?.schoolId],
    enabled: !!user?.schoolId,
  });

  // Mock subscription data
  const subscriptionData = {
    plan: 'School Premium Plan',
    amount: 2400,
    currency: 'USD',
    renewalDate: 'March 2025',
    status: 'active',
    parentSubscriptions: 142,
    monthlyRevenue: 3540,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t('paymentSubscriptions')}</h3>
        <p className="text-sm text-gray-500 mt-1">Manage school and parent subscriptions</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        
        {/* Main Subscription Card */}
        <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{t('schoolPremiumPlan')}</h4>
              <p className="text-sm opacity-90">{t('annualSubscription')}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${subscriptionData.amount}</p>
              <p className="text-sm opacity-90">{t('perYear')}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm opacity-90">
              {t('renewal')}: {subscriptionData.renewalDate}
            </span>
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-none">
              {t('active')}
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('parentSubscriptions')}</p>
                <p className="text-2xl font-bold text-green-600">{subscriptionData.parentSubscriptions}</p>
              </div>
              <Users className="h-6 w-6 text-green-600 opacity-60" />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('monthlyRevenue')}</p>
                <p className="text-2xl font-bold text-blue-600">${subscriptionData.monthlyRevenue}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* Manage Payments Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            if (window?.location) {
              window.location.href = '/demo#pricing';
            }
          }}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {t('managePayments')}
        </Button>
      </CardContent>
    </Card>
  );
}
