export type Lang = "ka" | "ru";

export type Dict = {
  bookAppointment: string;
  reserveSteps: string;
  stepService: string;
  stepStylist: string;
  stepSchedule: string;
  chooseService: string;
  chooseServiceSub: string;
  chooseStylist: string;
  chooseStylistSub: string;
  anyAvailable: string;
  anyAvailableRole: string;
  availableFor: string;
  pickDateTime: string;
  pickDateTimeSub: string;
  availableTimes: string;
  selectDateFirst: string;
  bookingSummary: string;
  labelService: string;
  labelStylist: string;
  labelDate: string;
  labelTime: string;
  labelDuration: string;
  labelTotal: string;
  back: string;
  continue: string;
  confirmBooking: string;
  min: string;
};

const KA: Dict = {
  bookAppointment:  "ვიზიტის დაჯავშნა",
  reserveSteps:     "დაჯავშნეთ რამდენიმე ნაბიჯში.",
  stepService:      "სერვისი",
  stepStylist:      "სტილისტი",
  stepSchedule:     "დრო",
  chooseService:    "სერვისის არჩევა",
  chooseServiceSub: "აირჩიეთ სასურველი პროცედურა.",
  chooseStylist:    "სტილისტის არჩევა",
  chooseStylistSub: "აირჩიეთ სასურველი სპეციალისტი.",
  anyAvailable:     "ნებისმიერი ხელმისაწვდომი",
  anyAvailableRole: "პირველი თავისუფალი სპეციალისტი",
  availableFor:     "ხელმისაწვდომი სპეციალისტები:",
  pickDateTime:     "თარიღი და დრო",
  pickDateTimeSub:  "დრო ნაჩვენებია ადგილობრივი სარტყელით.",
  availableTimes:   "ხელმისაწვდომი დრო",
  selectDateFirst:  "დროის სანახავად, გთხოვთ, აირჩიეთ თარიღი",
  bookingSummary:   "ჯავშნის შეჯამება",
  labelService:     "სერვისი",
  labelStylist:     "სტილისტი",
  labelDate:        "თარიღი",
  labelTime:        "დრო",
  labelDuration:    "ხანგრძლივობა",
  labelTotal:       "სულ",
  back:             "უკან",
  continue:         "გაგრძელება",
  confirmBooking:   "ჯავშნის დადასტურება",
  min:              "წთ",
};

const RU: Dict = {
  bookAppointment:  "Записаться на приём",
  reserveSteps:     "Запишитесь за несколько шагов.",
  stepService:      "Услуга",
  stepStylist:      "Мастер",
  stepSchedule:     "Время",
  chooseService:    "Выберите услугу",
  chooseServiceSub: "Выберите нужную процедуру.",
  chooseStylist:    "Выберите мастера",
  chooseStylistSub: "Выберите специалиста.",
  anyAvailable:     "Любой доступный",
  anyAvailableRole: "Первый свободный специалист",
  availableFor:     "Доступные специалисты:",
  pickDateTime:     "Дата и время",
  pickDateTimeSub:  "Время указано в вашем часовом поясе.",
  availableTimes:   "Доступное время",
  selectDateFirst:  "Выберите дату для просмотра времени",
  bookingSummary:   "Сводка записи",
  labelService:     "Услуга",
  labelStylist:     "Мастер",
  labelDate:        "Дата",
  labelTime:        "Время",
  labelDuration:    "Длительность",
  labelTotal:       "Итого",
  back:             "Назад",
  continue:         "Продолжить",
  confirmBooking:   "Подтвердить запись",
  min:              "мин",
};

export const TRANSLATIONS: Record<Lang, Dict> = { ka: KA, ru: RU };
export const LANG_LOCALE: Record<Lang, string> = { ka: "ka-GE", ru: "ru-RU" };
