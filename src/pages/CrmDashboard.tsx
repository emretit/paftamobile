
import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard: React.FC<CrmDashboardProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="CRM Dashboard" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default CrmDashboard;
