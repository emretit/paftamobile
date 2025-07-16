
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { DetailedFinancialOverview } from "@/components/dashboard/DetailedFinancialOverview";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="p-6">
          <DetailedFinancialOverview />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
