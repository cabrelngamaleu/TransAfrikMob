export interface RecurringTransferPrediction {
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  estimatedAmount: number;
  currency: string;
  estimatedDate: Date;
  confidence: number;
  frequency: string; // WEEKLY, MONTHLY, BIWEEKLY
  lastTransactions: {
    date: Date;
    amount: number;
  }[];
  reason: string;
}

export interface PatternInsight {
  type: string;
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  potentialSavings?: number;
}

export interface AnomalyAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  transactionId?: string;
  timestamp: Date;
}
