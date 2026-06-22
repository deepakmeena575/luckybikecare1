import { ServiceRecord } from './types';
import { format } from 'date-fns';
import { formatCurrency } from './utils';

export const getBaseUrl = () => {
  return window.location.origin;
};

export const getPublicInvoiceUrl = (vehicleNumber: string, mobileNumber: string) => {
  const url = new URL(getBaseUrl());
  url.searchParams.set('portal', 'true');
  url.searchParams.set('v', encodeURIComponent(vehicleNumber));
  url.searchParams.set('m', encodeURIComponent(mobileNumber));
  return url.toString();
};

export type WhatsAppTemplate = 'invoice' | 'reminder' | 'payment_due' | 'ready' | 'thank_you';

export const generateWhatsAppText = (record: ServiceRecord, template: WhatsAppTemplate, customShopName = "Lucky Bike Care") => {
  const dateFormatted = format(new Date(record.dateOfService), 'dd MMM yyyy');
  const nextDateFormatted = format(new Date(record.nextServiceDate), 'dd MMM yyyy');
  const invoiceLink = getPublicInvoiceUrl(record.vehicleNumber, record.mobileNumber);
  
  switch(template) {
    case 'invoice':
      return `Hello ${record.customerName},

Your vehicle service has been completed successfully.

*Vehicle Number:* ${record.vehicleNumber}
*Invoice Number:* ${record.id}
*Service Date:* ${dateFormatted}
*Total Amount:* ${formatCurrency(record.totalCost)}${record.dueAmount > 0 ? `\n*Due Amount:* ${formatCurrency(record.dueAmount)}` : ''}

*View Invoice & Full History:*
${invoiceLink}

*Next Service Due:*
${nextDateFormatted} or at ${record.kilometerReading + 2500} kms.

Thank you for choosing ${customShopName}.`;

    case 'payment_due':
      return `Hello ${record.customerName},

This is a gentle reminder regarding your pending payment at ${customShopName}.

*Vehicle Number:* ${record.vehicleNumber}
*Invoice Date:* ${dateFormatted}
*Pending Due Amount:* ${formatCurrency(record.dueAmount)}

*View Invoice:*
${invoiceLink}

Please clear the dues at your earliest convenience. Let us know if you have already paid.

Thank you!`;

    case 'reminder':
      return `Hello ${record.customerName},

It's time to pamper your ride! 🏍️
Your next service for *${record.vehicleNumber}* is due on *${nextDateFormatted}*.

Regular servicing keeps your vehicle in top condition and prevents major repairs.

*View your past service history here:*
${invoiceLink}

Visit us at ${customShopName} soon!`;

    case 'ready':
      return `Hello ${record.customerName},

Good news! Your vehicle *${record.vehicleNumber}* is fully serviced and ready for pickup.

*Total Amount:* ${formatCurrency(record.totalCost)}

*View Invoice:*
${invoiceLink}

See you soon at ${customShopName}!`;

    case 'thank_you':
      return `Hello ${record.customerName},

Thank you for visiting ${customShopName}! We hope you had a great experience servicing your vehicle *${record.vehicleNumber}* with us.

If you have any feedback or face any issues, feel free to reach out.

*Access your service digital portal anytime:*
${invoiceLink}

Have a safe ride!`;

    default:
      return '';
  }
};
