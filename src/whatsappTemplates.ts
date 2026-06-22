import { ServiceRecord } from './types';
import { format } from 'date-fns';
import { formatCurrency } from './utils';

export const getBaseUrl = () => {
  return window.location.origin;
};

export const getPublicInvoiceUrl = (vehicleNumber: string, mobileNumber: string, invoiceId?: string) => {
  const url = new URL(getBaseUrl());
  if (invoiceId) {
    url.pathname = `/invoice/${encodeURIComponent(invoiceId)}`;
  } else {
    url.searchParams.set('portal', 'true');
    url.searchParams.set('v', encodeURIComponent(vehicleNumber));
    url.searchParams.set('m', encodeURIComponent(mobileNumber));
  }
  return url.toString();
};

export type WhatsAppTemplate = 'invoice' | 'reminder' | 'payment_due' | 'ready' | 'thank_you';

export const generateWhatsAppText = (record: ServiceRecord, template: WhatsAppTemplate, customShopName = "Lucky Bike Care", shopMobileNumber = "9414377153") => {
  const dateFormatted = format(new Date(record.dateOfService), 'dd MMM yyyy');
  const nextDateFormatted = format(new Date(record.nextServiceDate), 'dd MMM yyyy');
  
  switch(template) {
    case 'invoice':
      return `Hello ${record.customerName},

Thank you for choosing ${customShopName}.

Your vehicle service has been completed successfully.

Vehicle Number: ${record.vehicleNumber}
Invoice Number: ${record.id}
Service Date: ${dateFormatted}
Total Amount: ${formatCurrency(record.totalCost)}${record.dueAmount > 0 ? `\nDue Amount: ${formatCurrency(record.dueAmount)}` : ''}

Next Recommended Service:
${nextDateFormatted} or at ${Number(record.kilometerReading || 0) + 2500} kms.

Thank you for your trust.

${customShopName}
Contact: ${shopMobileNumber}`;

    case 'payment_due':
      return `Hello ${record.customerName},

This is a gentle reminder regarding your pending payment at ${customShopName}.

*Vehicle Number:* ${record.vehicleNumber}
*Invoice Date:* ${dateFormatted}
*Pending Due Amount:* ${formatCurrency(record.dueAmount)}

Please refer to your PDF invoice for details. Clear the dues at your earliest convenience. Let us know if you have already paid.

Thank you!
Contact: ${shopMobileNumber}`;

    case 'reminder':
      return `Hello ${record.customerName},

It's time to pamper your ride! 🏍️
Your next service for *${record.vehicleNumber}* is due on *${nextDateFormatted}*.

Regular servicing keeps your vehicle in top condition and prevents major repairs.

Visit us at ${customShopName} soon!
Contact: ${shopMobileNumber}`;

    case 'ready':
      return `Hello ${record.customerName},

Good news! Your vehicle *${record.vehicleNumber}* is fully serviced and ready for pickup.

*Total Amount:* ${formatCurrency(record.totalCost)}

See you soon at ${customShopName}!
Contact: ${shopMobileNumber}`;

    case 'thank_you':
      return `Hello ${record.customerName},

Thank you for visiting ${customShopName}! We hope you had a great experience servicing your vehicle *${record.vehicleNumber}* with us.

If you have any feedback or face any issues, feel free to reach out.

Have a safe ride!
Contact: ${shopMobileNumber}`;

    default:
      return '';
  }
};
