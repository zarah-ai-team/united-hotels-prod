import type { LanguageCode } from "@/shared/context/LanguageContext";

/**
 * Static translation tables for the most-visible UI strings.
 * The runtime API (mymemory) is rate-limited, so the visible UI must not
 * depend on it. Anything missing here falls through to the API and finally
 * to the English source string.
 */

const COMMON: Record<string, Record<Exclude<LanguageCode, "en">, string>> = {
  // ─── Navigation ─────────────────────────────────────────
  Home: {
    tr: "Ana Sayfa", de: "Startseite", fr: "Accueil", es: "Inicio", it: "Home",
    ar: "الرئيسية", ru: "Главная", zh: "首页", ja: "ホーム",
  },
  "Why Choose United Hotels": {
    tr: "Neden United Hotels", de: "Warum United Hotels", fr: "Pourquoi United Hotels",
    es: "Por qué United Hotels", it: "Perché United Hotels", ar: "لماذا United Hotels",
    ru: "Почему United Hotels", zh: "为什么选择 United Hotels", ja: "United Hotels を選ぶ理由",
  },
  "Featured Hotels": {
    tr: "Öne Çıkan Oteller", de: "Empfohlene Hotels", fr: "Hôtels en vedette",
    es: "Hoteles destacados", it: "Hotel in evidenza", ar: "فنادق مميزة",
    ru: "Избранные отели", zh: "精选酒店", ja: "おすすめホテル",
  },
  Quality: {
    tr: "Kalite", de: "Qualität", fr: "Qualité", es: "Calidad", it: "Qualità",
    ar: "الجودة", ru: "Качество", zh: "品质", ja: "品質",
  },
  FAQ: {
    tr: "SSS", de: "FAQ", fr: "FAQ", es: "FAQ", it: "FAQ",
    ar: "الأسئلة الشائعة", ru: "Вопросы", zh: "常见问题", ja: "よくある質問",
  },
  Account: {
    tr: "Hesap", de: "Konto", fr: "Compte", es: "Cuenta", it: "Account",
    ar: "الحساب", ru: "Аккаунт", zh: "账户", ja: "アカウント",
  },
  "Book stay": {
    tr: "Rezervasyon", de: "Buchen", fr: "Réserver", es: "Reservar", it: "Prenota",
    ar: "احجز", ru: "Забронировать", zh: "预订", ja: "予約",
  },
  Menu: {
    tr: "Menü", de: "Menü", fr: "Menu", es: "Menú", it: "Menu",
    ar: "القائمة", ru: "Меню", zh: "菜单", ja: "メニュー",
  },
  Region: {
    tr: "Bölge", de: "Region", fr: "Région", es: "Región", it: "Regione",
    ar: "المنطقة", ru: "Регион", zh: "地区", ja: "地域",
  },
  "Choose your region": {
    tr: "Bölgenizi seçin", de: "Wählen Sie Ihre Region", fr: "Choisissez votre région",
    es: "Elige tu región", it: "Scegli la tua regione", ar: "اختر منطقتك",
    ru: "Выберите регион", zh: "选择您的地区", ja: "地域を選択",
  },

  // ─── Hero / Search ──────────────────────────────────────
  "Stay Smart. Stay United.": {
    tr: "Akıllı Konakla. United ile Kal.", de: "Klug reisen. United wählen.",
    fr: "Voyagez malin. Choisissez United.", es: "Viaja inteligente. Elige United.",
    it: "Viaggia smart. Scegli United.", ar: "سافر بذكاء. اختر United.",
    ru: "Путешествуй умно. Выбирай United.", zh: "聪明出行，选择 United。",
    ja: "賢く旅する。United を選ぶ。",
  },
  "Handpicked stays in Turkey's most loved neighborhoods. Verified, transparent, and quietly excellent.": {
    tr: "Türkiye'nin en sevilen semtlerinde özenle seçilmiş konaklamalar. Doğrulanmış, şeffaf ve sade bir mükemmellik.",
    de: "Handverlesene Unterkünfte in den beliebtesten Vierteln der Türkei. Geprüft, transparent und unaufgeregt exzellent.",
    fr: "Hébergements triés sur le volet dans les quartiers les plus prisés de Turquie. Vérifiés, transparents et discrètement excellents.",
    es: "Alojamientos seleccionados a mano en los barrios más queridos de Turquía. Verificados, transparentes y discretamente excelentes.",
    it: "Soggiorni selezionati a mano nei quartieri più amati della Turchia. Verificati, trasparenti e silenziosamente eccellenti.",
    ar: "إقامات مختارة بعناية في أكثر أحياء تركيا محبوبة. موثوقة وشفافة ومتميزة بهدوء.",
    ru: "Тщательно отобранные отели в самых любимых районах Турции. Проверенные, прозрачные и неброско отличные.",
    zh: "精心挑选土耳其最受喜爱街区的住宿。经过验证、透明、低调卓越。",
    ja: "トルコで最も愛される街区から厳選された宿泊施設。検証済み、透明、静かに卓越。",
  },
  Destination: {
    tr: "Destinasyon", de: "Reiseziel", fr: "Destination", es: "Destino", it: "Destinazione",
    ar: "الوجهة", ru: "Направление", zh: "目的地", ja: "目的地",
  },
  "Check-in": {
    tr: "Giriş", de: "Anreise", fr: "Arrivée", es: "Entrada", it: "Check-in",
    ar: "تسجيل الوصول", ru: "Заезд", zh: "入住", ja: "チェックイン",
  },
  "Check-out": {
    tr: "Çıkış", de: "Abreise", fr: "Départ", es: "Salida", it: "Check-out",
    ar: "تسجيل المغادرة", ru: "Выезд", zh: "退房", ja: "チェックアウト",
  },
  Guests: {
    tr: "Misafir", de: "Gäste", fr: "Voyageurs", es: "Huéspedes", it: "Ospiti",
    ar: "النزلاء", ru: "Гости", zh: "客人", ja: "宿泊人数",
  },
  "Where to?": {
    tr: "Nereye?", de: "Wohin?", fr: "Où aller ?", es: "¿A dónde?", it: "Dove?",
    ar: "إلى أين؟", ru: "Куда?", zh: "去哪里？", ja: "どこへ？",
  },
  "Where are you going?": {
    tr: "Nereye gidiyorsunuz?", de: "Wohin reisen Sie?", fr: "Où allez-vous ?",
    es: "¿A dónde vas?", it: "Dove stai andando?", ar: "إلى أين تذهب؟",
    ru: "Куда вы едете?", zh: "您要去哪里？", ja: "どちらへ行かれますか？",
  },
  "Add guests": {
    tr: "Misafir ekle", de: "Gäste hinzufügen", fr: "Ajouter des voyageurs",
    es: "Añadir huéspedes", it: "Aggiungi ospiti", ar: "أضف نزلاء",
    ru: "Добавить гостей", zh: "添加客人", ja: "宿泊人数を追加",
  },
  "1 guest": { tr: "1 misafir", de: "1 Gast", fr: "1 voyageur", es: "1 huésped", it: "1 ospite", ar: "نزيل واحد", ru: "1 гость", zh: "1 位客人", ja: "1 名" },
  "2 guests": { tr: "2 misafir", de: "2 Gäste", fr: "2 voyageurs", es: "2 huéspedes", it: "2 ospiti", ar: "نزيلان", ru: "2 гостя", zh: "2 位客人", ja: "2 名" },
  "3 guests": { tr: "3 misafir", de: "3 Gäste", fr: "3 voyageurs", es: "3 huéspedes", it: "3 ospiti", ar: "3 نزلاء", ru: "3 гостя", zh: "3 位客人", ja: "3 名" },
  "4+ guests": { tr: "4+ misafir", de: "4+ Gäste", fr: "4+ voyageurs", es: "4+ huéspedes", it: "4+ ospiti", ar: "+4 نزلاء", ru: "4+ гостей", zh: "4+ 位客人", ja: "4 名以上" },
  Search: {
    tr: "Ara", de: "Suchen", fr: "Rechercher", es: "Buscar", it: "Cerca",
    ar: "بحث", ru: "Поиск", zh: "搜索", ja: "検索",
  },
  "Search Hotels": {
    tr: "Otel Ara", de: "Hotels suchen", fr: "Rechercher des hôtels",
    es: "Buscar hoteles", it: "Cerca hotel", ar: "ابحث عن فنادق",
    ru: "Найти отели", zh: "搜索酒店", ja: "ホテルを検索",
  },
  Turkey: {
    tr: "Türkiye", de: "Türkei", fr: "Turquie", es: "Turquía", it: "Turchia",
    ar: "تركيا", ru: "Турция", zh: "土耳其", ja: "トルコ",
  },

  // ─── Why Choose Us ──────────────────────────────────────
  "Why United Hotels": {
    tr: "Neden United Hotels", de: "Warum United Hotels", fr: "Pourquoi United Hotels",
    es: "Por qué United Hotels", it: "Perché United Hotels", ar: "لماذا United Hotels",
    ru: "Почему United Hotels", zh: "为什么选择 United Hotels", ja: "United Hotels を選ぶ理由",
  },
  "Not another OTA.": {
    tr: "Sıradan bir OTA değiliz.", de: "Kein weiteres OTA.", fr: "Pas une OTA de plus.",
    es: "No somos otra OTA.", it: "Non un'altra OTA.", ar: "لسنا مجرد OTA أخرى.",
    ru: "Не очередное OTA.", zh: "不是又一个OTA。", ja: "ありふれた OTA ではありません。",
  },
  "Personally Selected": {
    tr: "Özenle Seçildi", de: "Persönlich ausgewählt", fr: "Sélectionné personnellement",
    es: "Seleccionados personalmente", it: "Selezionati personalmente", ar: "مختارة شخصياً",
    ru: "Лично отобрано", zh: "亲自精选", ja: "厳選",
  },
  "Better Direct Rates": {
    tr: "Daha İyi Doğrudan Fiyatlar", de: "Bessere Direktpreise", fr: "Meilleurs tarifs directs",
    es: "Mejores tarifas directas", it: "Tariffe dirette migliori", ar: "أسعار مباشرة أفضل",
    ru: "Лучшие прямые тарифы", zh: "更优直订价", ja: "より良い直販料金",
  },
  "Total Price Upfront": {
    tr: "Toplam Fiyat Önceden", de: "Gesamtpreis im Voraus", fr: "Prix total annoncé",
    es: "Precio total claro", it: "Prezzo totale chiaro", ar: "السعر الكامل مسبقاً",
    ru: "Полная цена сразу", zh: "总价透明", ja: "総額を事前提示",
  },
  "WhatsApp Support": {
    tr: "WhatsApp Desteği", de: "WhatsApp-Support", fr: "Support WhatsApp",
    es: "Soporte por WhatsApp", it: "Supporto WhatsApp", ar: "دعم واتساب",
    ru: "Поддержка в WhatsApp", zh: "WhatsApp 支持", ja: "WhatsApp サポート",
  },
  "Flexible Cancellation": {
    tr: "Esnek İptal", de: "Flexible Stornierung", fr: "Annulation flexible",
    es: "Cancelación flexible", it: "Cancellazione flessibile", ar: "إلغاء مرن",
    ru: "Гибкая отмена", zh: "灵活取消", ja: "柔軟なキャンセル",
  },

  // ─── Stats / Numbers ────────────────────────────────────
  "By the numbers": {
    tr: "Rakamlarla", de: "In Zahlen", fr: "En chiffres", es: "En cifras", it: "In numeri",
    ar: "بالأرقام", ru: "В цифрах", zh: "数据一览", ja: "数字で見る",
  },
  "A focused team. Real outcomes.": {
    tr: "Odaklanmış bir ekip. Gerçek sonuçlar.", de: "Ein fokussiertes Team. Echte Ergebnisse.",
    fr: "Une équipe focalisée. De vrais résultats.", es: "Un equipo enfocado. Resultados reales.",
    it: "Un team focalizzato. Risultati reali.", ar: "فريق مركّز. نتائج حقيقية.",
    ru: "Сфокусированная команда. Реальные результаты.", zh: "专注团队，真实成果。",
    ja: "集中したチーム。確かな成果。",
  },
  "Verified hotels": {
    tr: "Doğrulanmış oteller", de: "Geprüfte Hotels", fr: "Hôtels vérifiés",
    es: "Hoteles verificados", it: "Hotel verificati", ar: "فنادق موثقة",
    ru: "Проверенные отели", zh: "已验证酒店", ja: "認証済みホテル",
  },
  "Turkish cities": {
    tr: "Türk şehirleri", de: "Türkische Städte", fr: "Villes turques",
    es: "Ciudades turcas", it: "Città turche", ar: "مدن تركية",
    ru: "Турецкие города", zh: "土耳其城市", ja: "トルコの都市",
  },
  "Happy guests": {
    tr: "Mutlu misafirler", de: "Zufriedene Gäste", fr: "Voyageurs satisfaits",
    es: "Huéspedes felices", it: "Ospiti soddisfatti", ar: "نزلاء سعداء",
    ru: "Довольные гости", zh: "满意的客人", ja: "満足したゲスト",
  },
  "Average rating": {
    tr: "Ortalama puan", de: "Durchschnittsbewertung", fr: "Note moyenne",
    es: "Calificación media", it: "Valutazione media", ar: "متوسط التقييم",
    ru: "Средний рейтинг", zh: "平均评分", ja: "平均評価",
  },

  // ─── Curated stays ──────────────────────────────────────
  "Curated stays": {
    tr: "Seçili konaklamalar", de: "Kuratierte Aufenthalte", fr: "Séjours sélectionnés",
    es: "Estancias seleccionadas", it: "Soggiorni selezionati", ar: "إقامات مختارة",
    ru: "Подборка отелей", zh: "精选住宿", ja: "厳選の宿",
  },
  "Stays worth booking this week.": {
    tr: "Bu hafta rezerve edilmeye değer konaklamalar.", de: "Aufenthalte, die diese Woche eine Buchung wert sind.",
    fr: "Des séjours à réserver cette semaine.", es: "Estancias que vale la pena reservar esta semana.",
    it: "Soggiorni che vale la pena prenotare questa settimana.", ar: "إقامات تستحق الحجز هذا الأسبوع.",
    ru: "Отели, которые стоит забронировать на этой неделе.", zh: "本周值得预订的住宿。",
    ja: "今週予約する価値のある宿泊。",
  },
  "View all stays": {
    tr: "Tüm konaklamaları gör", de: "Alle Unterkünfte ansehen", fr: "Voir tous les séjours",
    es: "Ver todas las estancias", it: "Vedi tutti i soggiorni", ar: "عرض جميع الإقامات",
    ru: "Все варианты", zh: "查看全部住宿", ja: "すべての宿を見る",
  },
  night: {
    tr: "gece", de: "Nacht", fr: "nuit", es: "noche", it: "notte",
    ar: "ليلة", ru: "ночь", zh: "晚", ja: "泊",
  },
  Save: {
    tr: "Tasarruf", de: "Sparen", fr: "Économisez", es: "Ahorra", it: "Risparmia",
    ar: "وفّر", ru: "Экономия", zh: "省", ja: "お得",
  },

  // ─── Quality ────────────────────────────────────────────
  "Quality you can verify": {
    tr: "Doğrulayabileceğiniz kalite", de: "Qualität, die Sie prüfen können",
    fr: "Une qualité vérifiable", es: "Calidad que puedes verificar",
    it: "Qualità che puoi verificare", ar: "جودة يمكنك التحقق منها",
    ru: "Качество, которое можно проверить", zh: "可验证的品质",
    ja: "確認できる品質",
  },
  "Every hotel, personally vetted.": {
    tr: "Her otel, bizzat denetlendi.", de: "Jedes Hotel, persönlich geprüft.",
    fr: "Chaque hôtel, personnellement vérifié.", es: "Cada hotel, verificado personalmente.",
    it: "Ogni hotel, verificato di persona.", ar: "كل فندق تم تفقده شخصياً.",
    ru: "Каждый отель проверен лично.", zh: "每家酒店均亲自审核。",
    ja: "すべてのホテルを直接確認。",
  },
  "Our promise": {
    tr: "Sözümüz", de: "Unser Versprechen", fr: "Notre promesse",
    es: "Nuestra promesa", it: "La nostra promessa", ar: "وعدنا",
    ru: "Наше обещание", zh: "我们的承诺", ja: "私たちの約束",
  },
  "How we vet every property": {
    tr: "Her tesisi nasıl denetliyoruz", de: "So prüfen wir jede Unterkunft",
    fr: "Comment nous vérifions chaque hébergement", es: "Cómo verificamos cada propiedad",
    it: "Come verifichiamo ogni struttura", ar: "كيف نتفقد كل عقار",
    ru: "Как мы проверяем каждый отель", zh: "我们如何审核每家酒店",
    ja: "各物件の審査方法",
  },

  // ─── Destinations ───────────────────────────────────────
  "Explore neighbourhoods": {
    tr: "Semtleri keşfet", de: "Viertel entdecken", fr: "Explorer les quartiers",
    es: "Explora barrios", it: "Esplora i quartieri", ar: "استكشف الأحياء",
    ru: "Изучить районы", zh: "探索街区", ja: "街区を探索",
  },
  "Where to stay in Turkey.": {
    tr: "Türkiye'de nerede kalınır.", de: "Wo in der Türkei übernachten.",
    fr: "Où séjourner en Turquie.", es: "Dónde alojarse en Turquía.",
    it: "Dove alloggiare in Turchia.", ar: "أين تقيم في تركيا.",
    ru: "Где остановиться в Турции.", zh: "在土耳其住哪里。",
    ja: "トルコで泊まる街。",
  },
  "View all neighbourhoods": {
    tr: "Tüm semtleri gör", de: "Alle Viertel ansehen", fr: "Voir tous les quartiers",
    es: "Ver todos los barrios", it: "Vedi tutti i quartieri", ar: "عرض جميع الأحياء",
    ru: "Все районы", zh: "查看全部街区", ja: "すべての街区を見る",
  },
  Hotels: {
    tr: "Oteller", de: "Hotels", fr: "Hôtels", es: "Hoteles", it: "Hotel",
    ar: "فنادق", ru: "Отели", zh: "酒店", ja: "ホテル",
  },
  "Avg/night": {
    tr: "Ort/gece", de: "Ø/Nacht", fr: "Moy./nuit", es: "Med./noche", it: "Media/notte",
    ar: "متوسط/ليلة", ru: "Сред/ночь", zh: "均价/晚", ja: "平均/泊",
  },
  Rating: {
    tr: "Puan", de: "Bewertung", fr: "Note", es: "Calificación", it: "Valutazione",
    ar: "التقييم", ru: "Рейтинг", zh: "评分", ja: "評価",
  },

  // ─── SEO / Why book with us ─────────────────────────────
  "Why book with us": {
    tr: "Neden bizimle rezervasyon yapmalısınız", de: "Warum bei uns buchen",
    fr: "Pourquoi réserver chez nous", es: "Por qué reservar con nosotros",
    it: "Perché prenotare con noi", ar: "لماذا تحجز معنا",
    ru: "Почему стоит бронировать у нас", zh: "为什么向我们预订", ja: "私たちで予約する理由",
  },
  "Affordable stays. Prime locations.": {
    tr: "Uygun fiyatlı konaklamalar. Merkezi konumlar.",
    de: "Erschwingliche Unterkünfte. Beste Lagen.",
    fr: "Séjours abordables. Emplacements de premier choix.",
    es: "Estancias asequibles. Ubicaciones privilegiadas.",
    it: "Soggiorni accessibili. Posizioni privilegiate.",
    ar: "إقامات بأسعار معقولة. مواقع متميزة.",
    ru: "Доступные отели. Лучшие локации.",
    zh: "实惠住宿，黄金位置。",
    ja: "手頃な宿泊。一等地。",
  },
  "Local Expertise": {
    tr: "Yerel Uzmanlık", de: "Lokale Expertise", fr: "Expertise locale",
    es: "Conocimiento local", it: "Esperienza locale", ar: "خبرة محلية",
    ru: "Местная экспертиза", zh: "本地专长", ja: "ローカルの専門知識",
  },
  "Direct Rates": {
    tr: "Doğrudan Fiyatlar", de: "Direktpreise", fr: "Tarifs directs",
    es: "Tarifas directas", it: "Tariffe dirette", ar: "أسعار مباشرة",
    ru: "Прямые тарифы", zh: "直订价格", ja: "直販料金",
  },
  "Total Transparency": {
    tr: "Tam Şeffaflık", de: "Volle Transparenz", fr: "Transparence totale",
    es: "Total transparencia", it: "Trasparenza totale", ar: "شفافية كاملة",
    ru: "Полная прозрачность", zh: "完全透明", ja: "完全な透明性",
  },
  "Local Support": {
    tr: "Yerel Destek", de: "Lokaler Support", fr: "Support local",
    es: "Soporte local", it: "Supporto locale", ar: "دعم محلي",
    ru: "Местная поддержка", zh: "本地支持", ja: "ローカルサポート",
  },
  "Your booking benefits": {
    tr: "Rezervasyon avantajlarınız", de: "Ihre Buchungsvorteile",
    fr: "Vos avantages réservation", es: "Tus beneficios de reserva",
    it: "I tuoi vantaggi di prenotazione", ar: "مزايا حجزك",
    ru: "Преимущества вашего бронирования", zh: "预订福利", ja: "予約特典",
  },

  // ─── FAQ ────────────────────────────────────────────────
  "Got questions?": {
    tr: "Sorunuz mu var?", de: "Haben Sie Fragen?", fr: "Des questions ?",
    es: "¿Tienes preguntas?", it: "Hai domande?", ar: "لديك أسئلة؟",
    ru: "Есть вопросы?", zh: "有疑问？", ja: "ご質問は？",
  },
  "Frequently asked questions.": {
    tr: "Sıkça sorulan sorular.", de: "Häufig gestellte Fragen.",
    fr: "Questions fréquentes.", es: "Preguntas frecuentes.",
    it: "Domande frequenti.", ar: "الأسئلة الشائعة.",
    ru: "Часто задаваемые вопросы.", zh: "常见问题。", ja: "よくあるご質問。",
  },
  "Talk to us": {
    tr: "Bize ulaşın", de: "Sprechen Sie mit uns", fr: "Parlez-nous",
    es: "Habla con nosotros", it: "Parla con noi", ar: "تحدث معنا",
    ru: "Связаться", zh: "联系我们", ja: "お問い合わせ",
  },

  // ─── CTA ────────────────────────────────────────────────
  "Plan your stay": {
    tr: "Konaklamanızı planlayın", de: "Planen Sie Ihren Aufenthalt",
    fr: "Planifiez votre séjour", es: "Planifica tu estancia",
    it: "Pianifica il tuo soggiorno", ar: "خطط لإقامتك",
    ru: "Спланируйте поездку", zh: "规划您的住宿", ja: "宿泊を計画",
  },
  "Ready to book your Turkey stay?": {
    tr: "Türkiye konaklamanızı rezerve etmeye hazır mısınız?",
    de: "Bereit, Ihren Türkei-Aufenthalt zu buchen?",
    fr: "Prêt à réserver votre séjour en Turquie ?",
    es: "¿Listo para reservar tu estancia en Turquía?",
    it: "Pronto a prenotare il tuo soggiorno in Turchia?",
    ar: "هل أنت مستعد لحجز إقامتك في تركيا؟",
    ru: "Готовы забронировать поездку в Турцию?",
    zh: "准备好预订您的土耳其行程了吗？",
    ja: "トルコ滞在の予約準備はできましたか？",
  },
  "Find hotels in Turkey": {
    tr: "Türkiye'de otel bul", de: "Hotels in der Türkei finden",
    fr: "Trouver des hôtels en Turquie", es: "Encuentra hoteles en Turquía",
    it: "Trova hotel in Turchia", ar: "ابحث عن فنادق في تركيا",
    ru: "Найти отели в Турции", zh: "查找土耳其酒店", ja: "トルコのホテルを探す",
  },
  "Free cancellation": {
    tr: "Ücretsiz iptal", de: "Kostenlose Stornierung", fr: "Annulation gratuite",
    es: "Cancelación gratuita", it: "Cancellazione gratuita", ar: "إلغاء مجاني",
    ru: "Бесплатная отмена", zh: "免费取消", ja: "無料キャンセル",
  },
  "No hidden fees": {
    tr: "Gizli ücret yok", de: "Keine versteckten Gebühren",
    fr: "Aucun frais caché", es: "Sin cargos ocultos",
    it: "Nessun costo nascosto", ar: "لا رسوم خفية",
    ru: "Без скрытых платежей", zh: "无隐藏费用", ja: "隠れた料金なし",
  },
  "Local support 24/7": {
    tr: "7/24 yerel destek", de: "Lokaler Support rund um die Uhr",
    fr: "Support local 24h/24", es: "Soporte local 24/7",
    it: "Supporto locale 24/7", ar: "دعم محلي على مدار الساعة",
    ru: "Поддержка 24/7", zh: "本地支持 24/7", ja: "24時間ローカルサポート",
  },
  "Still have questions?": {
    tr: "Hâlâ sorunuz mu var?", de: "Noch Fragen?", fr: "D'autres questions ?",
    es: "¿Aún tienes preguntas?", it: "Hai ancora domande?", ar: "لا تزال لديك أسئلة؟",
    ru: "Остались вопросы?", zh: "还有疑问？", ja: "まだご質問がありますか？",
  },

  // ─── Account / login dropdown ───────────────────────────
  "Guest Portal": {
    tr: "Misafir Paneli", de: "Gästeportal", fr: "Espace voyageur",
    es: "Portal del huésped", it: "Portale ospiti", ar: "بوابة النزلاء",
    ru: "Кабинет гостя", zh: "客户中心", ja: "ゲストポータル",
  },
  "Manage bookings": {
    tr: "Rezervasyonları yönetin", de: "Buchungen verwalten",
    fr: "Gérer mes réservations", es: "Gestionar reservas",
    it: "Gestisci prenotazioni", ar: "إدارة الحجوزات",
    ru: "Управление бронями", zh: "管理预订", ja: "予約を管理",
  },
  "Admin Login": {
    tr: "Yönetici Girişi", de: "Admin-Anmeldung", fr: "Connexion admin",
    es: "Acceso admin", it: "Accesso admin", ar: "دخول الإدارة",
    ru: "Вход администратора", zh: "管理员登录", ja: "管理者ログイン",
  },
  "Staff access": {
    tr: "Personel erişimi", de: "Mitarbeiterzugang", fr: "Accès personnel",
    es: "Acceso del personal", it: "Accesso del personale", ar: "وصول الموظفين",
    ru: "Доступ персонала", zh: "员工访问", ja: "スタッフアクセス",
  },

  // ─── Quality details ────────────────────────────────────
  "On-site inspection": {
    tr: "Yerinde denetim", de: "Vor-Ort-Inspektion", fr: "Inspection sur site",
    es: "Inspección in situ", it: "Ispezione in loco", ar: "تفقد ميداني",
    ru: "Проверка на месте", zh: "实地检查", ja: "現地検査",
  },
  "Inspection at a glance": {
    tr: "Bir bakışta denetim", de: "Inspektion auf einen Blick",
    fr: "L'inspection en bref", es: "Inspección de un vistazo",
    it: "Ispezione in sintesi", ar: "نظرة سريعة على التفقد",
    ru: "Проверка кратко", zh: "审查一览", ja: "検査の概要",
  },
  "Hotels visited in person": {
    tr: "Bizzat ziyaret edilen oteller", de: "Persönlich besuchte Hotels",
    fr: "Hôtels visités en personne", es: "Hoteles visitados en persona",
    it: "Hotel visitati di persona", ar: "فنادق تمت زيارتها شخصياً",
    ru: "Отели, посещённые лично", zh: "亲自走访的酒店", ja: "実際に訪問したホテル",
  },
  "Avg. support response": {
    tr: "Ort. destek yanıtı", de: "Ø Antwortzeit Support",
    fr: "Temps de réponse moyen", es: "Tiempo medio de respuesta",
    it: "Tempo medio di risposta", ar: "متوسط زمن الدعم",
    ru: "Сред. время ответа", zh: "平均响应时间", ja: "平均サポート応答時間",
  },
  "Local team per region": {
    tr: "Bölge başına yerel ekip", de: "Lokales Team pro Region",
    fr: "Équipe locale par région", es: "Equipo local por región",
    it: "Team locale per regione", ar: "فريق محلي لكل منطقة",
    ru: "Местная команда в каждом регионе", zh: "每个地区的本地团队",
    ja: "地域ごとの現地チーム",
  },

  // ─── Pillars ────────────────────────────────────────────
  "In-Person Verification": {
    tr: "Yerinde Doğrulama", de: "Persönliche Überprüfung",
    fr: "Vérification en personne", es: "Verificación en persona",
    it: "Verifica di persona", ar: "تحقق شخصي",
    ru: "Личная проверка", zh: "亲自核实", ja: "対面確認",
  },
  "Location Reality Check": {
    tr: "Konum Doğrulama", de: "Realitätscheck zum Standort",
    fr: "Vérification de l'emplacement", es: "Verificación de la ubicación",
    it: "Verifica della posizione", ar: "التحقق من الموقع",
    ru: "Проверка локации", zh: "位置实地核查", ja: "立地の実地確認",
  },
  "Cleanliness Audits": {
    tr: "Temizlik Denetimleri", de: "Sauberkeitsprüfungen",
    fr: "Audits de propreté", es: "Auditorías de limpieza",
    it: "Verifiche di pulizia", ar: "تدقيق النظافة",
    ru: "Проверки чистоты", zh: "清洁审核", ja: "清潔度監査",
  },
  "Safety Standards": {
    tr: "Güvenlik Standartları", de: "Sicherheitsstandards",
    fr: "Normes de sécurité", es: "Normas de seguridad",
    it: "Standard di sicurezza", ar: "معايير السلامة",
    ru: "Стандарты безопасности", zh: "安全标准", ja: "安全基準",
  },
  "Price Transparency": {
    tr: "Fiyat Şeffaflığı", de: "Preistransparenz",
    fr: "Transparence des prix", es: "Transparencia de precios",
    it: "Trasparenza dei prezzi", ar: "شفافية الأسعار",
    ru: "Прозрачные цены", zh: "价格透明", ja: "価格の透明性",
  },
  "Guest Review Watch": {
    tr: "Misafir Yorum Takibi", de: "Gästebewertungs-Monitoring",
    fr: "Surveillance des avis", es: "Seguimiento de reseñas",
    it: "Monitoraggio recensioni", ar: "متابعة تقييمات النزلاء",
    ru: "Мониторинг отзывов", zh: "客户评价监测", ja: "ゲストレビュー監視",
  },
};

export function lookupTranslation(text: string, language: LanguageCode): string | null {
  if (language === "en") return text;
  const entry = COMMON[text];
  if (!entry) return null;
  const translated = entry[language];
  return translated || null;
}
