
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, BarChart3, CheckCircle2 } from "lucide-react";

const DealStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
            <p className="text-2xl font-bold mt-1">$240,000</p>
          </div>
          <div className="bg-green-100 p-2 rounded-lg">
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2 flex items-center">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          12% from last month
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Won Deals</p>
            <p className="text-2xl font-bold mt-1">$120,000</p>
          </div>
          <div className="bg-green-100 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2 flex items-center">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          8% from last month
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Lost Deals</p>
            <p className="text-2xl font-bold mt-1">$35,000</p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <p className="text-sm text-red-600 mt-2 flex items-center">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          5% from last month
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Win Rate</p>
            <p className="text-2xl font-bold mt-1">67%</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-2 flex items-center">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          2% from last month
        </p>
      </Card>
    </div>
  );
};

export default DealStats;
