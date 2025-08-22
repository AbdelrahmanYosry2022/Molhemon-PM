# فصل أعضاء الشركة عن أعضاء المشاريع

## المشكلة
كان هناك تداخل بين مفهومين مختلفين:
1. **أعضاء الشركة** - دور العضو في الشركة وحالته العامة
2. **أعضاء المشاريع** - دور العضو في مشروع معين وحالته في هذا المشروع

## الحل
تم فصل هذين المفهومين إلى جداول منفصلة مع علاقات واضحة.

## الهيكل الجديد

### 1. جدول `company_team_members` (أعضاء الشركة)
```sql
- id (UUID, Primary Key)
- name (VARCHAR(255), NOT NULL)
- first_name (VARCHAR(100))
- last_name (VARCHAR(100))
- email (VARCHAR(255), UNIQUE)
- phone (VARCHAR(50))
- role (VARCHAR(50)) -- دور العضو في الشركة
- status (VARCHAR(20)) -- حالة العضو في الشركة
- joined (DATE) -- تاريخ انضمامه للشركة
- avatar_url (TEXT)
- bio (TEXT)
- skills (TEXT[])
- hourly_rate (DECIMAL(10,2)) -- معدل الساعة العام
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

### 2. جدول `project_team_members` (أعضاء المشاريع)
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key) -- المشروع
- company_member_id (UUID, Foreign Key) -- العضو من الشركة
- project_role (VARCHAR(50)) -- دور العضو في هذا المشروع
- project_status (VARCHAR(20)) -- حالة العضو في هذا المشروع
- joined_project_date (DATE) -- تاريخ انضمامه للمشروع
- left_project_date (DATE) -- تاريخ مغادرته المشروع
- project_notes (TEXT) -- ملاحظات خاصة بالمشروع
- project_hourly_rate (DECIMAL(10,2)) -- معدل الساعة في هذا المشروع
- allocated_hours (INTEGER) -- الساعات المخصصة
- actual_hours (INTEGER) -- الساعات المنفقة فعلياً
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

## الأدوار والحالات

### أدوار الشركة (company_team_members.role)
- `manager` - مدير
- `lead` - قائد فريق
- `editor` - محرر
- `designer` - مصمم
- `member` - عضو فريق

### حالات الشركة (company_team_members.status)
- `active` - نشط
- `inactive` - غير نشط

### أدوار المشاريع (project_team_members.project_role)
- `project_manager` - مدير المشروع
- `team_lead` - قائد الفريق
- `designer` - مصمم
- `developer` - مطور
- `editor` - محرر
- `animator` - رسام متحرك
- `video_editor` - مونتير فيديو
- `audio_engineer` - مهندس صوت
- `copywriter` - كاتب محتوى
- `researcher` - باحث
- `tester` - مختبر
- `member` - عضو فريق

### حالات المشاريع (project_team_members.project_status)
- `active` - نشط في المشروع
- `inactive` - غير نشط في المشروع
- `completed` - أتم العمل في المشروع
- `on_leave` - في إجازة من المشروع
- `replaced` - تم استبداله

## الجداول المساعدة

### 3. جدول `project_roles` (أدوار المشاريع)
```sql
- id (UUID, Primary Key)
- name (VARCHAR(100), UNIQUE)
- description (TEXT)
- color (VARCHAR(7)) -- لون العرض
- is_default (BOOLEAN)
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

### 4. جدول `project_statuses` (حالات المشاريع)
```sql
- id (UUID, Primary Key)
- name (VARCHAR(100), UNIQUE)
- description (TEXT)
- color (VARCHAR(7)) -- لون العرض
- icon (VARCHAR(50)) -- أيقونة العرض
- is_default (BOOLEAN)
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

## العلاقات

### العلاقة بين الجداول
```
company_team_members (1) ←→ (N) project_team_members
projects (1) ←→ (N) project_team_members
```

### مثال عملي
```
العضو: أحمد محمد
- دور في الشركة: مصمم
- حالة في الشركة: نشط

في مشروع "تصميم موقع":
- دور في المشروع: مدير المشروع
- حالة في المشروع: نشط

في مشروع "تصميم هوية":
- دور في المشروع: مصمم
- حالة في المشروع: أتم العمل
```

## الميزات الجديدة

### 1. فصل واضح للمفاهيم
- **دور الشركة**: يحدد تخصص العضو العام
- **دور المشروع**: يحدد مسؤولية العضو في مشروع معين
- **حالة الشركة**: توضح إذا كان العضو يعمل في الشركة
- **حالة المشروع**: توضح حالة العضو في مشروع معين

### 2. مرونة في الأدوار
- نفس العضو يمكن أن يكون له أدوار مختلفة في مشاريع مختلفة
- يمكن تتبع تطور دور العضو عبر المشاريع

### 3. تتبع الساعات
- معدل ساعة عام للعضو
- معدل ساعة خاص بكل مشروع
- ساعات مخصصة ومنفقة لكل مشروع

### 4. إدارة الحالات
- حالة عامة في الشركة
- حالات مختلفة في كل مشروع
- تتبع تاريخ الانضمام والمغادرة

## الاستعلامات المفيدة

### الحصول على أعضاء مشروع معين
```sql
SELECT * FROM project_team_view WHERE project_id = 'project-uuid';
```

### الحصول على جميع مشاريع العضو
```sql
SELECT * FROM project_team_view WHERE company_member_id = 'member-uuid';
```

### الحصول على أعضاء نشطين في مشروع معين
```sql
SELECT * FROM project_team_view 
WHERE project_id = 'project-uuid' 
AND project_status = 'active';
```

## التطبيق في الكود

### في داشبورد إدارة فريق العمل
- يعرض أعضاء الشركة (`company_team_members`)
- يدير الأدوار والحالات العامة
- يعرض الإحصائيات الشاملة

### في جدول فريق المشروع
- يعرض أعضاء المشروع (`project_team_members`)
- يدير الأدوار والحالات الخاصة بالمشروع
- يعرض تفاصيل العمل في المشروع

## الفوائد

### 1. دقة البيانات
- كل مفهوم له مكانه المناسب
- لا تداخل بين الأدوار والحالات

### 2. مرونة الإدارة
- إدارة منفصلة لكل مستوى
- إمكانية تخصيص الأدوار حسب المشروع

### 3. تتبع أفضل
- تتبع أداء العضو في كل مشروع
- إحصائيات دقيقة لكل مستوى

### 4. قابلية التوسع
- إضافة أدوار وحالات جديدة بسهولة
- دعم مشاريع معقدة بأدوار متعددة

## الخطوات التالية

1. **تشغيل ملف SQL** لفصل الجداول
2. **تحديث الكود** لاستخدام الجداول الجديدة
3. **اختبار الوظائف** في كلا النظامين
4. **تدريب المستخدمين** على المفاهيم الجديدة
