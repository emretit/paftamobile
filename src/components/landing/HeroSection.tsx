
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
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
  );
};

export default HeroSection;
