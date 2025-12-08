import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  console.log('🚀 Push Notification Edge Function başlatıldı!');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Gelen veriyi al
    const payload = await req.json();
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // İki farklı format destekle:
    // 1. Mobil uygulamadan: { user_id, title, body, data }
    // 2. Webhook'tan: { record: { ... } }
    
    let userId: string | null = null;
    let notificationTitle: string;
    let notificationBody: string;
    let notificationData: Record<string, string> = {};
    
    if (payload.user_id) {
      // Mobil uygulamadan gelen format
      userId = payload.user_id;
      notificationTitle = payload.title || 'Bildirim';
      notificationBody = payload.body || '';
      notificationData = payload.data || {};
    } else if (payload.record) {
      // Webhook'tan gelen format (service_requests tablosu güncellendiğinde)
      const serviceRequest = payload.record;
      
      // assigned_technician değiştiyse teknisyene bildirim gönder
      if (serviceRequest.assigned_technician) {
        userId = serviceRequest.assigned_technician;
        notificationTitle = 'Yeni Servis Talebi Atandı';
        const customerName = serviceRequest.customer_name || 'Müşteri';
        notificationBody = `${customerName} için "${serviceRequest.service_title || 'Servis talebi'}" atandı`;
        notificationData = {
          type: 'service_assignment',
          service_request_id: serviceRequest.id,
          action: 'open_service_request',
        };
      } else if (serviceRequest.customer_id) {
        // Müşteriye durum güncelleme bildirimi
        userId = serviceRequest.customer_id;
        notificationTitle = 'Servis Talebi Güncellendi';
        notificationBody = `${serviceRequest.service_title || 'Servis talebiniz'} durumu: ${serviceRequest.service_status}`;
        
        // Durum tabasında özel mesajlar
        switch (serviceRequest.service_status) {
          case 'assigned':
            notificationTitle = 'Teknisyen Atandı';
            notificationBody = `${serviceRequest.service_title} için teknisyen atandı`;
            break;
          case 'in_progress':
            notificationTitle = 'Servis Başlatıldı';
            notificationBody = `${serviceRequest.service_title} servisi başlatıldı`;
            break;
          case 'completed':
            notificationTitle = 'Servis Tamamlandı';
            notificationBody = `${serviceRequest.service_title} servisi tamamlandı`;
            break;
          case 'cancelled':
            notificationTitle = 'Servis İptal Edildi';
            notificationBody = `${serviceRequest.service_title} servisi iptal edildi`;
            break;
        }
        
        notificationData = {
          service_request_id: serviceRequest.id,
          status: serviceRequest.service_status,
          type: 'service_request_update',
          action: 'open_service_request',
        };
      } else {
        return new Response(JSON.stringify({ error: 'user_id veya customer_id bulunamadı' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Geçersiz payload formatı' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id bulunamadı' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Kullanıcının FCM token'ını al
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', userId)
      .single();
      
    console.log('👤 Profile query sonucu:', { profile, profileError });
    
    if (profileError || !profile?.fcm_token) {
      console.log('❌ FCM token bulunamadı');
      return new Response(JSON.stringify({ 
        error: 'FCM token bulunamadı',
        user_id: userId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log('📨 Bildirim gönderiliyor:');
    console.log('- Title:', notificationTitle);
    console.log('- Body:', notificationBody);
    console.log('- FCM Token:', profile.fcm_token.substring(0, 20) + '...');
    
    // OAuth 2.0 Access Token al
    const accessToken = await getAccessToken();
    console.log('🔑 Access token alındı');
    
    // FCM v1 API ile bildirim gönder
    const message = {
      message: {
        token: profile.fcm_token,
        notification: {
          title: notificationTitle,
          body: notificationBody
        },
        data: notificationData,
        android: {
          notification: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            sound: 'default',
            icon: 'ic_notification'
          }
        },
        apns: {
          payload: {
            aps: {
              category: 'FLUTTER_NOTIFICATION_CLICK',
              sound: 'default',
              badge: 1,
              'content-available': 1
            }
          }
        }
      }
    };
    
    const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/pafta-b84ce/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text();
      console.error('❌ FCM API hatası:', fcmResponse.status, errorText);
      throw new Error(`FCM API hatası: ${fcmResponse.status} - ${errorText}`);
    }
    
    const fcmResult = await fcmResponse.json();
    console.log('✅ FCM başarılı response:', fcmResult);
    
    // Bildirimi veritabanına kaydet
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notificationTitle,
          body: notificationBody,
          type: notificationData.type || 'general',
          data: notificationData,
          action: notificationData.action || null,
          service_request_id: notificationData.service_request_id || null,
          technician_id: notificationData.type === 'service_assignment' ? userId : null,
          customer_id: notificationData.type === 'service_request_update' ? userId : null,
          is_read: false
        });
      
      if (notificationError) {
        console.error('❌ Bildirim veritabanına kaydedilemedi:', notificationError);
      } else {
        console.log('✅ Bildirim veritabanına kaydedildi');
      }
    } catch (dbError) {
      console.error('❌ Bildirim kaydetme hatası:', dbError);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Bildirim başarıyla gönderildi',
      fcm_message_id: fcmResult.name,
      data: {
        title: notificationTitle,
        body: notificationBody,
        user_id: userId,
        ...notificationData
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('❌ Edge Function hatası:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// OAuth 2.0 Access Token al
async function getAccessToken() {
  const serviceAccount = {
    type: 'service_account',
    project_id: 'pafta-b84ce',
    private_key_id: '9643917946d259ca364fbfbf144279588dd45b99',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDxUckkbOHi/2Nw\nq1rTlpOQhkTPTNEka9iZFCnYfRpZWLjNDegp52VxWzUlR1W+jeHe/J9fC9SSQcyI\nMiVcWiMEzMCSrh+zMqkQNfdx4LOxHlcMpbzyyEBOaore33D2zCnOalk7rhwiLB2n\ndicwUbK2lwMHu2T8nVVmBDb+wxlhsNaj0RgIrrytaGdtp4F2w5aOw3RwAG5J3D5V\nQ/dsOXAZs9IxIqjc6kKjltSqwmh8VWhYF7yDSmTTVCrW5dekovIA+vT0gPyDBjTB\n7xfqs6DZador2FThD47J7lZ1NWacvk4mSDshPAiU9ZYG/hTLj7pm+P6g6xKXyt7P\ne8WfL+zDAgMBAAECggEAAlXKbqX3vkS+t2w5D0YW5yBIJyy082IbG57EfuSgWM/7\nzc7Tecr+7My3TsU0xl4aGu3H3wQUH6wvqKZk59K0IbZCK3Pa46wwUvNVZyPc/pru\nuF/G3HSP8Wek214/JMGPVVYrHIw6l8wPJ2aEdOUS0nh984Oz3kvpc84Y+CMhf5P7\n1+vTXv/TaPYAmSSieAQrypjzCI2onUi7ZYFlWfbZdfnA1wvILq5OlmKzTIM3LBxc\njV4tHXWnIyzv6y0seYOssFWzg8NIDPxuuWTW4T1wD8XZbpilEHUkhM1JeQ6MdjVq\nfMus0tsDNvq6ovuY2BIreFKJtlsFBATBM3M8nekMVQKBgQD+wWGqhr3u3s6kMz3I\nM9Ct2/2GqraSDaGw84u/v8CqO2Em3Qcvv4Ykqg9b3OyTvL9OMBNugtJFELIC0Q/o\nEb+ZxeBjuT6hHAUhXbqXAIemHD1ZlsJmC3NaoSEn4Fh6bhITx0jbl3fwDhjE21je\nG4dslT/pyuy9mnn3ruOYy1+wBwKBgQDyf5mg+uXOf6ZAtrgxsunWJ740v/aRPcVY\nVin6cCzYGsnUP5rgVlBuKXNqUfeZJCf3aiDFXmsZkpDClgvmjLSSBUHI9CjMdYsd\n0pXy7A/eh+ySKhRjUmXrHaTnqgwlRC81xyYC0GiiUbvwCKH8n+EypCvYzEdh9Yl2\nwSY+QsI2ZQKBgHHjHbhQOES7UoHRboM7tsSinjo/wxKUCX7Dwevc21K+7PWkxfuw\nkVV+uRMGNrTtIlDf6S/0R/AcQJhFweirVo52CZRLUhZQInMCJdIvqHS4Fy0f2pQn\n9k/DzMC46JUC9A3nf0i79CBbDPOkY5wXjnkaV9I6p48zqebyRkkeUg6tAoGBAOwV\nE8DoYnBuT7Hy8VHZJ9QJLyD1vhtactT0VbvuF4pwUgujvKko/vawvh9FG3LpA0vY\n83yS1lu4F9yI7Z8PXwBFw+za3xlmWgC3sqoj7bMsy0DlXKHxZy3F13R+VYK2ZevK\nLRRSR3u3bOtbzDBAiqKdt95BykDxJVoK4qt8nM0NAoGBAOMYoCiz5Pfqf1u9Q2wY\nI+o958FZwZXuroRZFSJw3bYd6tOCCo2PzNEcQVQSKjLZIpRol70/sgZMaRfZCE0q\nKl9cJtmzc6lpbBQskHcXeL/xPT+jnS33Qm7ugOtQkZhQyXus/D0omKu/LvLU/Ljn\n68ryUU18XUhowpP0q4f0LFW3\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-fbsvc@pafta-b84ce.iam.gserviceaccount.com',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token'
  };
  
  // JWT oluştur
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now
  };
  
  // JWT'yi manuel olarak oluştur (Deno'da crypto.subtle kullan)
  const jwtHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwtPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const textToSign = `${jwtHeader}.${jwtPayload}`;
  
  const signature = await signWithRSA256(textToSign, serviceAccount.private_key);
  const jwt = `${textToSign}.${signature}`;
  
  // Access token al
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    throw new Error(`Token alma hatası: ${tokenResponse.status}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// RSA256 ile imzalama
async function signWithRSA256(data: string, privateKeyPem: string) {
  // Private key'i temizle
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKeyPem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  
  // Base64'ten ArrayBuffer'a çevir
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Private key'i içe aktar
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
  
  // Veriyi imzala
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(data)
  );
  
  // Base64 URL-safe formatına çevir
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return base64Signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}