
import { screenshots } from "@/data/landingPageData";

const ScreenshotSection = () => {
  return (
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
  );
};

export default ScreenshotSection;
