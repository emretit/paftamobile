
import Navbar from "@/components/Navbar";
import CustomerFormHeader from "@/components/customers/CustomerFormHeader";
import CustomerFormContent from "@/components/customers/CustomerFormContent";
import { useCustomerForm } from "@/hooks/useCustomerForm";

interface CustomerFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CustomerForm = ({ isCollapsed, setIsCollapsed }: CustomerFormProps) => {
  const {
    id,
    formData,
    setFormData,
    isLoadingCustomer,
    customerError,
    mutation,
    handleSubmit,
    navigate
  } = useCustomerForm();

  if (customerError) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 p-3 sm:p-6 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <CustomerFormHeader id={id} />

        {isLoadingCustomer && id ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <CustomerFormContent 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isPending={mutation.isPending}
            isEdit={!!id}
            onCancel={() => navigate('/contacts')}
          />
        )}
      </main>
    </div>
  );
};

export default CustomerForm;
