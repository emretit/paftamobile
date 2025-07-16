
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { DetailedFinancialOverview } from "@/components/dashboard/DetailedFinancialOverview";
import { EnhancedCashflowTable } from "@/components/dashboard/EnhancedCashflowTable";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Finansal Yönetim Merkezi</h1>
              <p className="text-gray-600 mt-1">Genel bakış ve ana nakit akış tablosu</p>
            </div>
          </div>

          {/* Genel Bakış Özeti */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <DetailedFinancialOverview />
          </div>

          {/* Ana Nakit Akış Tablosu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ana Nakit Akış Tablosu</h2>
            <EnhancedCashflowTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
