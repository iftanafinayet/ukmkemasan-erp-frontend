import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Package, CreditCard, Truck, RotateCcw, HelpCircle } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';

const FAQ_DATA = [
  {
    icon: Package,
    category: 'Pemesanan',
    items: [
      {
        q: 'Bagaimana cara memesan kemasan di website ini?',
        a: 'Pilih produk kemasan yang diinginkan, tentukan jumlah/ukuran, lalu klik "Tambah ke Keranjang". Lanjutkan ke checkout dan ikuti instruksi pembayaran.',
      },
      {
        q: 'Apakah bisa custom desain atau ukuran kemasan?',
        a: 'Bisa. Pilih opsi "Custom Order" pada halaman produk atau hubungi tim kami untuk konsultasi ukuran, bahan, dan desain sesuai kebutuhan.',
      },
      {
        q: 'Berapa minimum order (MOQ)?',
        a: 'Minimum order berbeda tergantung jenis pesanan:\n• Order reguler (stok/tanpa custom): minimum 100 pcs\n• Custom sablon: minimum 500 pcs\n• Custom printing: minimum 5.000 pcs',
      },
      {
        q: 'Kenapa MOQ custom printing jauh lebih besar dari sablon?',
        a: 'Proses printing membutuhkan setup mesin dan biaya produksi yang lebih tinggi dibanding sablon, sehingga MOQ ditetapkan lebih besar agar biaya produksi lebih efisien per pcs.',
      },
      {
        q: 'Apa perbedaan sablon dan printing pada kemasan?',
        a: '• Sablon: cocok untuk desain sederhana dengan jumlah warna terbatas, MOQ lebih rendah (500 pcs).\n• Printing: cocok untuk desain full color/detail tinggi, MOQ lebih besar (5.000 pcs) karena kompleksitas proses produksi.',
      },
      {
        q: 'Apakah bisa gabung beberapa desain dalam satu MOQ?',
        a: 'Tidak dapat digabung. MOQ berlaku per desain untuk masing-masing jenis pesanan.',
      },
      {
        q: 'Apakah ada sampel produk sebelum order dalam jumlah besar?',
        a: 'Ya, sampel dapat langsung dipesan melalui website dengan klik opsi "Pesan Sampel" pada halaman produk.',
      },
    ],
  },
  {
    icon: CreditCard,
    category: 'Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Transfer bank, kartu kredit/debit, e-wallet (OVO, GoPay, DANA), dan virtual account.',
      },
      {
        q: 'Apakah bisa bayar di tempat (COD)?',
        a: 'Tidak tersedia. Pembayaran hanya dapat dilakukan melalui transfer bank, kartu kredit/debit, e-wallet, atau virtual account.',
      },
      {
        q: 'Bagaimana jika pembayaran sudah dilakukan tapi status masih "pending"?',
        a: 'Konfirmasi pembayaran biasanya diperbarui otomatis dalam 1x24 jam. Jika lebih dari itu, silakan hubungi CS dengan melampirkan bukti transfer.',
      },
    ],
  },
  {
    icon: Truck,
    category: 'Produksi & Pengiriman',
    items: [
      {
        q: 'Berapa lama waktu produksi untuk kemasan?',
        a: 'Waktu produksi tergantung jenis produk:\n• Produk ready stok: dapat langsung dipesan tanpa menunggu produksi\n• Custom sablon: maksimal 1 bulan\n• Custom printing: maksimal 3 bulan',
      },
      {
        q: 'Berapa lama estimasi pengiriman?',
        a: 'Tergantung lokasi dan ekspedisi yang dipilih, umumnya 2–5 hari kerja untuk dalam negeri.',
      },
      {
        q: 'Bagaimana cara melacak pesanan saya?',
        a: 'Nomor resi akan dikirim via email/WhatsApp setelah barang dikirim. Lacak melalui halaman "Pesanan Saya" atau langsung di website ekspedisi terkait.',
      },
    ],
  },
  {
    icon: RotateCcw,
    category: 'Retur & Komplain',
    items: [
      {
        q: 'Bagaimana jika kemasan yang diterima cacat atau tidak sesuai pesanan?',
        a: 'Laporkan maksimal 2x24 jam setelah barang diterima disertai foto/video bukti. Tim kami akan memproses retur atau penggantian.',
      },
      {
        q: 'Apakah bisa membatalkan pesanan?',
        a: 'Pembatalan hanya bisa dilakukan sebelum proses produksi dimulai. Untuk pesanan yang sudah masuk produksi, pembatalan tidak dapat dilakukan.',
      },
    ],
  },
  {
    icon: HelpCircle,
    category: 'Lain-lain',
    items: [
      {
        q: 'Apakah tersedia harga khusus untuk pembelian dalam jumlah besar (wholesale)?',
        a: 'Ya, silakan hubungi tim sales kami untuk penawaran harga khusus (bulk pricing).',
      },
      {
        q: 'Bagaimana cara menghubungi customer service?',
        a: 'Melalui live chat website, email di admin@ukmkemasan.com, atau WhatsApp di 0817345168.',
      },
    ],
  },
];

function FaqAccordion({ items }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item, idx) => (
        <Accordion.Item
          key={idx}
          value={`item-${idx}`}
          className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-card transition-all duration-200 data-[state=open]:shadow-card-hover data-[state=open]:border-primary/20"
        >
          <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer transition-colors duration-200 hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl data-[state=open]:rounded-b-none">
            <span className="text-sm font-semibold text-on-surface pr-4">{item.q}</span>
            <ChevronDown className="w-5 h-5 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-fade-in">
            <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-on-surface-variant whitespace-pre-line border-t border-outline-variant/20">
              {item.a}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full border border-primary/10 bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            Pusat Bantuan
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl font-headline">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="mt-3 text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            Temukan jawaban untuk pertanyaan umum seputar pemesanan, pembayaran, produksi, dan pengiriman kemasan.
          </p>
        </div>

        <div className="space-y-10">
          {FAQ_DATA.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-on-surface">{section.category}</h2>
                </div>
                <FaqAccordion items={section.items} />
              </section>
            );
          })}
        </div>

        <div className="mt-16 text-center p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-on-surface mb-2">Masih punya pertanyaan?</h3>
          <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto">
            Tim customer service kami siap membantu. Hubungi kami melalui live chat, email, atau WhatsApp.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:admin@ukmkemasan.com"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Email Kami
            </a>
            <a
              href="https://wa.me/62817345168"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              WhatsApp CS
            </a>
            <Link
              to="/portal"
              className="px-5 py-2.5 rounded-xl text-primary font-semibold text-sm hover:underline transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Kembali ke Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
