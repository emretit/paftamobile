import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface SignUpEmailProps {
  supabase_url: string;
  token: string;
  token_hash: string;
  redirect_to: string;
  user_name: string;
  company_name: string;
}

export const SignUpEmail = ({
  token,
  supabase_url,
  token_hash,
  redirect_to,
  user_name,
  company_name,
}: SignUpEmailProps) => (
  <Html>
    <Head />
    <Preview>PAFTA hesabınızı onaylayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>PAFTA</Heading>
          <Text style={subtitle}>İş Süreçleri Yönetim Platformu</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h2}>Hoş Geldiniz!</Heading>
          
          <Text style={text}>
            Merhaba {user_name || "Değerli Kullanıcı"},
          </Text>
          
          <Text style={text}>
            {company_name ? `${company_name} şirketi için ` : ""}PAFTA hesabınızı oluşturduğunuz için teşekkür ederiz. 
            Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
              style={button}
            >
              Hesabımı Onayla
            </Link>
          </Section>
          
          <Text style={text}>
            Alternatif olarak, aşağıdaki onay kodunu kopyalayıp giriş sayfasına yapıştırabilirsiniz:
          </Text>
          
          <Section style={codeContainer}>
            <Text style={code}>{token}</Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={disclaimer}>
            <strong>Önemli:</strong> Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.
          </Text>
          
          <Text style={disclaimer}>
            Bu onay bağlantısı güvenlik nedeniyle 1 saat içinde geçerliliğini yitirecektir.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            <strong>PAFTA Ekibi</strong>
          </Text>
          <Link href="https://pafta.app" style={footerLink}>
            pafta.app
          </Link>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default SignUpEmail;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: 'Geist Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "40px 20px",
};

const container = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  overflow: "hidden",
};

const header = {
  backgroundColor: "#D32F2F",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 8px 0",
  letterSpacing: "0.05em",
};

const subtitle = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
  opacity: "0.9",
  fontWeight: "400",
};

const content = {
  padding: "40px",
};

const h2 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  margin: "20px 0",
  lineHeight: "1.6",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#D32F2F",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  margin: "0 auto",
  boxShadow: "0 4px 6px -1px rgba(211, 47, 47, 0.3)",
  transition: "all 0.2s ease",
};

const codeContainer = {
  backgroundColor: "#f8fafc",
  border: "2px dashed #D32F2F",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const code = {
  color: "#D32F2F",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  margin: "0",
  fontFamily: "monospace",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
  border: "none",
  borderTop: "1px solid #e5e7eb",
};

const disclaimer = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "16px 0",
  lineHeight: "1.5",
  backgroundColor: "#f9fafb",
  padding: "12px 16px",
  borderRadius: "6px",
  borderLeft: "4px solid #D32F2F",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "24px 40px",
  textAlign: "center" as const,
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0 0 8px 0",
  fontWeight: "600",
};

const footerLink = {
  color: "#D32F2F",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600",
};