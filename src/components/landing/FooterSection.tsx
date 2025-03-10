
const FooterSection = () => {
  return (
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
  );
};

export default FooterSection;
