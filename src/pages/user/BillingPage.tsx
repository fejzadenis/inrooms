import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { CreditCard, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function BillingPage() {
  const mockInvoices = [
    { id: 1, date: '2024-03-01', amount: 99, status: 'Paid' },
    { id: 2, date: '2024-02-01', amount: 99, status: 'Paid' },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Method</h3>
            <div className="mt-5">
              <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex sm:items-center">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <div className="text-sm font-medium text-gray-900">Visa ending in 4242</div>
                    <div className="text-sm text-gray-600">Expires 12/2024</div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button variant="outline">Update</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Billing History</h3>
            <div className="mt-5">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4">
                        <span className="sr-only">Download</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mockInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                          {invoice.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${invoice.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {invoice.status}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Download className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}