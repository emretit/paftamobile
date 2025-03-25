
import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface ContactsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Contacts: React.FC<ContactsProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="Müşteriler" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default Contacts;
