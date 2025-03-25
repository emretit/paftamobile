
import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface TasksProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks: React.FC<TasksProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="Görevler" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default Tasks;
