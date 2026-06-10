// i18n.js — English + Arabic translations for the HC Patient Portal

export const T = {
  en: {
    dir: "ltr",
    bookTab:  "Book",
    trackTab: "Track",

    // Hero
    heroTitle:    "Home Collection",
    heroSub:      "We come to you — anywhere in Abu Dhabi",

    // Booking form
    formTitle:    "Book an Appointment",
    name:         "Full Name",
    namePh:       "e.g. Ahmed Al Mansouri",
    mobile:       "Mobile Number",
    mobilePh:     "05X XXX XXXX",
    date:         "Preferred Date",
    timeSlot:     "Preferred Time",
    morning:      "Morning",
    afternoon:    "Afternoon",
    evening:      "Evening",
    area:         "Area",
    areaSelect:   "Select your area…",
    location:     "Share Location (Optional)",
    locationBtn:  "📍 Share My Location",
    locationOk:   "✓ Location captured",
    locationFail: "Couldn't get location — try again",
    tests:        "Tests Required",
    testsPh:      "e.g. CBC, LFT, HbA1c…",
    notes:        "Additional Notes (Optional)",
    notesPh:      "Fasting status, building details, etc.",
    submit:       "Request Appointment",
    submitting:   "Submitting…",
    disclaimer:   "We will call you to confirm your appointment. Confirmation usually within 2 hours.",
    required:     "This field is required",

    // Confirmation
    confirmTitle: "Request Received!",
    confirmSub:   "We'll contact you shortly to confirm your appointment.",
    refLabel:     "Your Reference",
    copyRef:      "Copy",
    copied:       "Copied!",
    waBtn:        "Notify Us on WhatsApp",
    waBtnSub:     "Tap to send us your request details — we'll call you back faster",
    trackBtn:     "Track My Appointment",
    newBooking:   "Make Another Booking",

    // Tracker
    trackTitle:   "Track Your Appointment",
    trackSub:     "Enter your details to see the latest status",
    trackMobile:  "Mobile Number",
    trackName:    "First Name",
    trackBtn2:    "Track",
    tracking:     "Checking status…",
    notFound:     "No booking found for these details. Please check your mobile number and first name.",
    lastUpdated:  "Last updated",
    bookingRef:   "Reference",
    bookingDate:  "Date",
    bookingArea:  "Area",
    contactUs:    "Need help? Call us:",
    callApml:     "📞 Call APML",

    // Status labels & messages
    statuses: {
      Requested:      { label: "Request Received",        msg: "We've received your request and will confirm your appointment shortly.",             emoji: "📋", anim: "anim-bob" },
      Confirmed:      { label: "Appointment Confirmed",   msg: "Great news! Your appointment has been confirmed.",                                  emoji: "✅", anim: "anim-sparkle" },
      Assigned:       { label: "Phlebotomist Assigned",   msg: " is assigned to collect your sample.",                                             emoji: "🧑‍⚕️", anim: "anim-wave" },
      "On the Way":   { label: "On the Way!",             msg: "Your phlebotomist is on the way. Please be ready for collection.",                  emoji: "🚗", anim: "anim-drive" },
      Collected:      { label: "Sample Collected",        msg: "Your sample has been collected successfully. We're heading to the lab!",            emoji: "🧪", anim: "anim-float" },
      Processing:     { label: "Sample Processing",       msg: "Your sample is being carefully analyzed in our accredited laboratory.",             emoji: "🔬", anim: "anim-spin" },
      "Report Ready": { label: "Report Ready!",           msg: "Your report is ready. Please contact us or visit our lab to receive your report.", emoji: "📄", anim: "anim-sparkle" },
      Cancelled:      { label: "Appointment Cancelled",   msg: "Your appointment has been cancelled. Please contact us if you need assistance.",    emoji: "❌", anim: "anim-pulse" },
    },

    // Countdown
    arrivingIn:  "Arriving in approximately",
    anytimeNow:  "Arriving any moment now…",
    phlebTitle:  "Your Phlebotomist",
    callPhleb:   "📞 Call",

    // Journey step labels
    journey: [
      "Requested",
      "Confirmed",
      "Assigned",
      "On the Way",
      "Collected",
      "Processing",
      "Report Ready",
    ],

    // Areas
    areas: ["Abu Dhabi City", "Shabiya", "Al Ain", "Dubai"],

    // Footer
    footer: "Accuracy Plus Medical Laboratory — Abu Dhabi, UAE",
  },

  ar: {
    dir: "rtl",
    bookTab:  "حجز",
    trackTab: "تتبع",

    heroTitle:    "جمع العينات المنزلي",
    heroSub:      "نأتي إليك — في أي مكان في أبوظبي",

    formTitle:    "احجز موعدك",
    name:         "الاسم الكامل",
    namePh:       "مثال: أحمد المنصوري",
    mobile:       "رقم الجوال",
    mobilePh:     "05X XXX XXXX",
    date:         "التاريخ المفضل",
    timeSlot:     "الوقت المفضل",
    morning:      "صباحاً",
    afternoon:    "ظهراً",
    evening:      "مساءً",
    area:         "المنطقة",
    areaSelect:   "اختر منطقتك…",
    location:     "مشاركة الموقع (اختياري)",
    locationBtn:  "📍 مشاركة موقعي",
    locationOk:   "✓ تم تحديد الموقع",
    locationFail: "تعذر تحديد الموقع — حاول مرة أخرى",
    tests:        "الفحوصات المطلوبة",
    testsPh:      "مثال: CBC, LFT, HbA1c",
    notes:        "ملاحظات إضافية (اختياري)",
    notesPh:      "حالة الصيام، تفاصيل المبنى، إلخ",
    submit:       "طلب موعد",
    submitting:   "جارٍ الإرسال…",
    disclaimer:   "سنتصل بك لتأكيد الموعد. التأكيد عادةً خلال ساعتين.",
    required:     "هذا الحقل مطلوب",

    confirmTitle: "تم استلام طلبك!",
    confirmSub:   "سنتواصل معك قريباً لتأكيد موعدك.",
    refLabel:     "رقمك المرجعي",
    copyRef:      "نسخ",
    copied:       "تم النسخ!",
    waBtn:        "إشعارنا عبر واتساب",
    waBtnSub:     "اضغط لإرسال تفاصيل طلبك — سنتصل بك بشكل أسرع",
    trackBtn:     "تتبع موعدي",
    newBooking:   "حجز موعد آخر",

    trackTitle:   "تتبع موعدك",
    trackSub:     "أدخل بياناتك لمعرفة آخر المستجدات",
    trackMobile:  "رقم الجوال",
    trackName:    "الاسم الأول",
    trackBtn2:    "تتبع",
    tracking:     "جارٍ البحث…",
    notFound:     "لم يتم العثور على حجز. يرجى التحقق من رقم جوالك واسمك.",
    lastUpdated:  "آخر تحديث",
    bookingRef:   "المرجع",
    bookingDate:  "التاريخ",
    bookingArea:  "المنطقة",
    contactUs:    "هل تحتاج مساعدة؟ اتصل بنا:",
    callApml:     "📞 اتصل بـ APML",

    statuses: {
      Requested:      { label: "تم استلام الطلب",     msg: "تلقينا طلبك وسنؤكد موعدك قريباً.",                                              emoji: "📋", anim: "anim-bob" },
      Confirmed:      { label: "تم تأكيد الموعد",     msg: "تهانينا! تم تأكيد موعدك.",                                                     emoji: "✅", anim: "anim-sparkle" },
      Assigned:       { label: "تم تعيين الفني",      msg: "مُعيَّن لجمع عينتك.",                                                          emoji: "🧑‍⚕️", anim: "anim-wave" },
      "On the Way":   { label: "في الطريق!",          msg: "الفني في طريقه إليك. يرجى الاستعداد للجمع.",                                   emoji: "🚗", anim: "anim-drive" },
      Collected:      { label: "تم جمع العينة",       msg: "تم جمع عينتك بنجاح. نتوجه إلى المختبر!",                                      emoji: "🧪", anim: "anim-float" },
      Processing:     { label: "معالجة العينة",       msg: "يتم تحليل عينتك بعناية في مختبرنا المعتمد.",                                   emoji: "🔬", anim: "anim-spin" },
      "Report Ready": { label: "التقرير جاهز!",       msg: "تقريرك جاهز. يرجى التواصل معنا أو زيارة المختبر للحصول على تقريرك.",          emoji: "📄", anim: "anim-sparkle" },
      Cancelled:      { label: "تم إلغاء الموعد",    msg: "تم إلغاء موعدك. يرجى التواصل معنا إذا كنت بحاجة إلى مساعدة.",                emoji: "❌", anim: "anim-pulse" },
    },

    arrivingIn:  "يصل خلال تقريباً",
    anytimeNow:  "سيصل بين لحظة وأخرى…",
    phlebTitle:  "الفني المخصص لك",
    callPhleb:   "📞 اتصل",

    journey: [
      "الطلب",
      "التأكيد",
      "تعيين الفني",
      "في الطريق",
      "الجمع",
      "المعالجة",
      "التقرير جاهز",
    ],

    areas: ["مدينة أبوظبي", "الشعبية", "العين", "دبي"],

    footer: "مختبر أكيوراسي بلاس الطبي — أبوظبي، الإمارات",
  },
};

export const AREA_MAP = {
  "Abu Dhabi City": "مدينة أبوظبي",
  "Shabiya":        "الشعبية",
  "Al Ain":         "العين",
  "Dubai":          "دبي",
};

export const STATUS_ORDER = [
  "Requested",
  "Confirmed",
  "Assigned",
  "On the Way",
  "Collected",
  "Processing",
  "Report Ready",
];

export const STATUS_BG = {
  Requested:      "#E0F2FE",
  Confirmed:      "#DCFCE7",
  Assigned:       "#E0F2FE",
  "On the Way":   "#F3E8FF",
  Collected:      "#FEF9C3",
  Processing:     "#DBEAFE",
  "Report Ready": "#FEF3C7",
  Cancelled:      "#F1F5F9",
};
