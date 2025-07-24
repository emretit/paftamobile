
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-red-100">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl font-sans">
          <span className="block">CRM & ERP Çözümünüzle</span>
          <span className="block text-primary">İşinizi Daha Verimli Yönetin</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-lg text-muted-foreground md:text-xl md:max-w-3xl">
          Tüm iş süreçlerinizi tek bir platformda yönetin ve büyümeye odaklanın.
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="px-8 shadow-lg hover:shadow-xl transition-all">
              Hemen Başlayın
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="px-8 border-primary/20 hover:bg-primary/5">
              Ücretsiz Deneyin
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
