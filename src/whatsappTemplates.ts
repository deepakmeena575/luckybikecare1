import { ServiceRecord } from './types';
import { format } from 'date-fns';
import { formatCurrency, parseIsoDateOnly } from './utils';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://luckybikecare.com';
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
  const dateFormatted = format(parseIsoDateOnly(record.dateOfService), 'dd MMM yyyy');
  const nextDateFormatted = format(parseIsoDateOnly(record.nextServiceDate), 'dd MMM yyyy');
  
  switch(template) {
    case 'invoice': {
      const invoiceUrl = getPublicInvoiceUrl(record.vehicleNumber, record.mobileNumber, record.id);
      return `Hello ${record.customerName},

Thank you for choosing ${customShopName}. Your vehicle service has been completed successfully.

Vehicle Number: ${record.vehicleNumber}
Invoice Number: ${record.id}
Service Date: ${dateFormatted}
Total Amount: ${formatCurrency(record.totalCost)}${record.dueAmount > 0 ? `\nDue Amount: ${formatCurrency(record.dueAmount)}` : ''}

View your digital invoice here:
${invoiceUrl}

Thank you for your trust!

${customShopName}
Contact: ${shopMobileNumber}`;
    }

    case 'payment_due':
      return `Hello ${record.customerName},

This is a gentle reminder regarding your pending payment at ${customShopName}.

Vehicle Number: ${record.vehicleNumber}
Invoice Number: ${record.id}
Invoice Date: ${dateFormatted}
Pending Due Amount: ${formatCurrency(record.dueAmount)}

Please clear the dues at your earliest convenience. Let us know if you have already paid.

Thank you!
${customShopName}
Contact: ${shopMobileNumber}`;

    case 'reminder':
      return `Hello ${record.customerName},

This is a friendly service reminder from ${customShopName}.

Your vehicle *${record.vehicleNumber}* is due for its scheduled maintenance service.

*Last Service Date:* ${dateFormatted}
*Next Service Due Date:* ${nextDateFormatted}

Regular servicing ensures optimal performance and safety for your ride. We look forward to serving you!

Thank you for choosing ${customShopName}.

📞 Contact: ${shopMobileNumber}`;

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

export const generateServiceReminderWhatsAppText = (
  reminder: { customerName: string; vehicleNumber: string; lastServiceDate: string; nextServiceDueDate: string },
  customShopName = "Lucky Bike Care",
  shopMobileNumber = "9414377153"
) => {
  const lastDateFormatted = format(parseIsoDateOnly(reminder.lastServiceDate), 'dd MMM yyyy');
  const nextDateFormatted = format(parseIsoDateOnly(reminder.nextServiceDueDate), 'dd MMM yyyy');

  return `Hello ${reminder.customerName},

This is a friendly service reminder from ${customShopName}.

Your vehicle *${reminder.vehicleNumber}* is due for its scheduled maintenance service.

*Last Service Date:* ${lastDateFormatted}
*Next Service Due Date:* ${nextDateFormatted}

Regular servicing keeps your bike running reliably, safely, and smoothly. We recommend bringing your vehicle in for servicing soon.

Thank you for choosing ${customShopName}!

📞 Contact: ${shopMobileNumber}`;
};

