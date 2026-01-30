import React, { useState, useEffect } from 'react';
import { Anchor, FileText, CheckCircle, ChevronRight, User, Ship, DollarSign, ClipboardCheck, Download, ArrowLeft, PenTool, Calendar, Shield, AlertCircle, Building, CreditCard, Smartphone, Banknote, Share2, Copy, Link, QrCode, ExternalLink } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════════
// BOATCLOSER - Complete Boat Transaction Management Platform
// Version: 3.0.0
// 
// Features:
// - Multi-step transaction workflow (6-7 steps)
// - 14 professional legal documents with auto-populated data
// - Escrow/Payment options (Wire, Zelle, Check, Escrow Service)
// - Professional real estate-style document formatting
// - Payment/Legal terms with plan selection (optional paywall)
// - Due diligence tracking
// - Document signing and download
// - Share transaction via link or QR code
// - Join transaction as buyer or seller via shared link
// - AUTO-SAVE: Transaction data persists in localStorage
//
// Configuration:
// - showPaywall: Set to true to enable payment step
// - showEscrowStep: Set to true to enable escrow/payment options step
// ════════════════════════════════════════════════════════════════════════════════

export default function BoatCloserDemo() {
  // App state
  const [currentView, setCurrentView] = useState('welcome'); // welcome, role, vessel, parties, terms, diligence, documents, complete, share, join
  const [userRole, setUserRole] = useState(null); // 'buyer' or 'seller'
  const [currentStep, setCurrentStep] = useState(0);
  
  // Transaction ID for sharing (generated when transaction starts)
  const [transactionId, setTransactionId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinData, setJoinData] = useState(null); // Data received when joining via shared link
  
  // Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BC-${timestamp}-${random}`.toUpperCase();
  };

  // Load saved transaction from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem('boatcloser_current_transaction');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.transactionId) setTransactionId(data.transactionId);
        if (data.userRole) setUserRole(data.userRole);
        if (data.vesselData) setVesselData(data.vesselData);
        if (data.partiesData) setPartiesData(data.partiesData);
        if (data.termsData) setTermsData(data.termsData);
        if (data.escrowData) setEscrowData(data.escrowData);
        if (data.diligenceItems) setDiligenceItems(data.diligenceItems);
        if (data.signedDocs) setSignedDocs(data.signedDocs);
        if (data.signatureData) setSignatureData(data.signatureData);
        if (data.currentStep !== undefined) setCurrentStep(data.currentStep);
        if (data.currentView) setCurrentView(data.currentView);
      } catch (e) {
        console.error('Failed to load saved transaction');
      }
    }
    
    // Parse URL for shared transaction data
    const params = new URLSearchParams(window.location.search);
    const txId = params.get('tx');
    const role = params.get('role');
    const data = params.get('data');
    
    if (txId && role && data) {
      try {
        const decodedData = JSON.parse(atob(data));
        setJoinData({ transactionId: txId, role, ...decodedData });
        setCurrentView('join');
      } catch (e) {
        console.error('Invalid share link data');
      }
    }
  }, []);
  
  // Auto-save transaction to localStorage whenever data changes
  useEffect(() => {
    if (transactionId || userRole || vesselData.name || partiesData.buyerName || partiesData.sellerName) {
      const saveData = {
        transactionId,
        userRole,
        vesselData,
        partiesData,
        termsData,
        escrowData,
        diligenceItems,
        signedDocs,
        signatureData,
        currentStep,
        currentView,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('boatcloser_current_transaction', JSON.stringify(saveData));
    }
  }, [transactionId, userRole, vesselData, partiesData, termsData, escrowData, diligenceItems, signedDocs, signatureData, currentStep, currentView]);
  
  // Form data
  const [vesselData, setVesselData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    length: '',
    hin: '',
    askingPrice: ''
  });
  
  const [partiesData, setPartiesData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    sellerAddress: ''
  });
  
  const [termsData, setTermsData] = useState({
    purchasePrice: '',
    depositAmount: '',
    closingDate: '',
    inspectionDays: '10',
    escrowCompany: 'BoatClosers Escrow Services'
  });
  
  const [diligenceItems, setDiligenceItems] = useState({
    survey: false,
    seaTrial: false,
    titleSearch: false,
    insurance: false
  });
  
  const [signedDocs, setSignedDocs] = useState({});
  const [viewingDoc, setViewingDoc] = useState(null);
  const [signatureMode, setSignatureMode] = useState(false);
  const [signatureData, setSignatureData] = useState({});
  const [docShareModal, setDocShareModal] = useState(false);
  const [copiedDocLink, setCopiedDocLink] = useState(false);

  // Steps for the process
  // NOTE: To enable paywall, uncomment the 'payment' step below and set showPaywall to true
  const showPaywall = false; // Set to true to enable payment step
  const showEscrowStep = true; // Set to true to enable escrow/payment options step

  // Escrow and Payment Method State
  const [escrowData, setEscrowData] = useState({
    paymentMethod: 'escrow', // escrow, wire, zelle, check
    bankName: '',
    accountName: '',
    routingNumber: '',
    accountNumber: '',
    zelleEmail: '',
    zellePhone: '',
    checkPayableTo: '',
    checkMailingAddress: '',
    escrowCompanyName: 'BoatCloser Escrow Services',
    escrowContact: '',
    escrowPhone: '',
    escrowEmail: '',
    depositDueDate: '',
    balanceDueDate: ''
  });
  
  const steps = showPaywall ? [
    { id: 'vessel', label: 'Vessel Details', icon: Ship },
    { id: 'parties', label: 'Buyer & Seller', icon: User },
    { id: 'payment', label: 'Payment', icon: Shield },
    { id: 'terms', label: 'Deal Terms', icon: DollarSign },
    ...(showEscrowStep ? [{ id: 'escrow', label: 'Escrow Setup', icon: Building }] : []),
    { id: 'diligence', label: 'Due Diligence', icon: ClipboardCheck },
    { id: 'documents', label: 'Sign & Close', icon: FileText }
  ] : [
    { id: 'vessel', label: 'Vessel Details', icon: Ship },
    { id: 'parties', label: 'Buyer & Seller', icon: User },
    { id: 'terms', label: 'Deal Terms', icon: DollarSign },
    ...(showEscrowStep ? [{ id: 'escrow', label: 'Escrow Setup', icon: Building }] : []),
    { id: 'diligence', label: 'Due Diligence', icon: ClipboardCheck },
    { id: 'documents', label: 'Sign & Close', icon: FileText }
  ];

  // Document definitions
  const documents = [
    // Agreement Phase
    { id: 'purchase-agreement', name: 'Purchase Agreement', phase: 'agreement', required: true, 
      description: 'The main contract between buyer and seller outlining all terms' },
    { id: 'counter-offer', name: 'Counter Offer Addendum', phase: 'agreement', required: false,
      description: 'Propose modified terms to the original offer' },
    { id: 'deposit-receipt', name: 'Deposit Receipt', phase: 'agreement', required: false,
      description: 'Confirms the earnest money deposit has been received' },
    { id: 'escrow-instructions', name: 'Escrow Instructions', phase: 'agreement', required: false,
      description: 'Payment instructions for the escrow company or direct transfer' },
    
    // Due Diligence Phase
    { id: 'survey-authorization', name: 'Survey Authorization', phase: 'diligence', required: false,
      description: 'Grants permission for a marine surveyor to inspect the vessel' },
    { id: 'sea-trial-agreement', name: 'Sea Trial Agreement', phase: 'diligence', required: false,
      description: 'Liability waiver for test-running the boat' },
    { id: 'conditional-acceptance', name: 'Conditional Acceptance', phase: 'diligence', required: false,
      description: 'Accept vessel subject to specific repairs or conditions' },
    { id: 'vessel-acceptance', name: 'Vessel Acceptance', phase: 'diligence', required: false,
      description: 'Buyer formally accepts the vessel condition' },
    { id: 'vessel-rejection', name: 'Vessel Rejection', phase: 'diligence', required: false,
      description: 'Reject vessel and request deposit refund' },
    
    // Closing Phase
    { id: 'bill-of-sale', name: 'Bill of Sale', phase: 'closing', required: true,
      description: 'Official legal document transferring ownership' },
    { id: 'closing-statement', name: 'Closing Statement', phase: 'closing', required: true,
      description: 'Final financial breakdown of the entire transaction' },
    { id: 'wire-transfer-confirmation', name: 'Wire Transfer Confirmation', phase: 'closing', required: false,
      description: 'Confirms final payment has been sent/received' },
    { id: 'title-transfer', name: 'Title Transfer', phase: 'closing', required: false,
      description: 'State registration and title transfer form' },
    { id: 'lien-release', name: 'Lien Release Affidavit', phase: 'closing', required: false,
      description: 'Seller certifies no liens or debts on the vessel' }
  ];

  // ════════════════════════════════════════════════════════════════════════════
  // DOCUMENT GENERATORS
  // ════════════════════════════════════════════════════════════════════════════
  
  const generateDocumentContent = (docId) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    switch(docId) {
      case 'purchase-agreement':
        return {
          title: 'VESSEL PURCHASE AGREEMENT',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                         VESSEL PURCHASE AGREEMENT                            ║
║                                                                              ║
║                    This is a Legally Binding Contract                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

AGREEMENT NUMBER: PA-${Date.now().toString(36).toUpperCase()}
EFFECTIVE DATE: ${today}

This Vessel Purchase Agreement ("Agreement") is entered into by and between 
the parties identified below. This Agreement constitutes the entire agreement 
between the parties concerning the purchase and sale of the vessel described 
herein and supersedes all prior negotiations, representations, or agreements.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              ARTICLE I - PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUYER:
  Legal Name:    ${partiesData.buyerName || '[BUYER FULL LEGAL NAME]'}
  Address:       ${partiesData.buyerAddress || '[STREET ADDRESS]'}
  Email:         ${partiesData.buyerEmail || '[EMAIL]'}
  Phone:         ${partiesData.buyerPhone || '[PHONE]'}

SELLER:
  Legal Name:    ${partiesData.sellerName || '[SELLER FULL LEGAL NAME]'}
  Address:       ${partiesData.sellerAddress || '[STREET ADDRESS]'}
  Email:         ${partiesData.sellerEmail || '[EMAIL]'}
  Phone:         ${partiesData.sellerPhone || '[PHONE]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ARTICLE II - VESSEL DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Vessel Name:                    ${vesselData.name || '[VESSEL NAME]'}
  Manufacturer/Builder:           ${vesselData.make || '[MAKE]'}
  Model:                          ${vesselData.model || '[MODEL]'}
  Year of Manufacture:            ${vesselData.year || '[YEAR]'}
  Length Overall (LOA):           ${vesselData.length || '[LENGTH]'} feet
  Hull Identification Number:     ${vesselData.hin || '[HIN]'}
  State/Federal Documentation #:  _____________________________
  Current Location:               _____________________________

The vessel includes all permanently attached equipment, fixtures, and 
accessories currently aboard, including but not limited to: electronics, 
navigation equipment, safety equipment, anchors, lines, and fenders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          ARTICLE III - PURCHASE PRICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TOTAL PURCHASE PRICE:           $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[AMOUNT]'}

  Payment Schedule:
  ├─ Earnest Money Deposit:       $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[AMOUNT]'}
  │   Due upon execution of this Agreement
  │   Held by: ${termsData.escrowCompany || escrowData.escrowCompanyName}
  │
  └─ Balance Due at Closing:      $${termsData.purchasePrice && termsData.depositAmount ? (parseInt(termsData.purchasePrice) - parseInt(termsData.depositAmount)).toLocaleString() : '[AMOUNT]'}
      Due on or before: ${termsData.closingDate || '[CLOSING DATE]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          ARTICLE IV - CONTINGENCIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Agreement is contingent upon the satisfaction of the following conditions 
within ${termsData.inspectionDays || '10'} calendar days from the Effective Date:

4.1 MARINE SURVEY: Buyer shall have the right to obtain, at Buyer's expense, 
    a marine survey from a qualified marine surveyor. If the survey reveals 
    material defects, Buyer may: (a) accept the vessel as-is; (b) negotiate 
    repairs with Seller; or (c) terminate this Agreement with full refund 
    of the Earnest Money Deposit.

4.2 SEA TRIAL: Buyer shall have the right to conduct a sea trial, with 
    Seller or Seller's designated captain operating the vessel. Buyer 
    assumes all risk during the sea trial except for Seller's gross 
    negligence or willful misconduct.

4.3 TITLE VERIFICATION: Seller shall provide evidence of clear and 
    marketable title, free of all liens, encumbrances, and claims. Buyer 
    may conduct a title search at Buyer's expense.

4.4 FINANCING (if applicable): Buyer shall have _____ days to obtain 
    financing approval. If financing is denied, Buyer may terminate with 
    full refund of the Earnest Money Deposit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                       ARTICLE V - SELLER'S REPRESENTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seller represents and warrants that:

5.1 Seller is the sole legal owner of the vessel and has full authority 
    to sell and transfer title.

5.2 The vessel is free and clear of all liens, mortgages, security 
    interests, encumbrances, and claims of any kind.

5.3 There are no pending or threatened legal actions, claims, or disputes 
    relating to the vessel.

5.4 To Seller's knowledge, all information provided regarding the vessel 
    is true and accurate.

5.5 Seller will maintain the vessel in its current condition until closing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        ARTICLE VI - AS-IS CONDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPON BUYER'S ACCEPTANCE FOLLOWING THE INSPECTION PERIOD, the vessel shall 
be sold and conveyed "AS IS, WHERE IS, WITH ALL FAULTS." Seller makes no 
warranties, express or implied, including but not limited to warranties of 
merchantability or fitness for a particular purpose, except as specifically 
set forth in Article V.

Buyer acknowledges that Buyer has had the opportunity to inspect the vessel 
and is relying solely on Buyer's own inspection and judgment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            ARTICLE VII - DEFAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7.1 BUYER DEFAULT: If Buyer fails to perform after the contingency period, 
    Seller's sole remedy shall be to retain the Earnest Money Deposit as 
    liquidated damages. Both parties agree this amount is a reasonable 
    estimate of Seller's damages and not a penalty.

7.2 SELLER DEFAULT: If Seller fails to perform, Buyer shall be entitled 
    to: (a) return of the Earnest Money Deposit; and (b) pursuit of any 
    other remedies available at law or in equity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            ARTICLE VIII - CLOSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Closing shall occur on or before ${termsData.closingDate || '[CLOSING DATE]'} at a location 
mutually agreed upon by the parties. At closing:

• Buyer shall pay the balance of the purchase price
• Seller shall deliver a properly executed Bill of Sale
• Seller shall provide all keys, manuals, and documentation
• Seller shall execute all documents necessary to transfer title

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          ARTICLE IX - GOVERNING LAW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Agreement shall be governed by and construed in accordance with the 
laws of the state where the vessel is primarily located. Any disputes shall 
be resolved through binding arbitration or in the courts of competent 
jurisdiction in said state.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ARTICLE X - ENTIRE AGREEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Agreement, together with any addenda or amendments signed by both 
parties, constitutes the entire agreement between the parties. No 
modification shall be valid unless in writing and signed by both parties.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BY SIGNING BELOW, THE PARTIES ACKNOWLEDGE THAT THEY HAVE READ, UNDERSTAND, 
AND AGREE TO BE BOUND BY ALL TERMS AND CONDITIONS OF THIS AGREEMENT.


BUYER:

X_________________________________          _______________
  ${partiesData.buyerName || '[Print Name]'}                               Date

  Address: ${partiesData.buyerAddress || '________________________________'}


SELLER:

X_________________________________          _______________
  ${partiesData.sellerName || '[Print Name]'}                               Date

  Address: ${partiesData.sellerAddress || '________________________________'}


══════════════════════════════════════════════════════════════════════════════
         IMPORTANT: This document should be reviewed by legal counsel
                    Document generated by BoatCloser.com
══════════════════════════════════════════════════════════════════════════════
          `
        };
        
      case 'bill-of-sale':
        return {
          title: 'VESSEL BILL OF SALE',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                            VESSEL BILL OF SALE                               ║
║                                                                              ║
║                Official Document of Ownership Transfer                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

DOCUMENT NUMBER: BOS-${Date.now().toString(36).toUpperCase()}
DATE OF SALE: ${today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          KNOW ALL MEN BY THESE PRESENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

That ${partiesData.sellerName || '[SELLER NAME]'}, hereinafter referred to as 
"SELLER," of the address ${partiesData.sellerAddress || '[SELLER ADDRESS]'},

for and in consideration of the sum of:

┌──────────────────────────────────────────────────────────────────────────────┐
│  PURCHASE PRICE: $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[AMOUNT]'}                                                 │
│  (${termsData.purchasePrice ? numberToWords(parseInt(termsData.purchasePrice)).toUpperCase() + ' DOLLARS' : '[AMOUNT IN WORDS]'})                                                      │
└──────────────────────────────────────────────────────────────────────────────┘

lawful money of the United States of America, to SELLER in hand paid by 
${partiesData.buyerName || '[BUYER NAME]'}, hereinafter referred to as "BUYER," 
of the address ${partiesData.buyerAddress || '[BUYER ADDRESS]'},

the receipt whereof is hereby acknowledged, does hereby GRANT, BARGAIN, SELL, 
TRANSFER, and DELIVER unto BUYER the following described vessel and all 
appurtenances thereto:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              VESSEL DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Official Name:              ${vesselData.name || '[VESSEL NAME]'}
  Manufacturer:               ${vesselData.make || '[MAKE]'}
  Model:                      ${vesselData.model || '[MODEL]'}
  Year Built:                 ${vesselData.year || '[YEAR]'}
  Length Overall:             ${vesselData.length || '[LENGTH]'} feet
  Hull Identification Number: ${vesselData.hin || '[HIN]'}
  Hull Material:              ____________________________
  Engine Make/Model:          ____________________________
  Engine Serial Number:       ____________________________
  State Registration #:       ____________________________
  USCG Documentation #:       ____________________________ (if applicable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         INCLUDED EQUIPMENT & ACCESSORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All equipment, fixtures, and accessories currently aboard the vessel are 
included in this sale, including but not limited to:

☑ All electronics and navigation equipment
☑ All safety equipment (life jackets, flares, fire extinguishers)
☑ Anchors, rode, and ground tackle
☑ Dock lines, fenders, and boat hooks
☑ Canvas covers and enclosures
☑ Trailer (if applicable): VIN _________________________

EXCLUDED ITEMS (if any): _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          SELLER'S WARRANTIES & COVENANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELLER hereby warrants, represents, and covenants that:

1. SELLER is the true and lawful owner of said vessel and has full right, 
   power, and authority to sell and convey the same.

2. The vessel is free and clear of all liens, mortgages, encumbrances, 
   security interests, claims, and demands of any kind whatsoever.

3. SELLER will WARRANT AND DEFEND the title to said vessel against the 
   lawful claims and demands of all persons whomsoever.

4. There are no outstanding debts, marina fees, storage charges, repair 
   bills, or other obligations secured by or relating to said vessel.

5. To the best of SELLER's knowledge, all information provided is true, 
   accurate, and complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              AS-IS CONDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXCEPT FOR THE WARRANTIES OF TITLE SET FORTH ABOVE, this vessel is sold and 
conveyed in its present condition, "AS IS, WHERE IS, WITH ALL FAULTS." 

BUYER acknowledges that BUYER has inspected the vessel (or has had the 
opportunity to inspect the vessel) and accepts it in its current condition. 
SELLER makes no warranties, express or implied, regarding the condition, 
seaworthiness, merchantability, or fitness for any particular purpose.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              HABENDUM CLAUSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO HAVE AND TO HOLD the above-described vessel and all appurtenances thereto 
unto BUYER, BUYER's heirs, executors, administrators, successors, and assigns 
forever.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IN WITNESS WHEREOF, SELLER has executed this Bill of Sale on the date first 
written above.


SELLER:

X_________________________________          _______________
  ${partiesData.sellerName || '[Print Name]'}                               Date

  Driver's License/ID #: _________________________
  State of Issue: _________________________________


BUYER (Acknowledgment of Receipt):

X_________________________________          _______________
  ${partiesData.buyerName || '[Print Name]'}                               Date


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          NOTARY ACKNOWLEDGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE OF _______________________  )
                                  ) ss.
COUNTY OF ______________________  )

Before me, the undersigned Notary Public, on this _____ day of _____________, 
20___, personally appeared ${partiesData.sellerName || '[SELLER NAME]'}, known to me 
(or proved to me on the basis of satisfactory evidence) to be the person(s) 
whose name(s) is/are subscribed to the within instrument and acknowledged to 
me that he/she/they executed the same in his/her/their authorized capacity(ies), 
and that by his/her/their signature(s) on the instrument the person(s), or 
the entity upon behalf of which the person(s) acted, executed the instrument.

WITNESS my hand and official seal.


_________________________________
Notary Public Signature

My Commission Expires: _______________

                                        [NOTARY SEAL]


══════════════════════════════════════════════════════════════════════════════
              This document should be filed with appropriate state agencies
                         Document generated by BoatCloser.com
══════════════════════════════════════════════════════════════════════════════
          `
        };

      case 'closing-statement':
        const purchasePrice = parseInt(termsData.purchasePrice) || 0;
        const deposit = parseInt(termsData.depositAmount) || 0;
        const escrowFee = Math.round(purchasePrice * 0.015);
        const docFee = 75;
        const sellerNet = purchasePrice - escrowFee - docFee;
        const buyerTotal = purchasePrice + escrowFee + docFee;
        
        return {
          title: 'CLOSING STATEMENT',
          content: `
CLOSING STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction Date: ${today}
Closing Agent: ${termsData.escrowCompany}

VESSEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${vesselData.year} ${vesselData.make} ${vesselData.model} "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}

PARTIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buyer: ${partiesData.buyerName || '[Buyer Name]'}
Seller: ${partiesData.sellerName || '[Seller Name]'}

════════════════════════════════════════════════════════════
                    FINANCIAL SUMMARY
════════════════════════════════════════════════════════════

PURCHASE PRICE                           $${purchasePrice.toLocaleString()}

BUYER'S CHARGES:
  Escrow Fee (1.5%)                      $${escrowFee.toLocaleString()}
  Document Preparation Fee               $${docFee}
  ─────────────────────────────────────────────────────
  TOTAL BUYER CHARGES                    $${(escrowFee + docFee).toLocaleString()}

BUYER'S CREDITS:
  Earnest Money Deposit                  ($${deposit.toLocaleString()})
  ─────────────────────────────────────────────────────
  TOTAL CREDITS                          ($${deposit.toLocaleString()})

════════════════════════════════════════════════════════════
AMOUNT DUE FROM BUYER AT CLOSING         $${(buyerTotal - deposit).toLocaleString()}
════════════════════════════════════════════════════════════

SELLER'S PROCEEDS:
  Purchase Price                         $${purchasePrice.toLocaleString()}
  Less: Escrow Fee (1.5%)               ($${escrowFee.toLocaleString()})
  Less: Document Fee                    ($${docFee})
  ─────────────────────────────────────────────────────
  NET TO SELLER                          $${sellerNet.toLocaleString()}
════════════════════════════════════════════════════════════

FUNDS DISBURSEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To Seller:                               $${sellerNet.toLocaleString()}
To Escrow Company (fees):                $${(escrowFee + docFee).toLocaleString()}
                                         ─────────────────
TOTAL DISBURSED:                         $${purchasePrice.toLocaleString()}

ACKNOWLEDGMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Buyer Signature                    Date

_________________________          _________________________
Seller Signature                   Date
          `
        };

      case 'deposit-receipt':
        return {
          title: 'DEPOSIT RECEIPT',
          content: `
EARNEST MONEY DEPOSIT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${today}

RECEIVED FROM:
${partiesData.buyerName || '[Buyer Name]'}
${partiesData.buyerAddress || '[Address]'}

THE SUM OF: $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}
(${termsData.depositAmount ? numberToWords(parseInt(termsData.depositAmount)) : '[Amount in words]'} dollars)

AS EARNEST MONEY DEPOSIT FOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}
Seller: ${partiesData.sellerName || '[Seller Name]'}
Purchase Price: $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[Amount]'}

ESCROW TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This deposit is held in escrow by ${termsData.escrowCompany} and will be:
• Applied to purchase price at closing, OR
• Returned to Buyer if transaction fails due to inspection contingencies, OR  
• Retained by Seller as liquidated damages if Buyer defaults

RECEIVED BY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${termsData.escrowCompany}

_________________________          _________________________
Authorized Signature               Date
          `
        };

      case 'escrow-instructions':
        const paymentMethodLabels = {
          'escrow': 'Escrow Service',
          'wire': 'Wire Transfer',
          'zelle': 'Zelle',
          'check': 'Cash on the Spot'
        };
        return {
          title: 'ESCROW & PAYMENT INSTRUCTIONS',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                      ESCROW & PAYMENT INSTRUCTIONS                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date: ${today}
Reference: Purchase Agreement for ${vesselData.year} ${vesselData.make} ${vesselData.model}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TRANSACTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vessel:           ${vesselData.year} ${vesselData.make} ${vesselData.model}
Vessel Name:      "${vesselData.name || 'N/A'}"
HIN:              ${vesselData.hin || '[HIN]'}

Buyer:            ${partiesData.buyerName || '[Buyer Name]'}
Seller:           ${partiesData.sellerName || '[Seller Name]'}

Purchase Price:   $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[Amount]'}
Deposit Amount:   $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}
Balance Due:      $${termsData.purchasePrice && termsData.depositAmount ? (parseInt(termsData.purchasePrice) - parseInt(termsData.depositAmount)).toLocaleString() : '[Amount]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PAYMENT METHOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selected Method: ${paymentMethodLabels[escrowData.paymentMethod] || 'Escrow Service'}

${escrowData.paymentMethod === 'wire' ? `
┌─────────────────────────────────────────────────────────┐
│              WIRE TRANSFER INSTRUCTIONS                 │
├─────────────────────────────────────────────────────────┤
│  Bank Name:       ${escrowData.bankName || '[Bank Name]'}
│  Account Name:    ${escrowData.accountName || '[Account Name]'}
│  Routing Number:  ${escrowData.routingNumber || '[Routing Number]'}
│  Account Number:  ${escrowData.accountNumber || '[Account Number]'}
│                                                         │
│  Reference:       ${vesselData.hin || 'Boat Purchase'}
└─────────────────────────────────────────────────────────┘
` : ''}${escrowData.paymentMethod === 'zelle' ? `
┌─────────────────────────────────────────────────────────┐
│                  ZELLE INSTRUCTIONS                     │
├─────────────────────────────────────────────────────────┤
│  Send To Email:   ${escrowData.zelleEmail || '[Zelle Email]'}
│  Or Phone:        ${escrowData.zellePhone || '[Zelle Phone]'}
│                                                         │
│  Memo/Note:       ${vesselData.hin || 'Boat Purchase'} - ${partiesData.buyerName || 'Buyer'}
└─────────────────────────────────────────────────────────┘

⚠️  IMPORTANT: Zelle payments are immediate and cannot be reversed.
    Verify recipient information before sending.
` : ''}${escrowData.paymentMethod === 'check' ? `
┌─────────────────────────────────────────────────────────┐
│              CASH PAYMENT INSTRUCTIONS                  │
├─────────────────────────────────────────────────────────┤
│  Cash Recipient:                                        │
│  ${escrowData.checkPayableTo || '[Recipient Name]'}
│                                                         │
│  Closing Location:                                      │
│  ${escrowData.checkMailingAddress || '[Meeting Location]'}
│                                                         │
│  Amount Due:       $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[Amount]'}
└─────────────────────────────────────────────────────────┘

⚠️  IMPORTANT: Cash transactions require extra caution.
    Meet in a public place, bring a witness, count carefully.
` : ''}${escrowData.paymentMethod === 'escrow' ? `
┌─────────────────────────────────────────────────────────┐
│              ESCROW SERVICE DETAILS                     │
├─────────────────────────────────────────────────────────┤
│  Company:         ${escrowData.escrowCompanyName || termsData.escrowCompany}
│  Contact:         ${escrowData.escrowContact || '[Contact Name]'}
│  Phone:           ${escrowData.escrowPhone || '[Phone]'}
│  Email:           ${escrowData.escrowEmail || '[Email]'}
└─────────────────────────────────────────────────────────┘

Escrow agent will provide wire instructions upon engagement.
All funds held in trust until closing conditions are met.
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PAYMENT SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EARNEST MONEY DEPOSIT
   Amount:    $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}
   Due:       ${escrowData.depositDueDate || 'Upon execution of Purchase Agreement'}

2. BALANCE DUE AT CLOSING
   Amount:    $${termsData.purchasePrice && termsData.depositAmount ? (parseInt(termsData.purchasePrice) - parseInt(termsData.depositAmount)).toLocaleString() : '[Amount]'}
   Due:       ${escrowData.balanceDueDate || termsData.closingDate || 'At closing'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUYER ACKNOWLEDGMENT:

_________________________          _________________________
Buyer Signature                    Date


SELLER ACKNOWLEDGMENT:

_________________________          _________________________
Seller Signature                   Date
          `
        };

      case 'survey-authorization':
        return {
          title: 'SURVEY AUTHORIZATION',
          content: `
MARINE SURVEY AUTHORIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${today}

VESSEL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}
Length: ${vesselData.length} feet

AUTHORIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I, ${partiesData.sellerName || '[Seller Name]'}, as owner of the above-described vessel, hereby authorize:

1. A qualified marine surveyor selected by the prospective Buyer to conduct a complete survey of the vessel

2. The vessel to be hauled out at a facility of the surveyor's choosing for bottom inspection

3. All systems to be operated and tested as part of the survey process

4. Access to all areas of the vessel including bilges, engine compartments, and storage areas

SURVEY PERIOD:
The survey must be completed within ${termsData.inspectionDays} days of the date of this authorization.

COSTS:
All costs associated with the survey (surveyor fees, haul-out, etc.) shall be paid by the Buyer.

SELLER ACKNOWLEDGMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Seller Signature                   Date

BUYER ACKNOWLEDGMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Buyer Signature                    Date
          `
        };

      case 'sea-trial-agreement':
        return {
          title: 'SEA TRIAL AGREEMENT',
          content: `
SEA TRIAL AGREEMENT AND LIABILITY WAIVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${today}

VESSEL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}

PARTIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seller/Owner: ${partiesData.sellerName || '[Seller Name]'}
Prospective Buyer: ${partiesData.buyerName || '[Buyer Name]'}

AGREEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Seller agrees to allow the prospective Buyer to conduct a sea trial of the above-described vessel under the following conditions:

1. CAPTAIN: The vessel shall be operated by the Seller or their designated captain during the sea trial

2. FUEL: Fuel costs for the sea trial shall be paid by the Buyer

3. INSURANCE: Seller warrants that adequate insurance is in force covering the vessel and all passengers

4. CONDITION: The Buyer acknowledges the vessel is being test-driven in its current condition

LIABILITY WAIVER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The undersigned Buyer assumes all risk of personal injury during this sea trial and releases the Seller from any and all claims arising from this sea trial, except for claims arising from Seller's gross negligence or willful misconduct.

SIGNATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Seller Signature                   Date

_________________________          _________________________
Buyer Signature                    Date
          `
        };

      case 'vessel-acceptance':
        return {
          title: 'VESSEL ACCEPTANCE',
          content: `
VESSEL ACCEPTANCE DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${today}

VESSEL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}

Reference Purchase Agreement dated: ${today}

BUYER'S ACKNOWLEDGMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I, ${partiesData.buyerName || '[Buyer Name]'}, hereby acknowledge that I have:

☑ Completed a satisfactory marine survey of the vessel
☑ Completed a satisfactory sea trial of the vessel  
☑ Inspected all systems, equipment, and documentation
☑ Reviewed the vessel's maintenance records

ACCEPTANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on my inspection and due diligence, I hereby ACCEPT the vessel in its current "AS-IS" condition and agree to proceed to closing under the terms of the Purchase Agreement.

I understand that upon signing this acceptance, all inspection contingencies are waived and the transaction shall proceed to closing.

SIGNATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Buyer Signature                    Date

Acknowledged by Seller:

_________________________          _________________________
Seller Signature                   Date
          `
        };

      case 'title-transfer':
        return {
          title: 'TITLE TRANSFER',
          content: `
VESSEL TITLE TRANSFER / ASSIGNMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${today}

FOR VALUE RECEIVED, the undersigned Seller does hereby sell, assign, and transfer all right, title, and interest in and to the following described vessel:

VESSEL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel Name: ${vesselData.name || '[Vessel Name]'}
Make: ${vesselData.make || '[Make]'}
Model: ${vesselData.model || '[Model]'}
Year: ${vesselData.year || '[Year]'}
Length: ${vesselData.length || '[Length]'} feet
Hull Identification Number (HIN): ${vesselData.hin || '[HIN]'}
State Registration #: _______________________
USCG Documentation #: _______________________ (if applicable)

FROM (SELLER):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${partiesData.sellerName || '[Seller Name]'}
Address: ${partiesData.sellerAddress || '[Address]'}

TO (BUYER):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${partiesData.buyerName || '[Buyer Name]'}
Address: ${partiesData.buyerAddress || '[Address]'}

SELLER'S CERTIFICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Seller certifies that:
• The odometer/hour meter reading is: _________ hours
• The vessel is free of all liens and encumbrances
• The title is being transferred with all warranties of title

SIGNATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_________________________          _________________________
Seller Signature                   Date

_________________________          _________________________  
Buyer Signature                    Date
          `
        };

      case 'lien-release':
        return {
          title: 'LIEN RELEASE AFFIDAVIT',
          content: `
AFFIDAVIT OF NO LIENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE OF _________________
COUNTY OF ________________

BEFORE ME, the undersigned authority, personally appeared ${partiesData.sellerName || '[Seller Name]'} ("Affiant"), who being duly sworn, deposes and says:

VESSEL IDENTIFICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name}"
HIN: ${vesselData.hin || '[HIN]'}

AFFIRMATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Affiant is the legal owner of the above-described vessel.

2. The vessel is FREE AND CLEAR of all liens, mortgages, security interests, encumbrances, and claims of any kind.

3. There are no outstanding loans, financing agreements, or other debts secured by this vessel.

4. There are no pending lawsuits, judgments, or claims against the vessel.

5. All marina fees, storage fees, and repair bills have been paid in full.

6. Affiant has full authority to sell and transfer clear title to this vessel.

INDEMNIFICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Affiant agrees to indemnify and hold harmless the Buyer from any claims, liens, or encumbrances that may arise from Affiant's ownership of the vessel.

_________________________          _________________________
Affiant/Seller Signature           Date

NOTARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sworn to and subscribed before me this ___ day of _________, 20___

_________________________
Notary Public
My Commission Expires: _______________
          `
        };

      case 'counter-offer':
        return {
          title: 'COUNTER OFFER ADDENDUM',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                         COUNTER OFFER ADDENDUM                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date: ${today}
Reference: Purchase Agreement for ${vesselData.year} ${vesselData.make} ${vesselData.model}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original Offeror:    ${partiesData.buyerName || '[Buyer Name]'}
Counter Offeror:     ${partiesData.sellerName || '[Seller Name]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    VESSEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name || 'N/A'}"
HIN: ${vesselData.hin || '[HIN]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ORIGINAL TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original Purchase Price:    $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[Amount]'}
Original Deposit:           $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    COUNTER OFFER TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The undersigned Counter Offeror hereby rejects the original offer and 
proposes the following modified terms:

Counter Offer Price:        $__________________________

Counter Deposit Amount:     $__________________________

Modified Closing Date:      __________________________

Additional Conditions:
____________________________________________________________
____________________________________________________________
____________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Counter Offer shall expire at 5:00 PM on _____________, 20___.

All other terms of the original Purchase Agreement remain unchanged 
unless specifically modified above.

Upon acceptance, this Addendum becomes part of the Purchase Agreement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COUNTER OFFEROR:

_________________________________          _______________
Signature                                  Date


ACCEPTANCE BY ORIGINAL OFFEROR:

☐ I ACCEPT the above Counter Offer

_________________________________          _______________
Signature                                  Date
          `
        };

      case 'conditional-acceptance':
        return {
          title: 'CONDITIONAL ACCEPTANCE',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                        CONDITIONAL ACCEPTANCE                                ║
║                   Acceptance Subject to Repairs/Conditions                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date: ${today}
Reference: Purchase Agreement for ${vesselData.year} ${vesselData.make} ${vesselData.model}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    VESSEL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name || 'N/A'}"
HIN: ${vesselData.hin || '[HIN]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Buyer:  ${partiesData.buyerName || '[Buyer Name]'}
Seller: ${partiesData.sellerName || '[Seller Name]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CONDITIONAL ACCEPTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I, ${partiesData.buyerName || '[Buyer Name]'}, hereby CONDITIONALLY ACCEPT 
the vessel subject to the following repairs/conditions being completed 
by the Seller PRIOR TO CLOSING:

REQUIRED REPAIRS/CONDITIONS:

1. ____________________________________________________________

2. ____________________________________________________________

3. ____________________________________________________________

4. ____________________________________________________________

5. ____________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Repairs to be completed at SELLER'S expense
☐ Repairs to be completed at BUYER'S expense  
☐ Cost to be split: Seller ____% / Buyer ____%

Repairs must be completed by: ______________________

Upon satisfactory completion of the above conditions, Buyer agrees to 
proceed to closing under the terms of the Purchase Agreement.

If conditions are not met, Buyer reserves the right to:
☐ Cancel the transaction and receive full deposit refund
☐ Accept the vessel as-is with a price reduction of $__________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUYER:

_________________________________          _______________
${partiesData.buyerName || 'Buyer Signature'}                              Date


SELLER ACKNOWLEDGMENT & AGREEMENT:

_________________________________          _______________
${partiesData.sellerName || 'Seller Signature'}                              Date
          `
        };

      case 'vessel-rejection':
        return {
          title: 'VESSEL REJECTION & DEPOSIT REFUND REQUEST',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           VESSEL REJECTION                                   ║
║                      & Deposit Refund Request                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date: ${today}
Reference: Purchase Agreement for ${vesselData.year} ${vesselData.make} ${vesselData.model}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    VESSEL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name || 'N/A'}"
HIN: ${vesselData.hin || '[HIN]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Buyer:  ${partiesData.buyerName || '[Buyer Name]'}
        ${partiesData.buyerAddress || '[Address]'}

Seller: ${partiesData.sellerName || '[Seller Name]'}
        ${partiesData.sellerAddress || '[Address]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    NOTICE OF REJECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I, ${partiesData.buyerName || '[Buyer Name]'}, hereby give notice that I am 
REJECTING the above-described vessel and TERMINATING the Purchase Agreement 
pursuant to the inspection contingency provisions.

REASON FOR REJECTION (check all that apply):

☐ Unsatisfactory marine survey results
☐ Unsatisfactory sea trial results
☐ Material defects discovered
☐ Title issues
☐ Undisclosed damage or condition
☐ Other: ________________________________________________

DETAILS:
____________________________________________________________
____________________________________________________________
____________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    DEPOSIT REFUND REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Earnest Money Deposit Amount:    $${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}
Held By:                         ${termsData.escrowCompany || escrowData.escrowCompanyName}

I hereby request the FULL REFUND of my earnest money deposit as provided 
for under the inspection contingency of the Purchase Agreement.

REFUND PAYMENT METHOD:

☐ Return via same method as original payment
☐ Wire Transfer to:
    Bank: _________________________
    Routing #: ____________________
    Account #: ____________________
☐ Check mailed to address above
☐ Zelle to: _______________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUYER:

_________________________________          _______________
${partiesData.buyerName || 'Buyer Signature'}                              Date


SELLER ACKNOWLEDGMENT:

_________________________________          _______________
${partiesData.sellerName || 'Seller Signature'}                              Date


ESCROW AGENT AUTHORIZATION TO RELEASE DEPOSIT:

_________________________________          _______________
Authorized Signature                       Date
          `
        };

      case 'wire-transfer-confirmation':
        const finalAmount = (parseInt(termsData.purchasePrice) || 0) - (parseInt(termsData.depositAmount) || 0);
        return {
          title: 'WIRE TRANSFER CONFIRMATION',
          content: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                       WIRE TRANSFER CONFIRMATION                             ║
║                        Final Payment Verification                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date: ${today}
Transaction ID: ${transactionId || 'BC-' + Date.now().toString(36).toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TRANSACTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vessel: ${vesselData.year} ${vesselData.make} ${vesselData.model}
Name: "${vesselData.name || 'N/A'}"
HIN: ${vesselData.hin || '[HIN]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purchase Price:              $${termsData.purchasePrice ? parseInt(termsData.purchasePrice).toLocaleString() : '[Amount]'}
Less: Deposit Paid:         -$${termsData.depositAmount ? parseInt(termsData.depositAmount).toLocaleString() : '[Amount]'}
                            ─────────────────
FINAL WIRE AMOUNT:           $${finalAmount.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SENDER (BUYER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:           ${partiesData.buyerName || '[Buyer Name]'}
Bank Name:      _________________________________
Account #:      _________________________________
Wire Ref #:     _________________________________
Date Sent:      _________________________________
Time Sent:      _________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    RECIPIENT (SELLER/ESCROW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:           ${escrowData.paymentMethod === 'escrow' ? escrowData.escrowCompanyName : partiesData.sellerName || '[Recipient]'}
Bank Name:      ${escrowData.bankName || '_________________________________'}
Routing #:      ${escrowData.routingNumber || '_________________________________'}
Account #:      ${escrowData.accountNumber || '_________________________________'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CONFIRMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUYER CONFIRMATION:
I confirm that I have initiated a wire transfer in the amount of 
$${finalAmount.toLocaleString()} to the account specified above.

_________________________________          _______________
${partiesData.buyerName || 'Buyer Signature'}                              Date

Wire Confirmation Number: _________________________________


SELLER/ESCROW CONFIRMATION:
I confirm receipt of wire transfer in the amount of $${finalAmount.toLocaleString()}.

_________________________________          _______________
Recipient Signature                        Date

Date/Time Received: _________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Keep this confirmation for your records.
    Wire reference numbers should be saved for tracking purposes.
          `
        };

      default:
        return { title: 'Document', content: 'Document content not available.' };
    }
  };

  // Helper function for number to words (simple version)
  const numberToWords = (num) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return Math.floor(num/1000) + ' thousand ' + (num % 1000 > 0 ? (num % 1000) : '');
    return num.toLocaleString();
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER COMPONENTS
  // ════════════════════════════════════════════════════════════════════════════

  // Welcome Screen
  // Check if there's a saved transaction
  const hasSavedTransaction = () => {
    const saved = localStorage.getItem('boatcloser_current_transaction');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.vesselData?.name || data.partiesData?.buyerName || data.partiesData?.sellerName;
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  
  // Clear saved transaction and start fresh
  const startNewTransaction = () => {
    localStorage.removeItem('boatcloser_current_transaction');
    setTransactionId(null);
    setUserRole(null);
    setVesselData({ name: '', make: '', model: '', year: '', length: '', hin: '', askingPrice: '' });
    setPartiesData({ buyerName: '', buyerEmail: '', buyerPhone: '', buyerAddress: '', sellerName: '', sellerEmail: '', sellerPhone: '', sellerAddress: '' });
    setTermsData({ purchasePrice: '', depositAmount: '', closingDate: '', inspectionDays: '10', escrowCompany: 'BoatCloser Escrow Services' });
    setEscrowData({ paymentMethod: 'escrow', bankName: '', accountName: '', routingNumber: '', accountNumber: '', zelleEmail: '', zellePhone: '', checkPayableTo: '', checkMailingAddress: '', escrowCompanyName: 'BoatCloser Escrow Services', escrowContact: '', escrowPhone: '', escrowEmail: '', depositDueDate: '', balanceDueDate: '' });
    setDiligenceItems({ survey: false, seaTrial: false, titleSearch: false, insurance: false });
    setSignedDocs({});
    setSignatureData({});
    setCurrentStep(0);
    setCurrentView('role');
  };

  const WelcomeScreen = () => {
    const hasExisting = hasSavedTransaction();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-6">
              <Anchor className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">BoatCloser</h1>
            <p className="text-blue-200 text-lg">Close your boat deal with confidence</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">What you'll get:</h2>
            <div className="space-y-3 text-left">
              {['Professional Purchase Agreement', 'Legal Bill of Sale', 'Complete Closing Statement', 'Due Diligence Documents', 'Step-by-step guidance'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-100">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {hasExisting ? (
            <div className="space-y-3">
              <button
                onClick={() => setCurrentView('steps')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue Transaction <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={startNewTransaction}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Start New Transaction
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('role')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>
          )}
          
          <p className="text-blue-300/60 text-sm mt-6">
            Your data is saved automatically
          </p>
        </div>
      </div>
    );
  };

  // Role Selection
  const RoleSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button 
          onClick={() => setCurrentView('welcome')}
          className="text-blue-300 hover:text-white mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">What's your role?</h2>
        <p className="text-blue-200 mb-8">This helps us personalize your experience</p>

        <div className="space-y-4">
          <button
            onClick={() => { setUserRole('buyer'); setCurrentView('steps'); }}
            className="w-full bg-white hover:bg-blue-50 rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Ship className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">I'm Buying a Boat</h3>
                <p className="text-slate-500">Get documents to protect your purchase</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => { setUserRole('seller'); setCurrentView('steps'); }}
            className="w-full bg-white hover:bg-blue-50 rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">I'm Selling a Boat</h3>
                <p className="text-slate-500">Get documents to protect your sale</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Progress Steps
  const ProgressSteps = () => (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isComplete = currentStep > index;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => currentStep > index && setCurrentStep(index)}
                  className={`flex flex-col items-center ${isComplete ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    isActive ? 'bg-blue-500 text-white' : 
                    isComplete ? 'bg-green-500 text-white' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > index ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Form wrapper
  const FormSection = ({ title, subtitle, children, onBack, onNext, nextLabel = 'Continue', canProceed = true }) => (
    <div className="min-h-screen bg-slate-50">
      <ProgressSteps />
      <div className="max-w-xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          {children}
        </div>
        
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              canProceed 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {nextLabel} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Input field component
  const Input = ({ label, value, onChange, placeholder, type = 'text', prefix }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${prefix ? 'pl-8' : ''}`}
        />
      </div>
    </div>
  );

  // Vessel Details Step
  const VesselStep = () => (
    <FormSection
      title="Vessel Details"
      subtitle="Enter the boat's information"
      onBack={() => setCurrentView('role')}
      onNext={() => {
        // Generate transaction ID when moving forward
        if (!transactionId) {
          setTransactionId(generateTransactionId());
        }
        setCurrentStep(1);
      }}
      canProceed={vesselData.make && vesselData.model && vesselData.year}
    >
      <Input 
        label="Vessel Name (optional)" 
        value={vesselData.name} 
        onChange={(v) => setVesselData({...vesselData, name: v})}
        placeholder="e.g., Sea Breeze"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Make *" 
          value={vesselData.make} 
          onChange={(v) => setVesselData({...vesselData, make: v})}
          placeholder="e.g., Sea Ray"
        />
        <Input 
          label="Model *" 
          value={vesselData.model} 
          onChange={(v) => setVesselData({...vesselData, model: v})}
          placeholder="e.g., Sundancer 320"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Year *" 
          value={vesselData.year} 
          onChange={(v) => setVesselData({...vesselData, year: v})}
          placeholder="e.g., 2020"
          type="number"
        />
        <Input 
          label="Length (ft)" 
          value={vesselData.length} 
          onChange={(v) => setVesselData({...vesselData, length: v})}
          placeholder="e.g., 32"
        />
      </div>
      <Input 
        label="Hull ID Number (HIN)" 
        value={vesselData.hin} 
        onChange={(v) => setVesselData({...vesselData, hin: v})}
        placeholder="e.g., SERF5678J920"
      />
      <Input 
        label="Asking Price" 
        value={vesselData.askingPrice} 
        onChange={(v) => setVesselData({...vesselData, askingPrice: v})}
        placeholder="e.g., 125000"
        prefix="$"
      />
      
      {/* Share Button */}
      {vesselData.make && vesselData.model && vesselData.year && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              if (!transactionId) {
                setTransactionId(generateTransactionId());
              }
              setCurrentView('share');
            }}
            className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share with {userRole === 'buyer' ? 'Seller' : 'Buyer'}
          </button>
          <p className="text-center text-slate-400 text-xs mt-2">
            Send a link so they can add their information
          </p>
        </div>
      )}
    </FormSection>
  );

  // Parties Step
  const PartiesStep = () => {
    const yourInfo = userRole === 'buyer' 
      ? { name: 'buyerName', email: 'buyerEmail', phone: 'buyerPhone', address: 'buyerAddress' }
      : { name: 'sellerName', email: 'sellerEmail', phone: 'sellerPhone', address: 'sellerAddress' };
    const otherInfo = userRole === 'buyer'
      ? { name: 'sellerName', email: 'sellerEmail', phone: 'sellerPhone', address: 'sellerAddress' }
      : { name: 'buyerName', email: 'buyerEmail', phone: 'buyerPhone', address: 'sellerAddress' };
    const otherLabel = userRole === 'buyer' ? 'Seller' : 'Buyer';

    return (
      <FormSection
        title="Buyer & Seller Information"
        subtitle="Enter contact details for both parties"
        onBack={() => setCurrentStep(0)}
        onNext={() => setCurrentStep(showPaywall ? 2 : 2)}
        canProceed={partiesData[yourInfo.name] && partiesData[otherInfo.name]}
      >
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Your Information ({userRole === 'buyer' ? 'Buyer' : 'Seller'})
          </h3>
          <Input 
            label="Full Legal Name *" 
            value={partiesData[yourInfo.name]} 
            onChange={(v) => setPartiesData({...partiesData, [yourInfo.name]: v})}
            placeholder="As it appears on ID"
          />
          <Input 
            label="Email" 
            value={partiesData[yourInfo.email]} 
            onChange={(v) => setPartiesData({...partiesData, [yourInfo.email]: v})}
            placeholder="your@email.com"
            type="email"
          />
          <Input 
            label="Phone" 
            value={partiesData[yourInfo.phone]} 
            onChange={(v) => setPartiesData({...partiesData, [yourInfo.phone]: v})}
            placeholder="(555) 123-4567"
          />
          <Input 
            label="Address" 
            value={partiesData[yourInfo.address]} 
            onChange={(v) => setPartiesData({...partiesData, [yourInfo.address]: v})}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> {otherLabel}'s Information
          </h3>
          <Input 
            label="Full Legal Name *" 
            value={partiesData[otherInfo.name]} 
            onChange={(v) => setPartiesData({...partiesData, [otherInfo.name]: v})}
            placeholder="As it appears on ID"
          />
          <Input 
            label="Email" 
            value={partiesData[otherInfo.email]} 
            onChange={(v) => setPartiesData({...partiesData, [otherInfo.email]: v})}
            placeholder="their@email.com"
            type="email"
          />
          <Input 
            label="Phone" 
            value={partiesData[otherInfo.phone]} 
            onChange={(v) => setPartiesData({...partiesData, [otherInfo.phone]: v})}
            placeholder="(555) 123-4567"
          />
          <Input 
            label="Address" 
            value={partiesData[otherInfo.address]} 
            onChange={(v) => setPartiesData({...partiesData, [otherInfo.address]: v})}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>
      </FormSection>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PAYMENT & LEGAL TERMS STEP (Currently disabled - set showPaywall = true to enable)
  // ════════════════════════════════════════════════════════════════════════════
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  
  const PaymentStep = () => {
    const plans = [
      {
        id: 'standard',
        name: 'Standard',
        price: 149,
        description: 'Everything you need to close your boat deal',
        features: [
          'Purchase Agreement',
          'Bill of Sale',
          'Closing Statement',
          'Due Diligence Checklist',
          'Email Support'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 249,
        description: 'Full service with priority support',
        features: [
          'All Standard features',
          'All 9 Legal Documents',
          'Survey Authorization',
          'Sea Trial Agreement',
          'Title Transfer Forms',
          'Lien Release Affidavit',
          'Priority Phone Support',
          'Document Review Service'
        ],
        popular: true
      }
    ];

    return (
      <div className="min-h-screen bg-slate-50">
        <ProgressSteps />
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Choose Your Plan</h2>
            <p className="text-slate-500 mt-1">One-time payment, no subscriptions</p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white rounded-2xl p-6 text-left transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-slate-800">{plan.name}</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-800">${plan.price}</span>
                  <span className="text-slate-500 ml-1">one-time</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Legal Terms */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Terms of Service
            </h3>
            
            <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto mb-4 text-sm text-slate-600">
              <p className="font-semibold mb-2">BoatClosers Platform Terms of Service</p>
              <p className="mb-3">By using BoatClosers, you agree to the following terms:</p>
              
              <p className="font-medium mb-1">1. Service Description</p>
              <p className="mb-3">BoatClosers provides document preparation and transaction management services for private boat sales. We are not attorneys, brokers, or escrow agents.</p>
              
              <p className="font-medium mb-1">2. Document Accuracy</p>
              <p className="mb-3">You are responsible for verifying all information entered into documents. BoatClosers does not verify the accuracy of vessel descriptions, titles, or ownership claims.</p>
              
              <p className="font-medium mb-1">3. No Legal Advice</p>
              <p className="mb-3">Documents provided are templates for informational purposes. We recommend consulting with a maritime attorney for complex transactions.</p>
              
              <p className="font-medium mb-1">4. Limitation of Liability</p>
              <p className="mb-3">BoatClosers maximum liability is limited to the service fee paid. We are not liable for any disputes between buyer and seller.</p>
              
              <p className="font-medium mb-1">5. Refund Policy</p>
              <p className="mb-3">Full refund available within 24 hours if no documents have been generated. Partial refund (50%) available within 7 days.</p>
              
              <p className="font-medium mb-1">6. Privacy</p>
              <p>Your information is encrypted and secure. We do not sell or share your personal data with third parties.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                I have read and agree to the <span className="text-blue-600 font-medium">Terms of Service</span> and 
                <span className="text-blue-600 font-medium"> Privacy Policy</span>. I understand that BoatClosers 
                provides document services only and is not a law firm.
              </span>
            </label>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3">Order Summary</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">{plans.find(p => p.id === selectedPlan)?.name} Plan</span>
              <span className="font-semibold">${plans.find(p => p.id === selectedPlan)?.price}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
              <span className="font-medium text-slate-800">Total Due</span>
              <span className="text-xl font-bold text-blue-600">${plans.find(p => p.id === selectedPlan)?.price}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => acceptedTerms && setCurrentStep(3)}
              disabled={!acceptedTerms}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                acceptedTerms 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Shield className="w-5 h-5" />
              Pay ${plans.find(p => p.id === selectedPlan)?.price} & Continue
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    );
  };
  // ════════════════════════════════════════════════════════════════════════════
  // END PAYMENT STEP
  // ════════════════════════════════════════════════════════════════════════════

  // Terms Step
  const TermsStep = () => {
    const prevStep = showPaywall ? 2 : 1;
    // Next step: if escrow enabled, go to escrow (3 or 4); otherwise skip to diligence
    const nextStep = showEscrowStep ? (showPaywall ? 4 : 3) : (showPaywall ? 4 : 3);
    
    return (
    <FormSection
      title="Deal Terms"
      subtitle="Set the financial terms of the transaction"
      onBack={() => setCurrentStep(prevStep)}
      onNext={() => setCurrentStep(nextStep)}
      canProceed={termsData.purchasePrice && termsData.depositAmount}
    >
      <Input 
        label="Purchase Price *" 
        value={termsData.purchasePrice} 
        onChange={(v) => setTermsData({...termsData, purchasePrice: v})}
        placeholder="Agreed purchase price"
        prefix="$"
      />
      <Input 
        label="Earnest Money Deposit *" 
        value={termsData.depositAmount} 
        onChange={(v) => setTermsData({...termsData, depositAmount: v})}
        placeholder="Typically 10% of purchase price"
        prefix="$"
      />
      
      {termsData.purchasePrice && termsData.depositAmount && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Purchase Price</span>
            <span className="font-semibold">${parseInt(termsData.purchasePrice).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Less: Deposit</span>
            <span className="font-semibold">-${parseInt(termsData.depositAmount).toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-slate-700 font-medium">Balance Due at Closing</span>
            <span className="font-bold text-blue-600">
              ${(parseInt(termsData.purchasePrice) - parseInt(termsData.depositAmount)).toLocaleString()}
            </span>
          </div>
        </div>
      )}
      
      <Input 
        label="Target Closing Date" 
        value={termsData.closingDate} 
        onChange={(v) => setTermsData({...termsData, closingDate: v})}
        type="date"
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Inspection Period (Days)</label>
        <select
          value={termsData.inspectionDays}
          onChange={(e) => setTermsData({...termsData, inspectionDays: e.target.value})}
          className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">7 days</option>
          <option value="10">10 days</option>
          <option value="14">14 days</option>
          <option value="21">21 days</option>
          <option value="30">30 days</option>
        </select>
      </div>
    </FormSection>
  )};

  // ════════════════════════════════════════════════════════════════════════════
  // ESCROW/PAYMENT OPTIONS STEP
  // ════════════════════════════════════════════════════════════════════════════
  const EscrowStep = () => {
    const prevStep = showPaywall ? 3 : 2;
    const nextStep = showPaywall ? 5 : 4;
    
    const paymentMethods = [
      { id: 'escrow', label: 'Escrow Service', icon: Building, desc: 'Professional escrow holds funds until closing' },
      { id: 'wire', label: 'Wire Transfer', icon: Banknote, desc: 'Direct bank-to-bank transfer' },
      { id: 'zelle', label: 'Zelle', icon: Smartphone, desc: 'Quick digital payment' },
      { id: 'check', label: 'Cash on the Spot', icon: CreditCard, desc: 'Cash payment at closing' }
    ];

    return (
      <div className="min-h-screen bg-slate-50">
        <ProgressSteps />
        <div className="max-w-xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Escrow & Payment Setup</h2>
            <p className="text-slate-500 mt-1">Choose how funds will be transferred</p>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setEscrowData({...escrowData, paymentMethod: method.id})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      escrowData.paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${escrowData.paymentMethod === method.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div className="font-medium text-slate-800">{method.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{method.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details based on method */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              {escrowData.paymentMethod === 'escrow' && 'Escrow Company Details'}
              {escrowData.paymentMethod === 'wire' && 'Wire Transfer Details'}
              {escrowData.paymentMethod === 'zelle' && 'Zelle Details'}
              {escrowData.paymentMethod === 'check' && 'Cash Payment Details'}
            </h3>

            {escrowData.paymentMethod === 'escrow' && (
              <>
                <Input label="Escrow Company Name" value={escrowData.escrowCompanyName} 
                  onChange={(v) => setEscrowData({...escrowData, escrowCompanyName: v})} placeholder="Company name" />
                <Input label="Contact Person" value={escrowData.escrowContact} 
                  onChange={(v) => setEscrowData({...escrowData, escrowContact: v})} placeholder="Contact name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" value={escrowData.escrowPhone} 
                    onChange={(v) => setEscrowData({...escrowData, escrowPhone: v})} placeholder="(555) 123-4567" />
                  <Input label="Email" value={escrowData.escrowEmail} 
                    onChange={(v) => setEscrowData({...escrowData, escrowEmail: v})} placeholder="escrow@company.com" type="email" />
                </div>
              </>
            )}

            {escrowData.paymentMethod === 'wire' && (
              <>
                <Input label="Bank Name" value={escrowData.bankName} 
                  onChange={(v) => setEscrowData({...escrowData, bankName: v})} placeholder="Bank name" />
                <Input label="Account Name" value={escrowData.accountName} 
                  onChange={(v) => setEscrowData({...escrowData, accountName: v})} placeholder="Name on account" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Routing Number" value={escrowData.routingNumber} 
                    onChange={(v) => setEscrowData({...escrowData, routingNumber: v})} placeholder="9 digits" />
                  <Input label="Account Number" value={escrowData.accountNumber} 
                    onChange={(v) => setEscrowData({...escrowData, accountNumber: v})} placeholder="Account number" />
                </div>
                <div className="mt-3 p-3 bg-amber-50 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-800">Wire transfers are typically irreversible. Verify all details carefully.</p>
                </div>
              </>
            )}

            {escrowData.paymentMethod === 'zelle' && (
              <>
                <Input label="Zelle Email" value={escrowData.zelleEmail} 
                  onChange={(v) => setEscrowData({...escrowData, zelleEmail: v})} placeholder="email@example.com" type="email" />
                <Input label="Or Zelle Phone" value={escrowData.zellePhone} 
                  onChange={(v) => setEscrowData({...escrowData, zellePhone: v})} placeholder="(555) 123-4567" />
                <div className="mt-3 p-3 bg-amber-50 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-800">Zelle payments are instant and cannot be reversed. For large transactions, consider using escrow.</p>
                </div>
              </>
            )}

            {escrowData.paymentMethod === 'check' && (
              <>
                <Input label="Cash Recipient Name" value={escrowData.checkPayableTo} 
                  onChange={(v) => setEscrowData({...escrowData, checkPayableTo: v})} placeholder="Who will receive cash" />
                <Input label="Closing Location" value={escrowData.checkMailingAddress} 
                  onChange={(v) => setEscrowData({...escrowData, checkMailingAddress: v})} placeholder="Where cash exchange will occur" />
                <div className="mt-3 p-3 bg-amber-50 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-800">For safety, meet in a public place and consider bringing a witness. Count cash carefully before signing documents.</p>
                </div>
              </>
            )}
          </div>

          {/* Payment Schedule */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Payment Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Deposit Due Date" value={escrowData.depositDueDate} 
                onChange={(v) => setEscrowData({...escrowData, depositDueDate: v})} type="date" />
              <Input label="Balance Due Date" value={escrowData.balanceDueDate} 
                onChange={(v) => setEscrowData({...escrowData, balanceDueDate: v})} type="date" />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(prevStep)}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(nextStep)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-500 hover:bg-blue-600 text-white"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Due Diligence Step
  const DiligenceStep = () => {
    // Calculate step indices based on config
    // With showEscrowStep=true, showPaywall=false: Vessel(0), Parties(1), Terms(2), Escrow(3), Diligence(4), Documents(5)
    // With showEscrowStep=false, showPaywall=false: Vessel(0), Parties(1), Terms(2), Diligence(3), Documents(4)
    const prevStep = showPaywall ? (showEscrowStep ? 4 : 3) : (showEscrowStep ? 3 : 2);
    const nextStep = showPaywall ? (showEscrowStep ? 6 : 5) : (showEscrowStep ? 5 : 4);
    
    return (
    <FormSection
      title="Due Diligence Checklist"
      subtitle="Track inspection items (check when complete)"
      onBack={() => setCurrentStep(prevStep)}
      onNext={() => setCurrentStep(nextStep)}
      nextLabel="View Documents"
      canProceed={true}
    >
      <div className="space-y-3">
        {[
          { id: 'survey', label: 'Marine Survey', desc: 'Professional inspection of hull, systems, and equipment' },
          { id: 'seaTrial', label: 'Sea Trial', desc: 'Test the boat on the water' },
          { id: 'titleSearch', label: 'Title Search', desc: 'Verify ownership and check for liens' },
          { id: 'insurance', label: 'Insurance Quote', desc: 'Obtain insurance for the vessel' }
        ].map((item) => (
          <label 
            key={item.id}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              diligenceItems[item.id] ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={diligenceItems[item.id]}
              onChange={(e) => setDiligenceItems({...diligenceItems, [item.id]: e.target.checked})}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-green-500 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="font-medium text-slate-800">{item.label}</div>
              <div className="text-sm text-slate-500">{item.desc}</div>
            </div>
            {diligenceItems[item.id] && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
          </label>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Tip:</strong> Complete the survey and sea trial before signing the Vessel Acceptance document. You can proceed to view documents at any time.
        </div>
      </div>
    </FormSection>
  )};

  // Documents Step
  const DocumentsStep = () => {
    const groupedDocs = {
      agreement: documents.filter(d => d.phase === 'agreement'),
      diligence: documents.filter(d => d.phase === 'diligence'),
      closing: documents.filter(d => d.phase === 'closing')
    };

    const requiredDocs = documents.filter(d => d.required);
    const signedRequiredCount = requiredDocs.filter(d => signedDocs[d.id]).length;
    const canClose = signedRequiredCount === requiredDocs.length;

    return (
      <div className="min-h-screen bg-slate-50">
        <ProgressSteps />
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Transaction Documents</h2>
            <p className="text-slate-500 mt-1">View, sign, and download your documents</p>
          </div>

          {/* Progress indicator */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Required Documents Signed</span>
              <span className="text-sm font-semibold text-blue-600">{signedRequiredCount} of {requiredDocs.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${(signedRequiredCount / requiredDocs.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Document sections */}
          {[
            { key: 'agreement', title: '1. Purchase Agreement', docs: groupedDocs.agreement },
            { key: 'diligence', title: '2. Due Diligence', docs: groupedDocs.diligence },
            { key: 'closing', title: '3. Closing Documents', docs: groupedDocs.closing }
          ].map((section) => (
            <div key={section.key} className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-3">{section.title}</h3>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {section.docs.map((doc, i) => (
                  <div 
                    key={doc.id}
                    className={`p-4 flex items-center gap-4 ${i > 0 ? 'border-t' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      signedDocs[doc.id] ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {signedDocs[doc.id] ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{doc.name}</span>
                        {doc.required && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Required</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{doc.description}</p>
                    </div>
                    <button
                      onClick={() => setViewingDoc(doc.id)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors"
                    >
                      {signedDocs[doc.id] ? 'View' : 'Open'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Go back to diligence step
                const diligenceIndex = showPaywall ? (showEscrowStep ? 5 : 4) : (showEscrowStep ? 4 : 3);
                setCurrentStep(diligenceIndex);
              }}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => canClose && setCurrentView('complete')}
              disabled={!canClose}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                canClose 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canClose ? 'Complete Transaction' : 'Sign Required Documents to Close'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Document Viewer Modal
  // ════════════════════════════════════════════════════════════════════════════
  // ENHANCED DOCUMENT VIEWER - Open, Download PDF, Share, Sign
  // ════════════════════════════════════════════════════════════════════════════

  // Generate PDF from document content
  const generatePDF = (docId) => {
    const doc = documents.find(d => d.id === docId);
    const content = generateDocumentContent(docId);
    
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${content.title}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <pre>${content.content}</pre>
        ${signedDocs[docId] ? '<p style="margin-top: 40px; color: green; font-family: Arial;">✓ DIGITALLY SIGNED via BoatCloser</p>' : ''}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate shareable document link
  const getDocShareLink = (docId) => {
    const docData = {
      docId,
      vessel: vesselData,
      parties: partiesData,
      terms: termsData,
      transactionId: transactionId || generateTransactionId()
    };
    const encoded = btoa(JSON.stringify(docData));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?viewDoc=${docId}&data=${encoded}`;
  };

  const copyDocLink = async (docId) => {
    const link = getDocShareLink(docId);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedDocLink(true);
      setTimeout(() => setCopiedDocLink(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedDocLink(true);
      setTimeout(() => setCopiedDocLink(false), 2000);
    }
  };

  const DocumentViewer = () => {
    if (!viewingDoc) return null;
    
    const doc = documents.find(d => d.id === viewingDoc);
    const content = generateDocumentContent(viewingDoc);
    const isSigned = signedDocs[viewingDoc];
    const signature = signatureData[viewingDoc];

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{content.title}</h3>
              <p className="text-sm text-slate-500">{doc.description}</p>
            </div>
            <button
              onClick={() => {
                setViewingDoc(null);
                setSignatureMode(false);
                setDocShareModal(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600"
            >
              ✕
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-3 border-b bg-white flex items-center gap-2 flex-wrap">
            <button
              onClick={() => generatePDF(viewingDoc)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => setDocShareModal(!docShareModal)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Print
            </button>
            {isSigned && (
              <span className="ml-auto px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Signed {signature?.date || ''}
              </span>
            )}
          </div>

          {/* Share Modal Dropdown */}
          {docShareModal && (
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={getDocShareLink(viewingDoc)}
                  readOnly
                  className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm"
                />
                <button
                  onClick={() => copyDocLink(viewingDoc)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    copiedDocLink 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {copiedDocLink ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
              <p className="text-xs text-blue-700">Share this link for the other party to view and sign this document.</p>
            </div>
          )}
          
          {/* Document content */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
                {content.content}
              </pre>
              
              {/* Signature Section */}
              {isSigned && signature && (
                <div className="mt-6 pt-6 border-t-2 border-slate-200">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">✓ Digitally Signed</p>
                    <div className="text-sm text-green-700">
                      <p>Signed by: {signature.name || (userRole === 'buyer' ? partiesData.buyerName : partiesData.sellerName)}</p>
                      <p>Date: {signature.date}</p>
                      <p>Role: {signature.role || userRole}</p>
                      {signature.ip && <p className="text-xs text-green-600">IP: {signature.ip}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Signature / Actions Footer */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            {!isSigned ? (
              signatureMode ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-3">
                      By signing below, you agree to the terms of this document.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Your Full Legal Name</label>
                        <input
                          type="text"
                          placeholder="Type your full name"
                          defaultValue={userRole === 'buyer' ? partiesData.buyerName : partiesData.sellerName}
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm"
                          id="signatureName"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Today's Date</label>
                        <input
                          type="text"
                          value={new Date().toLocaleDateString()}
                          readOnly
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm bg-slate-50"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" id="signatureAgree" className="mt-1" />
                        <span className="text-xs text-slate-600">
                          I confirm that I am the person named above, I have read and understand this document, 
                          and I agree to be legally bound by its terms.
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSignatureMode(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const nameInput = document.getElementById('signatureName');
                        const agreeCheck = document.getElementById('signatureAgree');
                        if (nameInput?.value && agreeCheck?.checked) {
                          const sigData = {
                            name: nameInput.value,
                            date: new Date().toLocaleDateString(),
                            timestamp: new Date().toISOString(),
                            role: userRole,
                            docId: viewingDoc
                          };
                          setSignatureData({...signatureData, [viewingDoc]: sigData});
                          setSignedDocs({...signedDocs, [viewingDoc]: true});
                          setSignatureMode(false);
                        } else {
                          alert('Please enter your name and check the agreement box to sign.');
                        }
                      }}
                      className="flex-1 py-2 px-4 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                    >
                      <PenTool className="w-4 h-4" /> Apply Signature
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setSignatureMode(true)}
                    className="flex-1 py-2 px-4 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" /> Sign This Document
                  </button>
                </div>
              )
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={() => generatePDF(viewingDoc)}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Signed Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // QR CODE GENERATOR COMPONENT
  // ════════════════════════════════════════════════════════════════════════════
  const QRCodeDisplay = ({ url, size = 200 }) => {
    // Generate QR code using a simple SVG-based approach
    // In production, you'd use a library like 'qrcode' or 'qrcode.react'
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    
    return (
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <img 
            src={qrApiUrl} 
            alt="QR Code" 
            className="w-48 h-48"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-48 h-48 bg-slate-100 rounded-xl items-center justify-center">
            <QrCode className="w-16 h-16 text-slate-300" />
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SHARE SCREEN - Generate shareable link and QR code
  // ════════════════════════════════════════════════════════════════════════════
  const ShareScreen = () => {
    const otherRole = userRole === 'buyer' ? 'seller' : 'buyer';
    const otherRoleLabel = otherRole === 'buyer' ? 'Buyer' : 'Seller';
    
    // Generate share data (encode transaction details)
    const shareData = {
      vessel: vesselData,
      terms: termsData,
      parties: partiesData,
      initiatorRole: userRole
    };
    
    const encodedData = btoa(JSON.stringify(shareData));
    const txId = transactionId || generateTransactionId();
    
    // Ensure transaction ID is set
    if (!transactionId) {
      setTransactionId(txId);
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?tx=${txId}&role=${otherRole}&data=${encodedData}`;
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button 
            onClick={() => {
              setCurrentView('steps');
              setCurrentStep(0);
            }}
            className="text-blue-300 hover:text-white mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Transaction
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Share with {otherRoleLabel}</h2>
            <p className="text-blue-200">
              Send this link to the {otherRole} so they can join and complete their part of the transaction
            </p>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-sm">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-blue-100">
                <span>Vessel</span>
                <span className="text-white font-medium">{vesselData.year} {vesselData.make} {vesselData.model}</span>
              </div>
              {termsData.purchasePrice && (
                <div className="flex justify-between text-blue-100">
                  <span>Price</span>
                  <span className="text-white font-medium">${parseInt(termsData.purchasePrice).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-blue-100">
                <span>Transaction ID</span>
                <span className="text-white font-mono text-xs">{txId}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <QRCodeDisplay url={shareUrl} />
          </div>
          <p className="text-center text-blue-200 text-sm mb-6">
            Scan QR code or share link below
          </p>

          {/* Share Link */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-600 truncate"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
                  copiedLink 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copiedLink ? (
                  <><CheckCircle className="w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy</>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => window.open(`mailto:?subject=BoatCloser Transaction - ${vesselData.year} ${vesselData.make}&body=Join our boat transaction: ${shareUrl}`, '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Email
            </button>
            <button
              onClick={() => window.open(`sms:?body=Join our BoatCloser transaction: ${shareUrl}`, '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" /> Text
            </button>
          </div>

          {/* Continue without sharing */}
          <button
            onClick={() => {
              setCurrentView('steps');
              setCurrentStep(1);
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Continue Transaction
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // JOIN SCREEN - When someone opens a shared link
  // ════════════════════════════════════════════════════════════════════════════
  const JoinScreen = () => {
    if (!joinData) return null;
    
    const roleLabel = joinData.role === 'buyer' ? 'Buyer' : 'Seller';
    const otherRoleLabel = joinData.role === 'buyer' ? 'Seller' : 'Buyer';
    
    const acceptInvitation = () => {
      // Load the shared transaction data
      setTransactionId(joinData.transactionId);
      setUserRole(joinData.role);
      setVesselData(joinData.vessel || vesselData);
      setTermsData(joinData.terms || termsData);
      setPartiesData(joinData.parties || partiesData);
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Go to the appropriate step
      setCurrentView('steps');
      setCurrentStep(1); // Start at parties step so they can add their info
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-6">
              <Link className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">You're Invited!</h1>
            <p className="text-blue-200 text-lg">
              Join this boat transaction as the <span className="font-semibold text-white">{roleLabel}</span>
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-4">Transaction Details</h3>
            <div className="space-y-3 text-blue-100">
              {joinData.vessel && (
                <>
                  <div className="flex justify-between">
                    <span>Vessel</span>
                    <span className="text-white font-medium">
                      {joinData.vessel.year} {joinData.vessel.make} {joinData.vessel.model}
                    </span>
                  </div>
                  {joinData.vessel.name && (
                    <div className="flex justify-between">
                      <span>Name</span>
                      <span className="text-white font-medium">"{joinData.vessel.name}"</span>
                    </div>
                  )}
                </>
              )}
              {joinData.terms?.purchasePrice && (
                <div className="flex justify-between">
                  <span>Purchase Price</span>
                  <span className="text-white font-medium">
                    ${parseInt(joinData.terms.purchasePrice).toLocaleString()}
                  </span>
                </div>
              )}
              {joinData.terms?.depositAmount && (
                <div className="flex justify-between">
                  <span>Deposit</span>
                  <span className="text-white font-medium">
                    ${parseInt(joinData.terms.depositAmount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Invited By</span>
                <span className="text-white font-medium">{otherRoleLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="text-white font-mono text-xs">{joinData.transactionId}</span>
              </div>
            </div>
          </div>

          {/* Your Role */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                joinData.role === 'buyer' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {joinData.role === 'buyer' ? (
                  <Ship className="w-7 h-7 text-blue-600" />
                ) : (
                  <DollarSign className="w-7 h-7 text-green-600" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">You'll join as {roleLabel}</h3>
                <p className="text-slate-500 text-sm">
                  {joinData.role === 'buyer' 
                    ? 'Review the vessel and complete purchase documents'
                    : 'Complete your seller information and sign documents'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={acceptInvitation}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Join Transaction <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setJoinData(null);
                setCurrentView('welcome');
              }}
              className="w-full text-blue-300 hover:text-white font-medium py-3 transition-colors"
            >
              Start My Own Transaction Instead
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Completion Screen
  const CompletionScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">Transaction Complete!</h1>
        <p className="text-green-100 text-lg mb-8">
          Congratulations on closing your boat deal
        </p>
        
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-4">Transaction Summary</h3>
          <div className="space-y-3 text-green-50">
            <div className="flex justify-between">
              <span>Vessel</span>
              <span className="font-medium text-white">{vesselData.year} {vesselData.make} {vesselData.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Purchase Price</span>
              <span className="font-medium text-white">${parseInt(termsData.purchasePrice || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Documents Signed</span>
              <span className="font-medium text-white">{Object.keys(signedDocs).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="font-mono text-xs text-white">{transactionId}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              // Navigate to documents step
              const docsIndex = showPaywall ? (showEscrowStep ? 6 : 5) : (showEscrowStep ? 5 : 4);
              setCurrentView('steps');
              setCurrentStep(docsIndex);
            }}
            className="w-full bg-white text-green-600 font-semibold py-4 px-6 rounded-xl hover:bg-green-50 transition-colors"
          >
            View All Documents
          </button>
          <button
            onClick={startNewTransaction}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Start New Transaction
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  const renderCurrentView = () => {
    if (viewingDoc) return <><DocumentViewer />{renderMainContent()}</>;
    return renderMainContent();
  };

  const renderMainContent = () => {
    if (currentView === 'welcome') return <WelcomeScreen />;
    if (currentView === 'role') return <RoleSelection />;
    if (currentView === 'share') return <ShareScreen />;
    if (currentView === 'join') return <JoinScreen />;
    if (currentView === 'complete') return <CompletionScreen />;
    
    // Step-based views (currentView === 'steps' or any other value)
    // Steps order: Vessel(0), Parties(1), [Payment?], Terms, [Escrow?], Diligence, Documents
    
    if (showPaywall && showEscrowStep) {
      // Full config: Vessel, Parties, Payment, Terms, Escrow, Diligence, Documents
      switch(currentStep) {
        case 0: return <VesselStep />;
        case 1: return <PartiesStep />;
        case 2: return <PaymentStep />;
        case 3: return <TermsStep />;
        case 4: return <EscrowStep />;
        case 5: return <DiligenceStep />;
        case 6: return <DocumentsStep />;
        default: return <VesselStep />;
      }
    } else if (showPaywall) {
      // Paywall only: Vessel, Parties, Payment, Terms, Diligence, Documents
      switch(currentStep) {
        case 0: return <VesselStep />;
        case 1: return <PartiesStep />;
        case 2: return <PaymentStep />;
        case 3: return <TermsStep />;
        case 4: return <DiligenceStep />;
        case 5: return <DocumentsStep />;
        default: return <VesselStep />;
      }
    } else if (showEscrowStep) {
      // Escrow only: Vessel, Parties, Terms, Escrow, Diligence, Documents
      switch(currentStep) {
        case 0: return <VesselStep />;
        case 1: return <PartiesStep />;
        case 2: return <TermsStep />;
        case 3: return <EscrowStep />;
        case 4: return <DiligenceStep />;
        case 5: return <DocumentsStep />;
        default: return <VesselStep />;
      }
    } else {
      // Minimal: Vessel, Parties, Terms, Diligence, Documents
      switch(currentStep) {
        case 0: return <VesselStep />;
        case 1: return <PartiesStep />;
        case 2: return <TermsStep />;
        case 3: return <DiligenceStep />;
        case 4: return <DocumentsStep />;
        default: return <VesselStep />;
      }
    }
  };

  return renderCurrentView();
}
