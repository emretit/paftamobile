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
    <Preview>PAFTA hesabınızı onaylayın ve işletmenizi dijital dönüşüme hazırlayın</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with logo and branding */}
        <Section style={header}>
          <Row>
            <Column>
              <Img
                src="https://preview--ngs-crm-erp.lovable.app/logo.svg"
                width="150"
                height="60"
                alt="PAFTA Logo"
                style={logo}
              />
            </Column>
          </Row>
          <Text style={tagline}>İş Yönetim Sistemi</Text>
        </Section>
        
        {/* Main content */}
        <Section style={content}>
          <Heading style={h1}>Hoş Geldiniz! 🎉</Heading>
          
          <Text style={greeting}>
            Merhaba <strong>{user_name || "Değerli Kullanıcı"}</strong>,
          </Text>
          
          <Text style={text}>
            {company_name && (
              <>
                <strong>{company_name}</strong> şirketi adına PAFTA İş Yönetim Sistemi{"'"}ne kayıt olduğunuz için teşekkür ederiz! 
              </>
            )}
            {!company_name && "PAFTA İş Yönetim Sistemi'ne kayıt olduğunuz için teşekkür ederiz!"}
          </Text>

          <Text style={text}>
            Hesabınızı aktifleştirmek ve PAFTA{"'"}nın tüm özelliklerinden yararlanmaya başlamak için aşağıdaki butona tıklayın:
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
              style={button}
            >
              🚀 Hesabımı Aktifleştir
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Features highlight */}
          <Section style={featuresSection}>
            <Text style={featuresTitle}>PAFTA ile neler yapabilirsiniz?</Text>
            
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <Text style={featureText}>📊 <strong>Müşteri Yönetimi</strong></Text>
                <Text style={featureDescription}>Müşterilerinizi organize edin ve takip edin</Text>
              </Column>
              <Column style={featureColumn}>
                <Text style={featureText}>💰 <strong>Finansal Takip</strong></Text>
                <Text style={featureDescription}>Gelir-gider ve nakit akışınızı kontrol edin</Text>
              </Column>
            </Row>
            
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <Text style={featureText}>📈 <strong>Satış Fırsatları</strong></Text>
                <Text style={featureDescription}>Satış süreçlerinizi yönetin ve artırın</Text>
              </Column>
              <Column style={featureColumn}>
                <Text style={featureText}>🔧 <strong>Servis Yönetimi</strong></Text>
                <Text style={featureDescription}>Teknik destek süreçlerinizi optimize edin</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Alternative link */}
          <Text style={alternativeText}>
            Buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:
          </Text>
          
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`}
          </Text>

          <Text style={securityNote}>
            🔒 <strong>Güvenlik:</strong> Bu e-postayı sadece siz talep ettiyseniz linke tıklayın. 
            Eğer bu hesabı oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Sorularınız için: <Link href="mailto:destek@pafta.app" style={footerLink}>destek@pafta.app</Link>
          </Text>
          <Text style={footerText}>
            <strong>PAFTA Ekibi</strong> ile başarılı bir iş yönetimi deneyimi 🎯
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignUpEmail

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}

const header = {
  backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 30px 30px',
  textAlign: 'center' as const,
  background: '#4F46E5',
}

const logo = {
  margin: '0 auto',
  filter: 'brightness(0) invert(1)',
}

const tagline = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  margin: '10px 0 0',
  textAlign: 'center' as const,
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '36px',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#2d3748',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 20px',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '280px',
  border: 'none',
  boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.3)',
  transition: 'all 0.2s ease',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
}

const featuresSection = {
  margin: '30px 0',
}

const featuresTitle = {
  color: '#2d3748',
  fontSize: '20px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 25px',
}

const featureRow = {
  marginBottom: '20px',
}

const featureColumn = {
  width: '48%',
  paddingRight: '2%',
}

const featureText = {
  color: '#4a5568',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const featureDescription = {
  color: '#718096',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0 0 15px',
}

const alternativeText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '30px 0 15px',
  textAlign: 'center' as const,
}

const linkText = {
  backgroundColor: '#f7fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  color: '#4a5568',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '15px',
  wordBreak: 'break-all' as const,
  margin: '0 0 25px',
}

const securityNote = {
  backgroundColor: '#fef5e7',
  border: '1px solid #f6e05e',
  borderRadius: '6px',
  color: '#744210',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '15px',
  margin: '25px 0',
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
}

const footerText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 10px',
}

const footerLink = {
  color: '#4F46E5',
  textDecoration: 'none',
}