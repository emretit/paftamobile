
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";

interface PartnerDetailsProps {
  type: "customer" | "supplier";
  partner: Customer | Supplier | undefined;
}

const PartnerDetails = ({ type, partner }: PartnerDetailsProps) => {
  if (!partner) return null;

  return (
    <div className="mt-4 space-y-2 p-4 border rounded-lg bg-muted/50">
      <h3 className="font-medium">İş Ortağı Bilgileri</h3>
      {partner && (
        <>
          {partner.company && (
            <p className="text-sm">
              <span className="font-medium">Firma:</span> {partner.company}
            </p>
          )}
          {partner.representative && (
            <p className="text-sm">
              <span className="font-medium">Temsilci:</span> {partner.representative}
            </p>
          )}
          {partner.email && (
            <p className="text-sm">
              <span className="font-medium">E-posta:</span> {partner.email}
            </p>
          )}
          {(partner.mobile_phone || partner.office_phone) && (
            <p className="text-sm">
              <span className="font-medium">Telefon:</span>{" "}
              {partner.mobile_phone || partner.office_phone}
            </p>
          )}
          {partner.address && (
            <p className="text-sm">
              <span className="font-medium">Adres:</span> {partner.address}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PartnerDetails;
