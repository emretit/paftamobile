-- Türkiye'de 10+ çalışanı olan şirketler için tipik gider kategorileri ekleme
INSERT INTO cashflow_categories (name, type, user_id) VALUES
-- Genel Gider Kategorileri
('Maaş ve Ücretler', 'expense', NULL),
('SGK Primleri', 'expense', NULL),
('Vergi ve Harçlar', 'expense', NULL),
('Kira Giderleri', 'expense', NULL),
('Elektrik ve Su', 'expense', NULL),
('Telefon ve İnternet', 'expense', NULL),
('Ofis Malzemeleri', 'expense', NULL),
('Temizlik Giderleri', 'expense', NULL),
('Güvenlik Giderleri', 'expense', NULL),
('Sigorta Giderleri', 'expense', NULL),
('Muhasebe ve Mali Müşavir', 'expense', NULL),
('Hukuki Danışmanlık', 'expense', NULL),
('İK Danışmanlığı', 'expense', NULL),
('Araç Giderleri', 'expense', NULL),
('Yakıt Giderleri', 'expense', NULL),
('Seyahat ve Konaklama', 'expense', NULL),
('Yemek Giderleri', 'expense', NULL),
('Eğitim ve Seminer', 'expense', NULL),
('Bilgisayar ve Teknoloji', 'expense', NULL),
('Yazılım Lisansları', 'expense', NULL),
('Reklam ve Pazarlama', 'expense', NULL),
('Bakım ve Onarım', 'expense', NULL),
('Banka Komisyonları', 'expense', NULL),
('Faiz Giderleri', 'expense', NULL),
('Amortisman Giderleri', 'expense', NULL),

-- Gelir Kategorileri
('Satış Gelirleri', 'income', NULL),
('Hizmet Gelirleri', 'income', NULL),
('Faiz Gelirleri', 'income', NULL),
('Kira Gelirleri', 'income', NULL),
('Diğer Gelirler', 'income', NULL),
('İhracat Gelirleri', 'income', NULL),
('Danışmanlık Gelirleri', 'income', NULL)
ON CONFLICT (name, type) DO NOTHING;