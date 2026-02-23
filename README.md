# Omonat - Frontend Mijoz (Client)

Bu loyihaning ko'rinish (frontend) qismi, qarzlar (debts), kutilayotgan tushumlar (receivables) va doimiy xarajatlarni (expenses) qulay shaklda kuzatib borish uchun mo'ljallangan foydalanuvchi interfeysi (UI) hisoblanadi.

## Texnologiyalar (Tech Stack)

- **Next.js 15 (App Router)** & **React 19**
- **Tailwind CSS v3** (Tezkor va chiroyli uslublash uchun)
- **Shadcn UI & Radix UI** (Tayyor va qulay UI komponentlari: Modallar, Drawerlar, Inputlar va qolgan hamma narsa)
- **SWR** (Optimistik server-xotirasini yangilash va boshqarish)
- **Recharts** (Grafikalar: kirim va chiqim diagrammalari)
- **Lucide-React** (Piktogrammalar)
- **Axios** (API ga murojaat qilish vositasi)

## Papkalar tuzilishi (Folder Structure)

```text
src/
 ├── app/       # Next.js App Router (Barcha sahifalar)
 │   ├── (auth)/        # Avtorizatsiya guruhlari (Login, Register)
 │   ├── debts/         # Olingan va Berilgan qarzlar
 │   ├── receivables/   # Haqdorlik
 │   ├── expenses/      # Xarajatlar
 │   └── profile/       # Profil sozlamalari (Yangi qo'shilgan)
 ├── components/    # Reusablar (Qayta-qayta ishlatiladigan)
 │   └── ui/        # Asosan Shadcn komponentlari (+Navbar)
 ├── hooks/     # Ixtiyoriy React hooklari (`useUser` va hkz)
 ├── lib/       # Qulaylik uchun API kutubxonalari, xususan markazlashgan API util
```

## O'rnatish va Ishga tushirish (Local Setup)

### 1-qadam: Kutubxonalarni o'rnatish

Hali backend va root orqali qilinmagan bo'lsa, avvalo client ichiga kirib oling (`cd client`):

```bash
npm install
# yoki qaramliklarni (dependencies) yengillatib o'rnatish uchun
npm install --legacy-peer-deps
```

### 2-qadam: Testlashtirish serverini yurgizish (Development)

```bash
npm run dev
```

Keyin, brauzeringizda quyidagi manzilni oching: [http://localhost:3000](http://localhost:3000)

_(Agar 3000 band bo'lsa, Next.js avtomatik 3001 kabi keyingi portni taklif qiladi)._

---

### Ish printsipi bo'yicha muhim eslatmalar:

Ushbu interfeys siz "Tizimga kirganingizdan" so'nggina ochiladi. `/authentication/login` yoki `/authentication/register` dan o'tkazilgan `JWT` ni xavfsiz holatda Server Cookie lariga saqlaydi va **SWR** vositasi har safar yangi pageni ochganingizda Serverdan `/api/auth/me` orqali Profilingizni (Auth-state) tortib beradi.
