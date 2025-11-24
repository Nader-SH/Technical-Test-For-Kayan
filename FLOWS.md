# شرح كامل للـ Flows في نظام Healthcare

هذا المستند يشرح جميع الـ flows (التدفقات) الموجودة في النظام بشكل مفصل.

---

## 📋 جدول المحتويات

1. [Authentication Flow](#1-authentication-flow)
2. [Patient Flow](#2-patient-flow)
3. [Doctor Flow](#3-doctor-flow)
4. [Finance Flow](#4-finance-flow)
5. [Profile Flow](#5-profile-flow)

---

## 1. Authentication Flow

### 1.1 Sign Up (التسجيل)

**المسار:** `/signup`

**الخطوات:**
1. المستخدم يفتح صفحة Sign Up
2. يملأ النموذج:
   - Full Name (الاسم الكامل)
   - Email (البريد الإلكتروني)
   - Password (كلمة المرور - على الأقل 6 أحرف)
   - Role (الدور: patient, doctor, finance)
3. عند الضغط على "Sign up":
   - يتم التحقق من البيانات باستخدام Yup validation
   - يتم إرسال POST request إلى `/auth/signup`
   - عند النجاح، يتم تسجيل الدخول تلقائياً
   - يتم إعادة التوجيه إلى الصفحة الافتراضية حسب الدور

**API Endpoint:**
```
POST /auth/signup
Body: { full_name, email, password, role }
Response: { user, accessToken, refreshToken }
```

### 1.2 Login (تسجيل الدخول)

**المسار:** `/login`

**الخطوات:**
1. المستخدم يفتح صفحة Login
2. يملأ النموذج:
   - Email
   - Password
3. عند الضغط على "Sign in":
   - يتم التحقق من البيانات
   - يتم إرسال POST request إلى `/auth/login`
   - عند النجاح:
     - يتم حفظ `accessToken` في memory
     - يتم حفظ `refreshToken` في localStorage
     - يتم حفظ بيانات المستخدم
     - يتم إعادة التوجيه حسب الدور:
       - Patient → `/patient/doctors`
       - Doctor → `/doctor/appointments`
       - Finance → `/finance/search`

**API Endpoint:**
```
POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }
```

### 1.3 Token Refresh (تحديث الـ Token)

**كيف يعمل:**
- عند انتهاء صلاحية `accessToken` (401 error)
- يتم استدعاء `/auth/refresh` تلقائياً عبر axios interceptor
- يتم استخدام `refreshToken` من localStorage أو cookies
- يتم تحديث `accessToken` تلقائياً
- يتم إعادة الطلب الأصلي

**API Endpoint:**
```
POST /auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken }
```

### 1.4 Logout (تسجيل الخروج)

**الخطوات:**
1. المستخدم يضغط على "Logout" في Header
2. يتم استدعاء `/auth/logout`
3. يتم مسح جميع البيانات:
   - `accessToken` من memory
   - `refreshToken` من localStorage
   - بيانات المستخدم
4. يتم إعادة التوجيه إلى `/login`

**API Endpoint:**
```
POST /auth/logout
Body: { refreshToken }
```

---

## 2. Patient Flow

### 2.1 عرض قائمة الأطباء

**المسار:** `/patient/doctors`

**الخطوات:**
1. بعد تسجيل الدخول كـ Patient، يتم التوجيه تلقائياً إلى هذه الصفحة
2. يتم جلب قائمة الأطباء من `/doctors` endpoint
3. يتم عرض قائمة بجميع الأطباء المتاحين
4. يمكن للمريض:
   - رؤية اسم كل طبيب
   - الضغط على "Book Appointment" للانتقال إلى صفحة الحجز

**API Endpoint:**
```
GET /doctors
Headers: Authorization: Bearer <accessToken>
Response: [ { id, full_name, email } ]
```

### 2.2 حجز موعد جديد

**المسار:** `/patient/appointments/new`

**الخطوات:**
1. المريض يختار طبيب من القائمة أو يأتي مباشرة إلى هذه الصفحة
2. يملأ النموذج:
   - Doctor (اختيار من القائمة المنسدلة)
   - Date & Time (تاريخ ووقت في المستقبل)
3. عند الضغط على "Book Appointment":
   - يتم التحقق من البيانات (التاريخ يجب أن يكون في المستقبل)
   - يتم إرسال POST request إلى `/patients/:patientId/appointments`
   - Body: `{ doctor_id, scheduled_time }`
   - عند النجاح:
     - يتم عرض رسالة نجاح
     - يتم إعادة التوجيه إلى صفحة المواعيد

**API Endpoint:**
```
POST /patients/:patientId/appointments
Headers: Authorization: Bearer <accessToken>
Body: { doctor_id, scheduled_time }
Response: { appointment }
```

### 2.3 عرض مواعيدي

**المسار:** `/patient/appointments`

**الخطوات:**
1. يتم جلب جميع مواعيد المريض من `/patients/:patientId/appointments`
2. يتم عرض قائمة بالمواعيد مع:
   - معلومات الطبيب
   - التاريخ والوقت
   - الحالة (scheduled, in_progress, completed, cancelled)
   - المبلغ الإجمالي (إذا كان الموعد مكتمل)
3. يمكن للمريض رؤية تفاصيل كل موعد

**API Endpoint:**
```
GET /patients/:patientId/appointments
Headers: Authorization: Bearer <accessToken>
Response: [ { appointment with doctor, treatments, status, total_amount } ]
```

---

## 3. Doctor Flow

### 3.1 عرض قائمة المواعيد

**المسار:** `/doctor/appointments`

**الخطوات:**
1. بعد تسجيل الدخول كـ Doctor، يتم التوجيه تلقائياً إلى هذه الصفحة
2. يتم جلب جميع مواعيد الطبيب من `/doctors/:doctorId/appointments`
3. يتم عرض قائمة بالمواعيد مع:
   - معلومات المريض
   - التاريخ والوقت
   - الحالة
   - المبلغ الإجمالي
4. يمكن للطبيب:
   - الضغط على موعد للانتقال إلى صفحة التفاصيل
   - رؤية المواعيد المجدولة والجارية والمكتملة

**API Endpoint:**
```
GET /doctors/:doctorId/appointments
Headers: Authorization: Bearer <accessToken>
Response: [ { appointment with patient, treatments, status, total_amount } ]
```

### 3.2 عرض تفاصيل الموعد وبدء الزيارة

**المسار:** `/doctor/appointment/:id`

**الخطوات:**

#### أ. عرض معلومات الموعد
- يتم عرض معلومات الموعد (AppointmentCard):
  - معلومات المريض
  - التاريخ والوقت
  - الحالة
  - المبلغ الإجمالي

#### ب. بدء الزيارة (Start Visit)
1. الطبيب يضغط على "Start visit"
2. يتم التحقق من:
   - الموعد في حالة `scheduled`
   - لا يوجد موعد آخر `in_progress` للطبيب نفسه
3. يتم إرسال POST request إلى `/appointments/:id/start`
4. عند النجاح:
   - يتم تحديث حالة الموعد إلى `in_progress`
   - يتم تسجيل `started_at`
   - يتم تحديث القائمة تلقائياً

**API Endpoint:**
```
POST /appointments/:id/start
Headers: Authorization: Bearer <accessToken>
Response: { appointment }
```

#### ج. إضافة علاجات (Add Treatments)
1. بعد بدء الزيارة، يمكن للطبيب إضافة علاجات
2. يملأ النموذج:
   - Treatment name (اسم العلاج)
   - Cost (التكلفة - رقم موجب)
3. عند الضغط على "Add":
   - يتم التحقق من البيانات
   - يتم إرسال POST request إلى `/appointments/:id/treatments`
   - Body: `{ name, cost }`
   - عند النجاح:
     - يتم إضافة العلاج إلى القائمة
     - يتم إعادة حساب `total_amount` تلقائياً في الـ backend
     - يتم تحديث القائمة
     - يتم مسح النموذج تلقائياً

**API Endpoint:**
```
POST /appointments/:id/treatments
Headers: Authorization: Bearer <accessToken>
Body: { name, cost }
Response: { treatment, doctor_id }
```

#### د. حذف علاج (Delete Treatment)
1. الطبيب يضغط على زر الحذف بجانب العلاج
2. يتم إرسال DELETE request إلى `/appointments/:id/treatments/:treatmentId`
3. عند النجاح:
   - يتم حذف العلاج
   - يتم إعادة حساب `total_amount`
   - يتم تحديث القائمة

**API Endpoint:**
```
DELETE /appointments/:id/treatments/:treatmentId
Headers: Authorization: Bearer <accessToken>
Response: { doctor_id }
```

#### ه. إنهاء الزيارة (Finish Visit)
1. بعد إضافة جميع العلاجات، الطبيب يضغط على "Finish visit"
2. يتم إرسال POST request إلى `/appointments/:id/finish`
3. عند النجاح:
   - يتم تحديث حالة الموعد إلى `completed`
   - يتم تسجيل `finished_at`
   - يتم إعادة حساب `total_amount` النهائي
   - يتم تحديث:
     - قائمة مواعيد الطبيب
     - صفحة Finance search (تلقائياً)
   - يتم عرض رسالة نجاح

**API Endpoint:**
```
POST /appointments/:id/finish
Headers: Authorization: Bearer <accessToken>
Response: { appointment }
```

---

## 4. Finance Flow

### 4.1 البحث عن المواعيد

**المسار:** `/finance/search`

**الخطوات:**

#### أ. البحث التلقائي
1. بعد تسجيل الدخول كـ Finance، يتم التوجيه تلقائياً إلى هذه الصفحة
2. يتم عرض نموذج البحث مع الحقول:
   - Doctor (اسم الطبيب)
   - Patient (اسم المريض)
   - Appointment ID
   - From (تاريخ البداية)
   - To (تاريخ النهاية)
3. عند تغيير أي حقل:
   - يتم البحث تلقائياً بعد 500ms (debounce)
   - يتم تنظيف القيم الفارغة
   - يتم إرسال GET request إلى `/finance/appointments` مع query parameters

#### ب. عرض النتائج
- يتم عرض جدول بالمواعيد مع:
  - Appointment ID
  - Doctor name
  - Patient name
  - Date & Time
  - Total Amount
  - Status
  - **Review Status** (جديد):
    - إذا كان هناك review: يعرض "✓ Approved" أو "⚠ Needs Review"
    - يعرض الـ notes إذا موجودة
    - يعرض اسم Finance user الذي قام بالمراجعة
    - إذا لم يكن هناك review: يعرض "Not reviewed"
  - Actions (Review button)

#### ج. Pagination
- يتم عرض pagination في الأسفل
- عند تغيير الصفحة:
  - يتم تحديث `page` في filters
  - يتم إعادة جلب البيانات
- يتم حساب `totalPages` بشكل صحيح (باستخدام distinct count)

**API Endpoint:**
```
GET /finance/appointments?doctor=...&patient=...&appointmentId=...&from=...&to=...&limit=10&page=1
Headers: Authorization: Bearer <accessToken>
Response: {
  appointments: [...],
  pagination: { total, page, limit, totalPages }
}
```

### 4.2 مراجعة الموعد (Review Appointment)

**الخطوات:**
1. Finance user يضغط على "Review" أو "Update Review" بجانب موعد
2. يتم فتح Dialog مع:
   - معلومات الموعد (Doctor, Patient)
   - Decision dropdown:
     - "Approve" (approved = true)
     - "Needs follow-up" (approved = false)
   - Notes (textarea - اختياري)
   - إذا كان هناك review موجود، يتم ملء القيم الحالية
3. عند الضغط على "Save":
   - يتم التحقق من البيانات
   - يتم إرسال POST request إلى `/finance/appointments/:id/review`
   - Body: `{ approved, notes }`
   - عند النجاح:
     - يتم حفظ/تحديث الـ review
     - يتم إغلاق الـ Dialog
     - يتم تحديث القائمة تلقائياً
     - يتم عرض رسالة نجاح

**API Endpoint:**
```
POST /finance/appointments/:id/review
Headers: Authorization: Bearer <accessToken>
Body: { approved, notes }
Response: { financeReview }
```

**ملاحظات:**
- إذا كان هناك review موجود، يتم تحديثه
- إذا لم يكن هناك review، يتم إنشاء واحد جديد
- يتم ربط الـ review بـ Finance user الحالي

---

## 5. Profile Flow

### 5.1 عرض الملف الشخصي

**المسار:** `/profile`

**الخطوات:**
1. المستخدم (أي دور) يضغط على "Profile" في Header
2. يتم جلب بيانات المستخدم من `/profile` endpoint
3. يتم عرض:
   - Full Name
   - Email
   - Role (مع لون مميز)
   - Member Since (تاريخ التسجيل)

**API Endpoint:**
```
GET /profile
Headers: Authorization: Bearer <accessToken>
Response: { user }
```

---

## 🔄 التحديثات التلقائية (Auto-refresh)

### Finance Search Auto-refresh
عند حدوث أي من الأحداث التالية، يتم تحديث صفحة Finance search تلقائياً:
- إنهاء موعد (Finish appointment)
- إضافة treatment
- حذف treatment

هذا يتم عبر `invalidateQueries` في React Query.

---

## 🔐 الحماية والصلاحيات

### Route Protection
- **PrivateRoute**: يتحقق من وجود user مسجل دخول
- **ProtectedRouteByRole**: يتحقق من الدور:
  - Patient routes: فقط للمرضى
  - Doctor routes: فقط للأطباء
  - Finance routes: فقط لموظفي المالية
  - Profile: متاح لجميع المستخدمين

### API Protection
- جميع الـ endpoints (ما عدا auth و health) تتطلب `Authorization: Bearer <accessToken>`
- بعض الـ endpoints لها role-based authorization:
  - Patient endpoints: فقط للمرضى
  - Doctor endpoints: فقط للأطباء
  - Finance endpoints: فقط لموظفي المالية

---

## 📊 States (الحالات)

### Appointment Status
- `scheduled`: الموعد مجدول
- `in_progress`: الزيارة جارية
- `completed`: الزيارة مكتملة
- `cancelled`: الموعد ملغي

### Finance Review Status
- `approved: true`: موافق عليه
- `approved: false`: يحتاج متابعة

---

## 🎯 ملخص الـ Flows الرئيسية

1. **Patient Journey:**
   - Sign Up/Login → View Doctors → Book Appointment → View My Appointments

2. **Doctor Journey:**
   - Login → View Appointments → Start Visit → Add Treatments → Finish Visit

3. **Finance Journey:**
   - Login → Search Appointments → Review Appointment → View Reviews

4. **Common:**
   - Profile: متاح لجميع الأدوار

---

## 🔗 API Endpoints Summary

### Authentication
- `POST /auth/signup` - التسجيل
- `POST /auth/login` - تسجيل الدخول
- `POST /auth/refresh` - تحديث token
- `POST /auth/logout` - تسجيل الخروج

### Patient
- `GET /doctors` - قائمة الأطباء
- `POST /patients/:patientId/appointments` - حجز موعد
- `GET /patients/:patientId/appointments` - مواعيد المريض

### Doctor
- `GET /doctors/:doctorId/appointments` - مواعيد الطبيب
- `POST /appointments/:id/start` - بدء الزيارة
- `POST /appointments/:id/finish` - إنهاء الزيارة
- `POST /appointments/:id/treatments` - إضافة علاج
- `DELETE /appointments/:id/treatments/:treatmentId` - حذف علاج

### Finance
- `GET /finance/appointments` - البحث عن المواعيد
- `POST /finance/appointments/:id/review` - مراجعة موعد

### Users
- `GET /profile` - الملف الشخصي

---

## 🛠️ التقنيات المستخدمة

### Frontend
- React + TypeScript + Vite
- React Router للتنقل
- React Query للـ data fetching و caching
- React Hook Form + Yup للـ validation
- Axios مع interceptors للـ authentication
- Material-UI للـ UI components
- TailwindCSS للـ styling

### Backend
- Node.js + Express + TypeScript
- Sequelize ORM مع PostgreSQL
- JWT للـ authentication
- Express Rate Limit للحماية
- Yup للـ validation

---

## 📝 ملاحظات مهمة

1. **Token Management:**
   - `accessToken` محفوظ في memory (آمن)
   - `refreshToken` محفوظ في localStorage (fallback)
   - يتم تحديث الـ tokens تلقائياً عند انتهاء الصلاحية

2. **Error Handling:**
   - جميع الأخطاء يتم عرضها عبر toast notifications
   - 401 errors: يتم محاولة refresh تلقائياً
   - 403 errors: "Insufficient permissions"
   - 409 errors: "Conflict" (مثل: موعد آخر جاري)

3. **Optimistic Updates:**
   - بعض العمليات تستخدم optimistic updates لتحسين UX
   - عند الفشل، يتم rollback تلقائياً

4. **Auto-refresh:**
   - Finance search يتم تحديثه تلقائياً عند تغيير المواعيد
   - يتم استخدام React Query invalidation

---

تم إنشاء هذا المستند بتاريخ: 2024

