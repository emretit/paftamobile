
import React from 'react';
import Navbar from "@/components/Navbar";
import { ServiceRequestTable } from "@/components/service/ServiceRequestTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Service Management</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Service Request
            </Button>
          </div>
          <ServiceRequestTable />
        </div>
      </main>
    </div>
  );
};

export default ServicePage;
