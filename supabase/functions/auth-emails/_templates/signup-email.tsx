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
  Img,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SignUpEmailProps {
  supabase_url: string
  token: string
  token_hash: string
  redirect_to: string
  user_name: string
  company_name: string
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
    <Preview>PAFTA hesabınızı onaylayın 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Clean Header with Logo */}
        <Section style={header}>
          <Img
            src={`${supabase_url.replace('/v1', '')}/logo.svg`}
            width="120"
            height="48"
            alt="PAFTA Logo"
            style={logo}
          />
        </Section>
        
        {/* Welcome Section */}
        <Section style={welcomeSection}>
          <Heading style={h1}>Hesabınızı Onaylayın</Heading>
          <Text style={greeting}>
            Merhaba <strong>{user_name || "Değerli Kullanıcı"}</strong>,
          </Text>
          <Text style={welcomeText}>
            {company_name ? (
              <>
                <strong>{company_name}</strong> için PAFTA İş Yönetim Sistemi hesabınızı oluşturdunuz.
              </>
            ) : (
              "PAFTA İş Yönetim Sistemi hesabınızı oluşturdunuz."
            )}
          </Text>
        </Section>

        {/* CTA Section */}
        <Section style={ctaSection}>
          <Text style={ctaText}>
            Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:
          </Text>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
            style={button}
          >
            Hesabımı Aktifleştir
          </Link>
        </Section>

        {/* Features Grid */}
        <Section style={featuresSection}>
          <Text style={featuresTitle}>PAFTA'nın Özellikleri</Text>
          <Section style={featuresGrid}>
            <Section style={featureItem}>
              <Text style={featureIcon}>📊</Text>
              <Text style={featureLabel}>Müşteri Yönetimi</Text>
            </Section>
            <Section style={featureItem}>
              <Text style={featureIcon}>💰</Text>
              <Text style={featureLabel}>Finansal Takip</Text>
            </Section>
            <Section style={featureItem}>
              <Text style={featureIcon}>📈</Text>
              <Text style={featureLabel}>Satış Fırsatları</Text>
            </Section>
            <Section style={featureItem}>
              <Text style={featureIcon}>🔧</Text>
              <Text style={featureLabel}>Servis Yönetimi</Text>
            </Section>
          </Section>
        </Section>

        {/* Help Section */}
        <Section style={helpSection}>
          <Text style={helpText}>
            Buton çalışmıyorsa bu bağlantıyı tarayıcınıza kopyalayın:
          </Text>
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Destek için: <Link href="mailto:destek@pafta.app" style={footerLink}>destek@pafta.app</Link>
          </Text>
          <Text style={footerNote}>
            Bu e-postayı sadece siz talep ettiyseniz linke tıklayın.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignUpEmail

// Clean, modern styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: '0',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '580px',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}

const header = {
  backgroundColor: '#ffffff',
  padding: '40px 40px 30px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #f1f5f9',
}

const logo = {
  margin: '0 auto',
  display: 'block',
}

const welcomeSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1e293b',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#475569',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const welcomeText = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
}

const ctaSection = {
  padding: '30px 40px',
  textAlign: 'center' as const,
}

const ctaText = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 30px',
}

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '12px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  transition: 'all 0.2s ease',
}

const featuresSection = {
  padding: '30px 40px',
  backgroundColor: '#f8fafc',
}

const featuresTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const featuresGrid = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '16px',
  justifyContent: 'center',
}

const featureItem = {
  textAlign: 'center' as const,
  width: '120px',
  margin: '0 8px 16px',
}

const featureIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const featureLabel = {
  color: '#475569',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'center' as const,
}

const helpSection = {
  padding: '30px 40px',
  backgroundColor: '#f1f5f9',
}

const helpText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const linkText = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '12px',
  wordBreak: 'break-all' as const,
  margin: '0',
  textAlign: 'center' as const,
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
}

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#4f46e5',
  textDecoration: 'none',
  fontWeight: '500',
}

const footerNote = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}