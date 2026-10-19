import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, MapPin } from '@/components/icons'
import { listJobs } from '@/lib/admin-store'
import { services, technologies, tx } from '@/data/site'
import type { Locale } from '@/lib/i18n'
import { Reveal } from './Effects'
import { InteriorCTA, PageHero } from './PageShell'

const pc={
 uz:{about:['Biz fazoviy ma’lumotga ma’no beramiz.','GeoAIData Tech — davlat va biznesning murakkab hududiy vazifalarini aniq raqamli tizimlarga aylantiradigan geoaxborot kompaniyasi.','Bizning yo‘nalishimiz','Markaziy Osiyodan global geospatial bozorga.','Missiya','Geografik ma’lumotlarni aqlli, ochiq va masshtablanuvchi raqamli tizimlarga aylantirish.','Vizyon','Davlatlar va tashkilotlar uchun Markaziy Osiyodagi yetakchi geospatial texnologik hamkor bo‘lish.','Tamoyillar'],services:['Fazoviy texnologiyaning to‘liq sikli.','Strategiya va ma’lumot auditidan enterprise platformani ishga tushirishgacha bo‘lgan barcha texnik qatlamlar.','Biznes muammosidan ishlaydigan tizimgacha.'],solutions:['Hudud uchun tayyor raqamli yechimlar.','Davlat, qishloq xo‘jaligi, shahar, ekologiya va infratuzilma uchun modulli geospatial mahsulotlar.','Natijaga yo‘naltirilgan modullar'],technologies:['Ishonchli tizimlar ishonchli stackdan boshlanadi.','GIS, data, frontend, backend va infratuzilmaning sinovdan o‘tgan texnologik ekotizimi.','Tizim arxitekturasi'],industries:['Har bir sohaning o‘z geografiyasi bor.','Biz sohaga xos jarayonlarni fazoviy ma’lumot bilan bog‘laymiz va boshqaruv uchun yagona manzara yaratamiz.','Sohalar bo‘yicha qiymat'],insights:['Fazoviy texnologiya haqida chuqur fikr.','GIS, ArcGIS, sun’iy yo‘ldosh monitoringi va raqamli transformatsiya bo‘yicha amaliy tahlillar.','So‘nggi materiallar'],careers:['Murakkab masalalarni yaxshi ko‘radiganlar uchun.','GIS, dizayn va dasturiy muhandislik kesishgan joyda ishlaydigan jamoaga qo‘shiling.','Ochiq pozitsiyalar']},
 ru:{about:['Мы придаем смысл пространственным данным.','GeoAIData Tech превращает сложные территориальные задачи государства и бизнеса в точные цифровые системы.','Наше направление','Из Центральной Азии на глобальный георынок.','Миссия','Превращать геоданные в интеллектуальные, доступные и масштабируемые системы.','Видение','Стать ведущим геотехнологическим партнером в Центральной Азии.','Принципы'],services:['Полный цикл геотехнологий.','Все технические слои — от стратегии и аудита данных до запуска enterprise-платформы.','От бизнес-задачи к работающей системе.'],solutions:['Готовые цифровые решения для территорий.','Модульные геопродукты для государства, сельского хозяйства, города, экологии и инфраструктуры.','Модули, ориентированные на результат'],technologies:['Надежные системы начинаются с надежного стека.','Проверенная экосистема GIS, data, frontend, backend и инфраструктуры.','Архитектура системы'],industries:['У каждой отрасли своя география.','Мы связываем отраслевые процессы с геоданными и создаем единую картину управления.','Ценность для отраслей'],insights:['Глубокий взгляд на геотехнологии.','Практические материалы о GIS, ArcGIS, спутниковом мониторинге и цифровой трансформации.','Последние материалы'],careers:['Для тех, кто любит сложные задачи.','Присоединяйтесь к команде на пересечении GIS, дизайна и программной инженерии.','Открытые позиции']},
 en:{about:['We give spatial data meaning.','GeoAIData Tech turns complex territorial challenges for governments and businesses into precise digital systems.','Our direction','From Central Asia to the global geospatial market.','Mission','Transform geographic data into intelligent, accessible, and scalable digital systems.','Vision','Become a leading geospatial technology partner across Central Asia.','Principles'],services:['The full geospatial technology cycle.','Every technical layer, from strategy and data audit to an enterprise platform launch.','From business challenge to working system.'],solutions:['Digital solutions built for territories.','Modular geospatial products for government, agriculture, cities, environment, and infrastructure.','Outcome-driven modules'],technologies:['Reliable systems start with a reliable stack.','A proven ecosystem across GIS, data, frontend, backend, and infrastructure.','System architecture'],industries:['Every industry has its own geography.','We connect sector workflows with spatial data to create one operational picture.','Industry value'],insights:['Deep thinking about geospatial technology.','Practical perspectives on GIS, ArcGIS, satellite monitoring, and digital transformation.','Latest intelligence'],careers:['For people who enjoy hard problems.','Join a team working where GIS, design, and software engineering meet.','Open positions']}
}
const aboutPage={
 uz:{
  hero:'Geoaxborot tizimlari kompaniyasi',
  lead:'GeoAIData Tech davlat idoralari, qishloq va suv xo‘jaligi, ekologiya hamda infratuzilma tashkilotlari uchun GIS tizimlari, ArcGIS portallari va monitoring platformalarini yaratadi. Biz Toshkent viloyati, Zangiota tumanida joylashganmiz.',
  direction:'Biz nima qilamiz',
  directionTitle:'Hudud haqidagi ma’lumotni ishlaydigan tizimga aylantiramiz.',
  directionText:'Sun’iy yo‘ldosh tasviri, dala o‘lchovi va idora bazasi alohida qolsa, qaror qabul qilish qiyinlashadi. Biz bu manbalarni bitta xarita, katalog va boshqaruv panelida birlashtiramiz. Natijada mutaxassis maydon holatini, obyektni va o‘zgarishni bir joyda ko‘radi.',
  mission:'Missiya',
  missionText:'Geografik ma’lumotni tushunarli, ishonchli va kundalik ishda ishlatiladigan raqamli tizimga aylantirish. Har bir loyiha aniq vazifadan boshlanadi: suv monitoringi, yer hisobi, shahar infratuzilmasi yoki idoralararo ma’lumot almashinuvi.',
  vision:'Yo‘nalish',
  visionText:'O‘zbekiston va Markaziy Osiyoda davlat hamda biznes uchun geoaxborot tizimlarini loyihalash, ishga tushirish va qo‘llab-quvvatlash bo‘yicha ishonchli hamkor bo‘lish. Platforma o‘sishi kerak: yangi qatlam, yangi foydalanuvchi va yangi hudud qo‘shilganda tizim buzilmasligi lozim.',
  work:'Tizimlar',
  workTitle:'Qaysi tizimlarni yaratamiz',
  items:[
   ['GIS va geoportallar','Korporativ fazoviy bazalar, qatlam kataloglari, ochiq va ichki geoportallar. Foydalanuvchi xaritadan qidiradi, filtrlaydi va hisobot oladi.'],
   ['ArcGIS yechimlari','ArcGIS Enterprise, Online, Experience Builder va StoryMaps asosida portal, xarita va tahlil muhitini sozlaymiz.'],
   ['Masofadan zondlash','Sun’iy yo‘ldosh tasvirlari, NDVI va o‘zgarishlarni aniqlash. Ekin, suv va yer qoplami bo‘yicha monitoring.'],
   ['Veb va mobil platformalar','Davlat portallari, admin panellar va dala ilovalari. Oflayn xarita, GPS kuzatuvi va ma’lumot yig‘ish.']
  ],
  principles:'Tamoyillar',
  principlesTitle:'Tizim aniq, tushunarli va uzoq xizmat qilishi kerak.',
  values:[
   ['Aniqlik','Koordinata, qatlam va hisob bir-biriga mos keladi. Xato ma’lumot xaritaga chiqarilmaydi.'],
   ['Tushunarlik','Mutaxassis ham, rahbar ham ekranni o‘qiy oladi. Ortiqcha qatlam yashiriladi.'],
   ['Ishonchlilik','Kirish huquqi, zaxira va monitoring oldindan loyihalanadi.'],
   ['Hamkorlik','Vazifani buyurtmachi bilan birga aniqlaymiz, keyin arxitektura va ishlab chiqish boshlanadi.']
  ],
  coverage:'Qamrov',
  coverageTitle:'O‘zbekiston hududlari uchun ishlaydigan tizimlar.',
  coverageText:'Loyihalar respublika, viloyat va tuman miqyosida ishlaydi. Suv xo‘jaligi, qishloq xo‘jaligi, ekologiya va infratuzilma bo‘yicha xaritalar joyida qo‘llaniladi. Jamoa Toshkent viloyati, Zangiota tumani, Erkin MFY, 63-uyda joylashgan. Ish vaqti: dushanbadan jumagacha, 09:00–18:00.',
  cta:'Hududingiz uchun geoaxborot tizimini birga loyihalaymiz.'
 },
 ru:{
  hero:'Компания геоинформационных систем',
  lead:'GeoAIData Tech создаёт GIS-системы, порталы ArcGIS и платформы мониторинга для государственных органов, сельского и водного хозяйства, экологии и инфраструктуры. Мы находимся в Ташкентской области, районе Зангиота.',
  direction:'Чем мы занимаемся',
  directionTitle:'Превращаем данные о территории в рабочую систему.',
  directionText:'Когда спутниковый снимок, полевой замер и ведомственная база живут отдельно, решение принимать трудно. Мы собираем эти источники на одной карте, в каталоге и на панели управления. Специалист видит состояние территории, объект и изменение в одном месте.',
  mission:'Миссия',
  missionText:'Превращать географические данные в понятную, надёжную систему для ежедневной работы. Каждый проект начинается с конкретной задачи: мониторинг воды, учёт земель, городская инфраструктура или межведомственный обмен.',
  vision:'Направление',
  visionText:'Быть надёжным партнёром по проектированию, запуску и сопровождению геоинформационных систем для государства и бизнеса в Узбекистане и Центральной Азии. Платформа должна расти: новый слой, новый пользователь и новая территория не должны её ломать.',
  work:'Системы',
  workTitle:'Какие системы мы создаём',
  items:[
   ['GIS и геопорталы','Корпоративные пространственные базы, каталоги слоёв, открытые и внутренние геопорталы. Пользователь ищет, фильтрует и получает отчёт с карты.'],
   ['Решения ArcGIS','Настраиваем портал, карты и аналитику на ArcGIS Enterprise, Online, Experience Builder и StoryMaps.'],
   ['Дистанционное зондирование','Спутниковые снимки, NDVI и выявление изменений. Мониторинг посевов, воды и земельного покрова.'],
   ['Веб и мобильные платформы','Государственные порталы, админ-панели и полевые приложения. Офлайн-карты, GPS и сбор данных.']
  ],
  principles:'Принципы',
  principlesTitle:'Система должна быть точной, понятной и долговечной.',
  values:[
   ['Точность','Координата, слой и учёт совпадают. Ошибочные данные на карту не попадают.'],
   ['Понятность','И специалист, и руководитель читают экран. Лишние слои скрыты.'],
   ['Надёжность','Права доступа, резервное копирование и мониторинг закладываются заранее.'],
   ['Партнёрство','Сначала вместе формулируем задачу, затем начинаем архитектуру и разработку.']
  ],
  coverage:'Охват',
  coverageTitle:'Системы, которые работают на территории Узбекистана.',
  coverageText:'Проекты работают в масштабе республики, области и района. Карты водного хозяйства, сельского хозяйства, экологии и инфраструктуры применяются на месте. Команда находится в Ташкентской области, район Зангиота, Эркин МФЙ, дом 63. Время работы: понедельник–пятница, 09:00–18:00.',
  cta:'Спроектируем геоинформационную систему для вашей территории.'
 },
 en:{
  hero:'A geospatial systems company',
  lead:'GeoAIData Tech builds GIS systems, ArcGIS portals, and monitoring platforms for government agencies, agriculture, water management, the environment, and infrastructure. We are based in Zangiota District, Tashkent Region.',
  direction:'What we do',
  directionTitle:'We turn territory data into a system people can use.',
  directionText:'Satellite imagery, field measurements, and institutional databases are hard to act on when they stay separate. We bring those sources into one map, catalog, and dashboard. A specialist can see field condition, the asset, and the change in one place.',
  mission:'Mission',
  missionText:'Turn geographic data into a clear, reliable system for daily work. Every project starts from a concrete task: water monitoring, land records, urban infrastructure, or data exchange between agencies.',
  vision:'Direction',
  visionText:'Be a reliable partner for designing, launching, and supporting geospatial systems for government and business in Uzbekistan and Central Asia. The platform has to grow: a new layer, a new user, and a new territory should not break it.',
  work:'Systems',
  workTitle:'The systems we build',
  items:[
   ['GIS and geoportals','Enterprise spatial databases, layer catalogs, and public or internal geoportals. People search, filter, and report from the map.'],
   ['ArcGIS solutions','Portals, maps, and analysis on ArcGIS Enterprise, Online, Experience Builder, and StoryMaps.'],
   ['Remote sensing','Satellite imagery, NDVI, and change detection. Monitoring for crops, water, and land cover.'],
   ['Web and mobile platforms','Government portals, admin panels, and field apps. Offline maps, GPS tracking, and data collection.']
  ],
  principles:'Principles',
  principlesTitle:'A system should be accurate, readable, and built to last.',
  values:[
   ['Accuracy','Coordinates, layers, and records agree. Bad data does not reach the map.'],
   ['Clarity','A specialist and a manager can both read the screen. Extra layers stay hidden.'],
   ['Reliability','Access rights, backups, and monitoring are designed in from the start.'],
   ['Partnership','We define the task with the client, then start architecture and development.']
  ],
  coverage:'Coverage',
  coverageTitle:'Systems built for territories in Uzbekistan.',
  coverageText:'Projects run at republic, region, and district scale. Maps for water, agriculture, the environment, and infrastructure are used on the ground. The team is at house 63, Erkin MFY, Zangiota District, Tashkent Region. Hours: Monday–Friday, 09:00–18:00.',
  cta:'Let’s design a geospatial system for your territory.'
 }
}
const aboutSystemImages=['gis-systems','arcgis','remote-sensing','web-platforms'] as const
export function AboutPage({locale}:{locale:Locale}){const c=aboutPage[locale];return <><PageHero locale={locale} index="01" eyebrow={locale==='uz'?'BIZ HAQIMIZDA':locale==='ru'?'О КОМПАНИИ':'ABOUT'} title={c.hero} text={c.lead}/><section className="editorial-section about-page"><Reveal from="up"><span className="section-label">/ {c.direction}</span><h2>{c.directionTitle}</h2><p className="about-copy">{c.directionText}</p></Reveal><div className="about-grid">{[{t:c.mission,p:c.missionText},{t:c.vision,p:c.visionText}].map((item,i)=><Reveal key={item.t} from={i?'right':'left'} delay={i*.08}><article><span>0{i+1}</span><h3>{item.t}</h3><p>{item.p}</p></article></Reveal>)}</div></section><section className="editorial-section about-page"><Reveal from="up"><span className="section-label">/ {c.work}</span><h2>{c.workTitle}</h2></Reveal><div className="about-grid about-systems">{c.items.map((item,i)=><Reveal key={item[0]} delay={i*.05} from="up"><article><img src={'/images/services/'+aboutSystemImages[i]+'.jpg?v=2'} alt={item[0]} style={aboutSystemImages[i]==='arcgis'?{objectPosition:'82% center'}:undefined}/><div><span>0{i+1}</span><h3>{item[0]}</h3><p>{item[1]}</p></div></article></Reveal>)}</div></section><section className="editorial-section about-page"><Reveal from="up"><span className="section-label">/ {c.principles}</span><h2>{c.principlesTitle}</h2></Reveal><div className="about-grid">{c.values.map((item,i)=><Reveal key={item[0]} delay={i*.05} from="up"><article><span>0{i+1}</span><h3>{item[0]}</h3><p>{item[1]}</p></article></Reveal>)}</div></section><section className="coverage-section about-page"><Reveal from="scale"><div className="coverage-map"><div className="topo"/>{[1,2,3,4,5].map(i=><i key={i} className={'coverage-dot d'+i}/>)}</div></Reveal><Reveal from="right" delay={0.1}><span className="section-label">/ {c.coverage}</span><h2>{c.coverageTitle}</h2><p>{c.coverageText}</p></Reveal></section><InteriorCTA locale={locale} title={c.cta}/></>}
const serviceCredit:Record<string,string>={'gis-systems':'QGIS','arcgis':'ArcGIS Map Viewer','geoportals':'© OpenStreetMap','web-maps':'© OpenStreetMap'}
export function ServicesPage({locale}:{locale:Locale}){const c=pc[locale].services;const credit=serviceCredit;return <><PageHero locale={locale} index="02" eyebrow={locale==='uz'?'XIZMATLAR':locale==='ru'?'УСЛУГИ':'SERVICES'} title={c[0]} text={c[1]}/><section className="service-offers"><div className="section-head"><Reveal from="up"><span className="section-label">/ {locale==='uz'?'NIMA QILAMIZ':locale==='ru'?'ЧТО МЫ ДЕЛАЕМ':'WHAT WE DO'}</span><h2>{c[2]}</h2></Reveal></div><div className="service-board">{services.map((s,i)=><Reveal key={s.slug} className="service-slot" delay={i*.05} from="up"><article id={s.slug} className="service-offer"><img src={'/images/services/'+s.slug+'.jpg?v=2'} alt={tx(s.title,locale)} style={s.slug==='arcgis'?{objectPosition:'82% center'}:undefined}/><div><small>0{i+1}</small><h2>{tx(s.title,locale)}</h2><p>{tx(s.about,locale)}</p><ul>{s.capabilities.map(x=><li key={x.en}>{tx(x,locale)}</li>)}</ul>{credit[s.slug]?<span className="credit">{credit[s.slug]}</span>:null}</div></article></Reveal>)}</div></section><InteriorCTA locale={locale} title={locale==='en'?'One partner for every spatial layer.':locale==='ru'?'Один партнер для каждого пространственного слоя.':'Har bir fazoviy qatlam uchun yagona hamkor.'}/></>}

export function TechnologiesPage({locale}:{locale:Locale}){const c=pc[locale].technologies;const arch=locale==='uz'?<>Ma’lumot oqadi. Tizimlar javob beradi.<br/>Qarorlar tezlashadi.</>:locale==='ru'?<>Данные текут. Системы отвечают.<br/>Решения ускоряются.</>:<>Data flows. Systems respond.<br/>Decisions accelerate.</>;return <><PageHero locale={locale} index="06" eyebrow={locale==='uz'?'TEXNOLOGIYALAR':locale==='ru'?'ТЕХНОЛОГИИ':'TECHNOLOGIES'} title={c[0]} text={c[1]}/><section className="architecture-section"><Reveal from="up"><span className="section-label">/ {c[2]}</span><h2>{arch}</h2></Reveal><Reveal from="scale" delay={0.12}><div className="architecture-diagram"><div className="arch-core">GEODATA<br/>PLATFORM</div>{Object.keys(technologies).map((x,i)=><div key={x} className={'arch-node n'+i}><span>{x}</span><i/></div>)}<svg><path d="M110 250 C250 20 550 20 690 250"/><path d="M110 250 C250 480 550 480 690 250"/><path d="M400 40V460"/></svg></div></Reveal></section><section className="tech-catalog">{Object.entries(technologies).map(([group,items],i)=><Reveal key={group} delay={i*.06} from="up"><article><small>0{i+1}</small><h2>{group}</h2><div>{items.map(x=><span key={x}>{x}</span>)}</div></article></Reveal>)}</section><InteriorCTA locale={locale} title={locale==='en'?'Architecture that scales with your geography.':locale==='ru'?'Архитектура, которая масштабируется вместе с вашей географией.':'Geografiyangiz bilan birga masshtablanadigan arxitektura.'}/></>}
export async function CareersPage({locale}:{locale:Locale}){const c=pc[locale].careers;const jobList=await listJobs(true);const benefits=locale==='uz'?['Chuqur texnik ish','Haqiqiy ta’sir','O‘qish byudjeti','Gibrid madaniyat','Xalqaro qamrov','Yuqori muhandislik standartlari']:locale==='ru'?['Глубокая техническая работа','Реальное влияние','Бюджет на обучение','Гибридная культура','Международный охват','Высокие инженерные стандарты']:['Deep technical work','Real-world impact','Learning budget','Hybrid culture','International scope','Strong engineering standards'];const positionsLabel=locale==='uz'?`${jobList.length} ta pozitsiya / Toshkent + masofaviy`:locale==='ru'?`${jobList.length} позиций / Ташкент + удалённо`:`${jobList.length} positions / Tashkent + Remote`;return <><PageHero locale={locale} index="09" eyebrow={locale==='uz'?'KARYERA':locale==='ru'?'КАРЬЕРА':'CAREERS'} title={c[0]} text={c[1]}/><section className="culture-section"><Reveal from="left"><div className="culture-visual"><div className="topo"/><strong>GIS × CODE × DESIGN</strong></div></Reveal><Reveal from="right" delay={0.1}><span className="section-label">/ {locale==='uz'?'MADANIYAT':locale==='ru'?'КУЛЬТУРА':'CULTURE'}</span><h2>{locale==='uz'?'Hududlar ishlashini o‘zgartiradigan tizimlar yarating.':locale==='ru'?'Создавайте системы, которые меняют работу территорий.':'Build systems that change how territories work.'}</h2><p>{c[1]}</p><div className="benefit-list">{benefits.map(x=><span key={x}><CheckCircle2/>{x}</span>)}</div></Reveal></section><section className="jobs-section"><Reveal from="up"><span className="section-label">/ {c[2]}</span><h2>{positionsLabel}</h2></Reveal><div>{jobList.map((j,i)=><Reveal key={j.id} delay={i*.06} from="left"><article><small>0{i+1}</small><h3>{tx(j.title,locale)}</h3><span>{tx(j.type,locale)}</span><span><MapPin/>{tx(j.location,locale)}</span><Link href={`/${locale}/careers/apply?position=${encodeURIComponent(j.title.en)}`}><ArrowUpRight/></Link></article></Reveal>)}</div></section><InteriorCTA locale={locale} title={locale==='en'?'Your next coordinate may be here.':locale==='ru'?'Возможно, ваша следующая координата здесь.':'Keyingi koordinatangiz shu yerda bo‘lishi mumkin.'}/></>}
