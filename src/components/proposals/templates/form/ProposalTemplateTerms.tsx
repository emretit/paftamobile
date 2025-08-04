import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProposalFormData } from "@/types/proposal-form";

interface ProposalTemplateTermsProps {
  register: UseFormRegister<ProposalFormData>;
}

const ProposalTemplateTerms: React.FC<ProposalTemplateTermsProps> = ({
  register,
}) => {
  const defaultTerms = `Teklif Notları ve Ticari Şartlar :

Fiyatlar : KDV hariç TL cinsinden hazırlanmıştır.

Ödeme : %20 Peşin %80 işlik avansı olarak tahsil edilecektir.

Garanti : Yapımları fatura tarihinden itibaren faturalanan miktarlara kişi bazı 2(iki) yıl garantileri. Servis hizmetinde de malzeme ağırlık ve montaj maliyetleridir modem yapısında bulunacaktır.

Stok & Teslimat : Ürünler siparişlerini teslimat için yapılacaktır. Teslimat süresi 15 iş günüdür.

Sayılamıştır.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Şartlar ve Koşullar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="terms">Teklif Şartları</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Teklif şartlarınızı girin..."
              defaultValue={defaultTerms}
              className="min-h-[120px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalTemplateTerms;