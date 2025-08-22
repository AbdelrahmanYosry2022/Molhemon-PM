# تنفيذ فصل أعضاء الشركة عن أعضاء المشاريع

## 🎯 الهدف
فصل إدارة أعضاء الشركة عن إدارة أعضاء المشاريع، بحيث يكون لكل عضو:
- **دور في الشركة** (مصمم، مطور، مدير، إلخ)
- **حالة في الشركة** (نشط، غير نشط)
- **دور في المشروع** (مدير المشروع، مصمم، مطور، إلخ)
- **حالة في المشروع** (نشط، مكتمل، في إجازة، إلخ)

## 🗄️ الهيكل الجديد للقاعدة

### الجداول الجديدة:

#### 1. `company_team_members` (أعضاء الشركة)
```sql
- id (UUID)
- name (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- role (VARCHAR) -- دور في الشركة
- status (VARCHAR) -- حالة في الشركة
- joined (DATE)
- avatar_url (TEXT)
- bio (TEXT)
- skills (TEXT[])
- hourly_rate (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `project_team_members` (أعضاء المشاريع)
```sql
- id (UUID)
- project_id (UUID) -- مرجع للمشروع
- company_member_id (UUID) -- مرجع لعضو الشركة
- project_role (VARCHAR) -- دور في المشروع
- project_status (VARCHAR) -- حالة في المشروع
- joined_project_date (DATE)
- left_project_date (DATE)
- project_notes (TEXT)
- project_hourly_rate (DECIMAL)
- allocated_hours (INTEGER)
- actual_hours (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `project_roles` (أدوار المشاريع)
```sql
- id (UUID)
- name (VARCHAR) -- project_manager, team_lead, designer, etc.
- description (TEXT)
- color (VARCHAR) -- لون العرض
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. `project_statuses` (حالات المشاريع)
```sql
- id (UUID)
- name (VARCHAR) -- active, inactive, completed, on_leave, replaced
- description (TEXT)
- color (VARCHAR) -- لون العرض
- icon (VARCHAR) -- أيقونة العرض
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 5. `project_team_view` (عرض شامل)
```sql
-- يجمع بيانات أعضاء المشروع مع بيانات الشركة
SELECT 
  ptm.*,
  ctm.name as member_name,
  ctm.email as member_email,
  ctm.phone as member_phone,
  ctm.avatar_url as member_avatar_url,
  ctm.role as company_role,
  ctm.status as company_status,
  p.name as project_name,
  pr.name as project_role_name,
  ps.name as project_status_name
FROM project_team_members ptm
JOIN company_team_members ctm ON ptm.company_member_id = ctm.id
JOIN projects p ON ptm.project_id = p.id
LEFT JOIN project_roles pr ON ptm.project_role = pr.name
LEFT JOIN project_statuses ps ON ptm.project_status = ps.name
```

## 🔧 الملفات المحدثة

### 1. `src/components/TeamDashboard.jsx`
- **التحديث:** استخدام `company_team_members` بدلاً من `team_members`
- **الوظيفة:** إدارة أعضاء الشركة في لوحة إدارة الفريق

### 2. `src/components/ProjectTeamManager.jsx` (جديد)
- **الوظيفة:** إدارة أعضاء المشروع
- **الميزات:**
  - عرض أعضاء المشروع في جدول
  - إضافة أعضاء من قائمة أعضاء الشركة
  - تعديل دور وحالة العضو في المشروع
  - إدارة معدل الساعة والساعات المخصصة

### 3. `src/components/modals/EditMemberModal.jsx`
- **التحديث:** دعم أعضاء المشاريع
- **الميزات الجديدة:**
  - `isProjectMember` prop للتمييز بين نوع العضو
  - حقول إضافية لأعضاء المشاريع (معدل الساعة، الساعات المخصصة)
  - أدوار وحالات مختلفة للمشاريع

### 4. `src/components/ProjectSections.jsx`
- **التحديث:** استخدام `ProjectTeamManager` بدلاً من `TeamPanel`
- **الوظيفة:** عرض إدارة فريق المشروع في تبويب المشروع

## 🎨 الواجهة الجديدة

### لوحة إدارة الفريق (Team Dashboard)
- **تبويب النظرة العامة:** إحصائيات أعضاء الشركة
- **تبويب الأعضاء:** إدارة أعضاء الشركة
- **تبويب الأدوار:** إدارة أدوار الشركة

### تبويب فريق المشروع (Project Team Tab)
- **جدول أعضاء المشروع:** عرض جميع أعضاء المشروع
- **إضافة عضو:** اختيار من قائمة أعضاء الشركة
- **تعديل العضو:** تغيير دور وحالة العضو في المشروع
- **إدارة التكلفة:** معدل الساعة والساعات المخصصة

## 🔄 تدفق البيانات

### إضافة عضو للمشروع:
1. المستخدم يفتح تبويب "فريق المشروع"
2. يضغط "إضافة عضو"
3. يختار عضو من قائمة أعضاء الشركة
4. يحدد دور العضو في المشروع
5. يحدد حالة العضو في المشروع
6. يضيف معدل الساعة والساعات المخصصة
7. يحفظ البيانات في `project_team_members`

### عرض أعضاء المشروع:
1. النظام يستعلم من `project_team_view`
2. يجمع بيانات العضو من `company_team_members`
3. يجمع بيانات المشروع من `projects`
4. يعرض البيانات في جدول منظم

## 🎯 المزايا

### 1. فصل واضح للمسؤوليات
- **أعضاء الشركة:** إدارة عامة للفريق
- **أعضاء المشروع:** إدارة خاصة بكل مشروع

### 2. مرونة في الأدوار
- عضو يمكن أن يكون "مصمم" في الشركة و"مدير مشروع" في مشروع معين
- عضو يمكن أن يكون "نشط" في الشركة و"مكتمل" في مشروع معين

### 3. تتبع التكلفة
- معدل ساعة مختلف لكل مشروع
- ساعات مخصصة لكل مشروع
- إمكانية تتبع الساعات الفعلية

### 4. إدارة أفضل للمشاريع
- عرض واضح لفريق كل مشروع
- إمكانية إضافة/إزالة أعضاء من المشاريع
- تتبع حالة كل عضو في المشروع

## 🚀 الخطوات التالية

1. **اختبار النظام:** التأكد من عمل جميع الوظائف
2. **ترحيل البيانات:** نقل البيانات الموجودة للهيكل الجديد
3. **تدريب المستخدمين:** شرح النظام الجديد
4. **تحسينات إضافية:** إضافة ميزات مثل تقارير التكلفة

## 📝 ملاحظات مهمة

- النظام الجديد يحافظ على البيانات الموجودة
- يمكن تشغيل النظام القديم والجديد معاً أثناء الانتقال
- جميع الواجهات تدعم العربية والإنجليزية
- النظام قابل للتوسع لإضافة ميزات جديدة
