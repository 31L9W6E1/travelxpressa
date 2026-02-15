import { prisma } from '../lib/prisma';
import { siteSettingsSchema } from '../validation/schemas';

export type SiteSettings = {
  maintenance: {
    enabled: boolean;
    message?: string;
  };
  visibility: {
    about: boolean;
    learnMore: boolean;
    translationService: boolean;
    gallery: boolean;
    news: boolean;
    blog: boolean;
    flight: boolean;
    insurance: boolean;
    helpCenter: boolean;
    qAndA: boolean;
    feedback: boolean;
  };
  agreement: {
    version?: string;
    template: string;
  };
  quickHelp: {
    title?: string;
    description?: string;
    facebookUrl?: string;
    phone?: string;
    email?: string;
    branch1Title?: string;
    branch1Hours?: string;
    headOfficeTitle?: string;
    headOfficeHours?: string;
    onlineHours?: string;
  };
  qAndAItems: Array<{
    q: string;
    a: string;
  }>;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  maintenance: { enabled: false, message: '' },
  visibility: {
    about: true,
    learnMore: true,
    translationService: true,
    gallery: true,
    news: true,
    blog: true,
    flight: true,
    insurance: true,
    helpCenter: true,
    qAndA: true,
    feedback: true,
  },
  agreement: {
    version: 'VISAMN-SERVICE-AGREEMENT-2026.02',
    template: `Огноо: {{DATE}}    Гэрээний №: {{CONTRACT_NUMBER}}    Улаанбаатар хот

Энэхүү гэрээг Монгол Улсын Иргэний хуулийн 343–358, 359–368 дугаар зүйлүүд болон холбогдох бусад хууль тогтоомжийг үндэслэн дараах талууд харилцан тохиролцож байгуулав:

I. ТАЛУУД
Гүйцэтгэгч (“А тал”): VISAMN ХХК
Имэйл: info@visamn.com

Захиалагч (“Б тал”):
Овог, нэр: {{CLIENT_NAME}}
Регистр: {{CLIENT_REGISTRY}}
Хаяг: {{CLIENT_ADDRESS}}
Утас: {{CLIENT_PHONE}}
Имэйл: {{CLIENT_EMAIL}}

II. ГЭРЭЭНИЙ ЗОРИЛГО, ЭРХ ЗҮЙН ШИНЖ
2.1. Энэхүү гэрээ нь мэргэжлийн зөвлөх үйлчилгээ үзүүлэх тухай хөлсөөр ажиллах гэрээ болно.
2.2. “А тал” нь виз мэдүүлэх үйл явцад зөвлөх, бэлтгэх, зохион байгуулах үйлчилгээ үзүүлэх бөгөөд виз олгох шийдвэр гаргах эрх бүхий этгээд биш.
2.3. Виз олгох эсэх шийдвэр нь тухайн улсын Элчин сайдын яам, Консулын газрын бүрэн эрхэд хамаарах бөгөөд “А тал” баталгаа, амлалт өгөхгүй.

III. ҮЙЛЧИЛГЭЭНИЙ АГУУЛГА
3.1. Визийн эрсдэлийн урьдчилсан үнэлгээ
3.2. Материал бүрдүүлэлтийн стратеги боловсруулах
3.3. Баримт бичгийн хяналт, зөвлөмж
3.4. Анкет болон холбогдох маягт бөглөх
3.5. Элчин сайдын яамны цаг захиалах
3.6. Ярилцлагын мэргэжлийн бэлтгэл
3.7. Визийн явцын мэдээлэл, зөвлөмж

IV. ҮЙЛЧИЛГЭЭНИЙ ХӨЛС, ТӨЛБӨР
4.1. Үйлчилгээний хөлс: {{SERVICE_FEE_MNT}} төгрөг.
4.2. Төлбөрийг 100% урьдчилан төлнө.
4.3. Гэрээ байгуулж, үйлчилгээ эхэлсэнд тооцогдсон үеэс хойш үйлчилгээний хөлс буцаагдахгүй.
4.4. Элчин сайдын яамны хураамж, гуравдагч этгээдийн төлбөрийг “Б тал” өөрөө хариуцна.

V. ВИЗ ТАТГАЛЗСАН ТОХИОЛДОЛ
5.1. Виз татгалзсан тохиолдолд “А тал” 6 сарын дотор дахин мэдүүлэх стратегийн зөвлөгөөг нэмэлт үйлчилгээний хөлсгүйгээр үзүүлж болно.
5.2. Үйлчилгээний хөлс буцаагдахгүй.

VI. ХАРИУЦЛАГЫН ХЯЗГААРЛАЛТ
6.1. “А тал”-ын нийт хариуцлага нь төлсөн үйлчилгээний хөлсний хэмжээнээс хэтрэхгүй.
6.2. Элчин сайдын яамны шийдвэр, нэмэлт шалгалт, давагдашгүй хүчин зүйлд “А тал” хариуцлага хүлээхгүй.

VII. Е-ГЭРЭЭНИЙ ХҮЧИН ТӨГӨЛДӨР БАЙДАЛ
7.1. Онлайн хэлбэрээр баталгаажсан гэрээ нь Иргэний хуулийн 42, 43 дугаар зүйлүүдэд нийцсэнд тооцогдоно.
7.2. IP хаяг, цагийн тэмдэглэл, цахим баталгаажуулалт хадгалагдана.
7.3. PDF хувилбар талуудад илгээгдэнэ.`,
  },
  quickHelp: {
    title: 'Шуурхай тусламж',
    description: 'Дэмжлэг болон үйлчилгээний мэдээлэл авах бол бидэнтэй холбогдоорой.',
    facebookUrl: '',
    phone: '0000000',
    email: 'support@visamn.com',
    branch1Title: 'Салбар 1',
    branch1Hours: 'Даваа-Баасан: 09:00-18:00\nБямба, Ням: 10:00-19:00',
    headOfficeTitle: 'Төв оффис',
    headOfficeHours: 'Даваа-Баасан: 08:00-18:00\nБямба, Ням: Амарна',
    onlineHours: 'Онлайнаар амралтын өдрүүдэд 10:00-19:00 ажиллана',
  },
  qAndAItems: [
    {
      q: 'Визийн зөвлөгөө авахын тулд заавал оффис дээр очих уу?',
      a: 'Үгүй. Та онлайнаар мэдээллээ өгч, мэргэжлийн зөвлөгөөг бүрэн авах боломжтой. Шаардлагатай тохиолдолд биечлэн уулзалт хийнэ.',
    },
    {
      q: 'Баримт бичиг дутуу бол яах вэ?',
      a: 'Манай баг таны баримтыг нягталж, дутуу жагсаалтыг үе шат бүрээр гаргаж өгнө. Бүрдүүлэлт дуусах хүртэл хяналттай ажиллана.',
    },
    {
      q: 'Үйлчилгээний хугацаа хэд хоног вэ?',
      a: 'Кейсийн төрөл болон улсын шаардлагаас хамаарч ялгаатай. Ихэнх тохиолдолд 1–2 хоногт өргөдөл бэлэн болгох боломжтой.',
    },
    {
      q: 'Express үйлчилгээ гэж юу вэ?',
      a: 'Яаралтай тохиолдолд баримтын шалгалт, зөвлөгөө, бүрдүүлэлтийг түргэвчилж гүйцэтгэнэ. Express үйлчилгээний нэмэгдэл төлбөр үйлчилнэ.',
    },
    {
      q: 'Мэдүүлгээ хаанаас хянах вэ?',
      a: 'Нэвтэрсэн хэрэглэгч өөрийн профайл дахь Inbox/Tracking хэсгээс явцаа бодит цагт хянана.',
    },
    {
      q: 'АНУ-ын визийн үйлчилгээ ямар алхмаар явах вэ?',
      a: 'Кейс үнэлгээ → баримт шалгалт → анкет/маягт бэлтгэл → цаг захиалга → ярилцлагын чиглүүлэг гэсэн дарааллаар явна.',
    },
    {
      q: 'Шенген, Их Британи, Канад зэрэг бусад улсад тусалдаг уу?',
      a: 'Тийм. Улс тус бүрийн шаардлагад нийцсэн бүрдүүлэлт, баримтын бүтэц, зөвлөмжийг тусад нь өгдөг.',
    },
    {
      q: 'Орчуулгын үйлчилгээ яаж ажилладаг вэ?',
      a: 'Файлаа Translation Service дээр илгээж хүсэлт үүсгэнэ. Хуудасны тоо, төрлөөс хамаарч үнэ ба хугацааг баталгаажуулж ажил эхлүүлнэ.',
    },
    {
      q: 'Нислэг, буудал, itinerary бэлтгэж өгдөг үү?',
      a: 'Тийм. Визийн материалд шаардлагатай нислэгийн төлөвлөгөө, буудлын мэдээлэл, аяллын хөтөлбөрийг кейсийн дагуу бэлтгэнэ.',
    },
    {
      q: 'Даатгалын баримт дээр юуг хамгийн их анхаарах вэ?',
      a: 'Аяллын бүх хугацааг хамарсан эсэх, нөхөн төлбөрийн дүн хүрэлцээтэй эсэх, нэр/паспортын мэдээлэл зөв эсэхийг нягтална.',
    },
    {
      q: 'Төлбөр төлөхийн өмнө гэрээ баталгаажуулах уу?',
      a: 'Тийм. Үйлчилгээний нөхцөл, хариуцлагын заалттай онлайн гэрээг зөвшөөрсний дараа төлбөрийн процесс үргэлжилнэ.',
    },
    {
      q: 'Чат дэмжлэгээр админтай шууд харилцаж болох уу?',
      a: 'Болно. Contact Support хэсгээр шууд чат эхлүүлж, явцын шинэчлэл болон шаардлагатай тайлбарыг цаг тухайд нь авна.',
    },
  ],
};

const mergeSiteSettings = (raw: Partial<SiteSettings> | null | undefined): SiteSettings => ({
  ...DEFAULT_SITE_SETTINGS,
  ...(raw || {}),
  maintenance: {
    ...DEFAULT_SITE_SETTINGS.maintenance,
    ...(raw?.maintenance || {}),
  },
  visibility: {
    ...DEFAULT_SITE_SETTINGS.visibility,
    ...(raw?.visibility || {}),
  },
  agreement: {
    ...DEFAULT_SITE_SETTINGS.agreement,
    ...(raw?.agreement || {}),
  },
  quickHelp: {
    ...DEFAULT_SITE_SETTINGS.quickHelp,
    ...(raw?.quickHelp || {}),
  },
  qAndAItems: Array.isArray(raw?.qAndAItems) && raw?.qAndAItems.length > 0
    ? raw.qAndAItems
    : DEFAULT_SITE_SETTINGS.qAndAItems,
});

export async function getSiteSettings(): Promise<SiteSettings> {
  const latest = await prisma.auditLog.findFirst({
    where: { action: 'SITE_SETTINGS_UPDATE', entity: 'SITE_SETTINGS' },
    orderBy: { createdAt: 'desc' },
    select: { newData: true, metadata: true },
  });

  const raw = latest?.newData || latest?.metadata;
  if (!raw) return DEFAULT_SITE_SETTINGS;

  try {
    const parsed = siteSettingsSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return mergeSiteSettings(parsed.data as Partial<SiteSettings>);
    }
  } catch {
    // ignore and fall back
  }

  return DEFAULT_SITE_SETTINGS;
}
