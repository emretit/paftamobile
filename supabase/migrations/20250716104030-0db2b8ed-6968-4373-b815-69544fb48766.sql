-- Maaş hesaplama fonksiyonunu güncelle - YENİ MANTIK: Net maaş + primler + yardımlar
CREATE OR REPLACE FUNCTION public.calculate_employer_costs()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate SGK employer contribution
  NEW.sgk_employer_amount = NEW.gross_salary * (NEW.sgk_employer_rate / 100);
  
  -- Calculate unemployment insurance employer contribution  
  NEW.unemployment_employer_amount = NEW.gross_salary * (NEW.unemployment_employer_rate / 100);
  
  -- Calculate accident insurance
  NEW.accident_insurance_amount = NEW.gross_salary * (NEW.accident_insurance_rate / 100);
  
  -- YENİ HESAPLAMA MANTIGI: Net maaş + işveren primleri + yardımlar + diğer maliyetler
  NEW.total_employer_cost = NEW.net_salary + 
                           NEW.sgk_employer_amount + 
                           NEW.unemployment_employer_amount + 
                           NEW.accident_insurance_amount + 
                           COALESCE(NEW.meal_allowance, 0) +
                           COALESCE(NEW.transport_allowance, 0) +
                           COALESCE(NEW.stamp_tax, 0) + 
                           COALESCE(NEW.severance_provision, 0) + 
                           COALESCE(NEW.bonus_provision, 0);
  
  RETURN NEW;
END;
$function$