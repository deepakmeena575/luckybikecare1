import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mepjeemilcxbuptfxoje.supabase.co';
const supabaseAnonKey = 'sb_publishable_ezRQMClDBoJT8q74mi3_Dg_TH8HqAmS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('service_records').select('*').limit(1);
  console.log('Select error:', error);
  console.log('Select data:', data);

  const { error: insertError } = await supabase.from('service_records').insert([{
    id: 'TEST-1234',
    timestamp: new Date().toISOString(),
    vehicleNumber: 'TEST',
    vehicleModel: 'TEST',
    customerName: 'TEST',
    mobileNumber: 'TEST',
    kilometerReading: 0,
    dateOfService: '2024-01-01',
    serviceDescription: [],
    labourCost: 0,
    totalCost: 0,
    cashPaid: 0,
    onlinePaid: 0,
    dueAmount: 0,
    nextServiceDate: '2024-01-01',
    serviceCounter: 1
  }]);
  console.log('Insert error:', insertError);
}

test();
