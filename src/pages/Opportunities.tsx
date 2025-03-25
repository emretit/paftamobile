
import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities: React.FC<OpportunitiesProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="Fırsatlar" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default Opportunities;
