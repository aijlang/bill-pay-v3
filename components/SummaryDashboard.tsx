import React from 'react';
import type { Bill } from '../types';
import { formatCurrency, formatDueDate } from '../utils/formatters';
import { DollarIcon, ChecklistIcon, ClockIcon, WalletIcon, CalendarIcon, HouseIcon } from '../constants';

interface SummaryDashboardProps {
    totalPaid: number;
    totalOwed: number;
    paidCount: number;
    totalBills: number;
    unpaidBills: Bill[];
}

const statCardThemes = {
    green: {
        card: 'bg-green-50',
        icon: 'bg-green-500',
        title: 'text-green-700',
        value: 'text-green-900',
        border: 'border-green-400',
    },
    red: {
        card: 'bg-red-50',
        icon: 'bg-red-500',
        title: 'text-red-700',
        value: 'text-red-900',
        border: 'border-red-400',
    },
    indigo: {
        card: 'bg-indigo-50',
        icon: 'bg-indigo-500',
        title: 'text-indigo-700',
        value: 'text-indigo-900',
        border: 'border-indigo-400',
    },
    amber: {
        card: 'bg-amber-50',
        icon: 'bg-amber-500',
        title: 'text-amber-700',
        value: 'text-amber-900',
        border: 'border-amber-400',
    },
};

const StatCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    value: string; 
    theme: typeof statCardThemes.green;
}> = ({ icon, title, value, theme }) => (
    <div className={`${theme.card} rounded-lg p-4 flex items-center shadow-sm border-2 ${theme.border}`}>
        <div className={`p-3 rounded-full mr-4 ${theme.icon}`}>
            <span className="text-white">{icon}</span>
        </div>
        <div>
            <p className={`text-sm font-medium ${theme.title}`}>{title}</p>
            <p className={`text-2xl font-bold ${theme.value}`}>{value}</p>
        </div>
    </div>
);

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ totalPaid, totalOwed, paidCount, totalBills, unpaidBills }) => {
    const remainingCount = totalBills - paidCount;
    const progressPercentage = totalBills > 0 ? (paidCount / totalBills) * 100 : 0;

    const dueSoonBills = unpaidBills
        .filter(bill => bill.dueDate)
        .sort((a, b) => a.dueDate! - b.dueDate!)
        .slice(0, 4);

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Monthly Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={DollarIcon} 
                    title="Total Paid" 
                    value={formatCurrency(totalPaid)} 
                    theme={statCardThemes.green}
                />
                <StatCard 
                    icon={WalletIcon} 
                    title="Total Owed" 
                    value={formatCurrency(totalOwed)} 
                    theme={statCardThemes.red}
                />
                <StatCard 
                    icon={ChecklistIcon} 
                    title="Bills Paid" 
                    value={`${paidCount} / ${totalBills}`} 
                    theme={statCardThemes.indigo}
                />
                <StatCard 
                    icon={ClockIcon} 
                    title="Remaining" 
                    value={`${remainingCount}`} 
                    theme={statCardThemes.amber}
                />
            </div>
            
            {dueSoonBills.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Due Soon</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dueSoonBills.map(bill => (
                            <div key={bill.id} className="bg-amber-50 rounded-lg p-3 shadow-sm border border-amber-200 flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                    {CalendarIcon}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{bill.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Due: <span className="font-medium text-slate-600">{formatDueDate(bill.dueDate)}</span>
                                    </p>
                                    {bill.amountDue && (
                                         <p className="text-xs text-slate-500">
                                            Amount: <span className="font-medium text-slate-600">{formatCurrency(bill.amountDue)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <div className="text-lg font-semibold text-slate-700 mb-2 flex justify-between items-baseline">
                    <h3>Payment Progress</h3>
                    <span className="text-sm font-medium text-slate-500">{`${paidCount} of ${totalBills} Paid`}</span>
                </div>
                <div
                    className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${paidCount} out of ${totalBills} bills paid`}
                >
                    <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                     {progressPercentage === 100 && (
                        <div className="absolute top-1/2 right-1 -translate-y-1/2 text-white animate-fade-in">
                            {HouseIcon}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryDashboard;