import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

const PettyCashTable = ({ expenses }) => {
    if (!expenses || expenses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No expenses found for this period.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500" id="petty-cash-table">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Voucher No</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3 text-right">Debit</th>
                        <th scope="col" className="px-6 py-3 text-right">Credit</th>
                        <th scope="col" className="px-6 py-3 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense, index) => (
                        <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.expense_date)}</td>
                            <td className="px-6 py-4 font-mono text-xs">{expense.id || index + 1}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {expense.category_name || 'General'}
                                </span>
                            </td>
                            <td className="px-6 py-4">{expense.note}</td>
                            <td className="px-6 py-4 text-right font-medium text-red-600">
                                {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-400">
                                -
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                {formatCurrency(expense.runningBalance)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PettyCashTable;
