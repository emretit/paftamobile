import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceNewProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServiceNew = ({ isCollapsed, setIsCollapsed }: ServiceNewProps) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/service');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <TopBar />
        <div className="container mx-auto p-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/service')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Servis Talebi</h1>
              <p className="text-gray-600">Yeni bir servis talebi oluşturun</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ServiceRequestForm 
              onClose={handleClose}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceNew;
