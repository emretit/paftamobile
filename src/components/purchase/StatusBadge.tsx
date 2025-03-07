
import { StatusBadge as BaseBadge } from "@/components/ui/status-badge";
import { PurchaseRequestStatus, PurchaseOrderStatus, InvoiceStatus } from "@/types/purchase";
import { 
  requestStatusStyles, 
  requestStatusLabels, 
  orderStatusStyles, 
  orderStatusLabels,
  invoiceStatusStyles,
  invoiceStatusLabels
} from "./constants";

interface RequestStatusBadgeProps {
  status: PurchaseRequestStatus;
  size?: "sm" | "md" | "lg";
}

export const RequestStatusBadge = ({ status, size = "md" }: RequestStatusBadgeProps) => {
  const style = requestStatusStyles[status];
  const label = requestStatusLabels[status];
  
  return (
    <BaseBadge
      label={label}
      customColors={style}
      size={size}
      variant="custom"
    />
  );
};

interface OrderStatusBadgeProps {
  status: PurchaseOrderStatus;
  size?: "sm" | "md" | "lg";
}

export const OrderStatusBadge = ({ status, size = "md" }: OrderStatusBadgeProps) => {
  const style = orderStatusStyles[status];
  const label = orderStatusLabels[status];
  
  return (
    <BaseBadge
      label={label}
      customColors={style}
      size={size}
      variant="custom"
    />
  );
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md" | "lg";
}

export const InvoiceStatusBadge = ({ status, size = "md" }: InvoiceStatusBadgeProps) => {
  const style = invoiceStatusStyles[status];
  const label = invoiceStatusLabels[status];
  
  return (
    <BaseBadge
      label={label}
      customColors={style}
      size={size}
      variant="custom"
    />
  );
};
