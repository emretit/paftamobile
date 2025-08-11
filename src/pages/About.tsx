import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Hakkımızda
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Misyonumuz
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Modern işletmelerin ihtiyaçlarını karşılamak için kapsamlı iş yönetimi 
                çözümleri sunuyoruz. Teknoloji ve deneyimi birleştirerek, 
                müşterilerimizin operasyonel verimliliklerini artırmalarına yardımcı oluyoruz.
              </p>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Vizyonumuz
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                İş dünyasında dijital dönüşümün öncüsü olmak ve işletmelerin 
                potansiyellerini tam olarak gerçekleştirmelerine olanak sağlamak.
              </p>
            </div>
          </div>
          
          <div className="bg-card p-8 rounded-lg border">
            <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
              Özelliklerimiz
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-primary text-xl font-semibold">📊</span>
                </div>
                <h3 className="font-medium text-foreground">Finansal Yönetim</h3>
                <p className="text-sm text-muted-foreground">
                  Kapsamlı finansal raporlama ve analiz araçları
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-primary text-xl font-semibold">👥</span>
                </div>
                <h3 className="font-medium text-foreground">CRM</h3>
                <p className="text-sm text-muted-foreground">
                  Müşteri ilişkileri yönetimi ve satış takibi
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-primary text-xl font-semibold">📝</span>
                </div>
                <h3 className="font-medium text-foreground">Teklif Yönetimi</h3>
                <p className="text-sm text-muted-foreground">
                  PDF teklif oluşturma ve yönetim sistemi
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Daha fazla bilgi için bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;