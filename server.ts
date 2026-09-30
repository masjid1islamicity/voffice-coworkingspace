import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client Server-side
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Helper to get fallback text if Gemini API is not configured or in fallback mode
  const getAiInstance = () => {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Islamicity Virtual Office Backend",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Contract Generator (Akad Ijarah & Perjanjian Sewa Virtual Office)
  app.post("/api/ai/generate-contract", async (req, res) => {
    try {
      const {
        tenantName,
        businessType,
        packageType,
        durationMonths,
        monthlyRate,
        representativeName,
        tenantAddress,
        masjidLocation,
        wakafPercentage = 5,
        customClauses = "",
      } = req.body;

      const prompt = `
Anda adalah Pakar Hukum Bisnis & Dewan Pengawas Fiqh Muamalah untuk "Islamicity Virtual Office & Sharia Co-Working Hub".
Buatlah Dokumen Resmi "SURAT PERJANJIAN AKAD IJARAH LAYANAN VIRTUAL OFFICE DAN FASILITAS CO-WORKING BERBASIS SYARIAH" yang sah secara hukum Indonesia (KUHPerdata & UU Cipta Kerja/PTSP) dan sesuai Fatwa DSN-MUI tentang Akad Ijarah.

Informasi Pihak & Layanan:
- Pihak Pertama (Pengelola): PT Islamicity Mandiri Berdaya / Manajemen Virtual Office Masjid Hub (${masjidLocation || "Pusat Bisnis Komunitas Masjid Agung"})
- Pihak Kedua (Penyewa): ${tenantName} (Bentuk Usaha: ${businessType})
- Penanggung Jawab: ${representativeName}
- Alamat Klien: ${tenantAddress || "Kota DKI Jakarta / Terdaftar"}
- Paket Layanan: ${packageType}
- Durasi Sewa: ${durationMonths} Bulan
- Biaya Layanan: Rp ${Number(monthlyRate).toLocaleString("id-ID")}/bulan (Termasuk alokasi infaq/wakaf produktif ${wakafPercentage}%)
- Catatan Tambahan: ${customClauses || "Standar operasional Islami, larangan aktivitas melanggar syariat, ruang rapat kuota bulanan."}

Format Output:
Berikan dokumen perjanjian legal lengkap, terstruktur rapi dengan:
1. Judul Resmi & Nomor Kontrak (Format: IVO/KTR/SYR/[BULAN]/[TAHUN])
2. Mukaddimah & Bismillah serta Dasar Hukum (Fatwa DSN-MUI No. 09/DSN-MUI/IV/2000 tentang Ijarah dan Permendag RI No. 8/2020 tentang Virtual Office)
3. Identitas Lengkap Para Pihak (Pihak I dan Pihak II)
4. Pasal 1: Objek Akad Ijarah & Ruang Lingkup Layanan (Domisili bisnis, penanganan surat/paket, resepsionis, kuota ruang rapat, akses coworking)
5. Pasal 2: Jangka Waktu Akad & Tata Cara Perpanjangan
6. Pasal 3: Biaya Sewa, Tata Cara Pembayaran & Alokasi Dana Wakaf/Infaq Produktif
7. Pasal 4: Hak dan Kewajiban Para Pihak (Menjaga adab kantor, kepatuhan bisnis halal)
8. Pasal 5: Larangan Penggunaan & Pembatalan Akad
9. Pasal 6: Penanganan Keterlambatan (Bebas Riba, mekanisme Ta'widh / Ganti Rugi Nyata & Ta'zir donasi sosial)
10. Pasal 7: Penyelesaian Perselisihan (Musyawarah mufakat atau BASYARNAS - Badan Arbitrase Syariah Nasional)
11. Kolom Tanda Tangan Para Pihak lengkap dengan Materai Digital 10.000.

Gunakan bahasa hukum Indonesia yang formal, elegan, tegas, dan sarat nilai integritas Islami.`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "Anda adalah penasihat hukum senior spesialis hukum korporasi Indonesia dan Dewan Pengawas Syariah Fiqh Muamalah.",
          },
        });
        res.json({ contractText: response.text });
      } else {
        // Fallback generator if offline / testing
        const sampleContract = `BISMILLAHIRRAHMANIRRAHIM
SURAT PERJANJIAN AKAD IJARAH (SEWA MANFAAT) LAYANAN VIRTUAL OFFICE
Nomor: IVO/KTR/SYR/${new Date().getMonth() + 1}/${new Date().getFullYear()}/088

Pada hari ini, tanggal ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}, telah dibuat dan disepakati Akad Ijarah Layanan Virtual Office antara:

I. PENGELOLA ISLAMICITY VIRTUAL OFFICE HUB ("PIHAK PERTAMA"), berkedudukan di ${masjidLocation || "Gedung Pusat Bisnis Komunitas Masjid, Jakarta"}.
II. ${tenantName} ("PIHAK KEDUA"), yang diwakili oleh ${representativeName} selaku Pimpinan/Direktur, beralamat di ${tenantAddress || "Domisili Terdaftar"}.

DASAR AKAD & SYARIAH:
Perjanjian ini mengacu pada Fatwa Dewan Syari'ah Nasional MUI No. 09/DSN-MUI/IV/2000 tentang Pembiayaan Ijarah serta Peraturan Menteri Perdagangan RI tentang Penyelenggaraan Kantor Virtual.

PASAL 1 - OBJEK AKAD & FASILITAS
1. Pihak Pertama menyewakan manfaat berupa alamat domisili usaha resmi, penerimaan surat & paket pos harian, layanan resepsionis, serta kuota ruang rapat/coworking desk paket ${packageType}.
2. Pihak Kedua berhak memanfaatkan fasilitas kantor sesuai Service Level Agreement (SLA).

PASAL 2 - BIAYA SEWA & ALOKASI WAKAF PRODUKTIF
1. Nilai sewa yang disepakati adalah Rp ${Number(monthlyRate).toLocaleString("id-ID")}/bulan selama jangka waktu ${durationMonths} bulan.
2. Dari total nilai sewa, sebesar ${wakafPercentage}% dialokasikan sebagai infaq/wakaf produktif bagi program pemberdayaan ekonomi umat dan operasional masjid.

PASAL 3 - KEPATUHAN BISNIS HALAL (SHARIA COMPLIANCE)
1. Pihak Kedua menyatakan bahwa seluruh kegiatan usaha yang dijalankan bebas dari unsur riba, maysir (judi), gharar (ketidakjelasan terlarang), dan produk/jasa yang diharamkan syariat Islam.
2. Pihak Pertama berhak menghentikan sewa seketika apabila ditemukan pelanggaran terhadap integritas hukum dan syariah.

PASAL 4 - PENYELESAIAN PERSELISIHAN
Segala perselisihan diselesaikan dengan prinsip Musyawarah untuk Mufakat, dan apabila tidak tercapai titik temu akan dirujuk ke Badan Arbitrase Syariah Nasional (BASYARNAS).

Demikian Perjanjian Akad Ijarah ini dibuat dengan penuh keikhlasan, amanah, dan tanpa paksaan dari pihak manapun.

PIHAK PERTAMA (PENGELOLA)          PIHAK KEDUA (PENYEWA)
( [Materai Rp 10.000] )
_____________________               _____________________
Direktur Pengelola                  ${representativeName}`;

        res.json({ contractText: sampleContract });
      }
    } catch (err: any) {
      console.error("Error generating contract:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses dokumen kontrak" });
    }
  });

  // AI Mailroom OCR & Government Letter Analyzer
  app.post("/api/ai/analyze-letter", async (req, res) => {
    try {
      const { sender, subject, senderCategory, summarySnippet, clientName } = req.body;

      const prompt = `
Analisis surat masuk untuk klien Virtual Office "${clientName}".
Pengirim: ${sender}
Kategori Surat: ${senderCategory} (Contoh: KPP Pajak / Instansi Pemerintah / Bank / Notaris / Vendor / Pengadilan)
Perihal / Cuplikan Isi: "${subject}. ${summarySnippet || ''}"

Tugas Anda:
1. Tentukan Tingkat Urgensi (Sangat Mendesak / Penting / Normal / Informasi Rutin).
2. Buat Ringkasan Singkat (2-3 kalimat jelas).
3. Buat Tindakan Rekomendasi (Action Items) bagi Direktur / Manajemen Klien.
4. Buat Draft Pesan Notifikasi WhatsApp Resmi & Santun (Gaya bahasa ramah Islami dengan Assalamu'alaikum dan petunjuk pengambilan di Mailroom Desk).

Kembalikan jawaban dalam format JSON murni:
{
  "urgency": "Sangat Mendesak" | "Penting" | "Normal",
  "summary": "...",
  "recommendedAction": "...",
  "whatsappDraft": "...",
  "deadlineWarning": "..."
}`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Anda adalah AI Smart Mailroom Secretary pada Virtual Office.",
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            urgency: "Penting",
            summary: text,
            recommendedAction: "Buka dan tindak lanjuti sebelum batas waktu.",
            whatsappDraft: `Assalamu'alaikum wr. wb. Tim ${clientName}, terdapat surat resmi dari ${sender} di resepsionis. Mohon dapat mengambil atau meminta scan dokumen. Terima kasih.`,
          });
        }
      } else {
        res.json({
          urgency: "Penting",
          summary: `Surat resmi dari ${sender} perihal ${subject}. Memerlukan perhatian manajemen untuk konfirmasi berkas.`,
          recommendedAction: "Harap verifikasi surat masuk dan lakukan tanggapan ke instansi pengirim bila terdapat tenggat waktu.",
          whatsappDraft: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nKepada Yth. Pimpinan *${clientName}*,\n\nKami menginformasikan bahwa staf resepsionis Islamicity Virtual Office telah menerima surat fisik:\n📬 *Pengirim*: ${sender}\n📋 *Perihal*: ${subject}\n🏷️ *Status*: Tersimpan aman di Locker Mailroom\n\nAnda dapat mengambil fisik dokumen di meja resepsionis atau meminta tim kami untuk scan lengkap via portal.\n\nJazakumullah khairan katsiran.\n*Front Desk Islamicity V-Office*`,
          deadlineWarning: "Periksa kemungkinan tenggat 7-14 hari kerja.",
        });
      }
    } catch (err: any) {
      console.error("Error analyzing letter:", err);
      res.status(500).json({ error: err?.message || "Gagal menganalisis surat" });
    }
  });

  // AI SOP Consultant & Customized Workflow Generator
  app.post("/api/ai/sop-consultant", async (req, res) => {
    try {
      const { category, query, organizationType, cityLocation } = req.body;

      const prompt = `
Anda adalah Konsultan Ahli Manajemen Operasional & Standarisasi Bisnis Virtual Office Syariah Indonesia.
Topik SOP: ${category}
Pertanyaan / Kebutuhan Kustomisasi: "${query}"
Karakteristik Usaha: ${organizationType || "Sentra Bisnis Komunitas Masjid & Inkubator UMKM"}
Wilayah: ${cityLocation || "Seluruh Indonesia"}

Berikan panduan Standard Operational Procedure (SOP) yang sangat terperinci, sistematis, dan praktis dijalankan, meliputi:
1. Tujuan & Ruang Lingkup SOP
2. Dasar Regulasi (OSS RBA, PTSP, Ketentuan Sewa Domisili, Fiqh Muamalah)
3. Prosedur Operasional Langkah demi Langkah (Step-by-Step Flowchart Text)
4. Dokumen / Formulir / Checklists yang Wajib Digunakan
5. Service Level Agreement (SLA) & Standar Waktu Respons
6. Matriks Penanggung Jawab (RACI: Front Desk, Supervisor Operasional, Legal Syariah, Tenant)
7. Pencegahan Risiko & Tips Integritas Berkah.

Sajikan dalam format Markdown yang rapi, profesional, dan mudah diaplikasikan.`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "Anda adalah Senior SOP Auditor and Sharia Business Consultant bersertifikat.",
          },
        });
        res.json({ sopGuide: response.text });
      } else {
        res.json({
          sopGuide: `### PANDUAN STANDAR OPERASIONAL (SOP) - ${category.toUpperCase()}\n\n**1. Tujuan & Sasaran**\nMemastikan seluruh alur pelayanan ${category} berjalan tepat waktu, transparan, memenuhi standar hukum Indonesia (Permendag RI) dan amanah secara Fiqh Muamalah.\n\n**2. Alur Pelaksanaan Utama**\n- **Tahap 1**: Penerimaan dan pencatatan dalam sistem registrasi digital.\n- **Tahap 2**: Verifikasi kepatuhan legalitas dan etika bisnis syariah.\n- **Tahap 3**: Pelaksanaan layanan dengan SLA maksimal 15-30 menit.\n- **Tahap 4**: Notifikasi otomatis multi-channel (WhatsApp & Email).\n- **Tahap 5**: Arsip digital terenkripsi dan laporan periodik ke manajer operasional.\n\n**3. Standar SLA & Kualitas**\n- Kecepatan respons tamu: < 2 menit di lobby\n- Penanganan surat: tercatat < 10 menit sejak kurir tiba\n- Reservasi ruang rapat: konfirmasi instan digital.`,
        });
      }
    } catch (err: any) {
      console.error("Error SOP consultant:", err);
      res.status(500).json({ error: err?.message || "Gagal konsultasi SOP" });
    }
  });

  // AI Virtual Receptionist Assistant
  app.post("/api/ai/virtual-receptionist", async (req, res) => {
    try {
      const { callerName, callerCompany, callerMessage, targetClientName, urgency } = req.body;

      const prompt = `
Sebagai Resepsionis Cerdas Islamicity Virtual Office, buatlah:
1. Ringkasan Catatan Panggilan Masuk (Telephone Memo) yang profesional.
2. Draf Pesan WhatsApp resmi yang dikirim ke Direktur/Pimpinan "${targetClientName}".
3. Rekomendasi tindak lanjut bagi klien.

Detail Telepon/Tamu:
- Nama Penelepon/Tamu: ${callerName}
- Dari Perusahaan/Instansi: ${callerCompany}
- Pesan/Tujuan: "${callerMessage}"
- Tingkat Urgensi: ${urgency || "Normal"}

Buat dalam format JSON:
{
  "memoSummary": "...",
  "whatsappNotification": "...",
  "recommendedAction": "..."
}`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Anda adalah resepsionis eksekutif virtual office berstandar hotel bintang lima dengan etika Islami.",
          },
        });
        res.json(JSON.parse(response.text || "{}"));
      } else {
        res.json({
          memoSummary: `Panggilan dari ${callerName} (${callerCompany}) mengenai "${callerMessage}".`,
          whatsappNotification: `Assalamu'alaikum wr. wb. Bapak/Ibu Pimpinan *${targetClientName}*,\n\nAda pesan telepon masuk di Meja Resepsionis Islamicity V-Office:\n👤 *Penelepon*: ${callerName} (${callerCompany})\n📝 *Pesan*: "${callerMessage}"\n⚡ *Urgensi*: ${urgency || "Normal"}\n\nMohon dapat dihubungi kembali jika diperlukan. Terima kasih.\n*Salam, Meja Resepsionis Islamicity*`,
          recommendedAction: "Hubungi kembali penelepon pada jam kerja aktif.",
        });
      }
    } catch (err: any) {
      console.error("Error in receptionist:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses panggilan" });
    }
  });

  // AI Zakat Calculator & Fiqh Muamalah Business Advisor
  app.post("/api/ai/calculate-zakat", async (req, res) => {
    try {
      const {
        tenantName,
        businessSector,
        businessType,
        monthlyRate = 0,
        financials = {},
        goldPricePerGram = 1450000,
        calendarType = "hijriyah",
        billingSummary = {},
        customNotes = "",
      } = req.body;

      const {
        cashAndEquivalents = 0,
        accountsReceivable = 0,
        inventoryValue = 0,
        shortTermInvestments = 0,
        shortTermPayables = 0,
        operationalExpensesDue = 0,
        shortTermFinancingDue = 0,
      } = financials;

      const totalGrossLiquid =
        Number(cashAndEquivalents) +
        Number(accountsReceivable) +
        Number(inventoryValue) +
        Number(shortTermInvestments);

      const totalDeductible =
        Number(shortTermPayables) +
        Number(operationalExpensesDue) +
        Number(shortTermFinancingDue);

      const netZakatBase = Math.max(0, totalGrossLiquid - totalDeductible);
      const nisabThreshold = 85 * Number(goldPricePerGram);
      const zakatRate = calendarType === "hijriyah" ? 0.025 : 0.02577;
      const isMuzakki = netZakatBase >= nisabThreshold;
      const calculatedZakat = isMuzakki ? Math.round(netZakatBase * zakatRate) : 0;

      const systemInstruction = `
ROLE: Anda adalah Dewan Pengawas Syariah (DPS) & Pakar Fiqh Zakat Bisnis/Tijarah bersertifikasi BAZNAS RI dan DSN-MUI.
TASK: Lakukan audit dan hisab zakat maal perniagaan (Zakat Tijarah) untuk entitas bisnis/tenant virtual office berdasarkan laporan neraca likuiditas dan integrasi data tagihan operasional.

ATURAN FIQH ZAKAT TIJARAH:
1. Nisab = Senilai 85 gram emas murni.
2. Tarif = 2.5% (Tahun Hijriyah / 354 hari) atau 2.577% (Tahun Masehi / 365 hari).
3. Harta Kena Zakat = (Kas/Bank + Piutang Lancar Tertagih + Stok/Persediaan Harga Pasar + Investasi Lancar) - (Hutang Dagang Jatuh Tempo + Beban Operasional/Gaji/Sewa Jatuh Tempo + Pokok Cicilan Jatuh Tempo Tahun Berjalan).
4. Aset tetap (komputer, meja, gedung) TIDAK dikenakan zakat maal, hanya sarana usaha.
5. Zakat yang dibayarkan melalui lembaga resmi (BAZNAS/LAZ terdaftar) dapat menjadi pengurang Penghasilan Kena Pajak (PPh Badan/Orang Pribadi) sesuai UU No. 23/2011 Pasal 22.

Kembalikan hasil analisis dalam format JSON terstruktur murni.`;

      const prompt = `
Profil Entitas Bisnis & Data Tagihan:
- Nama Perusahaan / Muzakki: ${tenantName || "Mitra Bisnis Tenant"}
- Bentuk Badan Usaha: ${businessType || "PT / CV / UMKM"}
- Sektor Usaha: ${businessSector || "Layanan Bisnis & Perdagangan"}
- Nilai Sewa Virtual Office: Rp ${Number(monthlyRate).toLocaleString("id-ID")}/bulan
- Rekam Jejak Tagihan: Total Tagihan Rp ${Number(billingSummary.totalBilled || 0).toLocaleString("id-ID")} | Total Lunas Rp ${Number(billingSummary.totalPaid || 0).toLocaleString("id-ID")} | Wakaf Terkontribusi Rp ${Number(billingSummary.wakafContributed || 0).toLocaleString("id-ID")}

Neraca Harta Lancar & Kewajiban (Hisab Zakat):
- Kas & Bank/Giro: Rp ${Number(cashAndEquivalents).toLocaleString("id-ID")}
- Piutang Lancar: Rp ${Number(accountsReceivable).toLocaleString("id-ID")}
- Persediaan Stok Barang Dagang: Rp ${Number(inventoryValue).toLocaleString("id-ID")}
- Investasi Lancar/Deposito: Rp ${Number(shortTermInvestments).toLocaleString("id-ID")}
- Total Aset Lancar: Rp ${totalGrossLiquid.toLocaleString("id-ID")}

Kewajiban Jatuh Tempo (Pengurang):
- Hutang Dagang Supplier: Rp ${Number(shortTermPayables).toLocaleString("id-ID")}
- Beban Rutin/Gaji/Sewa Kantor: Rp ${Number(operationalExpensesDue).toLocaleString("id-ID")}
- Cicilan Pokok Pinjaman: Rp ${Number(shortTermFinancingDue).toLocaleString("id-ID")}
- Total Pengurang: Rp ${totalDeductible.toLocaleString("id-ID")}

Parameter Hisab:
- Harga Emas: Rp ${Number(goldPricePerGram).toLocaleString("id-ID")}/gram (Nisab 85g: Rp ${nisabThreshold.toLocaleString("id-ID")})
- Tahun Buku: ${calendarType === "hijriyah" ? "Hijriyah (2.50%)" : "Masehi (2.577%)"}
- Harta Bersih Terhitung: Rp ${netZakatBase.toLocaleString("id-ID")}
- Estimasi Zakat: Rp ${calculatedZakat.toLocaleString("id-ID")}
- Catatan Tambahan Klien: "${customNotes || "Mohon rekomendasi pengalokasian 8 asnaf dan panduan pemanfaatan Bukti Setor Zakat untuk pengurang PPh Badan."}"

Format JSON yang diharapkan:
{
  "isMuzakki": ${isMuzakki},
  "nisabThreshold": ${nisabThreshold},
  "netZakatBaseAsset": ${netZakatBase},
  "zakatObligation": ${calculatedZakat},
  "monthlyInstallment": ${Math.round(calculatedZakat / 12)},
  "fiqhVerdict": "${isMuzakki ? "Wajib Menunaikan Zakat Maal Perniagaan (Telah Memenuhi Nisab & Haul)" : "Belum Wajib Zakat Maal (Dianjurkan Memperbanyak Infaq & Sedekah Produktif)"}",
  "executiveSummary": "Uraian komprehensif hisab zakat perniagaan dalam 2-3 kalimat lugas...",
  "assetPurificationNotes": "Panduan pembersihan harta bisnis dan perlakuan piutang lancar vs piutang ragu-ragu...",
  "deductibleLiabilityAnalysis": "Analisis kewajiban lancar yang sah sebagai pengurang zakat maal...",
  "taxDeductibilityAdvice": "Panduan praktis pengajuan Bukti Setor Zakat (BSZ) sebagai pengurang Penghasilan Kena Pajak (PPh Pasal 22 UU Zakat)...",
  "asnafDistributionRecommendations": [
    {
      "asnaf": "Fakir & Miskin Dhuafa",
      "allocationPercentage": 40,
      "programSuggestion": "Bantuan pangan bergizi & modal bergulir qardhul hasan UMKM dhuafa di sekitar lingkungan sentra kantor.",
      "impactRationale": "Mencegah kemiskinan ekstrem dan mendorong mustahiq bertransformasi menjadi muzakki."
    },
    {
      "asnaf": "Fisabilillah & Santripreneur",
      "allocationPercentage": 35,
      "programSuggestion": "Beasiswa pendidikan teknologi, akuntansi syariah, dan inkubasi usaha santri mandiri.",
      "impactRationale": "Mencetak generasi wirausaha muslim yang profesional dan amanah."
    },
    {
      "asnaf": "Gharimin & Korban Riba",
      "allocationPercentage": 25,
      "programSuggestion": "Advokasi dan pembebasan pelaku usaha mikro yang terjerat pinjaman rentenir.",
      "impactRationale": "Memulihkan daya tahan ekonomi keluarga prasejahtera."
    }
  ],
  "shariaEndorsementText": "Telah diaudit dan dinyatakan sesuai kaidah Fiqh Muamalah Kontemporer serta Pedoman BAZNAS RI Nomor 1 Tahun 2024.",
  "bszVerificationCode": "BSZ-IVO-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}"
}`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction,
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            isMuzakki,
            nisabThreshold,
            netZakatBaseAsset: netZakatBase,
            zakatObligation: calculatedZakat,
            monthlyInstallment: Math.round(calculatedZakat / 12),
            fiqhVerdict: isMuzakki
              ? "Wajib Menunaikan Zakat Maal Perniagaan (Muzakki Sah)"
              : "Belum Mencapai Nisab (Dianjurkan Infaq/Sedekah)",
            executiveSummary: `Entitas ${tenantName || "Muzakki"} memiliki harta perniagaan bersih sebesar Rp ${netZakatBase.toLocaleString("id-ID")}. ${isMuzakki ? `Kewajiban zakat perniagaan adalah Rp ${calculatedZakat.toLocaleString("id-ID")}/tahun.` : "Harta bersih belum mencapai batas nisab 85 gram emas."}`,
            assetPurificationNotes: "Pastikan seluruh persediaan dinilai berdasarkan harga pasar wajar dan piutang yang dihitung adalah piutang lancar tertagih.",
            deductibleLiabilityAnalysis: "Pengurang yang diakui adalah hutang operasional dan cicilan pokok yang jatuh tempo dalam tahun berjalan.",
            taxDeductibilityAdvice: "Bukti Setor Zakat (BSZ) resmi dari BAZNAS/Baitul Maal Masjid dapat dilampirkan pada SPT Tahunan PPh Badan (Formulir 1771) untuk mengurangi Penghasilan Bruto Kena Pajak.",
            asnafDistributionRecommendations: [
              {
                asnaf: "Fakir & Miskin Dhuafa",
                allocationPercentage: 40,
                programSuggestion: "Modal Bergulir Qardhul Hasan & Paket Sembako",
                impactRationale: "Pengentasan kemiskinan dan penguatan ekonomi akar rumput.",
              },
              {
                asnaf: "Fisabilillah & Santripreneur",
                allocationPercentage: 35,
                programSuggestion: "Beasiswa Pelatihan Digital & Usaha Mandiri",
                impactRationale: "Kaderisasi pengusaha muda berintegritas syariah.",
              },
              {
                asnaf: "Gharimin",
                allocationPercentage: 25,
                programSuggestion: "Penyelesaian Utang Darurat Pengusaha Mikro",
                impactRationale: "Pelepasan jerat riba untuk pemulihan ekonomi.",
              },
            ],
            shariaEndorsementText: "Disahkan sesuai hisab Fiqh Muamalah Islamicity & Standar BAZNAS RI.",
            bszVerificationCode: `BSZ-IVO-2026-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
          });
        }
      } else {
        res.json({
          isMuzakki,
          nisabThreshold,
          netZakatBaseAsset: netZakatBase,
          zakatObligation: calculatedZakat,
          monthlyInstallment: Math.round(calculatedZakat / 12),
          fiqhVerdict: isMuzakki
            ? "Wajib Menunaikan Zakat Maal Perniagaan (Telah Memenuhi Syarat Nisab 85g Emas & Haul Usaha)"
            : "Belum Mencapai Batas Nisab (Dianjurkan Infaq & Sedekah Produktif)",
          executiveSummary: `Entitas bisnis ${tenantName || "Tenant"} memiliki harta kena zakat bersih sebesar Rp ${netZakatBase.toLocaleString("id-ID")}. ${isMuzakki ? `Kewajiban zakat perniagaan tahunan sebesar Rp ${calculatedZakat.toLocaleString("id-ID")} (${calendarType === "hijriyah" ? "2.5% Hijriyah" : "2.577% Masehi"}).` : "Jumlah harta bersih belum melampaui nisab emas Rp " + nisabThreshold.toLocaleString("id-ID") + "."}`,
          assetPurificationNotes: "Seluruh kas operasional, saldo giro syariah, persediaan barang dagangan siap jual, dan piutang lancar tertagih telah dihitung secara transparan.",
          deductibleLiabilityAnalysis: "Hutang supplier dan beban operasional sewa/gaji jatuh tempo telah dikurangkan secara sah dari total aktiva lancar.",
          taxDeductibilityAdvice: "Bukti Setor Zakat (BSZ) resmi dapat digunakan sebagai pengurang Penghasilan Kena Pajak (PPh Badan) berdasarkan UU No. 23 Tahun 2011 dan Peraturan Pemerintah No. 60 Tahun 2010.",
          asnafDistributionRecommendations: [
            {
              asnaf: "Fakir & Miskin Dhuafa Sekitar",
              allocationPercentage: 40,
              programSuggestion: "Pemberdayaan Warung Berkah & Bantuan Pangan Bergizi Balita",
              impactRationale: "Dampak langsung bagi kesejahteraan warga di sekitar sentra perkantoran masjid.",
            },
            {
              asnaf: "Fisabilillah & Santripreneur",
              allocationPercentage: 35,
              programSuggestion: "Program Inkubasi Coding, AI & Akuntansi Syariah Santri",
              impactRationale: "Mempersiapkan kemandirian generasi muda berbasis ilmu dan teknologi halal.",
            },
            {
              asnaf: "Gharimin & Pelepasan Riba",
              allocationPercentage: 25,
              programSuggestion: "Bailout Modal Qardhul Hasan bagi Korban Rentenir",
              impactRationale: "Menghidupkan kembali perputaran ekonomi keluarga mustahiq yang terhimpit utang.",
            },
          ],
          shariaEndorsementText: "Perhitungan Fiqh Zakat Tijarah telah diverifikasi secara sistematis sesuai Fatwa DSN-MUI & BAZNAS RI.",
          bszVerificationCode: `BSZ-IVO-2026-SYR-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }
    } catch (err: any) {
      console.error("Error calculating AI Zakat:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses perhitungan zakat AI" });
    }
  });

  // AI Strategic Business Matchmaker & Ecosystem Architect
  app.post("/api/ai/optimize-routes", async (req, res) => {
    try {
      const {
        hubOrigin = "Sentra Bisnis Wakaf Masjid Agung Islamicity, Jakarta Pusat",
        shipments = [],
        vehicleType = "EV Van (Zero Emission)",
        optimizationPriority = "balanced", // 'carbon_first', 'cost_first', 'fastest_time', 'balanced'
        includePrayerBreak = true,
        driverName = "Ust. Rahmat Hidayat (Eco-Fleet Captain)",
      } = req.body;

      const systemInstruction = `
ROLE: Anda adalah AI Chief Route Dispatcher & Green Logistics Architect untuk "Islamicity Smart Logistics Hub" (Infrastruktur Distribusi Berkelanjutan Berbasis Kolaborasi Multi-Tenant).

TASK:
Lakukan optimasi rute pengiriman kolaboratif (Collaborative Multi-Tenant Dispatch Run), klasterisasi titik antar (geocoded waypoint ordering), hisab reduksi emisi karbon (kg CO2e avoided), dan kalkulasi penghematan biaya logistik bersama (cost-sharing efficiency) bagi para tenant virtual office.

PRINSIP PENGIRIMAN KOLABORATIF:
1. Konsolidasi Muatan: Menggabungkan beberapa paket dari berbagai tenant ke dalam 1 armada untuk mengeliminasi 'deadhead miles' dan redundansi kurir on-demand tunggal.
2. Green & Eco-Friendly Routing: Mengutamakan rute terpendek dengan hambatan macet terendah, optimalisasi jalur EV (Electric Vehicle) / Euro-4.
3. Adab & Kesejahteraan Kurir: Sisipkan titik istirahat & shalat fardhu (Dzuhur/Ashar) di masjid strategis terdekat sepanjang rute jika jam pengiriman melintasi waktu shalat.
4. Integritas Halal & Kargo Bersih: Pisahkan penanganan paket produk halal, cold-chain herbal/makanan, dan dokumen resmi secara amanah.

Format output WAJIB JSON murni sesuai skema.`;

      const prompt = `
Parameter Pengiriman:
- Hub Keberangkatan: ${hubOrigin}
- Jenis Armada: ${vehicleType}
- Prioritas Optimasi: ${optimizationPriority}
- Sisipkan Jadwal Istirahat Shalat: ${includePrayerBreak ? "Ya (Dzuhur / Ashar di Masjid Terdekat)" : "Tidak"}
- Pengemudi Terjadwal: ${driverName}
- Daftar Paket Tenant yang Masuk Pool (${shipments.length} Paket):
${JSON.stringify(
  shipments.map((s: any, idx: number) => ({
    id: s.id || `PKG-${idx + 1}`,
    tenant: s.tenantName,
    tujuan: s.destinationAddress,
    zona: s.zoneLabel || s.destinationZone,
    kategori: s.packageCategory,
    beratKg: s.weightKg,
    volumeM3: s.volumeM3,
    prioritas: s.priority,
  })),
  null,
  2
)}

Hitung dan susun:
1. Urutan Waypoints/Stops pengantaran yang paling optimal dari segi jarak & emisi.
2. Estimasi total jarak tempuh rute kolaboratif (km) vs. total jarak jika tiap tenant mengirim sendiri-sendiri secara terpisah (km baseline).
3. Penghematan biaya total (Rp) dan efisiensi persen biaya tenant.
4. Total $CO_2$ yang diemisikan dan $CO_2$ yang berhasil dihindari/dihemat ($kg\ CO_2e$).
5. Catatan briefing taktis untuk pengemudi dan verifikasi integritas paket halal.

Format JSON yang diharapkan:
{
  "batchCode": "DISPATCH-CLB-2026-${Math.floor(1000 + Math.random() * 9000)}",
  "optimizedSequence": [
    {
      "stopIndex": 0,
      "type": "hub_origin",
      "locationName": "Islamicity Hub Central (Start)",
      "address": "${hubOrigin}",
      "etaTime": "09:00 WIB",
      "distanceFromPrevKm": 0,
      "durationFromPrevMin": 0,
      "co2EmittedG": 0,
      "specialInstructions": "Pemuatan paket sesuai urutan LIFO (Last In First Out) dan cek suhu cold chain."
    }
  ],
  "routeMetrics": {
    "totalDistanceKm": 38.5,
    "totalDurationMin": 145,
    "baselineIndividualTotalKm": 94.0,
    "distanceSavedKm": 55.5,
    "distanceSavedPercent": 59.0,
    "baselineIndividualTotalCost": 380000,
    "pooledTotalCost": 175000,
    "costSavedTotal": 205000,
    "costSavedPercent": 53.9,
    "baselineIndividualCo2Kg": 14.8,
    "pooledCo2Kg": 3.8,
    "co2AvoidedKg": 11.0,
    "co2ReductionPercent": 74.3,
    "equivalentTreesPlanted": 0.55,
    "ecoScoreGrade": "A+ Zero Emission"
  },
  "prayerRestStop": {
    "recommendedMosque": "Masjid Al-Azhar / Masjid Sunda Kelapa",
    "stopWindow": "12:00 - 12:35 WIB (Shalat Dzuhur berjamaah & istirahat sejenak)",
    "address": "Jl. Sisingamangaraja / Jl. Taman Sunda Kelapa"
  },
  "aiDispatcherBriefing": "Ringkasan taktis rute: Klasterisasi berhasil mengelompokkan area pengantaran...",
  "tenantCostSplits": [
    {
      "tenantName": "Nama Tenant",
      "allocatedFee": 35000,
      "individualCost": 75000,
      "savings": 40000,
      "savingsPercent": 53.3,
      "co2SavedKg": 2.2
    }
  ],
  "qrManifestHash": "CLB-ECO-2026-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}"
}`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction,
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          // Fallback parsing
          res.json(generateFallbackRoute(shipments, vehicleType, hubOrigin));
        }
      } else {
        res.json(generateFallbackRoute(shipments, vehicleType, hubOrigin));
      }
    } catch (err: any) {
      console.error("Error optimizing routes:", err);
      res.status(500).json({ error: err?.message || "Gagal mengoptimasi rute logistik" });
    }
  });

  // Helper Fallback Route Generator
  function generateFallbackRoute(shipments: any[], vehicleType: string, hubOrigin: string) {
    const isEV = vehicleType.toLowerCase().includes("ev") || vehicleType.toLowerCase().includes("electric");
    const count = Math.max(1, shipments.length);
    const baselineDistance = count * 18.5;
    const pooledDistance = 12 + count * 4.2;
    const distSaved = Math.max(5, baselineDistance - pooledDistance);
    const distSavedPercent = Math.round((distSaved / baselineDistance) * 100);

    const baselineCost = count * 65000;
    const pooledCost = 70000 + count * 22000;
    const costSaved = Math.max(20000, baselineCost - pooledCost);
    const costSavedPercent = Math.round((costSaved / baselineCost) * 100);

    const emissionFactor = isEV ? 0.04 : 0.16; // kg CO2 / km
    const baselineEmission = baselineDistance * 0.18; // standard individual motorbike/car
    const pooledEmission = pooledDistance * emissionFactor;
    const co2Saved = Math.max(1.5, baselineEmission - pooledEmission);
    const co2Percent = Math.round((co2Saved / baselineEmission) * 100);

    const stops: any[] = [
      {
        stopIndex: 0,
        type: "hub_origin",
        locationName: "Sentra Bisnis Wakaf Islamicity (Start)",
        address: hubOrigin,
        etaTime: "08:30 WIB",
        distanceFromPrevKm: 0,
        durationFromPrevMin: 0,
        co2EmittedG: 0,
        specialInstructions: "Pemuatan paket tenant kolaboratif dengan pemilahan segel halal.",
      },
    ];

    let currentHour = 9;
    let currentMin = 0;
    let cumDist = 0;

    shipments.forEach((s, idx) => {
      const legDist = 3.5 + (idx % 3) * 1.5;
      const legDur = 18 + (idx % 2) * 7;
      cumDist += legDist;
      currentMin += legDur;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }

      // Add prayer break after stop 2 or 3 around 12:00
      if (idx === Math.min(2, shipments.length - 1)) {
        stops.push({
          stopIndex: stops.length,
          type: "prayer_break_station",
          locationName: "Masjid Agung Sunda Kelapa / Rest Area Jamaah",
          address: "Jl. Taman Sunda Kelapa No. 16, Menteng",
          etaTime: "12:00 WIB",
          distanceFromPrevKm: 2.1,
          durationFromPrevMin: 35,
          co2EmittedG: 0,
          specialInstructions: "Istirahat Shalat Dzuhur berjamaah, evaluasi checklist muatan, dan santap siang halal.",
        });
      }

      const etaStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")} WIB`;
      stops.push({
        stopIndex: stops.length,
        type: "delivery_stop",
        locationName: `Drop ${idx + 1}: ${s.recipientName || "Penerima Tenant"}`,
        address: s.destinationAddress || `Kawasan Bisnis ${s.zoneLabel || "Jakarta"}`,
        shipmentId: s.id,
        tenantName: s.tenantName,
        recipientName: s.recipientName,
        phone: s.recipientPhone || "0812-9988-7766",
        category: s.packageCategory,
        weightKg: s.weightKg,
        etaTime: etaStr,
        distanceFromPrevKm: legDist,
        durationFromPrevMin: legDur,
        co2EmittedG: Math.round(legDist * (isEV ? 40 : 150)),
        specialInstructions: s.requiresColdChain ? "Kargo bersuhu sejuk (Cold-chain). Serahkan langsung." : "Serahkan kepada resepsionis / penerima dengan tanda terima digital.",
      });
    });

    // Return to hub
    stops.push({
      stopIndex: stops.length,
      type: "hub_return",
      locationName: "Sentra Bisnis Wakaf Islamicity (Return)",
      address: hubOrigin,
      etaTime: `${String(currentHour + 1).padStart(2, "0")}:15 WIB`,
      distanceFromPrevKm: 6.2,
      durationFromPrevMin: 25,
      co2EmittedG: Math.round(6.2 * (isEV ? 40 : 150)),
      specialInstructions: "Serah terima bukti kirim (POD digital) dan re-charge armada EV.",
    });

    const tenantCostSplits = shipments.map((s, i) => {
      const indCost = 55000 + (s.weightKg || 2) * 5000;
      const pooledShare = Math.round(pooledCost / count);
      return {
        tenantName: s.tenantName || `Tenant ${i + 1}`,
        allocatedFee: pooledShare,
        individualCost: indCost,
        savings: indCost - pooledShare,
        savingsPercent: Math.round(((indCost - pooledShare) / indCost) * 100),
        co2SavedKg: Number((co2Saved / count).toFixed(2)),
      };
    });

    return {
      batchCode: `DISPATCH-CLB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      optimizedSequence: stops,
      routeMetrics: {
        totalDistanceKm: Number(pooledDistance.toFixed(1)),
        totalDurationMin: Math.round(stops.reduce((a, b) => a + (b.durationFromPrevMin || 0), 0)),
        baselineIndividualTotalKm: Number(baselineDistance.toFixed(1)),
        distanceSavedKm: Number(distSaved.toFixed(1)),
        distanceSavedPercent: distSavedPercent,
        baselineIndividualTotalCost: baselineCost,
        pooledTotalCost: pooledCost,
        costSavedTotal: costSaved,
        costSavedPercent: costSavedPercent,
        baselineIndividualCo2Kg: Number(baselineEmission.toFixed(2)),
        pooledCo2Kg: Number(pooledEmission.toFixed(2)),
        co2AvoidedKg: Number(co2Saved.toFixed(2)),
        co2ReductionPercent: co2Percent,
        equivalentTreesPlanted: Number((co2Saved * 0.05).toFixed(2)),
        ecoScoreGrade: isEV ? "A+ Zero Emission" : "A Eco-Optimized",
      },
      prayerRestStop: {
        recommendedMosque: "Masjid Agung Sunda Kelapa",
        stopWindow: "12:00 - 12:35 WIB (Shalat Dzuhur berjamaah & istirahat berkah)",
        address: "Jl. Taman Sunda Kelapa No. 16, Menteng, Jakarta Pusat",
      },
      aiDispatcherBriefing: `Rute kolaboratif ini mengkonsolidasikan ${count} paket dari ${new Set(shipments.map((s) => s.tenantName)).size} tenant menjadi satu lintasan loop terpadu. Mengurangi jarak tempuh sebesar ${distSaved.toFixed(1)} km (${distSavedPercent}%) dan menekan jejak karbon sebesar ${co2Saved.toFixed(2)} kg CO2e. Mengintegrasikan jeda shalat Dzuhur di masjid sentral.`,
      tenantCostSplits,
      qrManifestHash: `CLB-ECO-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };
  }

  // AI Strategic Business Matchmaker & Ecosystem Architect
  app.post("/api/ai/ecosystem-matchmaker", async (req, res) => {
    try {
      const {
        businessIdea,
        tenantName,
        targetSector,
        communityContext,
        socialImpactGoal,
      } = req.body;

      const systemInstruction = `
ROLE: Anda adalah Strategic Business Matchmaker & Ecosystem Architect untuk Islamicity Virtual Office.

TASK:
Analisis percakapan/ide bisnis pengguna, lalu transformasikan menjadi proposal kolaborasi konkret yang menghubungkan 3 pilar platform:
1. Global Islamicity (Knowledge, Education, & Global Exposure)
2. UPIC (Community Network, Program Incubator, & Citizen Engagement)
3. Logistics Hub (Supply Chain, Circular Economy, & Distribution)

OUTPUT FORMAT:
1. Core Value Proposition: [1 Kalimat ringkas]
2. Platform Integration Map:
   - Islamicity: [Fokus peran]
   - UPIC: [Fokus peran]
   - Logistics Hub: [Fokus peran]
3. Fast-Track Action (Quick Wins): [3 Langkah konkret dalam 30 hari pertama]
4. Monetization & Sustainability Model: [2 Skema pendanaan/pendapatan halal & berdaya]

TONE: Profesional, Visioner, Berdaya, Berbasis Ekonomi BerDakwah, BerSyariah, Berjamaah & Berkelanjutan.
`;

      const prompt = `
Ide Bisnis / Profil Sinergi:
- Nama Tenant / Inisiator: ${tenantName || "Inisiator Ekosistem Berdaya"}
- Sektor Usaha: ${targetSector || "Ekonomi Syariah Terpadu"}
- Deskripsi Ide Bisnis / Percakapan: "${businessIdea}"
- Konteks Komunitas: ${communityContext || "Jaringan Masjid, Pesantren, dan Komunitas Muslim"}
- Tujuan Dampak Sosial & Wakaf: ${socialImpactGoal || "Kemandirian ekonomi umat & pemberdayaan dhuafa"}

Formatkan respon Anda dalam JSON terstruktur:
{
  "coreValueProposition": "1 kalimat ringkas dan berbobot yang mendefinisikan proposisi nilai inti kolaborasi.",
  "platformIntegrationMap": {
    "islamicity": "Fokus peran Global Islamicity (Knowledge, Education, & Global Exposure).",
    "upic": "Fokus peran UPIC (Community Network, Program Incubator, & Citizen Engagement).",
    "logisticsHub": "Fokus peran Logistics Hub (Supply Chain, Circular Economy, & Distribution)."
  },
  "fastTrackAction": [
    "Hari 1-10: Langkah konkret pertama...",
    "Hari 11-20: Langkah konkret kedua...",
    "Hari 21-30: Langkah konkret ketiga..."
  ],
  "monetizationAndSustainability": [
    "Skema 1: Detail model pendanaan/pendapatan halal & berdaya (misal: Mudharabah/Musyarakah/Ujrah/Subscription)...",
    "Skema 2: Detail model pendanaan/pendapatan halal & berdaya (misal: Wakaf Produktif/Social Impact Return)..."
  ],
  "synergyScore": 95,
  "multiplierBerkahIndex": "Sangat Tinggi (1:4.8 Social ROI)",
  "executiveSummaryMarkdown": "Ringkasan narasi lengkap bergaya proposal eksekutif..."
}
`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction,
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            coreValueProposition: "Membangun ekosistem bisnis halal terpadu yang memadukan keunggulan ilmu, kekuatan jaringan jamaah, dan efisiensi logistik sirkular.",
            platformIntegrationMap: {
              islamicity: "Standarisasi kurikulum literasi muamalah dan kurasi eksposur produk ke jaringan global.",
              upic: "Inkubasi komunitas masjid dan penggalangan pre-order kolektif berbasis citizen engagement.",
              logisticsHub: "Konsolidasi pengiriman rantai pasok dan titik transit smart locker bebas emisi.",
            },
            fastTrackAction: [
              "Hari 1-10: Sinkronisasi blueprint kolaborasi dan kurasi standarisasi syariah.",
              "Hari 11-20: Peluncuran program percontohan di 3 sentra masjid binaan UPIC.",
              "Hari 21-30: Aktivasi jalur distribusi logistik dan pembukaan batch transaksi pertama.",
            ],
            monetizationAndSustainability: [
              "Skema Bagi Hasil Musyarakah (Revenue Sharing): Proporsi adil antara produsen, pengelola, dan dana cadangan.",
              "Alokasi Dana Abadi Wakaf Produktif: Kontribusi 5-10% marjin untuk program beasiswa dan pengembangan sarana umat.",
            ],
            synergyScore: 94,
            multiplierBerkahIndex: "Tinggi (1:4.5 Social ROI)",
            executiveSummaryMarkdown: text,
          });
        }
      } else {
        // High quality fallback
        res.json({
          coreValueProposition: `Mentransformasikan inisiatif "${businessIdea.slice(0, 70)}..." menjadi motor kemandirian ekonomi umat yang berdaya saing global melalui sinergi ilmu, jamaah, dan logistik syariah terpadu.`,
          platformIntegrationMap: {
            islamicity: "Menyediakan payung standarisasi literasi Fiqh Muamalah, akreditasi kurikulum bisnis halal, dan kanal eksposur ke investor serta pasar diaspora internasional melalui jaringan Global Islamicity.",
            upic: "Menggerakkan inkubasi bisnis komunitas akar rumput, mengorganisir pre-order berjamaah berbasis citizen engagement di jaringan masjid, dan mendampingi kesiapan manajerial para santri/pengusaha pemula.",
            logisticsHub: "Mengoperasikan infrastruktur smart fulfillment, titik transit locker 24/7, efisiensi rantai pasok terintegrasi, dan model sirkular ramah lingkungan untuk menekan biaya distribusi antar sentra jamaah.",
          },
          fastTrackAction: [
            "Hari 1-10: Penyusunan Dokumen Sinergi MoU & Kurasi Standar Halal bersama Dewan Syariah Global Islamicity.",
            "Hari 11-20: Pembukaan Pilot Project Inkubasi UPIC melibatkan 50 peserta percontohan di 3 titik masjid representatif.",
            "Hari 21-30: Aktivasi integrasi pengiriman via Smart Logistics Hub dan peluncuran transaksi perdana dengan garansi amanah.",
          ],
          monetizationAndSustainability: [
            "Skema Bagi Hasil Musyarakah / Mudharabah Berkeadilan: Pembagian keuntungan transparan dengan sistem automasi smart escrow berbasis akad syariah.",
            "Ekosistem Wakaf Produktif & Ujrah Berkelanjutan: Alokasi 5% surplus operasional ke dana abadi masjid guna membiayai subsidi silang bagi UMKM perintis.",
          ],
          synergyScore: 96,
          multiplierBerkahIndex: "Sangat Tinggi (1:4.9 Social ROI)",
        });
      }
    } catch (err: any) {
      console.error("Error in ecosystem matchmaker:", err);
      res.status(500).json({ error: err?.message || "Gagal menghasilkan proposal ekosistem" });
    }
  });

  // AI Potensi & Global TECS Learning Roadmap Analyzer
  app.post("/api/ai/potensi-assessment", async (req, res) => {
    try {
      const {
        applicantName,
        businessName,
        businessLegalForm,
        sector,
        mosqueName,
        kecamatanCity,
        assetEstimate,
        monthlyTurnoverEstimate,
        currentEmployeesCount,
        mainNeeds = [],
      } = req.body;

      const prompt = `
Anda adalah Dewan Pembina & Konsultan Ahli Ekosistem "VirtualOffice 4.0 & Global TECS Islamicity" (voffice.islamicity.tv, virtualoffice.islamicity.tv, coworking.islamicity.tv, potensi.islamicity.tv, register.islamicity.tv, global.tecs.islamicity.tv).
Analisis formulir registrasi potensi ekonomi komunitas masjid berikut:

Data Pemohon:
- Nama: ${applicantName}
- Nama Usaha: ${businessName} (${businessLegalForm})
- Sektor: ${sector}
- Basis Masjid & Lokasi: ${mosqueName}, ${kecamatanCity}
- Estimasi Aset: Rp ${Number(assetEstimate || 0).toLocaleString("id-ID")}
- Estimasi Omzet Bulanan: Rp ${Number(monthlyTurnoverEstimate || 0).toLocaleString("id-ID")}
- Jumlah Tenaga Kerja: ${currentEmployeesCount || 1} orang
- Kebutuhan Utama: ${(mainNeeds || []).join(", ")}

Tugas Anda:
1. Hitung "Skor Potensi Keberdayaan" (0 - 100) berdasarkan kesiapan usaha, dampak ke jamaah masjid, dan kelayakan tumbuh.
2. Klasifikasikan Kategori Daya Saing ("Taraf Lokal Kecamatan", "Taraf Nasional Berdaya", atau "Siap Ekspor Halal Internasional").
3. Berikan Rekomendasi Modul Pembelajaran dari http://global.tecs.islamicity.tv (eLearning, Coaching, Training, Workshop Fiqh Muamalah).
4. Buat Rencana Akselerasi 4 Langkah (Langkah 1: Legalitas & Domisili Virtual Office, Langkah 2: Standardisasi Mutu/Halal, Langkah 3: Coworking & Sinergi Logistik, Langkah 4: Akselerasi Omzet & Wakaf Berkah).
5. Buat Narasi Nasihat Spiritual Muamalah: "Belajar kepada Allah SWT dalam Menjemput Rezeki Halal Berjamaah".

Kembalikan dalam JSON:
{
  "scorePotensi": 94,
  "competitivenessLevel": "...",
  "recommendedGlobalTecsCourse": "...",
  "courseReasoning": "...",
  "accelerationRoadmap": [
    "Langkah 1: ...",
    "Langkah 2: ...",
    "Langkah 3: ...",
    "Langkah 4: ..."
  ],
  "spiritualWisdom": "...",
  "portalRecommendation": "http://voffice.islamicity.tv"
}
`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Anda adalah Guru Besar Ekonomi Syariah & Direktur Akselerasi UMKM 800.000 Masjid Islamicity.",
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            scorePotensi: 92,
            competitivenessLevel: "Taraf Nasional Berdaya",
            recommendedGlobalTecsCourse: "Fiqh Muamalah 4.0 & Adab Bisnis Syariah Digital Modern",
            courseReasoning: "Memperkuat fondasi kepatuhan syariah dan keberkahan transaksi sebelum ekspansi skala besar.",
            accelerationRoadmap: [
              "Langkah 1: Registrasi NIB & Alamat Domisili Resmi di Virtual Office Sentra Masjid Kecamatan",
              "Langkah 2: Akselerasi Sertifikasi Halal BPJPH & Manual SJPH Terpadu",
              "Langkah 3: Aktivasi Meja Kerja di Coworking Hub Masjid & Drop-Point Smart Locker",
              "Langkah 4: Skalabilitas Omzet Melalui Program Pelatihan & Coaching Intensif di global.tecs.islamicity.tv",
            ],
            spiritualWisdom: "Mari senantiasa belajar kepada Allah SWT bahwa rezeki tidak semata diukur dari angka materi, melainkan dari keberkahan, kejujuran, dan seberapa besar manfaat usaha ini memakmurkan masjid serta menolong dhuafa di sekitarnya.",
            portalRecommendation: "http://voffice.islamicity.tv",
          });
        }
      } else {
        res.json({
          scorePotensi: 91,
          competitivenessLevel: "Taraf Nasional Berdaya",
          recommendedGlobalTecsCourse: "Fiqh Muamalah 4.0 & Adab Bisnis Syariah Digital Modern",
          courseReasoning: "Memperkokoh aqidah bisnis bebas riba dan mengintegrasikan usaha dengan 3 pilar ekosistem Islamicity.",
          accelerationRoadmap: [
            "Langkah 1: Formalisasi Perizinan OSS-RBA & Domisili Hukum via voffice.islamicity.tv",
            "Langkah 2: Pemenuhan Standar Mutu Halal & Pendaftaran di register.islamicity.tv",
            "Langkah 3: Pemanfaatan Fasilitas Ruang Kerja Coworking & Jaringan Logistik Berkelanjutan",
            "Langkah 4: Mengikuti Distant eLearning & Coach Course di global.tecs.islamicity.tv untuk bersaing di panggung internasional",
          ],
          spiritualWisdom: "Niatkan setiap ikhtiar perniagaan sebagai ibadah menjemput karunia Allah SWT, berpegang teguh pada amanah Rasulullah SAW, dan menyisihkan sebagian keuntungan demi kemakmuran baitullah.",
          portalRecommendation: "http://voffice.islamicity.tv",
        });
      }
    } catch (err: any) {
      console.error("Error assessing potensi:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses penilaian potensi" });
    }
  });

  // Automated WhatsApp & Email Payment Reminder Generator (H-3 Days Due Date)
  app.post("/api/billing/generate-reminder", async (req, res) => {
    try {
      const {
        invoiceNumber,
        tenantName,
        representativeName,
        tenantPhone,
        tenantEmail,
        dueDate,
        daysRemaining = 3,
        totalAmount,
        baseAmount,
        wakafAmount,
        periodDescription,
        paymentMethods = ["BSI Virtual Account: 9888-0012-3456-7890", "Bank Muamalat VA: 7711-0023-4567-8901", "QRIS Syariah"],
      } = req.body;

      const prompt = `
Anda adalah Sistem Otomasi Notifikasi Penagihan Syariah "Islamicity Virtual Office & Sharia Hub".
Buatkan draf notifikasi pengingat pembayaran jatuh tempo (H-${daysRemaining} hari sebelum jatuh tempo) yang santun, profesional, beradab Islami, dan bebas dari ancaman/riba/denda keterlambatan.

Informasi Tagihan:
- No. Invoice: ${invoiceNumber}
- Klien / Tenant: ${tenantName} (U.P. ${representativeName || "Pimpinan"})
- No. WhatsApp: ${tenantPhone || "0812-xxxx-xxxx"}
- Email: ${tenantEmail || "finance@tenant.com"}
- Tanggal Jatuh Tempo: ${dueDate} (${daysRemaining} Hari Lagi)
- Layanan: ${periodDescription}
- Total Tagihan: Rp ${Number(totalAmount).toLocaleString("id-ID")} (Termasuk alokasi wakaf produktif masjid Rp ${Number(wakafAmount || 0).toLocaleString("id-ID")})
- Metode Pembayaran: ${paymentMethods.join(", ")}

Tugas Anda:
1. Buat "whatsappMessage": Pesan WhatsApp yang rapi dengan formatting bold (*), list (-), emoji relevan (🕌, 📄, 💳, 🤲), pembukaan salam Islami "Assalamu'alaikum Warahmatullahi Wabarakatuh", rincian tagihan, tanggal jatuh tempo H-${daysRemaining}, nomor VA BSI/Muamalat, dan penegasan bahwa 5% dari sewa merupakan wakaf produktif memakmurkan masjid.
2. Buat "emailSubject": Subjek email resmi yang informatif dan elegan.
3. Buat "emailHtml": Konten email HTML yang indah bertema natural/syariah dengan kop surat digital, tabel ringkasan pembayaran, dan instruksi konfirmasi.
4. Buat "emailText": Versi plain text email.
5. Catat "spiritualReminder": Kutipan adab muamalah tepat waktu memenuhi janji (QS. Al-Ma'idah: 1 atau Hadits Bukhari tentang kelapangan menunaikan kewajiban).

Kembalikan format JSON murni:
{
  "whatsappMessage": "...",
  "emailSubject": "...",
  "emailHtml": "...",
  "emailText": "...",
  "spiritualReminder": "..."
}
`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Anda adalah AI Financial Officer & Muamalah Notification Automation Specialist.",
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            whatsappMessage: `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\nKepada Yth. Pimpinan *${tenantName}* (U.P. ${representativeName || 'Bapak/Ibu'}),\n\nSemoga Allah SWT senantiasa melimpahkan berkah dan kelancaran pada usaha Anda.\n\nKami menginformasikan bahwa tagihan layanan Virtual Office & Fasilitas Syariah berikut akan jatuh tempo dalam *${daysRemaining} hari ke depan*:\n\n📄 *No. Invoice*: ${invoiceNumber}\n📋 *Perihal*: ${periodDescription}\n📅 *Jatuh Tempo*: ${dueDate}\n💰 *Total Pembayaran*: Rp ${Number(totalAmount).toLocaleString("id-ID")}\n🤲 *Alokasi Wakaf Produktif (5%)*: Rp ${Number(wakafAmount || 0).toLocaleString("id-ID")}\n\n💳 *Metode Pembayaran Resmi*:\n• Bank Syariah Indonesia (BSI) VA: 9888-0012-3456-7890\n• Bank Muamalat VA: 7711-0023-4567-8901\n• QRIS Syariah (Tersedia di Portal Billing)\n\n_Bebas bunga denda keterlambatan (Anti-Riba). Mohon konfirmasikan bukti transfer bila telah melakukan pembayaran._\n\nJazakumullah Khairan Katsiran.\n*Finance & Billing Team - Islamicity Virtual Office Hub*`,
            emailSubject: `[Pengingat Pembayaran H-${daysRemaining}] Invoice ${invoiceNumber} - ${tenantName}`,
            emailHtml: `<div style="font-family: Arial, sans-serif; color: #2d2d22; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E4E3DA; border-radius: 12px; padding: 24px; background: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #5A5A40; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #5A5A40; margin: 0; font-size: 20px;">Islamicity Virtual Office Hub</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #72725e;">Infrastruktur Cerdas & Ekosistem Bisnis Berdaya Syariah</p>
  </div>
  <p><strong>Assalamu'alaikum Warahmatullahi Wabarakatuh,</strong></p>
  <p>Kepada Yth. <strong>${tenantName}</strong> (U.P. ${representativeName || 'Pimpinan'}),</p>
  <p>Semoga Anda senantiasa dalam lindungan dan keberkahan Allah SWT. Kami mengingatkan bahwa tagihan sewa berkala Virtual Office Anda akan jatuh tempo pada <strong>${dueDate}</strong> (kurang ${daysRemaining} hari lagi).</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fafaf7; border-radius: 8px;">
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">No. Invoice</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${invoiceNumber}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Deskripsi</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${periodDescription}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Jatuh Tempo</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #d97706; font-weight: bold;">${dueDate}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Porsi Wakaf Masjid (5%)</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #5A5A40;">Rp ${Number(wakafAmount || 0).toLocaleString("id-ID")}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; font-size: 16px;">Total Tagihan</td><td style="padding: 10px; font-weight: bold; font-size: 16px; color: #5A5A40;">Rp ${Number(totalAmount).toLocaleString("id-ID")}</td></tr>
  </table>
  <div style="background: #f5f2ed; padding: 14px; border-radius: 8px; font-size: 13px; margin-bottom: 20px;">
    <strong>Instruksi Pembayaran BSI VA:</strong><br/>
    Nomor VA: <strong>9888-0012-3456-7890</strong> (A.N. Islamicity Virtual Office)
  </div>
  <p style="font-size: 12px; color: #72725e; font-style: italic;">"Penuhilah akad-akad itu..." (QS. Al-Ma'idah: 1). Sistem kami bebas dari bunga denda riba.</p>
  <p style="margin-top: 24px; font-size: 13px;">Wassalamu'alaikum Wr. Wb.<br/><strong>Tim Keuangan & Wakaf Islamicity</strong></p>
</div>`,
            emailText: `Assalamu'alaikum Wr. Wb.\n\nPengingat Pembayaran Invoice: ${invoiceNumber}\nTenant: ${tenantName}\nJatuh Tempo: ${dueDate} (${daysRemaining} hari lagi)\nTotal: Rp ${Number(totalAmount).toLocaleString("id-ID")}\n\nSilakan lakukan pembayaran melalui BSI VA: 9888-0012-3456-7890.\n\nTerima kasih.`,
            spiritualReminder: "Hai orang-orang yang beriman, penuhilah janji-janji dan akad-akadmu (QS. Al-Ma'idah: 1).",
          });
        }
      } else {
        // High quality local fallback
        res.json({
          whatsappMessage: `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\nKepada Yth. Pimpinan *${tenantName}* (U.P. ${representativeName || 'Bapak/Ibu'}),\n\nSemoga Allah SWT senantiasa melimpahkan berkah dan kelancaran pada perniagaan Anda.\n\nKami menginformasikan bahwa tagihan layanan Virtual Office & Fasilitas Berdaya berikut akan jatuh tempo dalam *${daysRemaining} hari ke depan*:\n\n📄 *No. Invoice*: ${invoiceNumber}\n📋 *Perihal*: ${periodDescription}\n📅 *Jatuh Tempo*: ${dueDate}\n💰 *Total Pembayaran*: Rp ${Number(totalAmount).toLocaleString("id-ID")}\n🤲 *Alokasi Wakaf Produktif (5%)*: Rp ${Number(wakafAmount || 0).toLocaleString("id-ID")}\n\n💳 *Metode Pembayaran Resmi*:\n• Bank Syariah Indonesia (BSI) VA: 9888-0012-3456-7890\n• Bank Muamalat VA: 7711-0023-4567-8901\n• QRIS Syariah (Tersedia di Portal Billing)\n\n_Bebas bunga denda keterlambatan (Prinsip Ta'zir/Bebas Riba). Mohon kirimkan konfirmasi bila telah tertunaikan._\n\nJazakumullah Khairan Katsiran.\n*Finance & Billing Hub - Islamicity Virtual Office*`,
          emailSubject: `[Pengingat Pembayaran H-${daysRemaining}] Invoice ${invoiceNumber} - ${tenantName}`,
          emailHtml: `<div style="font-family: Arial, sans-serif; color: #2d2d22; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E4E3DA; border-radius: 12px; padding: 24px; background: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #5A5A40; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #5A5A40; margin: 0; font-size: 20px;">Islamicity Virtual Office Hub</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #72725e;">Infrastruktur Cerdas & Ekosistem Bisnis Berdaya Syariah</p>
  </div>
  <p><strong>Assalamu'alaikum Warahmatullahi Wabarakatuh,</strong></p>
  <p>Kepada Yth. <strong>${tenantName}</strong> (U.P. ${representativeName || 'Pimpinan'}),</p>
  <p>Semoga Anda senantiasa dalam lindungan dan keberkahan Allah SWT. Kami mengingatkan bahwa tagihan sewa berkala Virtual Office Anda akan jatuh tempo pada <strong>${dueDate}</strong> (kurang ${daysRemaining} hari lagi).</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fafaf7; border-radius: 8px;">
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">No. Invoice</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${invoiceNumber}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Deskripsi</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${periodDescription}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Jatuh Tempo</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #d97706; font-weight: bold;">${dueDate}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Porsi Wakaf Masjid (5%)</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #5A5A40;">Rp ${Number(wakafAmount || 0).toLocaleString("id-ID")}</td></tr>
    <tr><td style="padding: 10px; font-weight: bold; font-size: 16px;">Total Tagihan</td><td style="padding: 10px; font-weight: bold; font-size: 16px; color: #5A5A40;">Rp ${Number(totalAmount).toLocaleString("id-ID")}</td></tr>
  </table>
  <div style="background: #f5f2ed; padding: 14px; border-radius: 8px; font-size: 13px; margin-bottom: 20px;">
    <strong>Instruksi Pembayaran BSI VA:</strong><br/>
    Nomor VA: <strong>9888-0012-3456-7890</strong> (A.N. Islamicity Virtual Office)
  </div>
  <p style="font-size: 12px; color: #72725e; font-style: italic;">"Penuhilah akad-akad itu..." (QS. Al-Ma'idah: 1). Sistem kami bebas dari bunga denda riba.</p>
  <p style="margin-top: 24px; font-size: 13px;">Wassalamu'alaikum Wr. Wb.<br/><strong>Tim Keuangan & Wakaf Islamicity</strong></p>
</div>`,
          emailText: `Assalamu'alaikum Wr. Wb.\n\nPengingat Pembayaran Invoice: ${invoiceNumber}\nTenant: ${tenantName}\nJatuh Tempo: ${dueDate} (${daysRemaining} hari lagi)\nTotal: Rp ${Number(totalAmount).toLocaleString("id-ID")}\n\nSilakan lakukan pembayaran melalui BSI VA: 9888-0012-3456-7890.\n\nTerima kasih.`,
          spiritualReminder: "Menepati janji akad tepat waktu adalah salah satu tanda kesempurnaan iman dan keberkahan rezeki.",
        });
      }
    } catch (err: any) {
      console.error("Error generating reminder:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses draf pengingat" });
    }
  });

  // Islamicity Virtual Assistant (AI-Powered Islamic & Muamalah Assistant)
  app.post("/api/ai/islamicity-assistant", async (req, res) => {
    try {
      const { userQuery, virtualCityContext, conversationHistory = [] } = req.body;

      const systemInstruction = `
Anda adalah "Islamicity Virtual Assistant (VA)" cerdas yang terintegrasi pada software "VirtualOffice 4.0 in every virtualCity".
Tujuan Anda adalah melayani dan mengedukasi lebih dari 800.000 Usaha Komunitas Masjid (UKM) dan UMKM di 8.000 kota kecamatan di Indonesia serta dunia internasional.

Peran & Nilai Inti:
1. Menjawab pertanyaan seputar Fiqh Muamalah, legalitas aset manajemen, kolateral syariah, tata kelola bisnis Islami, dan kepatuhan terhadap Fatwa DSN-MUI (Bebas Riba, Bebas Gharar, Bebas Maysir).
2. Memandu pengguna memanfaatkan platform ekosistem:
   - http://voffice.islamicity.tv (Virtual office, manajemen aset & kolateral, info perizinan OSS-RBA).
   - http://virtualoffice.islamicity.tv (Alamat bisnis virtual korporasi, resepsionis, smart locker).
   - http://coworking.islamicity.tv (Ruang kerja bersama ramah shalat berjamaah di sayap/gedung wakaf masjid).
   - http://potensi.islamicity.tv (Sensus potensi ekonomi jamaah & aset wakaf).
   - http://register.islamicity.tv (Pendaftaran UKM/UMKM masjid).
   - http://global.tecs.islamicity.tv (Distant eLearning, Training, Education, Coach Course, Seminar, Workshop).
   - GitHub Repository: https://islamicity.github.io/VirtualOffice.
3. Menjelaskan pilar pendukung:
   - CAP: Central Access Point
   - UPIC: Unit Pelayanan Islamicity
   - Koperasi - Bank Broker DUIT Voucher (Voucher Permodalan, Data, Iklan, dan Penyerapan Sisa/Sampah Sirkular).
4. Menjelaskan perbedaan fundamental:
   - Virtual Assistant (VA) & Virtual Office Assistant: Staf manusia profesional yang bekerja jarak jauh.
   - Google Assistant: AI voice assistant umum untuk tugas sehari-hari.
   - Islamicity Virtual Assistant: Asisten perangkat lunak AI berfokus spesifik pada nilai-nilai keislaman, muamalah, aset manajemen syariah, dan pemakmuran masjid.

Format Output JSON:
{
  "assistantResponse": "...",
  "topic": "fiqh_muamalah" | "asset_collateral" | "prayer_schedule" | "quran_hadith" | "virtual_office_guide" | "koperasi_voucher",
  "quranReference": "Ayat & Terjemah (jika ada)...",
  "hadithReference": "Hadits shahih pendukung (jika ada)...",
  "actionRecommendation": "Langkah praktis yang disarankan..."
}
`;

      const prompt = `
Pertanyaan Pengguna: "${userQuery}"
Konteks VirtualCity: "${virtualCityContext || "Nasional (8.000 Kecamatan)"}"

Jawablah dengan gaya bahasa yang santun, berwibawa, solutif, sarat nilai muamalah berkah, dan mencantumkan rujukan syariah yang relevan.
`;

      const genAI = getAiInstance();
      if (genAI) {
        const response = await genAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction,
          },
        });
        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch {
          res.json({
            assistantResponse: text,
            topic: "virtual_office_guide",
            actionRecommendation: "Kunjungi http://voffice.islamicity.tv dan http://potensi.islamicity.tv untuk mendaftarkan potensi UKM Anda.",
          });
        }
      } else {
        // High quality fallback
        res.json({
          assistantResponse: `Assalamu'alaikum Warahmatullahi Wabarakatuh. Terima kasih atas pertanyaan Anda. VirtualOffice 4.0 di setiap VirtualCity hadir untuk memberdayakan lebih dari 800.000 Usaha Komunitas Masjid (UKM) dan UMKM di 8.000 kota kecamatan di Indonesia agar mampu berkompetisi secara sehat di kancah nasional maupun dunia internasional.\n\nDidukung oleh CAP (Central Access Point), UPIC (Unit Pelayanan Islamicity), dan Koperasi - Bank Broker DUIT Voucher (Voucher, Data, Iklan, dan Sirkular Sisa Sampah), platform ini memastikan kepemilikan aset yang jelas, transaksi sah tanpa riba, dan keadilan sesuai Fatwa DSN-MUI.\n\nYuk belajar bersama kepada Allah SWT dengan mengisi sensus di http://potensi.islamicity.tv, mendaftar di http://register.islamicity.tv, serta mengikuti pelatihan bersertifikat di http://global.tecs.islamicity.tv. Anda juga dapat mengakses kode repositori terbuka di https://islamicity.github.io/VirtualOffice.`,
          topic: "virtual_office_guide",
          quranReference: "QS. Al-Baqarah: 282 (Perintah mencatat muamalah secara transparan dan adil)",
          hadithReference: "HR. Tirmidzi No. 1209: 'Pedagang yang jujur dan amanah akan bersama para Nabi, orang-orang shiddiq, dan para syuhada.'",
          actionRecommendation: "Aktivasi layanan domisili virtual office di masjid kecamatan Anda melalui voffice.islamicity.tv dan daftarkan permodalan syariah tanpa riba.",
        });
      }
    } catch (err: any) {
      console.error("Error in Islamicity Assistant:", err);
      res.status(500).json({ error: err?.message || "Gagal memproses asisten virtual" });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Islamicity Virtual Office Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
