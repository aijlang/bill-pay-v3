
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Bill, BillUpdatePayload } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import AddBillForm from './components/AddBillForm';
import BillList from './components/BillList';
import SummaryDashboard from './components/SummaryDashboard';
import Modal from './components/Modal';
import { WelcomeGraphic } from './constants';
import { isPaidThisMonth, formatExportDate, formatCurrency } from './utils/formatters';

const App: React.FC = () => {
    const [localBills, setLocalBills] = useLocalStorage<Bill[]>('bills', []);
    const bills = localBills;
    const setBills = setLocalBills;
    const [balance, setBalance] = useLocalStorage<number>('balance', 0);

    const [isLoading, setIsLoading] = useState(false);
    const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    
    const handleEditBill = useCallback(async (id: string, updates: BillUpdatePayload) => {
        setBills(prev => prev.map(bill => bill.id === id ? { ...bill, ...updates } : bill));
    }, [setBills]);

    const handleAddBill = useCallback(async (name: string, paymentUrl: string, amountDue?: number, dueDate?: number) => {
        const newBill: Bill = {
            id: crypto.randomUUID(),
            name,
            paymentUrl,
        };
        if (amountDue !== undefined && amountDue > 0) {
            newBill.amountDue = amountDue;
        }
        if (dueDate) {
            newBill.dueDate = dueDate;
        }

        setBills(prev => [...prev, newBill]);
        setIsAddBillModalOpen(false); 
    }, [setBills, handleEditBill]);

    const handleMarkAsPaid = useCallback(async (id: string, amount: number) => {
        const lastPayment = { date: new Date().toISOString(), amount };
        setBills(prev => prev.map(bill => bill.id === id ? { ...bill, lastPayment } : bill));
        // Deduct from balance
        setBalance(prev => Math.max(0, prev - amount));
    }, [setBills, setBalance]);

    const handleUndoPayment = useCallback(async (id: string) => {
        // Get the bill to retrieve the payment amount
        const bill = bills.find(b => b.id === id);
        setBills(prev =>
            prev.map(bill => {
                if (bill.id === id) {
                    const { lastPayment, ...restOfBill } = bill;
                    return restOfBill;
                }
                return bill;
            })
        );
        // Add the amount back to balance
        if (bill?.lastPayment) {
            setBalance(prev => prev + bill.lastPayment.amount);
        }
    }, [setBills, setBalance, bills]);

    const handleDeleteBill = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            setBills(prev => prev.filter(bill => bill.id !== id));
        }
    }, [setBills]);

    const handleExport = useCallback((format: 'csv' | 'xlsx' | 'pdf') => {
        const paidBillsThisMonth = bills.filter(bill => bill.lastPayment && isPaidThisMonth(bill.lastPayment.date));

        if (paidBillsThisMonth.length === 0) {
            alert("No paid bills to export for the current month.");
            return;
        }

        const monthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const filename = `Bill Payments - ${monthYear}`;

        const data = paidBillsThisMonth.map(bill => ({
            "Company Name": bill.name,
            "Amount Paid": bill.lastPayment!.amount,
            "Date Paid": formatExportDate(bill.lastPayment!.date),
        }));

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, monthYear);
            XLSX.writeFile(workbook, `${filename}.xlsx`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            const tableData = data.map(row => [
                row["Company Name"],
                formatCurrency(row["Amount Paid"]),
                row["Date Paid"]
            ]);

            doc.text(`Bill Payments - ${monthYear}`, 14, 15);
            autoTable(doc, {
                head: [['Company Name', 'Amount Paid', 'Date Paid']],
                body: tableData,
                startY: 20,
            });
            doc.save(`${filename}.pdf`);
        } else { // csv
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const value = (row as any)[header];
                    const strValue = String(value).replace(/"/g, '""');
                    return `"${strValue}"`;
                }).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, [bills]);

    const paidBillsThisMonth = bills.filter(bill => bill.lastPayment && isPaidThisMonth(bill.lastPayment.date));
    const unpaidBills = bills.filter(bill => !isPaidThisMonth(bill.lastPayment?.date));
    const totalPaid = paidBillsThisMonth.reduce((sum, bill) => sum + (bill.lastPayment?.amount || 0), 0);
    const totalOwed = unpaidBills.reduce((sum, bill) => sum + (bill.amountDue || 0), 0);
    const paidCount = paidBillsThisMonth.length;
    const totalBills = bills.length;

    return (
        <div className="min-h-screen bg-slate-200 font-sans text-slate-800">
            {isLoading && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
            <Header 
                onAddBillClick={() => setIsAddBillModalOpen(true)}
            />
            <main className="max-w-6xl mx-auto p-4 md:p-8">
                
                <Modal
                    isOpen={isAddBillModalOpen}
                    onClose={() => setIsAddBillModalOpen(false)}
                    title="Add a New Bill"
                >
                    <p className="text-sm sm:text-base text-slate-500 mb-4">Enter your bill details to start tracking.</p>
                    <AddBillForm onAddBill={handleAddBill} />
                </Modal>

                <Modal
                    isOpen={isBalanceModalOpen}
                    onClose={() => setIsBalanceModalOpen(false)}
                    title="Update Your Balance"
                >
                    <p className="text-sm sm:text-base text-slate-500 mb-4">Enter your current available funds.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="balance-input" className="block text-sm font-medium text-slate-600 mb-2">
                                Current Balance
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                <input
                                    id="balance-input"
                                    type="number"
                                    defaultValue={balance}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const newBalance = parseFloat((e.target as HTMLInputElement).value) || 0;
                                            setBalance(Math.max(0, newBalance));
                                            setIsBalanceModalOpen(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const input = document.getElementById('balance-input') as HTMLInputElement;
                                const newBalance = parseFloat(input.value) || 0;
                                setBalance(Math.max(0, newBalance));
                                setIsBalanceModalOpen(false);
                            }}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Save Balance
                        </button>
                    </div>
                </Modal>

                {/* Main Content Area: Dashboard and Bill List */}
                {bills.length > 0 ? (
                    <>
                        <SummaryDashboard
                            totalPaid={totalPaid}
                            totalOwed={totalOwed}
                            paidCount={paidCount}
                            totalBills={totalBills}
                            unpaidBills={unpaidBills}
                            balance={balance}
                            onEditBalance={() => setIsBalanceModalOpen(true)}
                        />
                        <BillList
                            bills={bills}
                            onMarkAsPaid={handleMarkAsPaid}
                            onUndoPayment={handleUndoPayment}
                            onDeleteBill={handleDeleteBill}
                            onEditBill={handleEditBill}
                            onExport={handleExport}
                            balance={balance}
                        />
                    </>
                ) : (
                    <div className="text-center bg-white rounded-xl shadow-lg p-8 md:p-12 border border-slate-200">
                    <div className="w-48 h-48 mx-auto text-slate-300">
                        {WelcomeGraphic}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mt-6">
                        Welcome to Your Bill Hub!
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        It looks like you don't have any bills yet. Click 'Add New Bill' in the header to add your first one and take control of your payments.
                    </p>
                    </div>
                )}

            </main>
             <footer className="text-center p-4 mt-8 text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} Bill Pay Hub. Simplify your finances.</p>
            </footer>
        </div>
    );
};

export default App;
