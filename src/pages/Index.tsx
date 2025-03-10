
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this email to your backend
    alert(`Demo request received for: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">İş Süreçlerinizi</span>
                  <span className="block text-blue-600">Tek Platformda Yönetin</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-3xl">
                  Şirketinizin tüm operasyonlarını yönetebileceğiniz, entegre bir platform. 
                  Satış, müşteri ilişkileri, satın alma, stok ve finans süreçlerinizi tek bir yerden kontrol edin.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={handleSignUp} className="w-full sm:w-auto">
                    Ücretsiz Başlayın
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleLogin} className="w-full sm:w-auto">
                    Giriş Yap
                  </Button>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">14 gün ücretsiz deneme, kredi kartı gerekmez</span>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
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

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Tüm İhtiyaçlarınız İçin Tek Çözüm
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Modern işletmenizin ihtiyaç duyduğu tüm araçlar tek bir platformda.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-3 text-gray-600">{feature.description}</p>
                  </CardContent>
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
                Binlerce işletme, platformumuz sayesinde verimliliklerini artırdı.
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
                    <p className="text-gray-600 mb-6">{testimonial.quote}</p>
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

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Platformumuzu Keşfedin
                </h2>
                <p className="mt-4 text-lg text-blue-100 max-w-3xl">
                  Uzman ekibimiz, işletmenize özel bir demo sunmak için hazır. İhtiyaçlarınızı anlamak ve size en uygun çözümü sunmak için hemen iletişime geçin.
                </p>
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

// Features Data
const features = [
  {
    title: "CRM & Satış Yönetimi",
    description: "Müşteri ilişkilerini güçlendirin, satış süreçlerinizi optimize edin ve fırsatları kaçırmayın.",
    icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Satın Alma Yönetimi",
    description: "Tedarikçileri, siparişleri ve faturaları tek bir yerden yönetin, süreçleri otomatikleştirin.",
    icon: <Shield className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Stok & Ürün Yönetimi",
    description: "Stok seviyelerini takip edin, sipariş noktalarını optimize edin ve envanter maliyetlerini düşürün.",
    icon: <Check className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "İnsan Kaynakları",
    description: "Çalışan verilerini merkezi olarak yönetin, izin ve bordro süreçlerini otomatikleştirin.",
    icon: <Check className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Finansal Yönetim",
    description: "Nakit akışı, gelir-gider takibi ve finansal raporlama için entegre çözümler.",
    icon: <Shield className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Teknik Servis Yönetimi",
    description: "Servis taleplerini takip edin, teknisyen planlaması yapın ve müşteri memnuniyetini artırın.",
    icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
  },
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

export default Index;
