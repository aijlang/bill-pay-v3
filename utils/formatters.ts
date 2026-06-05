
export const isPaidThisMonth = (lastPaidDate?: string): boolean => {
    if (!lastPaidDate) return false;
    const paidDate = new Date(lastPaidDate);
    const now = new Date();
    return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDueDate = (day?: number): string => {
    if (!day) return '';
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
    });
};

export const isPastDue = (day?: number): boolean => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), day);
    
    return dueDateThisMonth < today;
};

export const formatExportDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};