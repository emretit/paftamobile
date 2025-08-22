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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ResetPasswordEmailProps {
  supabase_url: string
  token: string
  token_hash: string
  redirect_to: string
  user_name: string
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
    <Preview>PAFTA şifre sıfırlama</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://preview--ngs-crm-erp.lovable.app/logo.svg"
            width="120"
            height="48"
            alt="PAFTA Logo"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Şifre Sıfırlama</Heading>
        
        <Text style={text}>
          Merhaba {user_name ? user_name : 'Değerli Kullanıcı'},
        </Text>
        
        <Text style={text}>
          PAFTA hesabınız için şifre sıfırlama talebinde bulundunuz. 
          Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:
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
          Veya bu linki tarayıcınıza kopyalayabilirsiniz:
        </Text>
        
        <Text style={code}>
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`}
        </Text>

        <Text style={text}>
          Güvenlik sebebiyle bu link 1 saat içinde geçerliliğini yitirecektir.
        </Text>

        <Text style={text}>
          Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
        </Text>

        <Text style={footer}>
          İyi çalışmalar,<br />
          <strong>PAFTA Ekibi</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordEmail

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

const logoContainer = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#d73502',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  fontWeight: 'bold',
}

const code = {
  display: 'inline-block',
  padding: '16px',
  width: '90%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 20px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  padding: '0 20px',
  textAlign: 'center' as const,
}