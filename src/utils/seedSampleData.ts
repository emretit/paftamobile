
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Seed sample tasks
export const seedTasks = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sampleTasks = [
      {
        id: uuidv4(),
        title: 'Müşteri görüşmesi',
        description: 'ABC Şirketi ile ürün demo görüşmesi',
        status: 'todo',
        priority: 'high',
        type: 'meeting',
        due_date: tomorrow.toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Teklif hazırlama',
        description: 'XYZ Firması için yazılım teklifi hazırlanacak',
        status: 'in_progress',
        priority: 'medium',
        type: 'proposal',
        due_date: nextWeek.toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Takip araması',
        description: 'Geçen hafta görüşülen müşterileri ara',
        status: 'todo',
        priority: 'medium',
        type: 'call',
        due_date: tomorrow.toISOString(),
      },
      {
        id: uuidv4(),
        title: 'E-posta yanıtla',
        description: 'Gelen bilgi taleplerine yanıt ver',
        status: 'todo',
        priority: 'low',
        type: 'email',
        due_date: today.toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Proje planı güncelleme',
        description: 'Yazılım geliştirme projesi takvimi güncellenecek',
        status: 'in_progress',
        priority: 'medium',
        type: 'general',
        due_date: nextWeek.toISOString(),
      }
    ];

    const { error } = await supabase
      .from('tasks')
      .insert(sampleTasks);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error seeding tasks:', error);
    return { success: false, error };
  }
};

// Seed sample opportunities
export const seedOpportunities = async () => {
  try {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // First, get a customer to reference
    let { data: customers } = await supabase
      .from('customers')
      .select('id')
      .limit(3);
    
    // If no customers exist, create some
    if (!customers || customers.length === 0) {
      const sampleCustomers = [
        {
          id: uuidv4(),
          name: 'ABC Teknoloji A.Ş.',
          company: 'ABC Teknoloji',
          email: 'info@abcteknoloji.com',
          mobile_phone: '5321234567',
          type: 'kurumsal',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          name: 'XYZ Sanayi Ltd. Şti.',
          company: 'XYZ Sanayi',
          email: 'info@xyzsanayi.com',
          mobile_phone: '5331234567',
          type: 'kurumsal',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          name: 'Mehmet Yılmaz',
          company: 'Yılmaz Danışmanlık',
          email: 'mehmet@yilmazdanismanlik.com',
          mobile_phone: '5351234567',
          type: 'bireysel',
          status: 'potansiyel'
        }
      ];
      
      await supabase.from('customers').insert(sampleCustomers);
      customers = sampleCustomers;
    }
    
    // Get employees
    let { data: employees } = await supabase
      .from('employees')
      .select('id')
      .limit(2);
    
    // If no employees exist, create some
    if (!employees || employees.length === 0) {
      const sampleEmployees = [
        {
          id: uuidv4(),
          first_name: 'Ali',
          last_name: 'Yılmaz',
          email: 'ali.yilmaz@sirket.com',
          phone: '5301234567',
          position: 'Satış Uzmanı',
          department: 'Satış',
          hire_date: '2022-01-15',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          first_name: 'Ayşe',
          last_name: 'Kaya',
          email: 'ayse.kaya@sirket.com',
          phone: '5311234567',
          position: 'Satış Müdürü',
          department: 'Satış',
          hire_date: '2020-03-10',
          status: 'aktif'
        }
      ];
      
      await supabase.from('employees').insert(sampleEmployees);
      employees = sampleEmployees;
    }
    
    const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const priorities = ['low', 'medium', 'high'];
    
    const sampleOpportunities = [];
    
    for (let i = 0; i < 5; i++) {
      const customerId = customers[Math.floor(Math.random() * customers.length)].id;
      const employeeId = employees[Math.floor(Math.random() * employees.length)].id;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      sampleOpportunities.push({
        id: uuidv4(),
        title: `Fırsat #${i + 1} - ${status === 'new' ? 'Yeni Fırsat' : status === 'contacted' ? 'İletişim Kuruldu' : status === 'qualified' ? 'Nitelikli' : status === 'proposal' ? 'Teklif Aşaması' : status === 'negotiation' ? 'Müzakere' : status === 'closed_won' ? 'Kazanıldı' : 'Kaybedildi'}`,
        description: `Bu bir örnek ${status} durumundaki fırsattır.`,
        customer_id: customerId,
        employee_id: employeeId,
        status: status,
        priority: priority,
        value: Math.floor(Math.random() * 50000) + 5000,
        expected_close_date: nextMonth.toISOString(),
        currency: 'TRY'
      });
    }
    
    const { error } = await supabase
      .from('opportunities')
      .insert(sampleOpportunities);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error seeding opportunities:', error);
    return { success: false, error };
  }
};

// Seed sample proposals
export const seedProposals = async () => {
  try {
    // First, get a customer to reference
    let { data: customers } = await supabase
      .from('customers')
      .select('id')
      .limit(3);
    
    // If no customers exist, return error
    if (!customers || customers.length === 0) {
      return { success: false, error: 'No customers found. Please seed customers first.' };
    }
    
    // Get employees
    let { data: employees } = await supabase
      .from('employees')
      .select('id')
      .limit(2);
    
    // If no employees exist, return error
    if (!employees || employees.length === 0) {
      return { success: false, error: 'No employees found. Please seed employees first.' };
    }
    
    // Get opportunities
    let { data: opportunities } = await supabase
      .from('opportunities')
      .select('id')
      .limit(3);
    
    // If no opportunities exist, return error
    if (!opportunities || opportunities.length === 0) {
      return { success: false, error: 'No opportunities found. Please seed opportunities first.' };
    }
    
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const statuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];
    
    const sampleProposals = [];
    
    for (let i = 0; i < 5; i++) {
      const customerId = customers[Math.floor(Math.random() * customers.length)].id;
      const employeeId = employees[Math.floor(Math.random() * employees.length)].id;
      const opportunityId = opportunities[Math.floor(Math.random() * opportunities.length)].id;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const totalAmount = Math.floor(Math.random() * 50000) + 5000;
      
      sampleProposals.push({
        id: uuidv4(),
        number: `TEK-${2023}${i + 1}`,
        title: `Teklif #${i + 1} - ${status === 'draft' ? 'Taslak' : status === 'sent' ? 'Gönderildi' : status === 'viewed' ? 'Görüntülendi' : status === 'accepted' ? 'Kabul Edildi' : status === 'rejected' ? 'Reddedildi' : 'Süresi Doldu'}`,
        description: `Bu bir örnek ${status} durumundaki tekliftir.`,
        customer_id: customerId,
        opportunity_id: opportunityId,
        employee_id: employeeId,
        status: status,
        total_amount: totalAmount,
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
        valid_until: nextMonth.toISOString(),
        items: JSON.stringify([
          {
            id: uuidv4(),
            name: "Yazılım Geliştirme",
            description: "Web uygulaması geliştirme hizmeti",
            quantity: 1,
            unit_price: totalAmount * 0.7,
            total_price: totalAmount * 0.7
          },
          {
            id: uuidv4(),
            name: "Danışmanlık",
            description: "Teknik danışmanlık hizmeti",
            quantity: 10,
            unit_price: totalAmount * 0.3 / 10,
            total_price: totalAmount * 0.3
          }
        ]),
        attachments: JSON.stringify([]),
        terms: "30 gün ödeme vadesi",
        notes: "Bu bir örnek tekliftir.",
        currency: "TRY"
      });
    }
    
    const { error } = await supabase
      .from('proposals')
      .insert(sampleProposals);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error seeding proposals:', error);
    return { success: false, error };
  }
};

// Seed all sample data
export const seedAllData = async () => {
  try {
    // Seed customers if needed
    let { data: customerCount } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });
    
    if (!customerCount) {
      const sampleCustomers = [
        {
          id: uuidv4(),
          name: 'ABC Teknoloji A.Ş.',
          company: 'ABC Teknoloji',
          email: 'info@abcteknoloji.com',
          mobile_phone: '5321234567',
          type: 'kurumsal',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          name: 'XYZ Sanayi Ltd. Şti.',
          company: 'XYZ Sanayi',
          email: 'info@xyzsanayi.com',
          mobile_phone: '5331234567',
          type: 'kurumsal',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          name: 'Mehmet Yılmaz',
          company: 'Yılmaz Danışmanlık',
          email: 'mehmet@yilmazdanismanlik.com',
          mobile_phone: '5351234567',
          type: 'bireysel',
          status: 'potansiyel'
        }
      ];
      
      await supabase.from('customers').insert(sampleCustomers);
    }
    
    // Seed employees if needed
    let { data: employeeCount } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true });
    
    if (!employeeCount) {
      const sampleEmployees = [
        {
          id: uuidv4(),
          first_name: 'Ali',
          last_name: 'Yılmaz',
          email: 'ali.yilmaz@sirket.com',
          phone: '5301234567',
          position: 'Satış Uzmanı',
          department: 'Satış',
          hire_date: '2022-01-15',
          status: 'aktif'
        },
        {
          id: uuidv4(),
          first_name: 'Ayşe',
          last_name: 'Kaya',
          email: 'ayse.kaya@sirket.com',
          phone: '5311234567',
          position: 'Satış Müdürü',
          department: 'Satış',
          hire_date: '2020-03-10',
          status: 'aktif'
        }
      ];
      
      await supabase.from('employees').insert(sampleEmployees);
    }
    
    // Seed tasks
    await seedTasks();
    
    // Seed opportunities
    await seedOpportunities();
    
    // Seed proposals
    await seedProposals();
    
    return { success: true };
  } catch (error) {
    console.error('Error seeding all data:', error);
    return { success: false, error };
  }
};
