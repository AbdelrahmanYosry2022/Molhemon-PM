-- فصل آمن لأعضاء الشركة عن أعضاء المشاريع مع الحفاظ على البيانات الموجودة

-- 1. التحقق من وجود الجداول أولاً
DO $$
BEGIN
    -- التحقق من وجود جدول team_members
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
        
        -- إعادة تسمية جدول team_members إلى company_team_members
        ALTER TABLE team_members RENAME TO company_team_members;
        
        RAISE NOTICE 'تم إعادة تسمية team_members إلى company_team_members بنجاح';
    ELSE
        RAISE NOTICE 'جدول team_members غير موجود، سيتم إنشاء company_team_members جديد';
        
        -- إنشاء جدول company_team_members جديد
        CREATE TABLE company_team_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(50),
            role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('manager', 'lead', 'editor', 'designer', 'member')),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            joined DATE DEFAULT CURRENT_DATE,
            avatar_url TEXT,
            bio TEXT,
            skills TEXT[],
            hourly_rate DECIMAL(10,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. إنشاء جدول project_team_members
CREATE TABLE IF NOT EXISTS project_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    company_member_id UUID NOT NULL REFERENCES company_team_members(id) ON DELETE CASCADE,
    
    -- دور العضو في هذا المشروع (مختلف عن دوره في الشركة)
    project_role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (project_role IN (
        'project_manager',    -- مدير المشروع
        'team_lead',         -- قائد الفريق
        'designer',          -- مصمم
        'developer',         -- مطور
        'editor',            -- محرر
        'animator',          -- رسام متحرك
        'video_editor',      -- مونتير فيديو
        'audio_engineer',    -- مهندس صوت
        'copywriter',        -- كاتب محتوى
        'researcher',        -- باحث
        'tester',            -- مختبر
        'member'             -- عضو فريق
    )),
    
    -- حالة العضو في هذا المشروع (مختلفة عن حالته في الشركة)
    project_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (project_status IN (
        'active',           -- نشط في المشروع
        'inactive',         -- غير نشط في المشروع
        'completed',        -- أتم العمل في المشروع
        'on_leave',         -- في إجازة من المشروع
        'replaced'          -- تم استبداله
    )),
    
    -- تاريخ انضمام العضو للمشروع
    joined_project_date DATE DEFAULT CURRENT_DATE,
    
    -- تاريخ مغادرة العضو للمشروع (إذا كان غير نشط)
    left_project_date DATE,
    
    -- ملاحظات خاصة بالمشروع
    project_notes TEXT,
    
    -- معدل الساعة في هذا المشروع (قد يختلف عن معدله العام)
    project_hourly_rate DECIMAL(10,2),
    
    -- عدد الساعات المخصصة للمشروع
    allocated_hours INTEGER,
    
    -- عدد الساعات المنفقة فعلياً
    actual_hours INTEGER DEFAULT 0,
    
    -- تاريخ إنشاء وتحديث السجل
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ضمان عدم تكرار نفس العضو في نفس المشروع
    UNIQUE(project_id, company_member_id)
);

-- 3. إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_team_members_updated_at 
    BEFORE UPDATE ON project_team_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_company_member_id ON project_team_members(company_member_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_role ON project_team_members(project_role);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_status ON project_team_members(project_status);
CREATE INDEX IF NOT EXISTS idx_project_team_members_joined_project_date ON project_team_members(joined_project_date);

-- 5. إنشاء جدول project_roles للأدوار المخصصة في المشاريع
CREATE TABLE IF NOT EXISTS project_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- لون العرض
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء trigger لتحديث updated_at للأدوار
CREATE TRIGGER update_project_roles_updated_at 
    BEFORE UPDATE ON project_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. إدخال أدوار افتراضية للمشاريع
INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'project_manager', 'مدير المشروع', '#059669', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'project_manager');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'team_lead', 'قائد الفريق', '#2563EB', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'team_lead');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'designer', 'مصمم', '#EC4899', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'designer');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'developer', 'مطور', '#7C3AED', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'developer');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'editor', 'محرر', '#DC2626', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'editor');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'animator', 'رسام متحرك', '#EA580C', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'animator');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'video_editor', 'مونتير فيديو', '#0891B2', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'video_editor');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'audio_engineer', 'مهندس صوت', '#059669', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'audio_engineer');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'copywriter', 'كاتب محتوى', '#7C2D12', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'copywriter');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'researcher', 'باحث', '#1E40AF', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'researcher');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'tester', 'مختبر', '#BE185D', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'tester');

INSERT INTO project_roles (name, description, color, is_default, created_at) 
SELECT 
    'member', 'عضو فريق', '#6B7280', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_roles WHERE name = 'member');

-- 8. إنشاء جدول project_statuses لحالات المشاريع
CREATE TABLE IF NOT EXISTS project_statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. إنشاء trigger لتحديث updated_at للحالات
CREATE TRIGGER update_project_statuses_updated_at 
    BEFORE UPDATE ON project_statuses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. إدخال حالات افتراضية للمشاريع
INSERT INTO project_statuses (name, description, color, icon, is_default, created_at) 
SELECT 
    'active', 'نشط في المشروع', '#059669', 'CheckCircle2', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_statuses WHERE name = 'active');

INSERT INTO project_statuses (name, description, color, icon, is_default, created_at) 
SELECT 
    'inactive', 'غير نشط في المشروع', '#DC2626', 'XCircle', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_statuses WHERE name = 'inactive');

INSERT INTO project_statuses (name, description, color, icon, is_default, created_at) 
SELECT 
    'completed', 'أتم العمل في المشروع', '#2563EB', 'CheckCircle', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_statuses WHERE name = 'completed');

INSERT INTO project_statuses (name, description, color, icon, is_default, created_at) 
SELECT 
    'on_leave', 'في إجازة من المشروع', '#F59E0B', 'Clock', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_statuses WHERE name = 'on_leave');

INSERT INTO project_statuses (name, description, color, icon, is_default, created_at) 
SELECT 
    'replaced', 'تم استبداله', '#6B7280', 'UserX', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM project_statuses WHERE name = 'replaced');

-- 11. إنشاء view لسهولة الاستعلام (مصحح)
CREATE OR REPLACE VIEW project_team_view AS
SELECT 
    ptm.id,
    ptm.project_id,
    ptm.company_member_id,
    ptm.project_role,
    ptm.project_status,
    ptm.joined_project_date,
    ptm.left_project_date,
    ptm.project_notes,
    ptm.project_hourly_rate,
    ptm.allocated_hours,
    ptm.actual_hours,
    ptm.created_at,
    ptm.updated_at,
    
    -- بيانات العضو من الشركة
    ctm.name as member_name,
    ctm.first_name,
    ctm.last_name,
    ctm.email,
    ctm.phone,
    ctm.avatar_url,
    ctm.role as company_role, -- دور العضو في الشركة (استخدام role بدلاً من company_role)
    ctm.status as company_status, -- حالة العضو في الشركة (استخدام status بدلاً من company_status)
    
    -- بيانات المشروع
    p.name as project_name,
    -- p.status as project_status_overall, -- تم إزالتها لأن عمود status غير موجود في جدول projects
    
    -- بيانات الدور في المشروع
    pr.name as project_role_name,
    pr.description as project_role_description,
    pr.color as project_role_color,
    
    -- بيانات الحالة في المشروع
    ps.name as project_status_name,
    ps.description as project_status_description,
    ps.color as project_status_color,
    ps.icon as project_status_icon
FROM project_team_members ptm
JOIN company_team_members ctm ON ptm.company_member_id = ctm.id
JOIN projects p ON ptm.project_id = p.id
LEFT JOIN project_roles pr ON ptm.project_role = pr.name
LEFT JOIN project_statuses ps ON ptm.project_status = ps.name;

-- 12. إنشاء دالة مساعدة للحصول على أعضاء المشروع (مصححة)
CREATE OR REPLACE FUNCTION get_project_team_members(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    member_name TEXT,
    member_email TEXT,
    member_phone TEXT,
    member_avatar_url TEXT,
    company_role TEXT,
    company_status TEXT,
    project_role TEXT,
    project_status TEXT,
    joined_project_date DATE,
    project_notes TEXT,
    project_hourly_rate DECIMAL(10,2),
    allocated_hours INTEGER,
    actual_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ptm.id,
        ctm.name as member_name,
        ctm.email as member_email,
        ctm.phone as member_phone,
        ctm.avatar_url as member_avatar_url,
        ctm.role as company_role, -- استخدام role بدلاً من company_role
        ctm.status as company_status, -- استخدام status بدلاً من company_status
        ptm.project_role,
        ptm.project_status,
        ptm.joined_project_date,
        ptm.project_notes,
        ptm.project_hourly_rate,
        ptm.allocated_hours,
        ptm.actual_hours
    FROM project_team_members ptm
    JOIN company_team_members ctm ON ptm.company_member_id = ctm.id
    WHERE ptm.project_id = project_uuid
    ORDER BY ptm.joined_project_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. إضافة بيانات تجريبية للمشاريع (إذا لم تكن موجودة)
DO $$
DECLARE
    demo_project_id UUID;
    demo_member_id UUID;
BEGIN
    -- الحصول على أول مشروع موجود
    SELECT id INTO demo_project_id FROM projects LIMIT 1;
    
    -- الحصول على أول عضو شركة موجود
    SELECT id INTO demo_member_id FROM company_team_members LIMIT 1;
    
    -- إضافة عضو تجريبي للمشروع
    IF demo_project_id IS NOT NULL AND demo_member_id IS NOT NULL THEN
        INSERT INTO project_team_members (
            project_id, 
            company_member_id, 
            project_role, 
            project_status, 
            joined_project_date, 
            project_notes, 
            project_hourly_rate,
            allocated_hours
        ) 
        SELECT 
            demo_project_id, 
            demo_member_id, 
            'project_manager', 
            'active', 
            '2024-01-15', 
            'مدير المشروع المسؤول عن التنسيق العام', 
            150.00,
            40
        WHERE NOT EXISTS (
            SELECT 1 FROM project_team_members 
            WHERE project_id = demo_project_id AND company_member_id = demo_member_id
        );
    END IF;
END $$;

-- رسالة تأكيد
SELECT 'تم فصل أعضاء الشركة عن أعضاء المشاريع بنجاح مع الحفاظ على البيانات الموجودة!' as message;
