/**
 * paymentScenarios.ts
 *
 * Mock payment scenarios and diagnostic trees for Payment & AutoPay Troubleshooter (Phase 5).
 * Simulates realistic transaction failure codes, bank messages, and Groww UI navigation steps.
 * Explicitly simulated for educational & troubleshooting guidance.
 */

export interface MockPaymentScenario {
  id: string;
  issueKey: string;
  title: string;
  shortDescription: string;
  simulatedDetails: {
    fundName: string;
    amount: number;
    scheduledDebitDate: string;
    bankName: string;
    accountLast4: string;
    mandateId: string;
    utrNumber?: string;
    failureReasonCode: string;
    status: 'FAILED' | 'PENDING' | 'SUCCESS_UNCONFIRMED' | 'INACTIVE';
  };
  diagnosticTree: {
    step1_situation: string;
    step2_probableReason: string;
    step3_clarifyingQuestions: {
      question: string;
      options: string[];
    };
    step4_growwUiSteps: string[];
    step5_escalation: {
      required: boolean;
      contactGrowwWhen: string;
      checklist: string[];
    };
  };
}

export const PAYMENT_SCENARIOS: Record<string, MockPaymentScenario> = {
  insufficient_balance: {
    id: 'ps-1',
    issueKey: 'insufficient_balance',
    title: 'Insufficient Balance for SIP Debit',
    shortDescription: 'AutoPay SIP debit bounced because your bank balance was lower than the installment amount.',
    simulatedDetails: {
      fundName: 'Groww Nifty 50 Index Fund',
      amount: 5000,
      scheduledDebitDate: '05th of every month',
      bankName: 'HDFC Bank',
      accountLast4: '4821',
      mandateId: 'MANDATE_HDFC_99214',
      failureReasonCode: 'AC_INS_BAL / 51',
      status: 'FAILED',
    },
    diagnosticTree: {
      step1_situation: 'Your scheduled AutoPay debit of ₹5,000 for Groww Nifty 50 Index Fund on the 5th could not be completed by your bank due to insufficient funds.',
      step2_probableReason: 'The debit date occurred right before your salary credit arrived or coincided with other monthly bill deductions (rent/EMI). Most banks also levy a mandate bounce fee (₹250–₹500 + GST).',
      step3_clarifyingQuestions: {
        question: 'When did your salary credit arrive this month relative to the 5th?',
        options: [
          'Salary arrived on or after the 7th',
          'Salary arrived on the 1st but spent on rent/EMI',
          'Freelance payment was delayed',
        ],
      },
      step4_growwUiSteps: [
        'Open the Groww App > Tap your Profile Avatar (top right).',
        'Go to "My Investments" > "Mutual Funds" > "SIPs".',
        'Select the active SIP and tap "Edit SIP".',
        'Tap "Change Date" and select a date 3–5 days AFTER your regular salary credit (e.g. 10th).',
        'For this month\'s missed instalment, tap "Pay Now" on the fund page to make a one-time lump-sum purchase without waiting for next month.',
      ],
      step5_escalation: {
        required: false,
        contactGrowwWhen: 'Only if your bank debited the amount despite showing as failed on Groww.',
        checklist: [
          'No mutual fund penalty is levied by Groww for a missed SIP installment.',
          'SIP AutoPay will automatically re-attempt on next month\'s scheduled date.',
          'Consider checking with your bank regarding any mandate bounce fee reversal.',
        ],
      },
    },
  },

  mandate_pending: {
    id: 'ps-2',
    issueKey: 'mandate_pending',
    title: 'AutoPay Mandate Not Registered / Pending',
    shortDescription: 'Your bank has not yet confirmed the AutoPay e-Mandate authorization.',
    simulatedDetails: {
      fundName: 'Parag Parikh Flexi Cap Fund',
      amount: 3000,
      scheduledDebitDate: '10th of every month',
      bankName: 'State Bank of India',
      accountLast4: '8832',
      mandateId: 'UMRN_SBI_771829',
      failureReasonCode: 'MANDATE_PENDING_AUTH / NP02',
      status: 'PENDING',
    },
    diagnosticTree: {
      step1_situation: 'You created a new AutoPay mandate for ₹3,000 via NetBanking/UPI, but the mandate status in Groww still shows "Pending Bank Authorization".',
      step2_probableReason: 'NPCI and public sector banks (like SBI, PNB, BOB) can take 24 to 72 bank working hours to verify OTP/debit card credentials and register the e-Mandate UMRN (Unique Mandate Reference Number).',
      step3_clarifyingQuestions: {
        question: 'How did you authorize your AutoPay mandate?',
        options: [
          'Via UPI App (GPay/PhonePe)',
          'Via NetBanking credentials',
          'Via Debit Card & OTP',
        ],
      },
      step4_growwUiSteps: [
        'Open Groww > Profile > "Bank & AutoPay".',
        'Select your linked bank account and locate "AutoPay Mandates".',
        'Check the status pill: if "Pending Approval", open your UPI app (GPay/PhonePe/Paytm) > Autopay / Mandates section to approve the request.',
        'If it has been over 3 working days and still pending, tap "Cancel Mandate" and recreate using UPI Autopay (which activates within minutes).',
      ],
      step5_escalation: {
        required: false,
        contactGrowwWhen: 'If the mandate remains in "Pending" status after 5 business days without any update.',
        checklist: [
          'Ensure your bank account has active SMS alerts enabled.',
          'Check that the bank account name matches your PAN name exactly.',
        ],
      },
    },
  },

  bank_changed: {
    id: 'ps-3',
    issueKey: 'bank_changed',
    title: 'Bank Account Changed / Re-linking Needed',
    shortDescription: 'Switched primary bank account or older bank account closed, causing debit rejections.',
    simulatedDetails: {
      fundName: 'Mirae Asset Large Cap Fund',
      amount: 4000,
      scheduledDebitDate: '15th of every month',
      bankName: 'ICICI Bank (Old: Axis Bank)',
      accountLast4: '1029',
      mandateId: 'MANDATE_ICICI_5521',
      failureReasonCode: 'AC_CLOSED_OR_FROZEN / 28',
      status: 'INACTIVE',
    },
    diagnosticTree: {
      step1_situation: 'Your primary bank account was closed or modified, but your existing SIPs are still tied to the older bank account mandate.',
      step2_probableReason: 'In India, an AutoPay mandate is legally linked to a specific bank account number (UMRN). Changing primary bank in Groww does NOT automatically transfer existing SIP mandates to the new bank.',
      step3_clarifyingQuestions: {
        question: 'Have you already added and verified your new bank account on Groww?',
        options: [
          'Yes, new bank is verified on Groww',
          'No, need to add new bank account first',
          'Old bank account is still active with balance',
        ],
      },
      step4_growwUiSteps: [
        'Step 1: Go to Profile > "Bank & AutoPay" > "Add Another Bank" if not added yet (verify with ₹1 penny drop).',
        'Step 2: Set the new bank account as your "Primary Bank".',
        'Step 3: Go to "Mutual Funds" > "SIPs" > Click each active SIP.',
        'Step 4: Tap "Edit SIP" > "Change Bank / AutoPay" and select the newly verified bank account.',
        'Step 5: Authorize the new mandate via NetBanking/UPI.',
      ],
      step5_escalation: {
        required: false,
        contactGrowwWhen: 'If the penny drop fails or the new bank mandate cannot be mapped to your SIP.',
        checklist: [
          'Keep your cancelled cheque or bank statement PDF ready for verification.',
          'Verify that the joint account holder rules permit online NACH mandates.',
        ],
      },
    },
  },

  failed_but_debited: {
    id: 'ps-4',
    issueKey: 'failed_but_debited',
    title: 'SIP Shown as Failed but Bank Debited',
    shortDescription: 'Money left your bank account, but Groww orders or portfolio show the payment as failed.',
    simulatedDetails: {
      fundName: 'UTI Nifty 50 Index Fund',
      amount: 2500,
      scheduledDebitDate: 'Yesterday, 10:14 AM',
      bankName: 'Kotak Mahindra Bank',
      accountLast4: '3910',
      mandateId: 'MANDATE_KOTAK_1109',
      utrNumber: 'KKBK243109283712',
      failureReasonCode: 'BSE_STAR_SETTLEMENT_TIMEOUT',
      status: 'SUCCESS_UNCONFIRMED',
    },
    diagnosticTree: {
      step1_situation: 'Your bank account debited ₹2,500, but Groww transaction history displays "Order Failed" or "Awaiting Payment".',
      step2_probableReason: 'During market hours, payment aggregators (Razorpay / BillDesk / ICCL) occasionally experience delayed confirmation from the banking switch. When the callback times out, the initial status marks as failed.',
      step3_clarifyingQuestions: {
        question: 'How long ago was the amount deducted from your bank account?',
        options: [
          'Less than 2 hours ago',
          'Between 2 and 24 hours ago',
          'More than 2 business days ago',
        ],
      },
      step4_growwUiSteps: [
        'Open your mobile banking app and copy the 12-digit UTR (Unique Transaction Reference) number or RRN.',
        'Wait for the automatic clearing cycle: NPCI runs auto-reconciliation at 3:00 PM and 11:30 PM daily.',
        'If payment reconciles: Order turns to "Successful" and units are allotted at the valid NAV.',
        'If payment fails auto-reconciliation: The amount is reversed automatically to your bank within T+2 to T+5 working days.',
      ],
      step5_escalation: {
        required: true,
        contactGrowwWhen: 'If funds are neither refunded to your bank nor updated on Groww after 3 business days.',
        checklist: [
          'UTR number from bank statement.',
          'Screenshot of the bank debit transaction with timestamp.',
          'Raise ticket at: Groww App > Profile > Help & Support > Mutual Funds > Payments.',
        ],
      },
    },
  },

  processing_delay: {
    id: 'ps-5',
    issueKey: 'processing_delay',
    title: 'Payment Processing Delay / Units Not Allotted',
    shortDescription: 'Money was debited on time, but mutual fund units are not yet visible in your dashboard.',
    simulatedDetails: {
      fundName: 'Quant Mid Cap Fund',
      amount: 3500,
      scheduledDebitDate: '3 days ago',
      bankName: 'Axis Bank',
      accountLast4: '7192',
      mandateId: 'MANDATE_AXIS_88301',
      utrNumber: 'AXIS0029381742',
      failureReasonCode: 'SETTLEMENT_T2_WINDOW',
      status: 'PENDING',
    },
    diagnosticTree: {
      step1_situation: 'Your AutoPay debited successfully, but your Groww portfolio does not reflect the newly purchased mutual fund units.',
      step2_probableReason: 'Per SEBI mutual fund settlement norms, NAV allotment happens only after the funds reach the clearing corporation (ICCL/NSE Clearing). Equity funds operate on a T+1 or T+2 business day settlement cycle (weekends and market holidays excluded).',
      step3_clarifyingQuestions: {
        question: 'Did the debit occur right before a weekend or national market holiday?',
        options: [
          'Yes, debit was on Friday or before holiday',
          'No, debit was on a normal Tuesday/Wednesday',
          'Unsure of market trading calendar',
        ],
      },
      step4_growwUiSteps: [
        'Go to Groww > "Mutual Funds" > "Orders" tab.',
        'Tap the in-progress order to view the "Order Lifecycle": (1) Payment received -> (2) Sent to AMC -> (3) Units Allotted.',
        'Check the estimated completion date shown directly on the order card.',
        'Remember that units reflect in your portfolio usually by 11:00 PM on the day of allotment once the AMC publishes official unit balances.',
      ],
      step5_escalation: {
        required: false,
        contactGrowwWhen: 'Only if the order lifecycle has exceeded T+3 working days without unit allotment.',
        checklist: [
          'Check the BSE / NSE clearing confirmation SMS sent to your registered mobile number.',
          'Confirm that your KYC status on CVLKRA is "KYC Registered" or "KYC Validated".',
        ],
      },
    },
  },

  pause_vs_cancel: {
    id: 'ps-6',
    issueKey: 'pause_vs_cancel',
    title: 'Confused About Stopping SIP vs. Disabling AutoPay',
    shortDescription: 'Need to temporarily halt investment without cancelling your long-term goal or incurring charges.',
    simulatedDetails: {
      fundName: 'Nippon India Small Cap Fund',
      amount: 2000,
      scheduledDebitDate: '12th of every month',
      bankName: 'Punjab National Bank',
      accountLast4: '5501',
      mandateId: 'MANDATE_PNB_4412',
      failureReasonCode: 'USER_QUERY_CLARIFICATION',
      status: 'INACTIVE',
    },
    diagnosticTree: {
      step1_situation: 'You are facing tight cash-flow this month and want to prevent your upcoming SIP debit without permanently losing your investment track record.',
      step2_probableReason: 'Many investors mistakenly cancel their AutoPay mandate at the bank, causing Groww to trigger failed debit notifications, or permanently cancel the SIP when they only intended a temporary break.',
      step3_clarifyingQuestions: {
        question: 'Do you want a temporary break or do you want to permanently exit this fund?',
        options: [
          'Temporary break for 1 to 3 months',
          'Permanently stop all future investments',
          'Sell/Redeem existing accumulated units as well',
        ],
      },
      step4_growwUiSteps: [
        'OPTION A (Temporary Pause): Open Groww > "Mutual Funds" > "SIPs" > Select Fund > Tap "Pause SIP". Select 1, 2, or 3 months. AutoPay will resume automatically after the pause period without any bank fees.',
        'OPTION B (Stop SIP): Tap "Cancel SIP". Future installments will stop permanently. Your existing invested money remains safe and continues growing in the fund until you choose to redeem.',
        'DO NOT simply disable AutoPay from your bank app while leaving the SIP active on Groww, as Groww will keep submitting orders that return as unpaid bounces.',
      ],
      step5_escalation: {
        required: false,
        contactGrowwWhen: 'Not required. SIP pausing and cancellation can be executed directly from your phone in under 60 seconds.',
        checklist: [
          'Pausing must be requested at least 3 business days before the upcoming debit date.',
          'No exit loads or penalties are charged for pausing or stopping an SIP.',
        ],
      },
    },
  },
};

