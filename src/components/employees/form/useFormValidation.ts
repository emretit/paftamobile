
export const useFormValidation = () => {
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[\d\s+()-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    validatePhoneNumber,
    validateEmail,
  };
};
