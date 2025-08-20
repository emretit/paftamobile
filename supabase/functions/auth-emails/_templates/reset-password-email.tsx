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

interface ResetPasswordEmailProps {
  supabase_url: string;
  token: string;
  token_hash: string;
  redirect_to: string;
  user_name: string;
}

export const ResetPasswordEmail = ({
  token,
  supabase_url,
  token_hash,
  redirect_to,
  user_name,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>PAFTA şifrenizi sıfırlayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Şifre Sıfırlama</Heading>
        
        <Text style={text}>
          Merhaba {user_name || "Değerli Kullanıcı"},
        </Text>
        
        <Text style={text}>
          PAFTA hesabınız için şifre sıfırlama talebinde bulundunuz. 
          Yeni bir şifre belirlemek için aşağıdaki bağlantıya tıklayın:
        </Text>
        
        <Section style={buttonContainer}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`}
            style={button}
          >
            Şifremi Sıfırla
          </Link>
        </Section>
        
        <Text style={text}>
          Alternatif olarak, aşağıdaki kodu kopyalayıp şifre sıfırlama sayfasına yapıştırabilirsiniz:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={warningText}>
          <strong>Güvenlik Uyarısı:</strong> Eğer bu şifre sıfırlama talebini siz yapmadıysanız, 
          lütfen bu e-postayı göz ardı edin ve hesabınızın güvenliği için mevcut şifrenizi değiştirmeyi düşünün.
        </Text>
        
        <Text style={footer}>
          Bu bağlantı güvenlik nedeniyle 1 saat içinde geçerliliğini yitirecektir.
        </Text>
        
        <Text style={footer}>
          <strong>PAFTA Ekibi</strong>
          <br />
          <Link href="https://pafta.app" style={footerLink}>
            pafta.app
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "16px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  margin: "24px 0",
  lineHeight: "1.5",
};

const warningText = {
  color: "#dc2626",
  fontSize: "14px",
  margin: "24px 0",
  lineHeight: "1.5",
  padding: "16px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 auto",
};

const codeContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const code = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  letterSpacing: "0.1em",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "16px 0",
  lineHeight: "1.5",
};

const footerLink = {
  color: "#2563eb",
  textDecoration: "none",
};