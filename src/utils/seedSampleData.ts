
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types/crm";
import { Task } from "@/types/task";
import { Proposal } from "@/types/proposal";
import { toast } from "sonner";

// Sample Customers for reference in opportunities and proposals
const sampleCustomers = [
  {
    id: "3a7f1e9b-8c4d-5a2e-9f6b-1d8c7e3b2a5f",
    name: "Ahmet Yılmaz",
    company: "AY Teknoloji Ltd. Şti.",
    email: "ahmet.yilmaz@example.com",
    mobile_phone: "0555 123 4567",
    type: "business",
    status: "active"
  },
  {
    id: "6b2e4d7c-9a5f-8e3b-1d6a-4c8b7e2d9a5f",
    name: "Mehmet Kaya",
    company: "Kaya İnşaat A.Ş.",
    email: "mehmet.kaya@example.com",
    mobile_phone: "0555 234 5678",
    type: "business",
    status: "active"
  },
  {
    id: "9c5d7e2a-1b6f-3d8e-5a4c-7b2d9a6f3e8c",
    name: "Ayşe Demir",
    company: "Demir Tekstil",
    email: "ayse.demir@example.com",
    mobile_phone: "0555 345 6789",
    type: "business",
    status: "active"
  },
  {
    id: "2d8e5a4c-7b3f-9d6e-1a2b-5c8d7e3a9f6b",
    name: "Fatma Çelik",
    company: "Çelik Mobilya",
    email: "fatma.celik@example.com",
    mobile_phone: "0555 456 7890",
    type: "business",
    status: "active"
  },
  {
    id: "5a4c8b3e-2d9f-7e6a-1b5c-8d3e9a7f2b6c",
    name: "Mustafa Şahin",
    company: "Şahin Otomotiv",
    email: "mustafa.sahin@example.com",
    mobile_phone: "0555 567 8901",
    type: "business",
    status: "active"
  }
];

// Sample Employees for reference in opportunities, proposals, and tasks
const sampleEmployees = [
  {
    id: "1e5a8c3b-7d2f-9e6a-4b3c-8d5a2e7f9b6c",
    first_name: "Ali",
    last_name: "Yıldız",
    position: "Satış Müdürü",
    email: "ali.yildiz@example.com",
    avatar_url: "/avatars/1.png",
    status: "aktif"
  },
  {
    id: "4b8c2d9e-5a3f-7b6c-1d8e-9a3c5b7d2f6e",
    first_name: "Zeynep",
    last_name: "Kara",
    position: "Satış Temsilcisi",
    email: "zeynep.kara@example.com",
    avatar_url: "/avatars/2.png",
    status: "aktif"
  },
  {
    id: "7d2e5a9c-1b6f-3d8e-5a7c-2b9d6f3e8a4c",
    first_name: "Okan",
    last_name: "Arslan",
    position: "Teknik Müdür",
    email: "okan.arslan@example.com",
    avatar_url: "/avatars/3.png",
    status: "aktif"
  }
];

// Sample Opportunities
const sampleOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Kurumsal Web Sitesi Yenileme",
    description: "Müşterinin mevcut web sitesinin tamamen yenilenmesi ve modern teknolojilerle yeniden tasarlanması.",
    status: "new",
    priority: "high",
    value: 35000,
    customer_id: sampleCustomers[0].id,
    employee_id: sampleEmployees[0].id,
    expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[0],
    employee: sampleEmployees[0],
    notes: "İlk görüşmede iyi izlenim bıraktık. Rakip teklifleri değerlendiriyorlar."
  },
  {
    id: "opp-2",
    title: "E-Ticaret Entegrasyonu",
    description: "Müşterinin mevcut sistemlerine e-ticaret altyapısının entegre edilmesi projesi.",
    status: "first_contact",
    priority: "medium",
    value: 50000,
    customer_id: sampleCustomers[1].id,
    employee_id: sampleEmployees[1].id,
    expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[1],
    employee: sampleEmployees[1],
    notes: "Müşteri ihtiyaçları belirlendi, çözüm önerileri hazırlanıyor."
  },
  {
    id: "opp-3",
    title: "Mobil Uygulama Geliştirme",
    description: "Müşteri için iOS ve Android platformlarında çalışacak mobil uygulama geliştirme projesi.",
    status: "site_visit",
    priority: "high",
    value: 75000,
    customer_id: sampleCustomers[2].id,
    employee_id: sampleEmployees[0].id,
    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[2],
    employee: sampleEmployees[0],
    notes: "Müşteri lokasyonunda keşif yapıldı, teknik detaylar görüşüldü."
  },
  {
    id: "opp-4",
    title: "CRM Sistem Entegrasyonu",
    description: "Müşterinin iş süreçlerini optimize etmek için CRM sisteminin kurulması ve entegrasyonu.",
    status: "preparing_proposal",
    priority: "medium",
    value: 45000,
    customer_id: sampleCustomers[3].id,
    employee_id: sampleEmployees[1].id,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[3],
    employee: sampleEmployees[1],
    notes: "Teklif detayları hazırlanıyor, fiyatlandırma çalışması yapılıyor."
  },
  {
    id: "opp-5",
    title: "Veri Merkezi Çözümleri",
    description: "Müşterinin veri depolama ve işleme ihtiyaçları için kapsamlı bir veri merkezi çözümü.",
    status: "proposal_sent",
    priority: "high",
    value: 120000,
    customer_id: sampleCustomers[4].id,
    employee_id: sampleEmployees[2].id,
    expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[4],
    employee: sampleEmployees[2],
    notes: "Teklif gönderildi, müşteriden geri dönüş bekleniyor."
  },
  {
    id: "opp-6",
    title: "Yazılım Lisanslama",
    description: "Kurumsal yazılım lisanslarının yenilenmesi ve ek lisans alımı.",
    status: "accepted",
    priority: "low",
    value: 25000,
    customer_id: sampleCustomers[0].id,
    employee_id: sampleEmployees[0].id,
    expected_close_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[0],
    employee: sampleEmployees[0],
    notes: "Teklif kabul edildi, sözleşme hazırlanıyor."
  },
  {
    id: "opp-7",
    title: "Güvenlik Sistemleri Yenileme",
    description: "Şirket bünyesindeki güvenlik sistemlerinin tamamen yenilenmesi projesi.",
    status: "lost",
    priority: "medium",
    value: 60000,
    customer_id: sampleCustomers[1].id,
    employee_id: sampleEmployees[1].id,
    expected_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_history: [],
    customer: sampleCustomers[1],
    employee: sampleEmployees[1],
    notes: "Müşteri farklı bir tedarikçiyle çalışmayı tercih etti."
  }
];

// Sample Proposals
const sampleProposals = [
  {
    id: "prop-1",
    title: "Web Sitesi Yenileme Teklifi",
    customer_id: sampleCustomers[0].id,
    opportunity_id: "opp-1",
    employee_id: sampleEmployees[0].id,
    status: "draft",
    total_value: 35000,
    sent_date: null,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1001,
    payment_terms: "30 gün içinde ödeme",
    delivery_terms: "Proje onayından itibaren 45 gün içinde teslim",
    notes: "Müşterinin özel istekleri dikkate alındı.",
    currency: "TRY",
    items: [
      { id: 1, name: "Web Tasarım", quantity: 1, price: 15000, total: 15000 },
      { id: 2, name: "Yazılım Geliştirme", quantity: 1, price: 20000, total: 20000 }
    ]
  },
  {
    id: "prop-2",
    title: "E-Ticaret Entegrasyon Teklifi",
    customer_id: sampleCustomers[1].id,
    opportunity_id: "opp-2",
    employee_id: sampleEmployees[1].id,
    status: "sent",
    total_value: 50000,
    sent_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1002,
    payment_terms: "50% peşin, 50% teslimde",
    delivery_terms: "60 gün içinde teslim",
    notes: "API entegrasyonları ayrıca ücretlendirilecektir.",
    currency: "TRY",
    items: [
      { id: 1, name: "E-Ticaret Yazılımı", quantity: 1, price: 30000, total: 30000 },
      { id: 2, name: "Entegrasyon Hizmetleri", quantity: 1, price: 15000, total: 15000 },
      { id: 3, name: "Eğitim", quantity: 1, price: 5000, total: 5000 }
    ]
  },
  {
    id: "prop-3",
    title: "Mobil Uygulama Geliştirme Teklifi",
    customer_id: sampleCustomers[2].id,
    opportunity_id: "opp-3",
    employee_id: sampleEmployees[0].id,
    status: "negotiation",
    total_value: 75000,
    sent_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1003,
    payment_terms: "3 eşit taksitte ödeme",
    delivery_terms: "90 gün içinde teslim",
    notes: "Android ve iOS platformları için ayrı uygulamalar geliştirilecektir.",
    currency: "TRY",
    items: [
      { id: 1, name: "iOS Uygulama", quantity: 1, price: 35000, total: 35000 },
      { id: 2, name: "Android Uygulama", quantity: 1, price: 35000, total: 35000 },
      { id: 3, name: "Backend Geliştirme", quantity: 1, price: 5000, total: 5000 }
    ]
  },
  {
    id: "prop-4",
    title: "CRM Sistemi Teklifi",
    customer_id: sampleCustomers[3].id,
    opportunity_id: "opp-4",
    employee_id: sampleEmployees[1].id,
    status: "accepted",
    total_value: 45000,
    sent_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1004,
    payment_terms: "40% peşin, 30% kurulum sonrası, 30% eğitim sonrası",
    delivery_terms: "45 gün içinde kurulum",
    notes: "1 yıllık ücretsiz destek dahildir.",
    currency: "TRY",
    items: [
      { id: 1, name: "CRM Yazılımı", quantity: 1, price: 30000, total: 30000 },
      { id: 2, name: "Kurulum ve Konfigürasyon", quantity: 1, price: 10000, total: 10000 },
      { id: 3, name: "Eğitim", quantity: 1, price: 5000, total: 5000 }
    ]
  },
  {
    id: "prop-5",
    title: "Veri Merkezi Çözümleri Teklifi",
    customer_id: sampleCustomers[4].id,
    opportunity_id: "opp-5",
    employee_id: sampleEmployees[2].id,
    status: "rejected",
    total_value: 120000,
    sent_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1005,
    payment_terms: "30% peşin, 70% kurulum sonrası",
    delivery_terms: "120 gün içinde kurulum",
    notes: "Donanım ve yazılım lisansları dahildir.",
    currency: "TRY",
    items: [
      { id: 1, name: "Sunucular", quantity: 3, price: 25000, total: 75000 },
      { id: 2, name: "Depolama Üniteleri", quantity: 2, price: 15000, total: 30000 },
      { id: 3, name: "Ağ Ekipmanları", quantity: 1, price: 10000, total: 10000 },
      { id: 4, name: "Kurulum ve Konfigürasyon", quantity: 1, price: 5000, total: 5000 }
    ]
  }
];

// Sample Tasks
const sampleTasks = [
  {
    id: "task-1",
    title: "Müşteri ile İlk Görüşme",
    description: "Web sitesi yenileme projesi için müşteri ile ilk toplantı.",
    status: "todo",
    priority: "high",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[0].id,
    related_item_id: "opp-1",
    related_item_type: "opportunity",
    related_item_title: "Kurumsal Web Sitesi Yenileme",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-2",
    title: "E-Ticaret Gereksinimleri Analizi",
    description: "Müşterinin e-ticaret entegrasyonu için gereksinimlerin detaylı analizi.",
    status: "in_progress",
    priority: "medium",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[1].id,
    related_item_id: "opp-2",
    related_item_type: "opportunity",
    related_item_title: "E-Ticaret Entegrasyonu",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-3",
    title: "Teklif Hazırlama - Mobil Uygulama",
    description: "Mobil uygulama geliştirme projesi için kapsamlı teklif hazırlama.",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[0].id,
    related_item_id: "opp-3",
    related_item_type: "opportunity",
    related_item_title: "Mobil Uygulama Geliştirme",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-4",
    title: "CRM Demo Hazırlığı",
    description: "Müşteriye yapılacak CRM sistemi demosunun hazırlanması.",
    status: "completed",
    priority: "medium",
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[1].id,
    related_item_id: "opp-4",
    related_item_type: "opportunity",
    related_item_title: "CRM Sistem Entegrasyonu",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-5",
    title: "Veri Merkezi Keşfi",
    description: "Müşteri lokasyonunda veri merkezi kurulumu için keşif yapılması.",
    status: "todo",
    priority: "high",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[2].id,
    related_item_id: "opp-5",
    related_item_type: "opportunity",
    related_item_title: "Veri Merkezi Çözümleri",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-6",
    title: "Sözleşme Hazırlama - Yazılım Lisanslama",
    description: "Yazılım lisanslama anlaşması için sözleşme hazırlanması.",
    status: "todo",
    priority: "medium",
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[0].id,
    related_item_id: "opp-6",
    related_item_type: "opportunity",
    related_item_title: "Yazılım Lisanslama",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-7",
    title: "Kaybedilen Fırsat Analizi",
    description: "Kaybedilen güvenlik sistemleri yenileme projesinin analizi.",
    status: "postponed",
    priority: "low",
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: sampleEmployees[1].id,
    related_item_id: "opp-7",
    related_item_type: "opportunity",
    related_item_title: "Güvenlik Sistemleri Yenileme",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Function to seed customers
const seedCustomers = async () => {
  try {
    const { data: existingCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('id');
    
    if (fetchError) throw fetchError;
    
    // Only insert customers if none exist
    if (existingCustomers.length === 0) {
      const { data, error } = await supabase
        .from('customers')
        .insert(sampleCustomers)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      console.log("Customers already exist, skipping seed");
      return existingCustomers;
    }
  } catch (error) {
    console.error("Error seeding customers:", error);
    return null;
  }
};

// Function to seed employees
const seedEmployees = async () => {
  try {
    const { data: existingEmployees, error: fetchError } = await supabase
      .from('employees')
      .select('id');
    
    if (fetchError) throw fetchError;
    
    // Only insert employees if none exist
    if (existingEmployees.length === 0) {
      const { data, error } = await supabase
        .from('employees')
        .insert(sampleEmployees)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      console.log("Employees already exist, skipping seed");
      return existingEmployees;
    }
  } catch (error) {
    console.error("Error seeding employees:", error);
    return null;
  }
};

// Function to seed opportunities
export const seedOpportunities = async () => {
  try {
    // Check if opportunities already exist
    const { data: existingOpportunities, error: fetchError } = await supabase
      .from('opportunities')
      .select('id')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (existingOpportunities && existingOpportunities.length > 0) {
      console.log("Opportunities already exist, skipping seed");
      toast.info("Fırsatlar zaten mevcut, örnek veriler eklenmedi.");
      return;
    }
    
    // Ensure customers and employees exist
    await seedCustomers();
    await seedEmployees();
    
    // Prepare opportunities for insertion
    // Remove customer and employee objects from opportunities before inserting
    const opportunitiesForInsert = sampleOpportunities.map(opp => {
      const { customer, employee, ...opportunityData } = opp;
      return {
        ...opportunityData,
        contact_history: JSON.stringify(opportunityData.contact_history)
      };
    });
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunitiesForInsert)
      .select();
    
    if (error) throw error;
    
    toast.success("Örnek fırsatlar başarıyla eklendi!");
    return data;
  } catch (error) {
    console.error("Error seeding opportunities:", error);
    toast.error("Örnek fırsatlar eklenirken bir hata oluştu.");
    return null;
  }
};

// Function to seed proposals
export const seedProposals = async () => {
  try {
    // Check if proposals already exist
    const { data: existingProposals, error: fetchError } = await supabase
      .from('proposals')
      .select('id')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (existingProposals && existingProposals.length > 0) {
      console.log("Proposals already exist, skipping seed");
      toast.info("Teklifler zaten mevcut, örnek veriler eklenmedi.");
      return;
    }
    
    // Ensure customers and employees exist
    await seedCustomers();
    await seedEmployees();
    
    // Prepare proposals for insertion
    const proposalsForInsert = sampleProposals.map(proposal => ({
      ...proposal,
      items: JSON.stringify(proposal.items),
      attachments: JSON.stringify([])
    }));
    
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposalsForInsert)
      .select();
    
    if (error) throw error;
    
    toast.success("Örnek teklifler başarıyla eklendi!");
    return data;
  } catch (error) {
    console.error("Error seeding proposals:", error);
    toast.error("Örnek teklifler eklenirken bir hata oluştu.");
    return null;
  }
};

// Function to seed tasks
export const seedTasks = async () => {
  try {
    // Check if tasks already exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (existingTasks && existingTasks.length > 0) {
      console.log("Tasks already exist, skipping seed");
      toast.info("Görevler zaten mevcut, örnek veriler eklenmedi.");
      return;
    }
    
    // Ensure employees exist
    await seedEmployees();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(sampleTasks)
      .select();
    
    if (error) throw error;
    
    toast.success("Örnek görevler başarıyla eklendi!");
    return data;
  } catch (error) {
    console.error("Error seeding tasks:", error);
    toast.error("Örnek görevler eklenirken bir hata oluştu.");
    return null;
  }
};

// Function to seed all data
export const seedAllData = async () => {
  const opportunitiesResult = await seedOpportunities();
  const proposalsResult = await seedProposals();
  const tasksResult = await seedTasks();
  
  if (opportunitiesResult && proposalsResult && tasksResult) {
    toast.success("Tüm örnek veriler başarıyla eklendi!");
    return true;
  } else {
    return false;
  }
};

export default {
  seedOpportunities,
  seedProposals,
  seedTasks,
  seedAllData
};
