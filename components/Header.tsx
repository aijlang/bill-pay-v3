
import React from 'react';
import { AppLogoIcon, PlusIcon } from '../constants';
import EndOfMonthCountdown from './EndOfMonthCountdown';

interface HeaderProps {
    onAddBillClick: () => void;
}


const Header: React.FC<HeaderProps> = ({ onAddBillClick }) => {
    const currentMonthAndYear = new Date().toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
    });
    
    return (
        <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 h-20">
                    {/* Left Section */}
                    <div className="flex-1 flex items-center justify-start">
                        <AppLogoIcon className="h-8 w-8" />
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 ml-3">
                            Bill Pay Hub
                        </h1>
                    </div>
                    
                    {/* Center Section */}
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-2xl font-semibold text-slate-600">{currentMonthAndYear}</p>
                        <EndOfMonthCountdown />
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-center justify-end gap-4">
                        <button
                            onClick={onAddBillClick}
                            className="inline-flex items-center gap-1 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                           {PlusIcon} Add New Bill
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
