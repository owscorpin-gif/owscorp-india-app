import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  purchased_at: string;
  service_id: string;
  services: {
    title: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  invoice_date: string;
  status: string;
}

interface Refund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  created_at: string;
}

export default function PaymentHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*, services(title)')
        .eq('customer_id', user.id)
        .order('purchased_at', { ascending: false });

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', user.id)
        .order('invoice_date', { ascending: false });

      // Fetch refunds
      const { data: refundsData } = await supabase
        .from('refunds')
        .select('*, purchases!inner(customer_id)')
        .eq('purchases.customer_id', user.id)
        .order('created_at', { ascending: false });

      setPurchases(purchasesData || []);
      setInvoices(invoicesData || []);
      setRefunds(refundsData || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (purchaseId: string) => {
    if (!refundReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for refund',
        variant: 'destructive',
      });
      return;
    }

    setRefundingId(purchaseId);
    try {
      const { error } = await supabase.functions.invoke('process-refund', {
        body: { purchaseId, reason: refundReason }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Refund request submitted successfully',
      });
      
      setRefundReason('');
      fetchData();
    } catch (error) {
      console.error('Refund error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
      case 'paid':
        return 'default';
      case 'pending':
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading payment history...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment History</h1>

        {/* Purchases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground">No purchases yet</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{purchase.services?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {purchase.currency} {purchase.amount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(purchase.payment_status)}>
                        {purchase.payment_status}
                      </Badge>
                      {purchase.payment_status === 'success' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Refund</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for your refund request
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea
                              placeholder="Reason for refund..."
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                            />
                            <Button
                              onClick={() => handleRefund(purchase.id)}
                              disabled={refundingId === purchase.id}
                            >
                              Submit Refund Request
                            </Button>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground">No invoices generated</p>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {invoice.currency} {invoice.amount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            {refunds.length === 0 ? (
              <p className="text-muted-foreground">No refunds requested</p>
            ) : (
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <div key={refund.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">
                        {refund.currency} {refund.amount}
                      </p>
                      <Badge variant={getStatusColor(refund.status)}>
                        {refund.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{refund.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}