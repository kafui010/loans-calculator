import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface LoanBreakdown {
  month: number;
  amountPaid: number;
  interestPaid: number;
  remainingAmount: number;
}

export default function LoanCalculator() {
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(22);
  const [loanTenor, setLoanTenor] = useState<number>(12);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<LoanBreakdown[]>([]);

  const calculateLoan = () => {
    const maxLoanAmount = monthlySalary * 4;
    const monthlyInterestRate = interestRate / 100 / 12;
    
    // Calculate base monthly payment
    const baseMonthlyPayment = (maxLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenor)) / 
                          (Math.pow(1 + monthlyInterestRate, loanTenor) - 1);
    
    // Add small random variation to make payments more balanced (±5%)
    const variation = 0.05; // 5% variation
    let remainingAmount = maxLoanAmount;
    const newBreakdown: LoanBreakdown[] = [];

    for (let month = 1; month <= loanTenor; month++) {
      const randomFactor = 1 + (Math.random() * variation * 2 - variation);
      const monthlyPayment = baseMonthlyPayment * randomFactor;
      const interestPaid = remainingAmount * monthlyInterestRate;
      const amountPaid = monthlyPayment - interestPaid;
      remainingAmount -= amountPaid;

      newBreakdown.push({
        month,
        amountPaid,
        interestPaid,
        remainingAmount: Math.max(0, remainingAmount),
      });
    }

    setLoanAmount(maxLoanAmount);
    setMonthlyPayment(baseMonthlyPayment);
    setBreakdown(newBreakdown);
  };

  useEffect(() => {
    if (monthlySalary > 0) {
      calculateLoan();
    }
  }, [monthlySalary, interestRate, loanTenor]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 bg-white/90 backdrop-blur-sm shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Loan Calculator
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Net Monthly Salary (GHS)
              </label>
              <Input
                type="number"
                value={monthlySalary || ''}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Enter your monthly salary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate ({interestRate}%)
              </label>
              <Slider
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(value[0])}
                max={50}
                step={0.5}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Tenor ({loanTenor} months)
              </label>
              <Slider
                value={[loanTenor]}
                onValueChange={(value) => setLoanTenor(value[0])}
                min={3}
                max={36}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {monthlySalary > 0 && (
            <div className="mt-8 result-card p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                YOUR ESTIMATED RESULTS
              </h2>
              <div className="space-y-4 text-lg">
                <p className="text-gray-700 leading-relaxed">
                  You can borrow up to <span className="highlight text-primary font-semibold">{formatCurrency(loanAmount)}</span> with your stated net income of <span className="highlight text-primary font-semibold">{formatCurrency(monthlySalary)}</span> a month, at an interest rate of <span className="highlight text-primary font-semibold">{interestRate}%</span>.
                </p>
                <p className="text-gray-700">
                  With these estimations, you would make payment installments of about <span className="highlight text-primary font-semibold">{formatCurrency(monthlyPayment)}</span> monthly over <span className="highlight text-primary font-semibold">{loanTenor}</span> months.
                </p>
              </div>
              <Button
                onClick={() => setShowBreakdown(true)}
                className="mt-6 w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                variant="secondary"
              >
                View Breakdown
              </Button>
            </div>
          )}
        </div>

        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">Payment Breakdown</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th className="text-gray-900 font-semibold">Month</th>
                    <th className="text-primary font-semibold">Amount Paid</th>
                    <th className="text-success font-semibold">Interest Paid</th>
                    <th className="text-danger font-semibold">Remaining Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatCurrency(row.amountPaid)}</td>
                      <td>{formatCurrency(row.interestPaid)}</td>
                      <td>{formatCurrency(row.remainingAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}