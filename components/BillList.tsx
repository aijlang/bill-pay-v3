
import React from 'react';
import type { Bill, BillUpdatePayload } from '../types';
import BillItem from './BillItem';
import { isPaidThisMonth } from '../utils/formatters';

interface BillListProps {
    bills: Bill[];
    onMarkAsPaid: (id: string, amount: number) => void;
    onUndoPayment: (id: string) => void;
    onDeleteBill: (id: string) => void;
    onEditBill: (id: string, updates: BillUpdatePayload) => void;
    onExport: (format: 'csv' | 'xlsx' | 'pdf') => void;
}

const BillList: React.FC<BillListProps> = ({ 
    bills, 
    onMarkAsPaid, 
    onUndoPayment, 
    onDeleteBill,
    onEditBill,
    onExport,
 }) => {
    const hasPaidBillsThisMonth = bills.some(bill => bill.lastPayment && isPaidThisMonth(bill.lastPayment.date));

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                 <h2 className="text-2xl font-bold text-slate-700">Your Bills</h2>
                 <div className="flex items-center gap-2 flex-wrap">
                    {hasPaidBillsThisMonth ? (
                        <>
                            <span className="text-sm font-semibold text-slate-600">Export Paid Bills:</span>
                            <button
                                onClick={() => onExport('xlsx')}
                                className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                aria-label="Download as XLSX"
                            >
                                .xlsx
                            </button>
                             <button
                                onClick={() => onExport('pdf')}
                                className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                aria-label="Download as PDF"
                            >
                                .pdf
                            </button>
                            <button
                                onClick={() => onExport('csv')}
                                className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                aria-label="Download as CSV"
                            >
                                .csv
                            </button>
                        </>
                    ) : (
                         <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
                             No paid bills to export
                         </div>
                    )}
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bills.map(bill => (
                    <BillItem 
                        key={bill.id} 
                        bill={bill} 
                        onMarkAsPaid={onMarkAsPaid} 
                        onUndoPayment={onUndoPayment}
                        onDeleteBill={onDeleteBill}
                        onEditBill={onEditBill}
                    />
                ))}
            </div>
        </div>
    );
};

export default BillList;
