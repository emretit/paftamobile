
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coreFeatures } from "@/data/landingPageData";

const FeaturesSection = () => {
  return (
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
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
