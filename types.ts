
export interface Bill {
  id: string;
  name: string;
  paymentUrl: string;
  amountDue?: number;
  dueDate?: number;
  lastPayment?: {
    date: string; // ISO date string
    amount: number;
  };
  logoUrl?: string;
}

export type BillUpdatePayload = Partial<Pick<Bill, 'amountDue' | 'dueDate' | 'lastPayment' | 'logoUrl'>>;

export interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

export interface Holiday {
  name: string;
  date: string;
  description: string;
  emoji: string;
  themeColor: string; // Hex color code
}
