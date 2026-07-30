import type { Locale } from '@/lib/i18n'

export type Localized = Record<Locale, string>
export const L = (uz:string,ru:string,en:string):Localized => ({uz,ru,en})
export const tx = (value:Localized, locale:Locale) => value[locale]

export const company = {
  name:'GEOLDATA TECH',
  email:'hello@geoldatatech.uz',
  phone:'+998 71 200 00 00',
  address:L('Toshkent, O‘zbekiston','Ташкент, Узбекистан','Tashkent, Uzbekistan'),
  hours:L('Du–Ju, 09:00–18:00','Пн–Пт, 09:00–18:00','Mon–Fri, 09:00–18:00'),
  description:L('Hududlar, ma’lumotlar va odamlarni bog‘laydigan geoaxborot tizimlari.','Геоинформационные системы, соединяющие территории, данные и людей.','Geospatial systems connecting territories, data and people.')
}

export const ui = {
  uz:{nav:['Bosh sahifa','Biz haqimizda','Xizmatlar','Loyihalar','Karyera','Aloqa'],start:'Biz bilan bog‘lanish',explore:'Xizmatlarni ko‘rish',view:'Batafsil',all:'Barchasi',back:'Ortga',menu:'Menyu',close:'Yopish',theme:'Mavzu',language:'Til',read:'O‘qish',minutes:'daq',newsletter:'Geoaxborot yangiliklari',subscribe:'Obuna bo‘lish',email:'Email manzilingiz',rights:'Barcha huquqlar himoyalangan.',next:'Keyingi',formSuccess:'So‘rovingiz qabul qilindi. Tez orada bog‘lanamiz.',required:'Maydonni to‘ldiring.',privacy:'Maxfiylik siyosati',terms:'Foydalanish shartlari',gridView:'Katak ko‘rinish',mapView:'Xarita ko‘rinishi',locations:'joylashuv',sendApplication:'Arizani yuborish',completeFields:'Majburiy maydonlarni to‘ldiring.'},
  ru:{nav:['Главная','О компании','Услуги','Проекты','Карьера','Контакты'],start:'Связаться с нами',explore:'Смотреть услуги',view:'Подробнее',all:'Все',back:'Назад',menu:'Меню',close:'Закрыть',theme:'Тема',language:'Язык',read:'Читать',minutes:'мин',newsletter:'Новости геотехнологий',subscribe:'Подписаться',email:'Ваш email',rights:'Все права защищены.',next:'Далее',formSuccess:'Запрос получен. Мы скоро свяжемся с вами.',required:'Заполните поле.',privacy:'Политика конфиденциальности',terms:'Условия использования',gridView:'Вид сеткой',mapView:'Вид карты',locations:'локаций',sendApplication:'Отправить заявку',completeFields:'Заполните обязательные поля.'},
  en:{nav:['Home','About','Services','Projects','Careers','Contact'],start:'Contact us',explore:'Explore services',view:'View details',all:'All',back:'Back',menu:'Menu',close:'Close',theme:'Theme',language:'Language',read:'Read',minutes:'min',newsletter:'Geospatial news',subscribe:'Subscribe',email:'Your email',rights:'All rights reserved.',next:'Next',formSuccess:'Your request has been received. We will be in touch shortly.',required:'This field is required.',privacy:'Privacy Policy',terms:'Terms of Use',gridView:'Grid view',mapView:'Map view',locations:'locations',sendApplication:'Send application',completeFields:'Please complete the required fields.'}
}
export const navSlugs=['','about','services','projects','careers','contact']

export const services = [
 {slug:'gis-systems',icon:'layers',title:L('GIS tizimlarini ishlab chiqish','Разработка GIS-систем','GIS System Development'),summary:L('Korporativ fazoviy bazalar, boshqaruv panellari va maxsus GIS platformalari.','Корпоративные пространственные базы, панели управления и специализированные GIS-платформы.','Enterprise spatial databases, dashboards, and custom GIS platforms.'),capabilities:[L('Korporativ GIS','Корпоративный GIS','Enterprise GIS'),L('Fazoviy bazalar','Пространственные базы','Spatial databases'),L('GIS boshqaruv panellari','GIS-панели','GIS dashboards'),L('Ma’lumotlarni boshqarish','Управление данными','Data management')]},
 {slug:'arcgis',icon:'orbit',title:L('ArcGIS yechimlari','Решения ArcGIS','ArcGIS Solutions'),summary:L('ArcGIS Enterprise, Portal, Experience Builder va API integratsiyalari.','ArcGIS Enterprise, Portal, Experience Builder и API-интеграции.','ArcGIS Enterprise, Portal, Experience Builder, and API integrations.'),capabilities:[L('ArcGIS Enterprise','ArcGIS Enterprise','ArcGIS Enterprise'),L('ArcGIS Online','ArcGIS Online','ArcGIS Online'),L('Experience Builder','Experience Builder','Experience Builder'),L('StoryMaps','StoryMaps','StoryMaps')]},
 {slug:'geoportals',icon:'globe',title:L('Geoportallar','Геопорталы','Geoportal Development'),summary:L('Milliy, hududiy va ichki foydalanish uchun tezkor xarita portallari.','Национальные, региональные и внутренние картографические порталы.','High-performance national, regional, and internal map portals.'),capabilities:[L('Ochiq portallar','Открытые порталы','Public portals'),L('Meta-ma’lumot kataloglari','Каталоги метаданных','Metadata catalogs'),L('Qatlamlarni boshqarish','Управление слоями','Layer management'),L('Kirish nazorati','Контроль доступа','Access control')]},
 {slug:'web-maps',icon:'map',title:L('Interaktiv veb-xaritalar','Интерактивные веб-карты','Interactive Web Maps'),summary:L('Real vaqt ma’lumotlari, qidiruv, filtrlash, geokodlash va marshrutlash.','Данные реального времени, поиск, фильтрация, геокодирование и маршрутизация.','Real-time data, search, filtering, geocoding, and routing.'),capabilities:[L('Jonli xaritalash','Живое картографирование','Live mapping'),L('Geokodlash','Геокодирование','Geocoding'),L('Marshrutlash','Маршрутизация','Routing'),L('Maxsus kartografiya','Кастомная картография','Custom cartography')]},
 {slug:'remote-sensing',icon:'satellite',title:L('Masofadan zondlash','Дистанционное зондирование','Remote Sensing'),summary:L('Sun’iy yo‘ldosh tasvirlari, NDVI, tasniflash va o‘zgarishlarni aniqlash.','Спутниковые снимки, NDVI, классификация и выявление изменений.','Satellite imagery, NDVI, classification, and change detection.'),capabilities:[L('Yo‘ldosh tasvirlari','Спутниковые снимки','Satellite imagery'),L('NDVI','NDVI','NDVI'),L('O‘zgarishlarni aniqlash','Выявление изменений','Change detection'),L('Yer qoplamini tasniflash','Классификация земель','Land classification')]},
 {slug:'web-platforms',icon:'code',title:L('Veb-platformalar','Веб-платформы','Web Platforms'),summary:L('Davlat portallari, monitoring tizimlari va korporativ dasturiy mahsulotlar.','Государственные порталы, системы мониторинга и корпоративные продукты.','Government portals, monitoring systems, and enterprise software.'),capabilities:[L('Davlat portallari','Государственные порталы','Government portals'),L('SaaS','SaaS','SaaS'),L('Admin tizimlari','Админ-системы','Admin systems'),L('Ma’lumot panellari','Панели данных','Data dashboards')]},
 {slug:'mobile-gis',icon:'mobile',title:L('Mobil GIS','Мобильные GIS','Mobile GIS Applications'),summary:L('Oflayn xaritalar, GPS kuzatuvi va dala ma’lumotlarini yig‘ish.','Офлайн-карты, GPS-мониторинг и сбор полевых данных.','Offline maps, GPS tracking, and field data collection.'),capabilities:[L('Oflayn xaritalar','Офлайн-карты','Offline maps'),L('Dala so‘rovlari','Полевые обследования','Field surveys'),L('GPS kuzatuvi','GPS-мониторинг','GPS tracking'),L('Tekshiruvlar','Инспекции','Inspections')]},
 {slug:'consulting',icon:'compass',title:L('GIS konsalting','GIS-консалтинг','GIS Consulting'),summary:L('Strategiya, audit, migratsiya, arxitektura va xavfsizlik bo‘yicha ekspertiza.','Стратегия, аудит, миграция, архитектура и безопасность.','Strategy, audit, migration, architecture, and security expertise.'),capabilities:[L('GIS strategiyasi','GIS-стратегия','GIS strategy'),L('Ma’lumot auditi','Аудит данных','Data audits'),L('Migratsiya','Миграция','Migration'),L('Xavfsizlik tekshiruvi','Проверка безопасности','Security review')]}
]

export const solutions = [
 {slug:'government-geoportal',title:L('Davlat geoportali','Государственный геопортал','Government Geoportal'),industry:'Government',impact:L('Idoralararo ma’lumot almashinuvini yagona xaritada boshqarish.','Управление межведомственным обменом данными на единой карте.','Manage interagency data exchange on one map.'),modules:['Identity & access','Layer catalog','Analytics','Public portal']},
 {slug:'agri-monitoring',title:L('Agromonitoring','Агромониторинг','Agricultural Monitoring'),industry:'Agriculture',impact:L('Ekin holati, suv va hosildorlikni sun’iy yo‘ldosh orqali kuzatish.','Мониторинг посевов, воды и урожайности со спутника.','Monitor crop health, water, and yield from satellite data.'),modules:['NDVI','Crop registry','Field analytics','Alerts']},
 {slug:'smart-city',title:L('Smart City GIS','Smart City GIS','Smart City GIS'),industry:'Urban Planning',impact:L('Shahar infratuzilmasini real vaqt rejimida nazorat qilish.','Контроль городской инфраструктуры в реальном времени.','Control urban infrastructure in real time.'),modules:['City twin','Assets','Traffic','Citizen requests']},
 {slug:'land-management',title:L('Yer boshqaruvi','Управление землями','Land Management'),industry:'Land',impact:L('Yer resurslari va huquqiy qatlamlarni aniq boshqarish.','Точное управление земельными ресурсами и правовыми слоями.','Accurately manage land resources and legal layers.'),modules:['Cadastre','Registry','Workflow','Compliance']},
 {slug:'environment',title:L('Ekologik monitoring','Экологический мониторинг','Environmental Monitoring'),industry:'Environment',impact:L('Havo, suv va yer o‘zgarishlarini erta aniqlash.','Раннее выявление изменений воздуха, воды и почвы.','Detect changes in air, water, and land early.'),modules:['Sensors','Satellite','Risk maps','Reporting']},
 {slug:'infrastructure',title:L('Infratuzilma boshqaruvi','Управление инфраструктурой','Infrastructure Management'),industry:'Infrastructure',impact:L('Obyektlar holati va ta’mirlash jarayonlarini xaritada boshqarish.','Управление объектами и ремонтами на карте.','Manage assets and maintenance workflows spatially.'),modules:['Asset registry','Inspections','Work orders','KPIs']}
]

export type Project = {
 slug:string
 year:string
 title:Localized
 location:Localized
 industry:Localized
 category:string
 result:Localized
 color:string
 image:string
 gallery:string[]
 summary:Localized
 challengeTitle:Localized
 challenge:Localized
 solutionTitle:Localized
 solution:Localized
 features:Localized[]
 stats:[string,Localized][]
 client:Localized
 stack:string[]
 flow:Localized[]
}

export const projects:Project[] = [
 {
  slug:'space-water-monitoring',
  year:'2025',
  title:L('Space Water Monitoring','Space Water Monitoring','Space Water Monitoring'),
  location:L('O‘zbekiston Respublikasi','Республика Узбекистан','Republic of Uzbekistan'),
  industry:L('Suv xo‘jaligi','Водное хозяйство','Water Management'),
  category:'ArcGIS',
  result:L(
   'Suv xo‘jaligi uchun respublikadagi dala maydonlari holati va suv iste’molini kuzatuvchi raqamli portal.',
   'Цифровой портал для водного хозяйства: состояние полей и водопотребление по республике.',
   'A digital portal for water management tracking field conditions and water consumption nationwide.'
  ),
  color:'#0c3450',
  image:'/images/projects/space-water-1.png',
  gallery:['/images/projects/space-water-1.png','/images/projects/space-water-2.png'],
  summary:L(
   'Space Water Monitoring — UZCOSMOS uchun ArcGIS asosida yaratilgan raqamlashtirilgan portal. Unda respublikadagi dala maydonlarining holati, ekin maydonlari, suv iste’moli, suv manbalari va kanallar bo‘yicha ma’lumotlar yagona xarita va analitika panelida ko‘rsatiladi.',
   'Space Water Monitoring — оцифрованный портал на базе ArcGIS для UZCOSMOS. В нём в единой карте и аналитической панели отображаются состояние полей по республике, посевные площади, водопотребление, источники воды и каналы.',
   'Space Water Monitoring is an ArcGIS-based digitized portal built for UZCOSMOS. It presents republic-wide field conditions, crop areas, water consumption, water sources, and canals in one map and analytics panel.'
  ),
  challengeTitle:L(
   'Suv va dala ma’lumotlari tarqoq edi.',
   'Данные по воде и полям были разрознены.',
   'Water and field data were scattered.'
  ),
  challenge:L(
   'Dala maydonlari holati, suv iste’moli va kanal ma’lumotlari turli tizimlarda saqlanar, shuning uchun respublika miqyosida tezkor tahlil qilish qiyin edi.',
   'Состояние полей, водопотребление и данные по каналам хранились в разных системах, поэтому оперативный анализ в масштабе республики был затруднён.',
   'Field status, water use, and canal data were stored in separate systems, making fast nationwide analysis difficult.'
  ),
  solutionTitle:L(
   'ArcGIS asosidagi yagona monitoring portali.',
   'Единый портал мониторинга на базе ArcGIS.',
   'A unified ArcGIS monitoring portal.'
  ),
  solution:L(
   'Interaktiv xarita, ekin bo‘yicha suv iste’moli kartochkalari, oylik iste’mol grafigi, suv manbalari va kanallar ro‘yxati bitta portalga birlashtirildi.',
   'Интерактивная карта, карточки водопотребления по культурам, график месячного расхода, список источников воды и каналов объединены в одном портале.',
   'An interactive map, crop water-use cards, a monthly consumption chart, and lists of water sources and canals were combined into one portal.'
  ),
  features:[
   L('Respublika bo‘ylab dala maydonlari holatini xaritada kuzatish','Мониторинг состояния полей по всей республике на карте','Nationwide field condition monitoring on the map'),
   L('Ekin turi bo‘yicha o‘rtacha suv iste’moli','Среднее водопотребление по типам культур','Average water use by crop type'),
   L('Suv manbalari va kanallar bo‘yicha ma’lumotlar','Данные по источникам воды и каналам','Water sources and canal data'),
   L('Oylik suv iste’moli grafigi va umumiy analitika','График месячного водопотребления и общая аналитика','Monthly water consumption chart and overall analytics')
  ],
  stats:[
   ['128K+',L('Ekin maydonlari soni','Количество полей','Crop fields')],
   ['327K',L('ga ekin maydoni','га посевных площадей','ha of crop area')],
   ['1.3B',L('m³ suv iste’moli','м³ водопотребления','m³ water consumption')],
   ['ArcGIS',L('Texnologik asos','Технологическая основа','Technology base')]
  ],
  client:L('UZCOSMOS','UZCOSMOS','UZCOSMOS'),
  stack:['ArcGIS','ArcGIS Online','Experience Builder','Satellite imagery','Dashboards'],
  flow:[
   L('Dala va yo‘ldosh ma’lumotlari','Полевые и спутниковые данные','Field & satellite data'),
   L('ArcGIS','ArcGIS','ArcGIS'),
   L('GIS xizmatlari','GIS-сервисы','GIS services'),
   L('Monitoring portali','Портал мониторинга','Monitoring portal'),
   L('Suv xo‘jaligi qarorlari','Решения для водного хозяйства','Water management decisions')
  ]
 },
 {
  slug:'space-agro-monitoring',
  year:'2025',
  title:L('Space Agro Monitoring','Space Agro Monitoring','Space Agro Monitoring'),
  location:L('O‘zbekiston Respublikasi','Республика Узбекистан','Republic of Uzbekistan'),
  industry:L('Qishloq xo‘jaligi','Сельское хозяйство','Agriculture'),
  category:'ArcGIS',
  result:L(
   'Respublika bo‘yicha maydonlar holati, ekin turi, hosil va grafiklar asosidagi agro-monitoring portali.',
   'Агромониторинг-портал по состоянию полей, типам культур, урожайности и графикам в масштабе республики.',
   'An agro-monitoring portal for field conditions, crop types, yield, and charts across the republic.'
  ),
  color:'#143c35',
  image:'/images/projects/space-agro-1.png',
  gallery:['/images/projects/space-agro-1.png','/images/projects/space-agro-2.png'],
  summary:L(
   'Space Agro Monitoring — UZCOSMOS uchun ArcGIS asosida yaratilgan raqamlashtirilgan portal. U respublika bo‘yicha maydonlar holati, ekin turlari, hosildorlik, vegetatsiya indekslari (NDVI va boshqalar) hamda viloyatlar kesimidagi grafiklar orqali qishloq xo‘jaligini kuzatishga xizmat qiladi.',
   'Space Agro Monitoring — оцифрованный портал на базе ArcGIS для UZCOSMOS. Он помогает отслеживать состояние полей по республике, типы культур, урожайность, вегетационные индексы (NDVI и другие) и графики в разрезе областей.',
   'Space Agro Monitoring is an ArcGIS-based digitized portal built for UZCOSMOS. It helps monitor field conditions across the republic, crop types, yield, vegetation indices (NDVI and others), and regional charts for agriculture.'
  ),
  challengeTitle:L(
   'Milliy miqyosda agro-ma’lumotni bir joyda ko‘rish qiyin edi.',
   'Было сложно видеть агроданные национального масштаба в одном месте.',
   'National-scale agro data was hard to see in one place.'
  ),
  challenge:L(
   'Maydonlar holati, ekin turlari va hosil ko‘rsatkichlari bo‘yicha ma’lumotlar tarqoq bo‘lib, respublika miqyosida yagona ko‘rinish yetishmas edi.',
   'Данные о состоянии полей, типах культур и урожайности были разрознены, и не хватало единой картины в масштабе республики.',
   'Data on field conditions, crop types, and yield was fragmented, and a single nationwide view was missing.'
  ),
  solutionTitle:L(
   'ArcGIS asosidagi raqamli agro-monitoring.',
   'Цифровой агромониторинг на базе ArcGIS.',
   'Digital agro-monitoring built on ArcGIS.'
  ),
  solution:L(
   'Yo‘ldosh indekslari, ekin turi diagrammalari, viloyatlar bo‘yicha maydonlar va vegetatsiya holati bitta interaktiv dashboardda jamlandi.',
   'Спутниковые индексы, диаграммы типов культур, площади по областям и состояние вегетации собраны в одном интерактивном дашборде.',
   'Satellite indices, crop-type charts, regional areas, and vegetation status were brought together in one interactive dashboard.'
  ),
  features:[
   L('Viloyatlar kesimida maydonlar tahlili','Анализ площадей по областям','Area analysis by region'),
   L('Ekin turi bo‘yicha taqsimot va grafiklar','Распределение и графики по типам культур','Crop-type distribution and charts'),
   L('NDVI va boshqa vegetatsiya indekslari','NDVI и другие вегетационные индексы','NDVI and other vegetation indices'),
   L('Hosil, zaxira va foydalanilmagan yerlar monitoringi','Мониторинг урожайности, резервных и неиспользуемых земель','Yield, reserve, and unused land monitoring')
  ],
  stats:[
   ['4.7M',L('ga ekin maydoni','га посевных площадей','ha of crop area')],
   ['14',L('Viloyat qamrovi','Охват областей','Regions covered')],
   ['NDVI',L('Vegetatsiya indeksi','Индекс вегетации','Vegetation index')],
   ['ArcGIS',L('Texnologik asos','Технологическая основа','Technology base')]
  ],
  client:L('UZCOSMOS','UZCOSMOS','UZCOSMOS'),
  stack:['ArcGIS','ArcGIS Online','NDVI','Remote Sensing','Dashboards'],
  flow:[
   L('Yo‘ldosh tasvirlari','Спутниковые снимки','Satellite imagery'),
   L('ArcGIS','ArcGIS','ArcGIS'),
   L('Indeks va grafik tahlili','Анализ индексов и графиков','Index & chart analytics'),
   L('Agro-monitoring portali','Портал агромониторинга','Agro-monitoring portal'),
   L('Qishloq xo‘jaligi qarorlari','Решения для сельского хозяйства','Agricultural decisions')
  ]
 },
 {
  slug:'xgt-online',
  year:'2024',
  title:L('XGT Online','XGT Online','XGT Online'),
  location:L('O‘zbekiston Respublikasi','Республика Узбекистан','Republic of Uzbekistan'),
  industry:L('Gaz tashkiloti','Газовая организация','Gas Organization'),
  category:'Dashboard',
  result:L(
   'Gaz holati, quvurlar va texnologiyalar analitikasi hamda ishchi vazifalarini nazorat qiluvchi dashboard.',
   'Дашборд для аналитики состояния газа, трубопроводов и технологий, а также контроля задач сотрудников.',
   'A dashboard for gas status, pipeline and technology analytics, and worker task control.'
  ),
  color:'#253a5f',
  image:'/images/projects/xgt-online-1.png',
  gallery:['/images/projects/xgt-online-1.png','/images/projects/xgt-online-2.png'],
  summary:L(
   'XGT Online — gaz tashkiloti uchun mo‘ljallangan dashboard platforma. Unda hududlardagi gaz holati, quvurlar, GTP, quduq va boshqa texnologik obyektlar bo‘yicha analitika yuritiladi. Shu bilan birga ishchilarga yuklatilgan vazifalar va ularning bajarilish holati tekshiriladi.',
   'XGT Online — дашборд-платформа для газовой организации. В ней ведётся аналитика по состоянию газа в регионах, трубопроводам, ГТП, скважинам и другим технологическим объектам. Параллельно контролируются задачи, назначенные сотрудникам, и статус их выполнения.',
   'XGT Online is a dashboard platform for a gas organization. It provides analytics on regional gas status, pipelines, GTP units, wells, and other technical assets. It also tracks tasks assigned to workers and their completion status.'
  ),
  challengeTitle:L(
   'Obyektlar va vazifalar alohida kuzatilardi.',
   'Объекты и задачи отслеживались отдельно.',
   'Assets and tasks were tracked separately.'
  ),
  challenge:L(
   'Gaz infratuzilmasi (quvur, GTP, quduq va boshqalar) hamda ishchilarga berilgan topshiriqlar bo‘yicha ma’lumotlar bir joyda emas edi. Bajarilish holatini tezkor tekshirish qiyinlashgan.',
   'Данные по газовой инфраструктуре (трубы, ГТП, скважины и др.) и заданиям сотрудников не были собраны в одном месте. Оперативно проверять статус выполнения становилось сложно.',
   'Data on gas infrastructure (pipes, GTP units, wells, and more) and worker assignments was not in one place. Checking completion status quickly became difficult.'
  ),
  solutionTitle:L(
   'Yagona analitika va vazifa nazorati dashboardi.',
   'Единый дашборд аналитики и контроля задач.',
   'One analytics and task-control dashboard.'
  ),
  solution:L(
   'Xarita, hudud obyektlari, ishchilar holati, maxsus topshiriqlar va viloyatlar bo‘yicha bajarilish foizi bitta platformaga birlashtirildi.',
   'Карта, объекты на территории, статус сотрудников, спецзадания и процент выполнения по областям объединены в одной платформе.',
   'A map, regional assets, worker status, special tasks, and completion rates by region were unified in one platform.'
  ),
  features:[
   L('Hududdagi gaz obyektlari analitikasi (quvur, GTP, quduq, zulfin)','Аналитика газовых объектов (трубы, ГТП, скважины, задвижки)','Gas asset analytics (pipes, GTP, wells, valves)'),
   L('Ishchilar faolligi va holatini kuzatish','Мониторинг активности и статуса сотрудников','Worker activity and status monitoring'),
   L('Yuklatilgan vazifalar va bajarilish holatini tekshirish','Проверка назначенных задач и статуса выполнения','Assigned tasks and completion status checks'),
   L('Viloyatlar bo‘yicha reja va bajarilish tahlili','Анализ плана и выполнения по областям','Plan vs. completion analysis by region')
  ],
  stats:[
   ['232K+',L('Hudud obyektlari','Объектов на территории','Regional assets')],
   ['93K',L('km quvur','км трубопроводов','km of pipeline')],
   ['1.3K+',L('Ishchilar','Сотрудников','Workers')],
   ['814',L('Maxsus topshiriq','Специальных заданий','Special tasks')]
  ],
  client:L('Gaz tashkiloti','Газовая организация','Gas organization'),
  stack:['Leaflet','Esri','React','Dashboards','GIS analytics'],
  flow:[
   L('Infratuzilma ma’lumotlari','Данные инфраструктуры','Infrastructure data'),
   L('GIS qatlam','GIS-слой','GIS layer'),
   L('Vazifalar moduli','Модуль задач','Tasks module'),
   L('Analitika dashboardi','Аналитический дашборд','Analytics dashboard'),
   L('Nazorat va tekshiruv','Контроль и проверка','Control & review')
  ]
 }
]


export const technologies = {
 GIS:['ArcGIS Enterprise','ArcGIS Online','ArcGIS Pro','Experience Builder','QGIS','GeoServer','Mapbox','MapLibre','Leaflet','OpenLayers','Turf.js','Deck.gl'],
 Data:['PostgreSQL','PostGIS','SQL Server','Redis','Elasticsearch'],
 Frontend:['React','Next.js','TypeScript','WebGL','Three.js'],
 Backend:['Python','Django','FastAPI','Node.js','NestJS'],
 Infrastructure:['Docker','Kubernetes','Nginx','Linux','CI/CD','Cloud']
}
export const industries = ['Agriculture','Government','Urban Planning','Environment','Transport','Infrastructure','Utilities','Land Management','Emergency Management','Real Estate','Tourism','Logistics']
export const industryCopy:Record<string,Localized> = Object.fromEntries(industries.map((x,i)=>[x,L(['Hosildorlik, suv va dala monitoringi','Idoralararo boshqaruv va ochiq ma’lumotlar','Shahar rejalashtirish va raqamli egizak','Ekologik xavflarni erta aniqlash','Yo‘nalish va transport oqimi tahlili','Aktivlar va ta’mirlash boshqaruvi','Muhandislik tarmoqlari monitoringi','Kadastr va yer nazorati','Favqulodda vaziyatlarni tezkor boshqarish','Bozor va lokatsiya tahlili','Turistik navigatsiya va geoportallar','Logistika va marshrut optimizatsiyasi'][i],['Мониторинг урожайности, воды и полей','Межведомственное управление и открытые данные','Градостроительство и цифровой двойник','Раннее выявление экологических рисков','Анализ маршрутов и транспортных потоков','Управление активами и ремонтами','Мониторинг инженерных сетей','Кадастр и земельный контроль','Оперативное управление ЧС','Анализ рынка и локаций','Туристическая навигация и геопорталы','Оптимизация логистики и маршрутов'][i],['Yield, water, and field monitoring','Interagency management and open data','Urban planning and digital twins','Early environmental risk detection','Route and traffic flow analytics','Asset and maintenance management','Utility network monitoring','Cadastre and land control','Rapid emergency response','Market and location intelligence','Tourism navigation and geoportals','Logistics and route optimization'][i])]))

export const posts = [
 {slug:'gis-transformation',date:'2026-05-18',read:7,category:'GIS',title:L('GIS transformatsiyasi: xaritadan boshqaruv tizimiga','GIS-трансформация: от карты к системе управления','GIS Transformation: From Map to Management System'),excerpt:L('Tashkilotlar fazoviy ma’lumotdan qanday real operatsion qiymat oladi.','Как организации получают операционную ценность из пространственных данных.','How organizations create operational value from spatial data.')},
 {slug:'arcgis-architecture',date:'2026-04-09',read:9,category:'ArcGIS',title:L('Barqaror ArcGIS Enterprise arxitekturasi','Устойчивая архитектура ArcGIS Enterprise','Resilient ArcGIS Enterprise Architecture'),excerpt:L('Yuqori yuklama, xavfsizlik va masshtablash bo‘yicha amaliy yondashuv.','Практический подход к нагрузке, безопасности и масштабированию.','A practical approach to scale, security, and high availability.')},
 {slug:'satellite-monitoring',date:'2026-03-22',read:6,category:'Remote Sensing',title:L('Sun’iy yo‘ldosh monitoringi qarorlarni qanday tezlashtiradi','Как спутниковый мониторинг ускоряет решения','How Satellite Monitoring Accelerates Decisions'),excerpt:L('O‘zgarishlarni aniqlash va qishloq xo‘jaligida yangi imkoniyatlar.','Выявление изменений и новые возможности в сельском хозяйстве.','Change detection and new opportunities in agriculture.')},
 {slug:'geospatial-ai',date:'2026-02-14',read:8,category:'Geospatial AI',title:L('Geospatial AI: fazoviy tahlilning yangi bosqichi','Geospatial AI: новый этап пространственного анализа','Geospatial AI: The Next Spatial Frontier'),excerpt:L('AI va GIS birgalikda prognozlash tizimlarini qanday o‘zgartirmoqda.','Как AI и GIS меняют прогнозные системы.','How AI and GIS are reshaping predictive systems.')}
]

export const testimonials = [
 {quote:L('Platforma hisobotlarni kunlardan daqiqalarga qisqartirdi va hududiy jamoalarni yagona ma’lumot bilan ishlashga o‘tkazdi.','Платформа сократила отчетность с дней до минут и объединила региональные команды.','The platform reduced reporting from days to minutes and aligned regional teams around one source of truth.'),name:'Aziz R.',role:L('Raqamli rivojlanish rahbari','Руководитель цифрового развития','Head of Digital Development'),org:L('Davlat tashkiloti','Государственная организация','Government organization')},
 {quote:L('Texnik chuqurlik va biznes jarayonini tushunish bir jamoada jamlangan.','Техническая глубина и понимание бизнеса объединены в одной команде.','Deep technical expertise and business understanding live in the same team.'),name:'Elena K.',role:L('Dastur direktori','Директор программы','Program Director'),org:L('Infratuzilma operatori','Инфраструктурный оператор','Infrastructure operator')}
]
export const jobs = [
 {title:L('GIS dasturchi','GIS-разработчик','GIS Developer'),type:L('To‘liq stavka','Полная занятость','Full-time'),location:L('Toshkent / Gibrid','Ташкент / Гибрид','Tashkent / Hybrid')},
 {title:L('Frontend dasturchi','Frontend-разработчик','Frontend Developer'),type:L('To‘liq stavka','Полная занятость','Full-time'),location:L('Toshkent / Gibrid','Ташкент / Гибрид','Tashkent / Hybrid')},
 {title:L('Masofadan zondlash mutaxassisi','Специалист по ДЗЗ','Remote Sensing Specialist'),type:L('To‘liq stavka','Полная занятость','Full-time'),location:L('Toshkent','Ташкент','Tashkent')},
 {title:L('GIS tahlilchi','GIS-аналитик','GIS Analyst'),type:L('To‘liq stavka','Полная занятость','Full-time'),location:L('Toshkent','Ташкент','Tashkent')},
 {title:L('UI/UX dizayner','UI/UX-дизайнер','UI/UX Designer'),type:L('Shartnoma','Контракт','Contract'),location:L('Masofaviy','Удаленно','Remote')}
]

