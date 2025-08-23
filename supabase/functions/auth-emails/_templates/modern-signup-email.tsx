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
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ModernSignUpEmailProps {
  supabase_url: string
  token: string
  token_hash: string
  redirect_to: string
  user_name: string
  company_name: string
}

export const ModernSignUpEmail = ({
  token,
  supabase_url,
  token_hash,
  redirect_to,
  user_name,
  company_name,
}: ModernSignUpEmailProps) => (
  <Html>
    <Head />
    <Preview>PAFTA hesabınızı onaylayın - İş yönetiminizi dijitalleştirin</Preview>
    <Body style={main}>
      <Container style={container}>
        
        {/* Header Section */}
        <Section style={header}>
          <Img
            src="https://527a7790-65f5-4ba3-87eb-7299d2f3415a.sandbox.lovable.dev/logo.svg"
            width="120"
            height="48"
            alt="PAFTA Logo"
            style={logo}
          />
          <Text style={subtitle}>İş Yönetim Sistemi</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          {/* Welcome Message */}
          <Heading style={h1}>Hoş Geldiniz! 🎉</Heading>
          
          <Text style={greeting}>
            Merhaba <strong>{user_name || "Değerli Kullanıcı"}</strong>,
          </Text>

          <Text style={welcomeText}>
            {company_name ? (
              <>
                <strong>{company_name}</strong> şirketi adına PAFTA İş Yönetim Sistemi'ne kaydolduğunuz için teşekkür ederiz.
              </>
            ) : (
              "PAFTA İş Yönetim Sistemi'ne kaydolduğunuz için teşekkür ederiz."
            )}
          </Text>

          <Text style={description}>
            Hesabınızı aktifleştirerek iş süreçlerinizi dijitalleştirmeye ve verimliliğinizi artırmaya hemen başlayabilirsiniz.
          </Text>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
              style={ctaButton}
            >
              Hesabımı Aktifleştir
            </Button>
          </Section>

          {/* Features Grid */}
          <Section style={featuresSection}>
            <Hr style={divider} />
            
            <Text style={featuresTitle}>Hemen başlayabilirsiniz:</Text>
            
            <Section style={featureGrid}>
              <Section style={featureItem}>
                <Text style={featureIcon}>👥</Text>
                <Text style={featureText}>Müşteri Yönetimi</Text>
              </Section>
              <Section style={featureItem}>
                <Text style={featureIcon}>💰</Text>
                <Text style={featureText}>Finansal Takip</Text>
              </Section>
              <Section style={featureItem}>
                <Text style={featureIcon}>📊</Text>
                <Text style={featureText}>Satış Fırsatları</Text>
              </Section>
              <Section style={featureItem}>
                <Text style={featureIcon}>🔧</Text>
                <Text style={featureText}>Servis Yönetimi</Text>
              </Section>
            </Section>
            
            <Hr style={divider} />
          </Section>

          {/* Security Note */}
          <Section style={securitySection}>
            <Text style={securityText}>
              🔒 Bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.
            </Text>
          </Section>

          {/* Alternative Link */}
          <Section style={alternativeSection}>
            <Text style={alternativeText}>
              Buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:
            </Text>
            <Text style={linkText}>
              {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
            </Text>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Sorularınız için: <Link href="mailto:destek@pafta.app" style={footerLink}>destek@pafta.app</Link>
          </Text>
          <Text style={footerBrand}>
            © 2024 PAFTA İş Yönetim Sistemi
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ModernSignUpEmail

// Styles - PAFTA Site Tasarımına Uyumlu
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Geist Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '20px auto',
  maxWidth: '600px',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(211, 47, 47, 0.08)',
  overflow: 'hidden',
}

const header = {
  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  filter: 'brightness(0) invert(1)', // Logo'yu beyaza çevirir
}

const subtitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  margin: '8px 0 0',
  opacity: '0.9',
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#2d3748',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const welcomeText = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const description = {
  color: '#718096',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 32px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#D32F2F',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '16px 32px',
  border: 'none',
  boxShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
  transition: 'all 0.2s ease',
}

const featuresSection = {
  margin: '40px 0',
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
}

const featuresTitle = {
  color: '#2d3748',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  margin: '0 0 24px',
}

const featureItem = {
  textAlign: 'center' as const,
  padding: '16px 8px',
}

const featureIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const featureText = {
  color: '#4a5568',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
}

const securitySection = {
  backgroundColor: '#fef5e7',
  borderRadius: '8px',
  padding: '16px',
  margin: '32px 0',
}

const securityText = {
  color: '#744210',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
}

const alternativeSection = {
  margin: '32px 0',
}

const alternativeText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0 0 16px',
}

const linkText = {
  backgroundColor: '#f7fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  color: '#4a5568',
  fontSize: '12px',
  lineHeight: '1.4',
  padding: '12px',
  wordBreak: 'break-all' as const,
  margin: '0',
}

const footer = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '24px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#718096',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#D32F2F',
  textDecoration: 'none',
  fontWeight: '500',
}

const footerBrand = {
  color: '#a0aec0',
  fontSize: '12px',
  margin: '0',
}