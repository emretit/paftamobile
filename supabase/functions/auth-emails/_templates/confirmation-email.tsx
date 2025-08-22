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
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const ConfirmationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>PAFTA hesabınızı onaylayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <img 
            src="https://vwhwufnckpqirxptwncw.supabase.co/storage/v1/object/public/logos/logo.svg"
            alt="PAFTA Logo" 
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Hoş Geldiniz!</Heading>
        
        <Text style={text}>
          Merhaba,
        </Text>
        
        <Text style={text}>
          PAFTA platformuna kaydolduğunuz için teşekkür ederiz. Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:
        </Text>
        
        <Section style={buttonSection}>
          <Button
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Hesabımı Onayla
          </Button>
        </Section>
        
        <Text style={text}>
          Eğer buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:
        </Text>
        
        <Text style={linkText}>
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
        </Text>
        
        <Text style={text}>
          Alternatif olarak, bu geçici onay kodunu kullanabilirsiniz:
        </Text>
        
        <code style={code}>{token}</code>
        
        <Text style={disclaimer}>
          Bu e-posta size {user_email} adresine gönderilmiştir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.
        </Text>
        
        <Text style={footer}>
          PAFTA İş Yönetim Sistemi
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoSection = {
  padding: '20px 40px 20px 40px',
  textAlign: 'center' as const,
}

const logo = {
  height: '48px',
  width: 'auto',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const buttonSection = {
  padding: '27px 40px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '4px',
  margin: '0 40px',
}

const disclaimer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 16px',
  padding: '0 40px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}