import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
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
    // Maximum loan amount is typically 3-4 times monthly salary
    const maxLoanAmount = monthlySalary * 4;
    const monthlyInterestRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using loan amortization formula
    const monthlyPayment = (maxLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenor)) / 
                          (Math.pow(1 + monthlyInterestRate, loanTenor) - 1);

    setLoanAmount(maxLoanAmount);
    setMonthlyPayment(monthlyPayment);

    // Calculate breakdown
    let remainingAmount = maxLoanAmount;
    const newBreakdown: LoanBreakdown[] = [];

    for (let month = 1; month <= loanTenor; month++) {
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

    setBreakdown(newBreakdown);
  };

  useEffect(() => {
    if (monthlySalary > 0) {
      calculateLoan();
    }
  }, [monthlySalary, interestRate, loanTenor]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
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
                className="w-full"
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
            <div className="mt-8 result-card p-6 bg-primary/5 rounded-lg border border-primary/10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                YOUR ESTIMATED RESULTS
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You can borrow up to <span className="highlight">{formatCurrency(loanAmount)}</span> with your stated net income of <span className="highlight">{formatCurrency(monthlySalary)}</span> a month, at an interest rate of <span className="highlight">{interestRate}%</span>.
              </p>
              <p className="text-gray-700 mt-2">
                With these estimations, you would make payment installments of about <span className="highlight">{formatCurrency(monthlyPayment)}</span> monthly over <span className="highlight">{loanTenor}</span> months.
              </p>
              <Button
                onClick={() => setShowBreakdown(true)}
                className="mt-4"
                variant="secondary"
              >
                View Breakdown
              </Button>
            </div>
          )}
        </div>

        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <Dialog.Content className="sm:max-w-[900px]">
            <Dialog.Header>
              <Dialog.Title>Payment Breakdown</Dialog.Title>
            </Dialog.Header>
            <div className="max-h-[60vh] overflow-auto">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-primary">Amount Paid</th>
                    <th className="text-success">Interest Paid</th>
                    <th className="text-danger">Remaining Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td className="text-primary">{formatCurrency(row.amountPaid)}</td>
                      <td className="text-success">{formatCurrency(row.interestPaid)}</td>
                      <td className="text-danger">{formatCurrency(row.remainingAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
}