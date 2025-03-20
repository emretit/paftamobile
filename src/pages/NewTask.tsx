
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import TaskForm from "@/components/tasks/form/TaskForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface NewTaskProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const NewTask = ({ isCollapsed, setIsCollapsed }: NewTaskProps) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate("/tasks");
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Yeni Görev"
      subtitle="Yeni bir görev oluşturun"
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle>Yeni Görev Oluştur</CardTitle>
          <CardDescription>
            Yeni bir görev eklemek için aşağıdaki formu doldurun. Zorunlu alanlar
            <span className="text-red-500 mx-1">*</span>
            ile işaretlenmiştir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm onClose={handleClose} />
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default NewTask;
