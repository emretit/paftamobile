
import React from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PlaceholderPage = ({ isCollapsed, setIsCollapsed }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sayfa Bulunamadı</h1>
            <p className="text-gray-600 mt-1">İstediğiniz sayfa şu anda mevcut değil</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>CRM Modülleri Güncelleniyor</CardTitle>
              <CardDescription>
                CRM modülleri şu anda bakım modundadır ve kullanılamaz. 
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Aradığınız CRM modülü (fırsatlar, teklifler veya görevler) şu anda veritabanından 
                kaldırılmış durumdadır. Bu modülleri kullanabilmek için yeniden yapılandırılması gerekmektedir.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PlaceholderPage;
