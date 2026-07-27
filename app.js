const $ = (selector) => document.querySelector(selector);
const modal = $('#modal');
const showModal = (title, message) => { $('#modalContent').innerHTML = `<h2>${title}</h2><p>${message}</p>`; modal.showModal(); };
$('.close').onclick = () => modal.close();

const readers = [
  ['مشاري راشد العفاسي', 'ar.alafasy'], ['ياسر الدوسري', 'ar.abdulbasitmurattal'],
  ['سعد الغامدي', 'ar.husary'], ['عبدالرحمن السديس', 'ar.minshawi']
];
$('#readersList').innerHTML = readers.map(([name, edition], index) => `<div class="reader"><img src="https://i.pravatar.cc/80?img=${index + 12}" alt="${name}"><div><strong>${name}</strong><small>القرآن الكريم</small></div><button class="play" data-edition="${edition}" aria-label="استمع إلى ${name}">▶</button></div>`).join('');

let verse = { number: 53, audio: '' };
async function loadVerse() {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/ayah/53:49/editions/ar.alafasy,ar.abdulbasitmurattal');
    if (!response.ok) throw new Error('Quran API unavailable');
    const { data } = await response.json();
    const textEdition = data[0];
    verse = { number: textEdition.number, audio: data[1]?.audio || textEdition.audio };
    $('#quranText').textContent = textEdition.text;
    $('#quranRef').textContent = `سورة ${textEdition.surah.name} — آية ${textEdition.numberInSurah}`;
  } catch (error) { console.warn(error); }
}
async function loadPrayerTimes() {
  const list = $('#prayerList');
  try {
    const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi%20Arabia&method=4');
    if (!response.ok) throw new Error('Prayer API unavailable');
    const { data } = await response.json();
    const labels = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    list.innerHTML = Object.entries(labels).map(([key, label]) => `<li><span>${label}</span><time>${data.timings[key]}</time></li>`).join('');
    $('#hijriDate').textContent = `${data.date.hijri.weekday.ar}، ${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year} هـ`;
  } catch (error) { $('#hijriDate').textContent = 'تعذر تحديث المواقيت حالياً'; console.warn(error); }
}
function playAudio(edition = 'ar.alafasy') {
  const audio = $('#recitation');
  const source = edition === 'ar.alafasy' ? verse.audio : `https://cdn.islamic.network/quran/audio/128/${edition}/${verse.number}.mp3`;
  if (!source) return showModal('التلاوة', 'تجري تهيئة التلاوة، حاول مرة أخرى بعد لحظات.');
  audio.src = source; audio.play().catch(() => showModal('التلاوة', 'يتطلب المتصفح تفاعلاً إضافياً لتشغيل الصوت.'));
}
$('#listenButton').onclick = () => playAudio();
document.addEventListener('click', (event) => { if (event.target.matches('.play')) playAudio(event.target.dataset.edition); });
$('#refreshPrayer').onclick = loadPrayerTimes;
$('#dhikrButton').onclick = () => showModal('أذكار اليوم', 'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر. اجعل لسانك رطباً بذكر الله.');
$('#zakatButton').onclick = () => showModal('حاسبة الزكاة', 'تجب الزكاة عند بلوغ النصاب وحولان الحول، ومقدارها ٢.٥٪ من المال الزكوي. استشر جهة إفتاء موثوقة للحالات الخاصة.');
$('#qiblaButton').onclick = () => { window.open('https://qiblafinder.withgoogle.com/intl/ar/desktop', '_blank', 'noopener'); };
$('#subscribeForm').onsubmit = (event) => { event.preventDefault(); event.target.reset(); showModal('تم الاشتراك', 'شكراً لك، سيصلك التذكير والمحتوى المفيد إلى بريدك قريباً.'); };
loadVerse(); loadPrayerTimes();
