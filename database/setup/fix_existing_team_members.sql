-- تحديث جدول team_members الموجود

-- إضافة الأعمدة المفقودة للجدول الموجود
DO $$ 
BEGIN
    -- إضافة عمود first_name إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'first_name') THEN
        ALTER TABLE team_members ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    -- إضافة عمود last_name إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'last_name') THEN
        ALTER TABLE team_members ADD COLUMN last_name VARCHAR(100);
    END IF;
    
    -- إضافة عمود bio إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'bio') THEN
        ALTER TABLE team_members ADD COLUMN bio TEXT;
    END IF;
    
    -- إضافة عمود skills إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'skills') THEN
        ALTER TABLE team_members ADD COLUMN skills TEXT[];
    END IF;
    
    -- إضافة عمود hourly_rate إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'hourly_rate') THEN
        ALTER TABLE team_members ADD COLUMN hourly_rate DECIMAL(10,2);
    END IF;
    
    -- إضافة عمود created_at إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'created_at') THEN
        ALTER TABLE team_members ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- إضافة عمود updated_at إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' AND column_name = 'updated_at') THEN
        ALTER TABLE team_members ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at (إذا لم يكن موجوداً)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_updated_at') THEN
        CREATE TRIGGER update_team_members_updated_at 
            BEFORE UPDATE ON team_members 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- إنشاء فهارس إضافية لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at);

-- تحديث البيانات الموجودة لتقسيم الاسم إلى first_name و last_name
UPDATE team_members 
SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN SPLIT_PART(name, ' ', 2) != '' THEN 
            SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE ''
    END
WHERE first_name IS NULL OR last_name IS NULL;

-- تحديث created_at للبيانات الموجودة
UPDATE team_members 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- تحديث updated_at للبيانات الموجودة
UPDATE team_members 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- إضافة بيانات تجريبية (فقط إذا لم تكن موجودة)
-- نحتاج project_id صالح، سنستخدم أول مشروع موجود أو نضيف مشروع تجريبي

-- إنشاء مشروع تجريبي إذا لم يكن موجود
INSERT INTO projects (name, description, status, created_at)
SELECT 
    'مشروع تجريبي للفريق', 
    'مشروع تجريبي لاختبار إدارة الفريق', 
    'active', 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

-- الحصول على project_id
DO $$
DECLARE
    demo_project_id UUID;
BEGIN
    -- الحصول على أول مشروع موجود
    SELECT id INTO demo_project_id FROM projects LIMIT 1;
    
    -- إضافة أعضاء تجريبيين
    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'أحمد محمد', 'أحمد', 'محمد', 'ahmed@example.com', '+201234567890', 'manager', 'active', '2024-01-15', 'مدير مشاريع ذو خبرة 10 سنوات', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'ahmed@example.com');

    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'فاطمة علي', 'فاطمة', 'علي', 'fatima@example.com', '+201234567891', 'lead', 'active', '2024-02-01', 'قائدة فريق تطوير', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'fatima@example.com');

    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'محمد حسن', 'محمد', 'حسن', 'mohamed@example.com', '+201234567892', 'designer', 'active', '2024-02-15', 'مصمم جرافيك محترف', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'mohamed@example.com');

    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'سارة أحمد', 'سارة', 'أحمد', 'sara@example.com', '+201234567893', 'editor', 'active', '2024-03-01', 'محررة محتوى', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'sara@example.com');

    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'علي محمود', 'علي', 'محمود', 'ali@example.com', '+201234567894', 'member', 'active', '2024-03-15', 'مطور ويب', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'ali@example.com');

    INSERT INTO team_members (project_id, name, first_name, last_name, email, phone, role, status, joined, bio, created_at) 
    SELECT 
        demo_project_id, 'نور الدين', 'نور', 'الدين', 'nour@example.com', '+201234567895', 'member', 'inactive', '2024-01-01', 'مطور تطبيقات', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'nour@example.com');
END $$;

-- إنشاء جدول custom_roles إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء trigger لتحديث updated_at للأدوار المخصصة
CREATE TRIGGER update_custom_roles_updated_at 
    BEFORE UPDATE ON custom_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- إدخال أدوار افتراضية (فقط إذا لم تكن موجودة)
INSERT INTO custom_roles (name, description, permissions, is_default, created_at) 
SELECT 
    'system_admin', 'مدير النظام', '["viewProjects", "createProjects", "editProjects", "deleteProjects", "viewTeam", "manageTeam", "viewPayments", "managePayments", "viewReports", "manageSettings"]', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'system_admin');

INSERT INTO custom_roles (name, description, permissions, is_default, created_at) 
SELECT 
    'project_manager', 'مدير المشروع', '["viewProjects", "createProjects", "editProjects", "viewTeam", "manageTeam", "viewPayments", "viewReports"]', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'project_manager');

INSERT INTO custom_roles (name, description, permissions, is_default, created_at) 
SELECT 
    'team_lead', 'قائد الفريق', '["viewProjects", "editProjects", "viewTeam", "viewPayments", "viewReports"]', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'team_lead');

INSERT INTO custom_roles (name, description, permissions, is_default, created_at) 
SELECT 
    'team_member', 'عضو الفريق', '["viewProjects", "viewTeam", "viewReports"]', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'team_member');

INSERT INTO custom_roles (name, description, permissions, is_default, created_at) 
SELECT 
    'viewer', 'مشاهد', '["viewProjects", "viewTeam", "viewReports"]', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'viewer');

-- رسالة تأكيد
SELECT 'تم تحديث جدول team_members بنجاح!' as message;
