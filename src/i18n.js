// i18n.js — translation strings for Accuracy Plus Home Collection portal

const strings = {
  en: {
    // Navigation
    tabRequest:     "Request",
    tabTrack:       "Track",

    // Booking form
    requestTitle:   "Request an Appointment",
    requestSub:     "Fill in your details and we will confirm shortly",
    patientName:    "Full Name",
    patientNamePh:  "Patient full name",
    mobile:         "Mobile Number",
    dob:            "Date of Birth",
    preferredDate:  "Preferred Date",
    timeSlot:       "Preferred Time",
    morning:        "Morning",
    afternoon:      "Afternoon",
    evening:        "Evening",
    tests:          "Tests Required",
    testsPh:        "e.g. CBC, HbA1c, Lipid Profile…",
    location:       "Your Location",
    shareLocation:  "Share My Location",
    notes:          "Additional Notes",
    notesPh:        "Fasting info, building name, floor…",
    disclaimer:     "Your information is kept private and used only to process your appointment.",
    submitRequest:  "Submit Request",
    submitting:     "Submitting…",
    required:       "Required",
    selectSlot:     "Please select a time slot",
    pastDateError:  "Please select today or a future date",

    // Confirmation
    confirmTitle:   "Request Submitted!",
    confirmSub:     "We have received your request and will confirm your appointment shortly.",
    bookingRef:     "Your Reference",
    trackNow:       "Track My Appointment",
    newRequest:     "Make Another Request",

    // Tracking
    trackTitle:     "Track Your Appointment",
    trackSubtitle:  "Enter your details to check your appointment status",
    firstName:      "First Name",
    firstNamePh:    "Your first name",
    track:          "Track Appointment",
    searching:      "Searching…",
    notFound:       "No booking found. Please check your mobile number and first name.",
    networkError:   "Network error. Please try again.",
    trackRequired:  "Please enter your mobile number and first name",
    reference:      "Booking Reference",
    trackAnother:   "Track Another",
    back:           "Back",
    multipleFound:  "Multiple bookings found",
    selectDate:     "Select a date to view status:",

    // Status labels
    "Requested":    "Request Received",
    "Confirmed":    "Appointment Confirmed",
    "Assigned":     "Phlebotomist Assigned",
    "On the Way":   "On the Way",
    "Collected":    "Sample Collected",
    "Processing":   "Processing in Lab",
    "Report Ready": "Report Ready",
    "Cancelled":    "Cancelled",
  },

  ar: {
    // Navigation
    tabRequest:     "طلب",
    tabTrack:       "تتبع",

    // Booking form
    requestTitle:   "طلب موعد",
    requestSub:     "أدخل بياناتك وسنقوم بتأكيد موعدك قريباً",
    patientName:    "الاسم الكامل",
    patientNamePh:  "اسم المريض كاملاً",
    mobile:         "رقم الهاتف",
    dob:            "تاريخ الميلاد",
    preferredDate:  "التاريخ المفضل",
    timeSlot:       "الوقت المفضل",
    morning:        "صباحاً",
    afternoon:      "ظهراً",
    evening:        "مساءً",
    tests:          "التحاليل المطلوبة",
    testsPh:        "مثل: CBC، HbA1c، دهون الدم…",
    location:       "موقعك",
    shareLocation:  "مشاركة موقعي",
    notes:          "ملاحظات إضافية",
    notesPh:        "معلومات الصيام، اسم المبنى، الطابق…",
    disclaimer:     "معلوماتك محفوظة وتُستخدم فقط لمعالجة موعدك.",
    submitRequest:  "إرسال الطلب",
    submitting:     "جارٍ الإرسال…",
    required:       "مطلوب",
    selectSlot:     "الرجاء اختيار وقت",
    pastDateError:  "يرجى اختيار اليوم أو تاريخ مستقبلي",

    // Confirmation
    confirmTitle:   "تم إرسال طلبك!",
    confirmSub:     "تلقّينا طلبك وسنقوم بتأكيد موعدك قريباً.",
    bookingRef:     "رقم الحجز",
    trackNow:       "تتبع موعدي",
    newRequest:     "طلب جديد",

    // Tracking
    trackTitle:     "تتبع موعدك",
    trackSubtitle:  "أدخل بياناتك للاطلاع على حالة موعدك",
    firstName:      "الاسم الأول",
    firstNamePh:    "اسمك الأول",
    track:          "تتبع الموعد",
    searching:      "جارٍ البحث…",
    notFound:       "لم يُعثر على حجز. تحقق من رقم هاتفك واسمك الأول.",
    networkError:   "خطأ في الشبكة. حاول مرة أخرى.",
    trackRequired:  "الرجاء إدخال رقم هاتفك واسمك الأول",
    reference:      "رقم الحجز",
    trackAnother:   "تتبع حجز آخر",
    back:           "رجوع",
    multipleFound:  "تم العثور على حجوزات متعددة",
    selectDate:     "اختر التاريخ:",

    // Status labels
    "Requested":    "تم استلام الطلب",
    "Confirmed":    "تم تأكيد الموعد",
    "Assigned":     "تم تعيين الفلبوتوميست",
    "On the Way":   "في الطريق إليك",
    "Collected":    "تم أخذ العينة",
    "Processing":   "قيد المعالجة",
    "Report Ready": "النتيجة جاهزة",
    "Cancelled":    "تم الإلغاء",
  },
};

export function t(key, lang = "en") {
  return strings[lang]?.[key] ?? strings.en?.[key] ?? key;
}

export default strings;
