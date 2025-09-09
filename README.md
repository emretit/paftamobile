# PAFTA Teknik Servis - Mobil Uygulama

PAFTA Teknik Servis için geliştirilmiş Flutter mobil uygulaması. Teknisyenlerin servis taleplerini yönetmesi ve takip etmesi için tasarlanmıştır.

## 🚀 Özellikler

- **Teknisyen Girişi**: Supabase Auth ile güvenli giriş
- **Servis Talepleri**: Atanan servis taleplerini görüntüleme
- **Durum Güncelleme**: Servis durumunu güncelleme (yeni, atandı, devam ediyor, tamamlandı)
- **Realtime Güncellemeler**: Supabase Realtime ile anlık güncellemeler
- **Push Notifications**: Servis atamaları için bildirimler
- **Offline Desteği**: Çevrimdışı çalışma desteği
- **Fotoğraf/Video**: Servis ile ilgili medya yükleme

## 🛠️ Teknolojiler

- **Flutter**: Cross-platform mobil uygulama
- **Supabase**: Backend ve veritabanı
- **Riverpod**: State management
- **Hive**: Local storage
- **Supabase Realtime**: Anlık güncellemeler

## 📱 Kurulum

### Gereksinimler
- Flutter SDK (3.0+)
- Dart SDK (3.0+)
- iOS 13.0+ / Android API 21+

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd paftamobile
```

2. **Bağımlılıkları yükleyin**
```bash
flutter pub get
```

3. **Supabase yapılandırması**
```bash
# Supabase CLI ile migration'ları uygulayın
npx supabase db push
```

4. **Uygulamayı çalıştırın**
```bash
# iOS
flutter run -d ios

# Android
flutter run -d android
```

## 🗄️ Veritabanı Yapısı

### Ana Tablolar
- `service_requests`: Servis talepleri
- `employees`: Teknisyen bilgileri
- `customers`: Müşteri bilgileri
- `user_tokens`: FCM token'ları (push notification için)

### Servis Talebi Durumları
- `new`: Yeni
- `assigned`: Atandı
- `in_progress`: Devam ediyor
- `on_hold`: Beklemede
- `completed`: Tamamlandı
- `cancelled`: İptal edildi

## 🔧 Geliştirme

### Proje Yapısı
```
lib/
├── core/                 # Temel yapılandırma
│   ├── constants/        # Sabitler
│   ├── services/         # Servisler
│   └── theme/           # Tema ayarları
├── features/            # Özellik modülleri
│   ├── auth/            # Kimlik doğrulama
│   ├── home/            # Ana sayfa
│   ├── service_requests/ # Servis talepleri
│   └── profile/         # Profil
├── shared/              # Paylaşılan bileşenler
│   ├── models/          # Veri modelleri
│   └── widgets/         # Widget'lar
└── main.dart           # Uygulama giriş noktası
```

### State Management
- **Riverpod**: Ana state management
- **StateNotifier**: Complex state yönetimi
- **Provider**: Dependency injection

## 📱 Ekran Görüntüleri

### Giriş Ekranı
- PAFTA logosu
- Email/şifre girişi
- Güvenli kimlik doğrulama

### Ana Sayfa
- Teknisyen bilgileri
- Servis talepleri listesi
- Hızlı erişim menüsü

### Servis Talepleri
- Atanan servisler
- Durum güncelleme
- Detay görüntüleme

## 🔐 Güvenlik

- **Supabase Auth**: Güvenli kimlik doğrulama
- **RLS**: Row Level Security
- **JWT**: Token tabanlı yetkilendirme
- **HTTPS**: Güvenli veri iletimi

## 🚀 Deployment

### iOS
1. Xcode'da projeyi açın
2. Signing & Capabilities ayarlayın
3. Archive oluşturun
4. App Store'a yükleyin

### Android
1. `android/app/build.gradle` ayarlayın
2. APK/AAB oluşturun
3. Google Play Store'a yükleyin

## 📞 Destek

Herhangi bir sorun veya öneri için:
- **Email**: info@pafta.app
- **Website**: https://pafta.app

## 📄 Lisans

Bu proje PAFTA Teknik Servis için geliştirilmiştir.

---

**PAFTA Teknik Servis** - Güvenilir teknik çözümler