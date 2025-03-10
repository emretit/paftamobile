
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
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
  );
};

export default CtaSection;
