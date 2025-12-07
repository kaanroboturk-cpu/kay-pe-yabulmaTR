"use client";
import { useState } from 'react';

// --- DİL VE METİN AYARLARI ---
const METINLER = {
  tr: {
    baslik: "Kayıp Eşya Portalı",
    altBaslik: "Hızlı & Güvenli Erişim",
    girisYap: "Giriş Yap",
    kayitOl: "Kayıt Ol",
    tcNo: "T.C. Kimlik Numarası",
    telNo: "Telefon Numarası (İletişim İçin)",
    sifre: "Şifre",
    sifreTekrar: "Şifre (Tekrar)",
    buldum: "Buldum",
    kaybettim: "Kaybettim",
    ayarlar: "Ayarlar",
    profil: "Profilim",
    puan: "Sosyal Puan",
    rozetler: "Rozetlerim",
    cikis: "Çıkış Yap",
    bildirimVar: "🔔 Dikkat: Yakınında Siyah Cüzdan bulundu!",
    seviye: "Seviye",
    neKaybettin: "🔍 Ne kaybettin? (Örn: Anahtar)",
    yakinindakiler: "📍 Konumuna Yakın Bulunanlar",
    iletisimGor: "Sahibine Ulaş",
    bulunamadi: "Henüz eşleşen bir ilan yok.",
    aiTarama: "🛡️ Dosya Analiz Ediliyor...",
    aiOnay: "✅ Dosya Temiz. İçerik Güvenli.",
    tcHata: "Geçersiz T.C. Kimlik Numarası!",
    sifreHata: "Şifreler uyuşmuyor!",
    girisHata: "T.C. veya Şifre Hatalı! (Kayıt oldunuz mu?)",
    adminMesaj: "Yönetici yetkisi doğrulandı. Hoş geldiniz Patron."
  },
  en: {
    baslik: "Lost & Found Portal",
    altBaslik: "Fast & Secure Access",
    girisYap: "Login",
    kayitOl: "Register",
    tcNo: "National ID",
    telNo: "Phone Number",
    sifre: "Password",
    sifreTekrar: "Confirm Password",
    buldum: "I Found",
    kaybettim: "I Lost",
    ayarlar: "Settings",
    profil: "My Profile",
    puan: "Social Score",
    rozetler: "My Badges",
    cikis: "Log Out",
    bildirimVar: "🔔 Alert: Black Wallet found nearby!",
    seviye: "Level",
    neKaybettin: "🔍 What did you lose?",
    yakinindakiler: "📍 Found Nearby",
    iletisimGor: "Contact Finder",
    bulunamadi: "No matching items found.",
    aiTarama: "🛡️ Analyzing File...",
    aiOnay: "✅ File Clean. Content Verified.",
    tcHata: "Invalid ID Number!",
    sifreHata: "Passwords do not match!",
    girisHata: "Invalid ID or Password! (Did you register?)",
    adminMesaj: "Admin privileges verified. Welcome Boss."
  }
};

export default function App() {
  const [ekran, setEkran] = useState('giris'); 
  const [dil, setDil] = useState('tr');
  const [sesSeviyesi, setSesSeviyesi] = useState(0.5);
  const [bildirim, setBildirim] = useState(null); 

  // --- SANAL VERİTABANI ---
  const [kayitliKullanicilar, setKayitliKullanicilar] = useState([]);

  // STATE'LER
  const [formModu, setFormModu] = useState('giris'); 

  const [kullanici, setKullanici] = useState({
    isim: "Kullanıcı",
    tc: "",
    puan: 0,
    rozetler: [],
    dogrulanmis: false,
    isAdmin: false
  });

  const [ilanlar, setIlanlar] = useState([
    { id: 1, baslik: 'Siyah Deri Cüzdan', yer: 'Kantin / Kafeterya', tarih: 'Bugün', uzaklik: '10m', user: 'Ahmet Y.' },
    { id: 2, baslik: 'AirPods Pro', yer: 'A Blok Giriş', tarih: 'Dün', uzaklik: '50m', user: 'Mehmet K.' },
    { id: 3, baslik: 'Mavi Şemsiye', yer: 'Güvenlik Kulübesi', tarih: '2 gün önce', uzaklik: '120m', user: 'Ayşe Z.' },
  ]);

  const t = METINLER[dil]; 

  const bildirimGoster = (mesaj, tur = 'basari') => {
    setBildirim({ mesaj, tur });
    setTimeout(() => { setBildirim(null); }, 3500); 
  };

  const sesCal = () => { console.log("🔊 SES ÇALDI (Seviye: " + sesSeviyesi + ")"); };

  const ilanSil = (id) => {
    if(confirm("Silmek istiyor musun patron?")) {
      setIlanlar(ilanlar.filter(ilan => ilan.id !== id));
      bildirimGoster("İlan sistemden silindi.", "basari");
    }
  };

  const tcKimlikDogrula = (tc) => {
    if (tc.length !== 11) return false;
    if (tc[0] === '0') return false;
    let tekler = 0, ciftler = 0, sonuc = 0, toplam = 0;
    tekler = parseInt(tc[0]) + parseInt(tc[2]) + parseInt(tc[4]) + parseInt(tc[6]) + parseInt(tc[8]);
    ciftler = parseInt(tc[1]) + parseInt(tc[3]) + parseInt(tc[5]) + parseInt(tc[7]);
    tekler = tekler * 7;
    sonuc = tekler - ciftler;
    if (sonuc % 10 !== parseInt(tc[9])) return false;
    for (let i = 0; i < 10; i++) toplam += parseInt(tc[i]);
    if (toplam % 10 !== parseInt(tc[10])) return false;
    return true;
  };

  // --- KAYIT OL (SMS OLMADAN DİREKT KAYIT) ---
  const handleKayitOl = (e) => {
    e.preventDefault();
    const data = {
      tc: e.target.tc.value,
      tel: e.target.tel.value,
      sifre: e.target.sifre.value,
      sifre2: e.target.sifre2.value
    };

    if (!tcKimlikDogrula(data.tc)) { bildirimGoster(t.tcHata, "hata"); return; }
    if (data.sifre !== data.sifre2) { bildirimGoster(t.sifreHata, "hata"); return; }
    if (data.tel.length < 10) { bildirimGoster("Telefon numaranızı kontrol edin.", "hata"); return; }

    const zatenVar = kayitliKullanicilar.find(k => k.tc === data.tc);
    if(zatenVar) { bildirimGoster("Bu T.C. ile zaten kayıt olunmuş!", "hata"); return; }

    // DİREKT KAYDET
    const yeniKullanici = { 
      tc: data.tc, 
      sifre: data.sifre,
      tel: data.tel,
      isim: "Yeni Üye" 
    };
    
    setKayitliKullanicilar([...kayitliKullanicilar, yeniKullanici]); 
    bildirimGoster("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.", "basari");
    setFormModu('giris'); // Otomatik giriş ekranına at
  };

  // --- GİRİŞ YAP ---
  const handleGirisYap = (e) => {
    e.preventDefault();
    const tc = e.target.tc.value;
    const sifre = e.target.sifre.value;

    if (sifre === '123456') {
      bildirimGoster(t.adminMesaj, "ozel");
      setKullanici({ isim: "Yönetici", tc: "ADMIN", puan: 9999, rozetler: ["👑 Yetkili"], dogrulanmis: true, isAdmin: true });
      setEkran('yoneticiPaneli');
      return;
    }

    if (!tcKimlikDogrula(tc)) { bildirimGoster(t.tcHata, "hata"); return; }
    
    const bulunanKullanici = kayitliKullanicilar.find(k => k.tc === tc && k.sifre === sifre);

    if (bulunanKullanici) {
      bildirimGoster("Giriş Başarılı! Hoş geldin.", "basari");
      setKullanici({ isim: "Üye", tc: tc, puan: 0, rozetler: ["🥉 Yeni"], dogrulanmis: true, isAdmin: false });
      setEkran('anasayfa');
    } else {
      bildirimGoster(t.girisHata, "hata");
    }
  };

  // --- 1. EKRAN: GİRİŞ / KAYIT ---
  if (ekran === 'giris') {
    return (
      <div style={kapsayiciStil}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');`}</style>
        {bildirim && <BildirimKutusu mesaj={bildirim.mesaj} tur={bildirim.tur} />}

        <div style={panelStil}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <div style={{fontSize: '50px', marginBottom: '10px'}}>🔐</div>
            <h2 style={{ color: '#4a4e69', fontWeight: '900', margin: 0 }}>{t.baslik}</h2>
            <p style={{color: '#b2bec3', fontSize: '14px', marginTop: '5px'}}>{t.altBaslik}</p>
          </div>

          <div style={{display:'flex', background:'#f1f2f6', padding:'5px', borderRadius:'50px', marginBottom:'20px'}}>
            <button onClick={() => setFormModu('giris')} style={{flex:1, padding:'10px', borderRadius:'50px', border:'none', background: formModu==='giris'?'white':'transparent', color:'#2d3436', fontWeight:'bold', cursor:'pointer', boxShadow: formModu==='giris'?'0 2px 5px rgba(0,0,0,0.1)':'none'}}>{t.girisYap}</button>
            <button onClick={() => setFormModu('kayit')} style={{flex:1, padding:'10px', borderRadius:'50px', border:'none', background: formModu==='kayit'?'white':'transparent', color:'#2d3436', fontWeight:'bold', cursor:'pointer', boxShadow: formModu==='kayit'?'0 2px 5px rgba(0,0,0,0.1)':'none'}}>{t.kayitOl}</button>
          </div>

          <form onSubmit={formModu === 'giris' ? handleGirisYap : handleKayitOl} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div><input name="tc" type="number" placeholder={t.tcNo} required style={inputStil} onInput={(e) => {if(e.target.value.length > 11) e.target.value = e.target.value.slice(0,11)}} /></div>
            
            {formModu === 'kayit' && (
              <div style={{animation: 'slideDown 0.3s'}}>
                <input name="tel" type="tel" placeholder={t.telNo} required style={inputStil} />
              </div>
            )}

            <div><input name="sifre" type="password" placeholder={t.sifre} required style={inputStil} /></div>
            
            {formModu === 'kayit' && (
              <div style={{animation: 'slideDown 0.3s'}}>
                <input name="sifre2" type="password" placeholder={t.sifreTekrar} required style={inputStil} />
              </div>
            )}

            <button type="submit" style={butonStil}>
              {formModu === 'giris' ? `${t.girisYap} ➜` : `${t.kayitOl} ➜`}
            </button>
          </form>

          <p style={{textAlign:'center', fontSize: '11px', color: '#ccc', marginTop: '20px'}}>© 2025 Güvenli Eşya Sistemi</p>
        </div>
      </div>
    );
  }

  // --- YÖNETİCİ PANELİ ---
  if (ekran === 'yoneticiPaneli') {
    return (
      <div style={kapsayiciStil}>
        {bildirim && <BildirimKutusu mesaj={bildirim.mesaj} tur={bildirim.tur} />}
        <div style={{ ...panelStil, maxWidth: '800px', background: '#fff0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e17055', paddingBottom: '15px' }}>
            <h2 style={{ color: '#d63031', margin: 0 }}>🛡️ {t.yoneticiPaneli}</h2>
            <button onClick={() => setEkran('giris')} style={{ background: '#2d3436', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>Çıkış</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', color: '#333' }}>
            <thead><tr style={{ color: '#d63031', fontSize: '14px' }}><th>ID</th><th>Başlık</th><th>Konum</th><th>Kullanıcı</th><th>İşlem</th></tr></thead>
            <tbody>
              {ilanlar.map(ilan => (
                <tr key={ilan.id} style={{ background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '15px', borderRadius: '15px 0 0 15px' }}>#{ilan.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{ilan.baslik}</td>
                  <td style={{ padding: '15px' }}>{ilan.yer}</td>
                  <td style={{ padding: '15px' }}>{ilan.user}</td>
                  <td style={{ padding: '15px', borderRadius: '0 15px 15px 0' }}>
                    <button onClick={() => ilanSil(ilan.id)} style={{ padding: '8px 15px', background: '#d63031', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>Sil 🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ilanlar.length === 0 && <p style={{textAlign:'center', color:'#999'}}>Temiz iş patron.</p>}
        </div>
      </div>
    );
  }

  // --- NAVBAR ---
  const Navbar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', borderRadius: '50px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <strong style={{ fontSize: '18px', cursor: 'pointer', fontWeight: '900', letterSpacing: '0.5px' }} onClick={() => setEkran('anasayfa')}>🔍 {t.baslik}</strong>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div onClick={() => bildirimGoster(t.bildirimVar, 'uyari')} style={{ cursor: 'pointer', position: 'relative', fontSize: '22px' }}>🔔<span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: '#ff7675', borderRadius: '50%', border: '2px solid white' }}></span></div>
        <div onClick={() => setEkran('profil')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '5px 15px', borderRadius: '30px', color: '#6c5ce7', fontWeight: 'bold' }}>
          👤 {kullanici.dogrulanmis && <span>✅</span>} <span style={{fontSize:'14px'}}>{kullanici.isim}</span>
        </div>
        <div onClick={() => setEkran('ayarlar')} style={{ cursor: 'pointer', fontSize: '22px' }}>⚙️</div>
        <div onClick={() => setDil(dil === 'tr' ? 'en' : 'tr')} style={{ cursor: 'pointer', fontSize: '14px', background: 'rgba(255,255,255,0.4)', padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold' }}>{dil === 'tr' ? '🇬🇧' : '🇹🇷'}</div>
      </div>
    </div>
  );

  return (
    <div style={kapsayiciStil}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');`}</style>
      {bildirim && <BildirimKutusu mesaj={bildirim.mesaj} tur={bildirim.tur} />}

      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Navbar />
        {ekran === 'anasayfa' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <Kart ikon="📸" baslik={t.buldum} onClick={() => setEkran('buldum')} renk="#6c5ce7" />
            <Kart ikon="😢" baslik={t.kaybettim} onClick={() => setEkran('kaybettim')} renk="#fd79a8" />
          </div>
        )}
        {ekran === 'profil' && (
          <div style={panelStil}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '100px', height: '100px', background: '#dfe6e9', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', border: '4px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>😎</div>
              <h2 style={{color: '#2d3436', margin: 0}}>{kullanici.isim}</h2>
              <p style={{color: '#b2bec3', fontWeight: 'bold'}}>{t.seviye}: {Math.floor(kullanici.puan / 50) + 1}</p>
            </div>
            <div style={{ background: '#f1f2f6', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
              <h4 style={{margin: '0 0 15px 0', color: '#636e72'}}>🏆 {t.rozetler}</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {kullanici.rozetler.map((rozet, i) => <span key={i} style={{ background: 'white', color: '#e17055', padding: '8px 15px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{rozet}</span>)}
              </div>
            </div>
            <button onClick={() => setEkran('anasayfa')} style={{...butonStil, background: '#b2bec3'}}>← Geri</button>
          </div>
        )}
        {ekran === 'ayarlar' && (
          <div style={panelStil}>
            <h3 style={{ borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', color: '#2d3436' }}>{t.ayarlar}</h3>
            <div style={{ margin: '30px 0' }}>
              <label style={{ display: 'block', marginBottom: '15px', color: '#636e72', fontWeight: 'bold' }}>🔊 {t.sesAyari}</label>
              <input type="range" min="0" max="1" step="0.1" value={sesSeviyesi} onChange={(e) => setSesSeviyesi(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#6c5ce7' }} />
            </div>
            <button onClick={() => setEkran('giris')} style={{ ...butonStil, background: '#ff7675' }}>🚪 {t.cikis}</button>
            <button onClick={() => setEkran('anasayfa')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#b2bec3', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>İptal</button>
          </div>
        )}
        {ekran === 'buldum' && <FormPanelAI baslik="Bulunan Eşya" t={t} bildirimGoster={bildirimGoster} onSuccess={() => { sesCal(); setEkran('anasayfa'); }} onCancel={() => setEkran('anasayfa')} />}
        {ekran === 'kaybettim' && <KayipAramaPaneli t={t} ilanlar={ilanlar} onSuccess={() => { sesCal(); bildirimGoster("İletişim Bilgileri Alındı! ✅", "basari"); }} onCancel={() => setEkran('anasayfa')} />}
      </div>
    </div>
  );
}

// --- AKILLI DOSYA FORM BİLEŞENİ (ANTİVİRÜS SİMÜLASYONU) ---
const FormPanelAI = ({ baslik, t, bildirimGoster, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [durum, setDurum] = useState("");
  const [secilenDosya, setSecilenDosya] = useState(null);

  const dosyaSecildi = (e) => {
    const file = e.target.files[0];
    if (file) setSecilenDosya(file);
  };

  const handleYayinla = () => {
    if (!secilenDosya) { bildirimGoster("Lütfen önce bir fotoğraf seçin.", "hata"); return; }
    
    setLoading(true); 
    setDurum("tariyor"); 

    setTimeout(() => { 
      // KONTROLLER
      const izinVerilenler = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const resimMi = izinVerilenler.includes(secilenDosya.type);
      const boyutuUygunMu = secilenDosya.size <= 10000000;

      if (resimMi && boyutuUygunMu) {
        setDurum("onay"); 
        setTimeout(() => {
          bildirimGoster("İlan Başarıyla Yayınlandı! (+10 Puan)", "basari");
          onSuccess();
        }, 1500); 
      } else {
        setDurum("red");
        if (!resimMi) bildirimGoster("🚨 VİRÜS UYARISI: Sadece resim dosyası yükleyebilirsiniz!", "hata");
        else bildirimGoster("⚠️ Dosya çok büyük (Max 10MB)", "uyari");
        
        setTimeout(() => { setLoading(false); setSecilenDosya(null); }, 3000);
      }
    }, 2500); 
  };

  return (
    <div style={panelStil}>
      <h3 style={{color: '#2d3436', marginBottom: '20px'}}>{baslik}</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '60px', animation: durum === 'red' ? 'shake 0.5s' : 'bounce 1s infinite' }}>{durum === 'tariyor' ? '🛡️' : (durum === 'onay' ? '✅' : '🦠')}</div>
          <p style={{ color: durum === 'red' ? '#d63031' : (durum === 'onay' ? '#00b894' : '#fdcb6e'), fontWeight: 'bold', marginTop: '10px' }}>
            {durum === 'tariyor' ? t.aiTarama : (durum === 'onay' ? t.aiOnay : "TEHDİT ALGILANDI!")}
          </p>
        </div>
      ) : (
        <>
          <div style={{border: '2px dashed #dfe6e9', padding: '20px', borderRadius: '20px', textAlign: 'center', marginBottom: '15px', backgroundColor: '#fdfdfd'}}>
            <label style={{cursor: 'pointer', display: 'block', color: '#636e72'}}>📸 Fotoğraf Yükle
              <input type="file" onChange={dosyaSecildi} style={{ display: 'none' }} />
            </label>
            {secilenDosya && <p style={{fontSize: '14px', color: '#00b894', margin: '10px 0', fontWeight: 'bold'}}>✓ {secilenDosya.name}</p>}
          </div>
          <input type="text" placeholder="Ne Buldun?" style={inputStil} />
          <input type="text" placeholder="Nerede?" style={{...inputStil, marginTop: '15px'}} />
          <div style={{ marginTop: '20px', padding: '20px', background: '#f1f2f6', borderRadius: '20px' }}>
            <p style={{margin: '0 0 10px 0', fontSize: '14px', color: '#6c5ce7', fontWeight: 'bold'}}>🛡️ Güvenlik Sorusu</p>
            <input type="text" placeholder="Soru?" style={inputStil} />
            <input type="text" placeholder="Cevap?" style={{...inputStil, marginTop: '10px'}} />
          </div>
          <button onClick={handleYayinla} style={{...butonStil, marginTop: '25px', background: '#6c5ce7'}}>Güvenli Yayınla</button>
          <button onClick={onCancel} style={{...butonStil, background: '#b2bec3', marginTop: '10px'}}>Vazgeç</button>
        </>
      )}
    </div>
  );
};

// --- ARAMA PANELİ ---
const KayipAramaPaneli = ({ t, ilanlar, onSuccess, onCancel }) => {
  const [arama, setArama] = useState('');
  const filtrelenmis = ilanlar.filter(i => i.baslik.toLowerCase().includes(arama.toLowerCase()) || i.yer.toLowerCase().includes(arama.toLowerCase()));
  return (
    <div style={panelStil}>
      <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#b2bec3', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}>← Geri</button>
      <input type="text" placeholder={t.neKaybettin} value={arama} onChange={(e) => setArama(e.target.value)} style={{ ...inputStil, padding: '15px', fontSize: '16px', border: '2px solid #fd79a8', marginBottom: '20px' }} />
      {filtrelenmis.map(ilan => (
        <div key={ilan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9f9f9', borderRadius: '15px', marginBottom: '10px' }}>
          <div><strong style={{ display: 'block', color: '#2d3436' }}>{ilan.baslik}</strong><div style={{ fontSize: '13px', color: '#636e72' }}>📍 {ilan.yer}</div></div>
          <button onClick={onSuccess} style={{ padding: '8px 15px', background: '#00b894', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>{t.iletisimGor}</button>
        </div>
      ))}
      {filtrelenmis.length === 0 && <div style={{textAlign:'center', color:'#b2bec3', marginTop:'20px'}}>🔍 {t.bulunamadi}</div>}
    </div>
  );
};

// --- TOAST BİLDİRİM KUTUSU ---
const BildirimKutusu = ({ mesaj, tur }) => {
  const renkler = {
    basari: '#00b894', // Yeşil
    hata: '#d63031',   // Kırmızı
    uyari: '#fdcb6e',  // Sarı
    ozel: '#6c5ce7'    // Mor
  };
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: renkler[tur] || '#333', color: 'white', padding: '15px 30px',
      borderRadius: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 9999,
      fontWeight: 'bold', animation: 'slideDown 0.5s', display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span>{tur === 'basari' ? '✅' : (tur === 'hata' ? '🚨' : 'ℹ️')}</span> {mesaj}
      <style>{`@keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }`}</style>
    </div>
  );
};

const Kart = ({ ikon, baslik, onClick, renk }) => (
  <div onClick={onClick} style={{ background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#2d3436', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <div style={{ fontSize: '50px', marginBottom: '10px' }}>{ikon}</div>
    <h3 style={{ margin: 0, color: renk }}>{baslik}</h3>
  </div>
);

// --- STİLLER ---
const kapsayiciStil = { minHeight: '100vh', background: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Nunito', sans-serif", padding: '20px', color: '#333' };
const panelStil = { background: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', maxHeight: '85vh', overflowY: 'auto' };
const inputStil = { width: '100%', padding: '15px', borderRadius: '20px', border: '2px solid #dfe6e9', boxSizing: 'border-box', color: '#2d3436', fontSize: '15px', outline: 'none', transition: 'border 0.3s', backgroundColor: '#fdfdfd' };
const butonStil = { width: '100%', padding: '15px', borderRadius: '30px', border: 'none', background: '#6c5ce7', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(108, 92, 231, 0.4)' };
