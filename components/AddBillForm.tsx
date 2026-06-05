
import React, { useState } from 'react';

interface AddBillFormProps {
    onAddBill: (name: string, paymentUrl: string, amountDue?: number, dueDate?: number) => void;
}

const AddBillForm: React.FC<AddBillFormProps> = ({ onAddBill }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [amountDue, setAmountDue] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !url.trim()) {
            setError('Company name and URL are required.');
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            setError('Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        const parsedAmount = amountDue ? parseFloat(amountDue) : undefined;
        if (amountDue && (isNaN(parsedAmount!) || parsedAmount! <= 0)) {
            setError('Please enter a valid, positive amount due.');
            return;
        }

        const parsedDueDate = dueDate ? parseInt(dueDate, 10) : undefined;
        if (dueDate && (isNaN(parsedDueDate!) || parsedDueDate! < 1 || parsedDueDate! > 31)) {
            setError('Please enter a valid due day (1-31).');
            return;
        }

        setError('');
        onAddBill(name, url, parsedAmount, parsedDueDate);
        setName('');
        setUrl('');
        setAmountDue('');
        setDueDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="bill-name" className="block text-sm font-medium text-slate-600 mb-1">
                        Company Name
                    </label>
                    <input
                        id="bill-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Electric Company"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="bill-url" className="block text-sm font-medium text-slate-600 mb-1">
                        Payment URL
                    </label>
                    <input
                        id="bill-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://payment.example.com"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                 <div>
                    <label htmlFor="bill-amount" className="block text-sm font-medium text-slate-600 mb-1">
                        Amount Due (Optional)
                    </label>
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            id="bill-amount"
                            type="number"
                            value={amountDue}
                            onChange={(e) => setAmountDue(e.target.value)}
                            placeholder="e.g. 123.45"
                            className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            step="0.01"
                            min="0"
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="bill-due-date" className="block text-sm font-medium text-slate-600 mb-1">
                        Due Day (Optional)
                    </label>
                    <input
                        id="bill-due-date"
                        type="number"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="e.g. 15"
                        min="1"
                        max="31"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Add Bill
                </button>
            </div>
        </form>
    );
};

export default AddBillForm;