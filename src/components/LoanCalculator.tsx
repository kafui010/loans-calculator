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
    const baseMonthlyPayment = (maxLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenor)) / 
                          (Math.pow(1 + monthlyInterestRate, loanTenor) - 1);
    
    let remainingAmount = maxLoanAmount;
    const newBreakdown: LoanBreakdown[] = [];

    for (let month = 1; month <= loanTenor; month++) {
      const interestPaid = remainingAmount * monthlyInterestRate;
      const amountPaid = baseMonthlyPayment - interestPaid;
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
    <div className="min-h-screen bg-gradient-to-b from-[#F6F4FF] to-[#E5DEFF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 bg-white/90 backdrop-blur-sm shadow-xl">
          <h1 className="text-3xl font-bold text-[#4B0082] mb-8 text-center">
            Loan Calculator
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Net Monthly Salary
              </label>
              <Input
                type="number"
                value={monthlySalary || ''}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full border-gray-300 focus:border-[#4B0082] focus:ring-[#4B0082]"
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

            <Button
              onClick={calculateLoan}
              className="w-full bg-[#4B0082] hover:bg-[#4B0082]/90 text-white"
            >
              Calculate Loan
            </Button>
          </div>

          {monthlySalary > 0 && (
            <div className="mt-8 result-card p-8 bg-gradient-to-br from-[#4B0082]/10 to-[#4B0082]/5 rounded-xl border border-[#4B0082]/10 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                YOUR ESTIMATED RESULTS
              </h2>
              <div className="space-y-4 text-lg">
                <p className="text-gray-700 leading-relaxed">
                  You can borrow up to <span className="highlight text-[#4B0082] font-semibold">{formatCurrency(loanAmount).replace('GH₵', '')}</span> with your stated net income of <span className="highlight text-[#4B0082] font-semibold">{formatCurrency(monthlySalary).replace('GH₵', '')}</span> a month, at an interest rate of <span className="highlight text-[#4B0082] font-semibold">{interestRate}%</span>.
                </p>
                <p className="text-gray-700">
                  With these estimations, you would make payment installments of about <span className="highlight text-[#4B0082] font-semibold">{formatCurrency(monthlyPayment).replace('GH₵', '')}</span> monthly over <span className="highlight text-[#4B0082] font-semibold">{loanTenor}</span> months.
                </p>
              </div>
              <Button
                onClick={() => setShowBreakdown(true)}
                className="mt-6 w-full sm:w-auto bg-[#FFBF00] hover:bg-[#FFBF00]/90 text-[#4B0082] font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              >
                View Breakdown
              </Button>
            </div>
          )}
        </div>

        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">Payment Breakdown</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 bg-gray-50 text-gray-900 font-semibold text-left">Month</th>
                    <th className="px-4 py-2 bg-[#4B0082] text-white font-semibold text-left">Amount Paid</th>
                    <th className="px-4 py-2 bg-[#34D399] text-white font-semibold text-left">Interest Paid</th>
                    <th className="px-4 py-2 bg-[#EF4444] text-white font-semibold text-left">Remaining Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row, index) => (
                    <tr 
                      key={row.month} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-2 text-gray-900">{row.month}</td>
                      <td className="px-4 py-2 text-gray-700">{formatCurrency(row.amountPaid).replace('GH₵', '')}</td>
                      <td className="px-4 py-2 text-gray-700">{formatCurrency(row.interestPaid).replace('GH₵', '')}</td>
                      <td className="px-4 py-2 text-gray-700">{formatCurrency(row.remainingAmount).replace('GH₵', '')}</td>
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