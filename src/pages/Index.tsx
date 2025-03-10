
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  ArrowRight, 
  Shield, 
  MessageSquare, 
  Smartphone, 
  BarChart3,
  Globe,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

interface IndexProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Index = ({ isCollapsed, setIsCollapsed }: IndexProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    navigate("/auth");
  };

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this email to your backend
    alert(`Demo talebi alındı: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/80 via-white/0 to-white/0"></div>
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">
                  <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                  <span>Yeni Sürüm: v2.0</span>
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">CRM & ERP Çözümünüzle</span>
                  <span className="block text-blue-600">İşinizi Daha Verimli Yönetin</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-3xl">
                  Tüm iş süreçlerinizi tek bir platformda yönetin ve büyümeye odaklanın.
                  Satış, müşteri ilişkileri, envanter ve finans süreçlerinizi kolayca takip edin.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={handleSignUp} className="w-full sm:w-auto">
                    Ücretsiz Dene
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleDemoRequest} className="w-full sm:w-auto">
                    Demo Talep Et
                  </Button>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">14 gün ücretsiz deneme, kredi kartı gerekmez</span>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Güçlü Özellikleriyle Öne Çıkan Platform
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Modern işletmenizin ihtiyaç duyduğu tüm temel özellikler tek bir çözümde.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Showcase */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Kullanışlı Arayüzümüzü Keşfedin
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Modern ve kullanıcı dostu tasarımımız ile işlerinizi kolayca yönetin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <img src={screenshot.image} alt={screenshot.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{screenshot.title}</h3>
                    <p className="mt-2 text-gray-600">{screenshot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                İşletmenize Uygun Fiyatlandırma
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Her ölçekteki işletme için uygun fiyatlandırma seçenekleri sunuyoruz.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`border ${plan.featured ? 'border-blue-200 shadow-lg ring-1 ring-blue-200' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      {plan.featured && (
                        <Badge variant="secondary" className="px-3 py-1">
                          Popüler
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 ml-2">/ ay</span>
                    </div>
                    <CardDescription className="mt-4">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="ml-3 text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={plan.featured ? "default" : "outline"} 
                      className="w-full"
                      onClick={handleSignUp}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Müşterilerimiz Ne Diyor?
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Platformumuz ile iş süreçlerini nasıl geliştirdiklerini keşfedin.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-xs text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Sıkça Sorulan Sorular
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Platformumuz hakkında en çok merak edilenler.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-xl">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Hemen Başlayın
                </h2>
                <p className="mt-4 text-lg text-blue-100 max-w-3xl">
                  14 gün ücretsiz deneyin, kredi kartı gerekmez. İşletmenizin ihtiyaçlarını karşıladığımızdan emin olun.
                </p>
                <div className="mt-8">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={handleSignUp}
                  >
                    Ücretsiz Hesap Oluştur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <form onSubmit={handleDemoRequest} className="sm:flex lg:justify-end">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md border-0 px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                      placeholder="E-posta adresiniz"
                      required
                    />
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                      Demo İsteyin
                    </Button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-blue-100">
                  Kişisel verilerinizi gizlilik politikamıza uygun olarak işliyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Ürün</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Özellikler</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Fiyatlandırma</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Entegrasyonlar</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Şirket</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Hakkımızda</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Kariyer</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">İletişim</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Kaynaklar</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Dokümantasyon</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Destek</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Bizi Takip Edin</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-8">
              <p className="text-sm text-gray-400 text-center">&copy; 2023 NGS Platform. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Core Features Data
const coreFeatures = [
  {
    title: "Kolay Kullanım",
    description: "Sezgisel arayüz ile tüm ekibiniz hızlıca adapte olabilir, eğitim gerektirmez.",
    icon: <Zap className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Esnek Raporlama",
    description: "Özelleştirilebilir raporlar ve grafiklerle verilerinizi anlamlı bilgilere dönüştürün.",
    icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Entegrasyonlar",
    description: "Mevcut araçlarınızla sorunsuz entegrasyon, iş akışlarınızı kesintisiz hale getirin.",
    icon: <Globe className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Mobil Uyumlu",
    description: "Hareket halindeyken bile işlerinizi yönetin, her cihazdan erişim sağlayın.",
    icon: <Smartphone className="h-6 w-6 text-blue-600" />,
  },
];

// Screenshots Data
const screenshots = [
  {
    title: "Satış Yönetimi",
    description: "Fırsatları takip edin, teklifler oluşturun ve satış süreçlerinizi optimize edin.",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    title: "Envanter Takibi",
    description: "Stok seviyelerinizi gerçek zamanlı izleyin, otomatik sipariş noktaları belirleyin.",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
  },
  {
    title: "Finansal Analiz",
    description: "Gelir-gider takibi yapın, nakit akışınızı planlayın ve finansal performansınızı analiz edin.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
  },
];

// Pricing Plans Data
const pricingPlans = [
  {
    name: "Starter",
    price: "₺299",
    description: "Küçük işletmeler ve yeni başlayanlar için ideal.",
    features: [
      "5 kullanıcıya kadar",
      "Temel CRM özellikleri",
      "Müşteri yönetimi",
      "Basit raporlama",
      "E-posta desteği"
    ],
    buttonText: "Ücretsiz Deneyin",
    featured: false
  },
  {
    name: "Business",
    price: "₺599",
    description: "Büyüyen işletmeler için kapsamlı özellikler.",
    features: [
      "20 kullanıcıya kadar",
      "Gelişmiş CRM özellikleri",
      "Envanter yönetimi",
      "Finansal raporlama",
      "Öncelikli destek",
      "API erişimi"
    ],
    buttonText: "Ücretsiz Deneyin",
    featured: true
  },
  {
    name: "Enterprise",
    price: "₺999",
    description: "Büyük ölçekli işletmeler için özel çözümler.",
    features: [
      "Sınırsız kullanıcı",
      "Tüm özellikler",
      "Özel entegrasyonlar",
      "Gelişmiş güvenlik",
      "Öncelikli destek",
      "Özel eğitim ve destek"
    ],
    buttonText: "Görüşme Talep Edin",
    featured: false
  }
];

// Testimonials Data
const testimonials = [
  {
    quote: "Bu platform sayesinde satış süreçlerimizi %30 hızlandırdık ve müşteri memnuniyetimiz arttı.",
    name: "Ahmet Yılmaz",
    role: "Satış Direktörü, ABC Teknoloji",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    quote: "Stok yönetimimiz çok daha verimli hale geldi. Artık stok eksikliği yaşamıyoruz.",
    name: "Ayşe Demir",
    role: "Operasyon Müdürü, XYZ Üretim",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    quote: "Finansal raporlama artık dakikalar içinde tamamlanıyor, eskiden günler alıyordu.",
    name: "Mehmet Kaya",
    role: "Finans Müdürü, 123 Holding",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

// FAQ Data
const faqs = [
  {
    question: "Platform kurulumu ne kadar sürer?",
    answer: "Kurulum genellikle 24-48 saat içinde tamamlanır. Verilerinizin miktarına ve özel ihtiyaçlarınıza bağlı olarak bu süre değişebilir. Kurulum ekibimiz, sorunsuz bir geçiş için size rehberlik edecektir."
  },
  {
    question: "Mevcut verilerimizi aktarabilir miyiz?",
    answer: "Evet, platformumuz çeşitli kaynaklardan veri aktarımını destekler. Excel, CSV ve diğer popüler CRM/ERP sistemlerinden veri aktarımı yapabilirsiniz. Teknik ekibimiz bu süreçte size yardımcı olacaktır."
  },
  {
    question: "Özel entegrasyonlar mümkün mü?",
    answer: "Evet, API'lerimiz ile kendi sistemlerinize özel entegrasyonlar geliştirebilirsiniz. Ayrıca, birçok popüler uygulama ve servisle hazır entegrasyonlar sunuyoruz."
  },
  {
    question: "Eğitim ve destek seçenekleri nelerdir?",
    answer: "Tüm paketlerimizde e-posta desteği sunuyoruz. Business ve Enterprise paketlerimizde telefon ve canlı destek de dahildir. Ayrıca, kapsamlı dokümantasyon ve video eğitimlerimizden yararlanabilirsiniz."
  },
  {
    question: "Verilerimizin güvenliği nasıl sağlanıyor?",
    answer: "Verileriniz, endüstri standardı SSL şifreleme, düzenli yedekleme ve güvenlik denetimleri ile korunmaktadır. KVKK ve GDPR uyumlu hizmet veriyoruz."
  },
  {
    question: "Fiyatlandırma planlarını değiştirebilir miyiz?",
    answer: "Evet, ihtiyaçlarınız değiştikçe paketler arasında geçiş yapabilirsiniz. Planınızı yükseltmek istediğinizde, fiyat farkını ödeyerek hemen geçiş yapabilirsiniz."
  }
];

export default Index;
