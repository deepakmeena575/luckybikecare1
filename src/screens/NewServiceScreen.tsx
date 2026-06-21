import React, { useState, useEffect } from 'react';
import { DB } from '../db';
import { ServiceRecord, ServiceItem } from '../types';
import { calculateServiceBill, parseServiceDescription } from '../utils';
import { Save, Plus, Trash2, Calendar, FileText, CheckCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { BottomSheet } from '../components/BottomSheet';

const VEHICLE_MODELS = [
  "Hero Splendor Plus",
  "Hero HF Deluxe",
  "Hero Passion Pro",
  "Hero Super Splendor",
  "Hero Glamour",
  "Hero Xtreme 160R",
  "Hero Xpulse 200",
  "Hero Destini 125",
  "Hero Maestro Edge",
  "Hero Pleasure Plus",
  "Honda Activa 6G",
  "Honda Activa 125",
  "Honda Shine",
  "Honda SP 125",
  "Honda Dio",
  "Honda Unicorn",
  "Honda Livo",
  "Honda Hornet 2.0",
  "Bajaj Pulsar 150",
  "Bajaj Pulsar 125",
  "Bajaj Pulsar NS200",
  "Bajaj Platina 100",
  "Bajaj CT 100",
  "Bajaj Avenger Cruise 220",
  "Bajaj Dominar 400",
  "TVS Jupiter",
  "TVS Apache RTR 160",
  "TVS Apache RTR 160 4V",
  "TVS NTORQ 125",
  "TVS XL100",
  "TVS Radeon",
  "TVS Sport",
  "TVS Star City Plus",
  "Royal Enfield Classic 350",
  "Royal Enfield Bullet 350",
  "Royal Enfield Hunter 350",
  "Royal Enfield Meteor 350",
  "Royal Enfield Himalayan",
  "Royal Enfield Interceptor 650",
  "Yamaha FZ-FI",
  "Yamaha FZS-FI",
  "Yamaha R15 V4",
  "Yamaha MT-15",
  "Yamaha RayZR 125",
  "Yamaha Fascino 125",
  "Suzuki Access 125",
  "Suzuki Burgman Street",
  "Suzuki Avenis",
  "Suzuki Gixxer",
  "Suzuki Gixxer SF",
  "KTM Duke 200",
  "KTM Duke 390",
  "KTM RC 200",
  "KTM RC 390",
  "Ather 450X",
  "Ola S1 Pro"
];

interface NewServiceScreenProps {
  onSuccess?: () => void;
  editingRecord?: ServiceRecord | null;
  isReentry?: boolean;
  onViewInvoice?: (record: ServiceRecord) => void;
}

export const NewServiceScreen: React.FC<NewServiceScreenProps> = ({ onSuccess, editingRecord, isReentry = false, onViewInvoice }) => {
  const [record, setRecord] = useState({
    vehicleNumber: '',
    customerName: '',
    mobileNumber: '',
    vehicleModel: '',
    dateOfService: format(new Date(), 'yyyy-MM-dd'),
    kilometerReading: '',
    labourCost: '',
    cashPaid: '',
    onlinePaid: ''
  });

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [createdInvoice, setCreatedInvoice] = useState<ServiceRecord | null>(null);

  useEffect(() => {
    if (editingRecord) {
      if (isReentry) {
        setRecord({
          vehicleNumber: editingRecord.vehicleNumber,
          customerName: editingRecord.customerName,
          mobileNumber: editingRecord.mobileNumber,
          vehicleModel: editingRecord.vehicleModel,
          dateOfService: format(new Date(), 'yyyy-MM-dd'),
          kilometerReading: '',
          labourCost: '',
          cashPaid: '',
          onlinePaid: ''
        });
        setServiceItems([]);
      } else {
        setRecord({
          vehicleNumber: editingRecord.vehicleNumber,
          customerName: editingRecord.customerName,
          mobileNumber: editingRecord.mobileNumber,
          vehicleModel: editingRecord.vehicleModel,
          dateOfService: format(new Date(editingRecord.dateOfService), 'yyyy-MM-dd'),
          kilometerReading: editingRecord.kilometerReading.toString(),
          labourCost: editingRecord.labourCost.toString(),
          cashPaid: editingRecord.cashPaid.toString(),
          onlinePaid: editingRecord.onlinePaid.toString()
        });
        setServiceItems(parseServiceDescription(editingRecord.serviceDescription));
      }
    } else {
      resetForm();
    }
  }, [editingRecord, isReentry]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({ ...prev, [name]: value }));
  };

  const addServiceItem = () => {
    setServiceItems([
      ...serviceItems, 
      { id: Date.now().toString(), partName: '', partCost: 0, labourCost: 0, exchangeValue: 0 }
    ]);
  };

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: any) => {
    setServiceItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(items => items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const generalLabour = parseFloat(record.labourCost) || 0;
    const cash = parseFloat(record.cashPaid) || 0;
    const online = parseFloat(record.onlinePaid) || 0;

    const { finalServiceBill, dueAmount } = calculateServiceBill(
      generalLabour,
      serviceItems,
      cash,
      online
    );

    const newRecord = {
      vehicleNumber: record.vehicleNumber.toUpperCase(),
      customerName: record.customerName,
      mobileNumber: record.mobileNumber,
      vehicleModel: record.vehicleModel,
      dateOfService: record.dateOfService,
      kilometerReading: parseInt(record.kilometerReading) || 0,
      serviceDescription: serviceItems,
      labourCost: generalLabour,
      totalCost: finalServiceBill,
      cashPaid: cash,
      onlinePaid: online,
      dueAmount: dueAmount
    };

    try {
      let saved;
      if (editingRecord && !isReentry) {
        saved = await DB.updateRecord(editingRecord.id, newRecord);
      } else {
        saved = await DB.addRecord(newRecord);
      }
      setCreatedInvoice(saved);
    } catch (e: any) {
      console.error(e);
      alert('Failed to save to database: ' + (e.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setRecord({
      vehicleNumber: '',
      customerName: '',
      mobileNumber: '',
      vehicleModel: '',
      dateOfService: format(new Date(), 'yyyy-MM-dd'),
      kilometerReading: '',
      labourCost: '',
      cashPaid: '',
      onlinePaid: ''
    });
    setServiceItems([]);
    setCreatedInvoice(null);
  };

  // Safe totals for display
  const { finalServiceBill, dueAmount, totalPartLabour, totalExchangeValue } = calculateServiceBill(
    parseFloat(record.labourCost) || 0,
    serviceItems,
    parseFloat(record.cashPaid) || 0,
    parseFloat(record.onlinePaid) || 0
  );

  const totalPartsCostDisplay = serviceItems.reduce((acc, item) => acc + (parseFloat(item.partCost as any) || 0), 0);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      <div className="mb-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {editingRecord ? 'Edit Service Record' : 'New Service Record'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {editingRecord ? `Editing invoice #${editingRecord.id}` : 'Create a new customer service order'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* Customer Details */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Customer & Vehicle Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Vehicle Number" name="vehicleNumber" value={record.vehicleNumber} onChange={handleTextChange} required placeholder="e.g. MH 12 AB 1234" />
            <InputGroup label="Vehicle Model" name="vehicleModel" value={record.vehicleModel} onChange={handleTextChange} required placeholder="e.g. Honda Activa 6G" datalistOptions={VEHICLE_MODELS} />
            <InputGroup label="Customer Name" name="customerName" value={record.customerName} onChange={handleTextChange} required />
            <InputGroup label="Mobile Number" name="mobileNumber" value={record.mobileNumber} onChange={handleTextChange} type="tel" required />
            <InputGroup label="Date of Service" name="dateOfService" value={record.dateOfService} onChange={handleTextChange} type="date" required />
            <InputGroup label="Kilometer Reading" name="kilometerReading" value={record.kilometerReading} onChange={handleTextChange} type="number" required />
          </div>
        </div>

        {/* Service Items */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
             <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Parts & Services</h2>
             <button type="button" onClick={addServiceItem} className="flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition">
               <Plus size={16} /> <span>Add Item</span>
             </button>
          </div>

          <div className="space-y-4">
            {serviceItems.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No parts or services added yet.</p>
              </div>
            )}
            {serviceItems.map(item => (
              <div key={item.id} className="relative p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                <button type="button" onClick={() => removeServiceItem(item.id)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Part / Service Description</label>
                    <input type="text" required value={item.partName} onChange={(e) => updateServiceItem(item.id, 'partName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Part Cost</label>
                    <input type="number" min="0" step="0.01" value={item.partCost} onChange={(e) => updateServiceItem(item.id, 'partCost', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Labour for Part</label>
                    <input type="number" min="0" step="0.01" value={item.labourCost} onChange={(e) => updateServiceItem(item.id, 'labourCost', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1 text-amber-600">Old Part Exchange Value (Deductible)</label>
                    <input type="number" min="0" step="0.01" value={item.exchangeValue} onChange={(e) => updateServiceItem(item.id, 'exchangeValue', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Calculation & Payments */}
        <div className="glass-card overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Billing & Payment</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputGroup label="General Labour Charges" name="labourCost" value={record.labourCost} onChange={handleTextChange} type="number" min="0" />
              <div className="hidden md:block"></div>
              <InputGroup label="Cash Paid" name="cashPaid" value={record.cashPaid} onChange={handleTextChange} type="number" min="0" />
              <InputGroup label="Online Payment Data (UPI/Card)" name="onlinePaid" value={record.onlinePaid} onChange={handleTextChange} type="number" min="0" />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                <span>General Labour:</span>
                <span className="font-medium">₹{(parseFloat(record.labourCost) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                <span>Total Part Labour:</span>
                <span className="font-medium">+ ₹{totalPartLabour.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm text-gray-600 border-b border-gray-200 pb-2 mb-2">
                <span>Part Exchange Deduction:</span>
                <span className="font-medium text-emerald-600">- ₹{totalExchangeValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2">
                <span>Final Service Bill:</span>
                <span>₹{finalServiceBill.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                <span>Total Amount Paid:</span>
                <span className="font-medium">₹{((parseFloat(record.cashPaid) || 0) + (parseFloat(record.onlinePaid) || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 mt-1 text-lg font-bold text-rose-600">
                <span>Due Amount:</span>
                <span>₹{dueAmount.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-gray-400 text-center mt-3 pt-3 border-t border-gray-200">
                Note: Total parts material cost is ₹{totalPartsCostDisplay.toFixed(2)}. As per business rule, customer only pays service bill minus exchange value.
              </p>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl shadow-lg transition active:scale-95">
          <Save size={20} />
          <span>{editingRecord ? 'Update Service Record' : 'Save Service Record'}</span>
        </button>
      </form>

      {/* Success Bottom Sheet */}
      <BottomSheet isOpen={!!createdInvoice} onClose={() => { setCreatedInvoice(null); if(onSuccess) onSuccess(); }} title={editingRecord ? "Record Updated" : "Record Saved"}>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{editingRecord ? 'Service Updated Successfully!' : 'Service Logged Successfully!'}</h2>
          <p className="text-gray-500 mb-6">Invoice {createdInvoice?.id} {editingRecord ? 'updated' : 'generated'}.</p>
          
          <div className="w-full flex gap-3">
            {!editingRecord && (
              <button onClick={resetForm} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition">
                Create Another
              </button>
            )}
            {editingRecord && (
              <button onClick={() => { setCreatedInvoice(null); if(onSuccess) onSuccess(); }} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition">
                Back to Search
              </button>
            )}
            <button onClick={() => { if(createdInvoice && onViewInvoice) onViewInvoice(createdInvoice); }} className="flex-1 flex justify-center items-center space-x-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-sm hover:bg-primary-700 transition">
              <Receipt size={18} />
              <span>View Invoice</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

const InputGroup = ({ label, required = false, datalistOptions, ...props }: any) => {
  const listId = datalistOptions ? `${props.name}-datalist` : undefined;
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        {...props}
        list={listId}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition bg-gray-50 shadow-sm ${props.className || ''}`}
      />
      {datalistOptions && (
        <datalist id={listId}>
          {datalistOptions.map((option: string) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </div>
  );
};
