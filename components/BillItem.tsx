
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Bill, BillUpdatePayload } from '../types';
import { CheckCircleIcon, TrashIcon, ExternalLinkIcon, UndoIcon, PencilIcon, CheckIcon } from '../constants';
import { isPaidThisMonth, formatDate, formatCurrency, formatDueDate, isPastDue } from '../utils/formatters';
import DragHandle from './DragHandle';

interface BillItemProps {
    bill: Bill;
    onMarkAsPaid: (id: string, amount: number) => void;
    onUndoPayment: (id: string) => void;
    onDeleteBill: (id: string) => void;
    onEditBill: (id: string, updates: BillUpdatePayload) => void;
    balance?: number;
}

const BillItem: React.FC<BillItemProps> = ({ bill, onMarkAsPaid, onUndoPayment, onDeleteBill, onEditBill, balance = 0 }) => {
    const [isPaying, setIsPaying] = useState(false);
    const [amount, setAmount] = useState('');
    const [payError, setPayError] = useState('');

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: bill.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const parsedAmount = amount ? parseFloat(amount) : 0;
    const balanceAfterPayment = Math.max(0, balance - parsedAmount);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedAmount, setEditedAmount] = useState(bill.amountDue?.toString() ?? '');
    const [editedDueDate, setEditedDueDate] = useState(bill.dueDate?.toString() ?? '');
    const [editError, setEditError] = useState('');

    const paid = isPaidThisMonth(bill.lastPayment?.date);

    const handleStartPaying = () => {
        setAmount(bill.amountDue?.toString() ?? '');
        setPayError('');
        setIsPaying(true);
    };

    const handleConfirmPayment = () => {
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setPayError('Please enter a valid amount.');
            return;
        }
        onMarkAsPaid(bill.id, parsedAmount);
        setIsPaying(false);
        setAmount('');
        setPayError('');
    };
    
    const handleCancelPayment = () => {
        setIsPaying(false);
        setAmount('');
        setPayError('');
    };

    const handleStartEditing = () => {
        setEditedAmount(bill.amountDue?.toString() ?? '');
        setEditedDueDate(bill.dueDate?.toString() ?? '');
        setEditError('');
        setIsEditing(true);
    }
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditError('');
    };

    const handleSaveEdit = () => {
        const parsedAmount = editedAmount ? parseFloat(editedAmount) : undefined;
        if (editedAmount && (isNaN(parsedAmount!) || parsedAmount! <= 0)) {
            setEditError('Please enter a valid, positive amount due.');
            return;
        }

        const parsedDueDate = editedDueDate ? parseInt(editedDueDate, 10) : undefined;
        if (editedDueDate && (isNaN(parsedDueDate!) || parsedDueDate! < 1 || parsedDueDate! > 31)) {
            setEditError('Please enter a valid due day (1-31).');
            return;
        }

        const updates: BillUpdatePayload = {
            amountDue: parsedAmount,
            dueDate: parsedDueDate,
        };

        onEditBill(bill.id, updates);
        setEditError('');
        setIsEditing(false);
    };
    
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all duration-300 flex flex-col ${paid ? 'border-green-500 bg-emerald-100' : 'border-slate-200'} ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div className="p-5 flex-grow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-grow flex items-start gap-4">
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                             {bill.logoUrl ? (
                                <img src={bill.logoUrl} alt={`${bill.name} logo`} className="h-full w-full rounded-lg object-contain p-1" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-500">{bill.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-3">
                                <DragHandle id={bill.id} />
                                <h3 className="text-xl font-semibold text-slate-800">{bill.name}</h3>
                                {!paid && !isEditing && (
                                    <button
                                        onClick={handleStartEditing}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                        aria-label="Edit bill"
                                    >
                                        {PencilIcon}
                                    </button>
                                )}
                            </div>

                            {paid && bill.lastPayment ? (
                                <div className="flex items-center mt-2 text-sm text-green-700">
                                <span className="text-green-500">{CheckCircleIcon}</span>
                                <p className="ml-2">
                                    Paid <span className="font-semibold">{formatCurrency(bill.lastPayment.amount)}</span> on {formatDate(bill.lastPayment.date)}
                                    </p>
                                </div>
                            ) : isEditing ? (
                                <div className="mt-4 space-y-3 animate-fade-in">
                                    <div>
                                        <label htmlFor={`edit-amount-${bill.id}`} className="block text-sm font-medium text-slate-600 mb-1">
                                            Amount Owed
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                id={`edit-amount-${bill.id}`}
                                                type="number"
                                                value={editedAmount}
                                                onChange={(e) => setEditedAmount(e.target.value)}
                                                placeholder="e.g. 123.45"
                                                className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                step="0.01" min="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor={`edit-due-date-${bill.id}`} className="block text-sm font-medium text-slate-600 mb-1">
                                            Due Day
                                        </label>
                                        <input
                                            id={`edit-due-date-${bill.id}`}
                                            type="number"
                                            value={editedDueDate}
                                            onChange={(e) => setEditedDueDate(e.target.value)}
                                            placeholder="e.g. 15"
                                            min="1" max="31"
                                            className="w-full px-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    {editError && <p className="text-sm text-red-600">{editError}</p>}
                                </div>
                            ) : (
                                <div>
                                    <p className="mt-1 text-sm text-slate-500">Pending for this month</p>
                                    {(bill.amountDue || bill.dueDate) && (
                                        <div className="mt-2 text-sm space-y-1">
                                            {bill.amountDue && bill.amountDue > 0 && (
                                                <p className="font-medium text-slate-600">
                                                    Amount Owed: <span className="font-bold text-slate-800">{formatCurrency(bill.amountDue)}</span>
                                                </p>
                                            )}
                                            {bill.dueDate && (
                                                <p className={`font-medium ${isPastDue(bill.dueDate) ? 'text-red-600' : 'text-slate-600'}`}>
                                                    Due Date: <span className="font-bold">{formatDueDate(bill.dueDate)}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                        {isEditing ? (
                             <>
                                <button onClick={handleSaveEdit} className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">Save</button>
                                <button onClick={handleCancelEdit} className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Cancel</button>
                            </>
                        ) : paid ? (
                            <>
                                <button
                                    disabled
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 cursor-not-allowed"
                                >
                                    <span className="w-5 h-5 mr-1.5">{CheckIcon}</span>
                                    Paid
                                </button>
                                <button
                                    onClick={() => onUndoPayment(bill.id)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                    aria-label="Undo payment"
                                >
                                    <span className="w-5 h-5 mr-1.5">{UndoIcon}</span>
                                    Undo
                                </button>
                            </>
                        ) : (
                             <>
                                <a
                                    href={bill.paymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                >
                                    Pay Now {ExternalLinkIcon}
                                </a>
                                 <button
                                    onClick={handleStartPaying}
                                    disabled={isPaying}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
                                >
                                    Mark as Paid
                                </button>
                            </>
                        )}
                       
                    </div>
                </div>
            </div>

            {isPaying && !paid && (
                <div className="p-5 bg-slate-100 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Confirm Payment</h4>
                    <div className="flex flex-col gap-3 mb-3">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Amount Paid"
                                className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                step="0.01"
                                min="0.01"
                            />
                        </div>
                        {balance > 0 && (
                            <div className="bg-white rounded-md p-3 border border-slate-200">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-600">Current Balance:</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(balance)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">After Payment:</span>
                                    <span className={`font-semibold ${balanceAfterPayment < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(balanceAfterPayment)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleConfirmPayment} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                            Confirm
                        </button>
                        <button onClick={handleCancelPayment} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                            Cancel
                        </button>
                    </div>
                    {payError && <p className="text-sm text-red-600 mt-2">{payError}</p>}
                </div>
            )}

            <div className="bg-slate-100/50 px-5 py-2 border-t border-slate-200">
                 <button 
                    onClick={() => onDeleteBill(bill.id)} 
                    className="flex items-center text-sm text-slate-500 hover:text-red-600 transition-colors"
                 >
                    <span className="w-5 h-5 mr-1.5">{TrashIcon}</span>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default BillItem;