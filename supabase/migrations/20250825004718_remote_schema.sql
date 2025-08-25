

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_project_team_members"("project_uuid" "uuid") RETURNS TABLE("id" "uuid", "member_name" "text", "member_email" "text", "member_phone" "text", "member_avatar_url" "text", "company_role" "text", "company_status" "text", "project_role" "text", "project_status" "text", "joined_project_date" "date", "project_notes" "text", "project_hourly_rate" numeric, "allocated_hours" integer, "actual_hours" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_project_team_members"("project_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_project_owner_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."set_project_owner_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account_transfers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_account_id" "uuid" NOT NULL,
    "to_account_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EGP'::"text" NOT NULL,
    "transfer_date" "date" NOT NULL,
    "exchange_rate" numeric DEFAULT 1,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "account_transfers_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "account_transfers_different_accounts" CHECK (("from_account_id" <> "to_account_id"))
);


ALTER TABLE "public"."account_transfers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "budget" numeric DEFAULT 0 NOT NULL,
    CONSTRAINT "categories_budget_check" CHECK (("budget" >= (0)::numeric))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prefix" "text",
    "first_name" "text",
    "last_name" "text",
    "client_bio" "text",
    "phone_number" "text",
    "email_address" "text",
    "profile_url" "text",
    "joined_date" "date",
    "picture_url" "text",
    "industry" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_image_url" "text",
    "profile_image_size" integer,
    "profile_image_type" "text",
    "cover_image_url" "text",
    "location" "text"
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "joined" "date",
    "email" "text",
    "phone" "text",
    "avatar_url" "text",
    "first_name" character varying(100),
    "last_name" character varying(100),
    "bio" "text",
    "skills" "text"[],
    "hourly_rate" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_members_role_check" CHECK (("role" = ANY (ARRAY['manager'::"text", 'lead'::"text", 'editor'::"text", 'designer'::"text", 'member'::"text"]))),
    CONSTRAINT "team_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."company_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deliverables" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "owner" "text",
    "due" "date",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "links" "text"[],
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" DEFAULT 'podcast'::"text" NOT NULL,
    "owner_id" "uuid",
    "cost" numeric(12,2) DEFAULT NULL::numeric,
    "currency" character varying(8) DEFAULT 'EGP'::character varying,
    CONSTRAINT "deliverables_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in-review'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "deliverables_type_check" CHECK (("type" = ANY (ARRAY['podcast'::"text", 'short-video'::"text", 'long-video'::"text", 'course'::"text", 'cover'::"text", 'book'::"text", 'branding'::"text", 'logo'::"text", 'web'::"text", 'wordpress'::"text", 'typography'::"text"])))
);


ALTER TABLE "public"."deliverables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EGP'::"text" NOT NULL,
    "expense_date" "date" NOT NULL,
    "payment_method" "text",
    "receipt_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "expenses_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "account_number" "text",
    "bank_name" "text",
    "initial_balance" numeric DEFAULT 0 NOT NULL,
    "current_balance" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'EGP'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "financial_accounts_type_check" CHECK (("type" = ANY (ARRAY['bank'::"text", 'digital_wallet'::"text", 'cash'::"text", 'investment'::"text"])))
);


ALTER TABLE "public"."financial_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_number" character varying(50) NOT NULL,
    "project_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EGP'::"text" NOT NULL,
    "issued_date" "date" NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "description" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "invoices_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'paid'::"text", 'overdue'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "date" "date",
    "status" "text" DEFAULT 'in-progress'::"text" NOT NULL,
    "budget" numeric,
    "deliverable_ids" "uuid"[],
    CONSTRAINT "milestones_status_check" CHECK (("status" = ANY (ARRAY['done'::"text", 'in-progress'::"text", 'at-risk'::"text"])))
);


ALTER TABLE "public"."milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "amount" numeric NOT NULL,
    "pay_date" "date" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text",
    "payment_method" "text",
    "status" "text",
    "milestone_id" "uuid",
    "attachment_url" "text",
    "currency" "text" DEFAULT 'EGP'::"text",
    "exchange_rate" numeric,
    CONSTRAINT "payments_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payments"."type" IS 'The type of transaction, e.g., ''income'' or ''expense''.';



COMMENT ON COLUMN "public"."payments"."payment_method" IS 'The method of payment, e.g., ''bank_transfer'', ''credit_card'', ''cash'', ''paypal''.';



COMMENT ON COLUMN "public"."payments"."status" IS 'The status of the payment, e.g., ''pending'', ''paid'', ''overdue''.';



COMMENT ON COLUMN "public"."payments"."milestone_id" IS 'The milestone associated with this payment.';



COMMENT ON COLUMN "public"."payments"."attachment_url" IS 'URL of the payment attachment (e.g., invoice).';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "text",
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_attributes" (
    "project_id" "uuid" NOT NULL,
    "account" "text",
    "client_name" "text",
    "service" "text",
    "department" "text",
    "service_batch" "text",
    "paid" numeric,
    "remaining" numeric,
    "added_costs" numeric,
    "profit" numeric,
    "status" "text",
    "closed" boolean,
    "notes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text"
);


ALTER TABLE "public"."project_attributes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_statuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "icon" character varying(50),
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "company_member_id" "uuid" NOT NULL,
    "project_role" character varying(50) DEFAULT 'member'::character varying NOT NULL,
    "project_status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "joined_project_date" "date" DEFAULT CURRENT_DATE,
    "left_project_date" "date",
    "project_notes" "text",
    "project_hourly_rate" numeric(10,2),
    "allocated_hours" integer,
    "actual_hours" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_team_members_project_role_check" CHECK ((("project_role")::"text" = ANY ((ARRAY['project_manager'::character varying, 'team_lead'::character varying, 'designer'::character varying, 'developer'::character varying, 'editor'::character varying, 'animator'::character varying, 'video_editor'::character varying, 'audio_engineer'::character varying, 'copywriter'::character varying, 'researcher'::character varying, 'tester'::character varying, 'member'::character varying])::"text"[]))),
    CONSTRAINT "project_team_members_project_status_check" CHECK ((("project_status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'completed'::character varying, 'on_leave'::character varying, 'replaced'::character varying])::"text"[])))
);


ALTER TABLE "public"."project_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid",
    "name" "text" NOT NULL,
    "total" numeric DEFAULT 0 NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_id" "uuid",
    "image_url" "text",
    "created_by" "uuid",
    "currency" "text" DEFAULT 'EGP'::"text",
    CONSTRAINT "projects_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."project_team_view" AS
 SELECT "ptm"."id",
    "ptm"."project_id",
    "ptm"."company_member_id",
    "ptm"."project_role",
    "ptm"."project_status",
    "ptm"."joined_project_date",
    "ptm"."left_project_date",
    "ptm"."project_notes",
    "ptm"."project_hourly_rate",
    "ptm"."allocated_hours",
    "ptm"."actual_hours",
    "ptm"."created_at",
    "ptm"."updated_at",
    "ctm"."name" AS "member_name",
    "ctm"."first_name",
    "ctm"."last_name",
    "ctm"."email",
    "ctm"."phone",
    "ctm"."avatar_url",
    "ctm"."role" AS "company_role",
    "ctm"."status" AS "company_status",
    "p"."name" AS "project_name",
    "pr"."name" AS "project_role_name",
    "pr"."description" AS "project_role_description",
    "pr"."color" AS "project_role_color",
    "ps"."name" AS "project_status_name",
    "ps"."description" AS "project_status_description",
    "ps"."color" AS "project_status_color",
    "ps"."icon" AS "project_status_icon"
   FROM (((("public"."project_team_members" "ptm"
     JOIN "public"."company_team_members" "ctm" ON (("ptm"."company_member_id" = "ctm"."id")))
     JOIN "public"."projects" "p" ON (("ptm"."project_id" = "p"."id")))
     LEFT JOIN "public"."project_roles" "pr" ON ((("ptm"."project_role")::"text" = ("pr"."name")::"text")))
     LEFT JOIN "public"."project_statuses" "ps" ON ((("ptm"."project_status")::"text" = ("ps"."name")::"text")));


ALTER VIEW "public"."project_team_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."revenues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EGP'::"text" NOT NULL,
    "revenue_date" "date" NOT NULL,
    "description" "text",
    "invoice_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "revenues_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."revenues" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account_transfers"
    ADD CONSTRAINT "account_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deliverables"
    ADD CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_accounts"
    ADD CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_attributes"
    ADD CONSTRAINT "project_attributes_pkey" PRIMARY KEY ("project_id");



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_statuses"
    ADD CONSTRAINT "project_statuses_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."project_statuses"
    ADD CONSTRAINT "project_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_team_members"
    ADD CONSTRAINT "project_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_team_members"
    ADD CONSTRAINT "project_team_members_project_id_company_member_id_key" UNIQUE ("project_id", "company_member_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenues"
    ADD CONSTRAINT "revenues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_account_transfers_date" ON "public"."account_transfers" USING "btree" ("transfer_date");



CREATE INDEX "idx_account_transfers_from_account" ON "public"."account_transfers" USING "btree" ("from_account_id");



CREATE INDEX "idx_account_transfers_to_account" ON "public"."account_transfers" USING "btree" ("to_account_id");



CREATE INDEX "idx_categories_project" ON "public"."categories" USING "btree" ("project_id");



CREATE INDEX "idx_deliverables_project" ON "public"."deliverables" USING "btree" ("project_id");



CREATE INDEX "idx_expenses_category" ON "public"."expenses" USING "btree" ("category");



CREATE INDEX "idx_expenses_date" ON "public"."expenses" USING "btree" ("expense_date");



CREATE INDEX "idx_financial_accounts_currency" ON "public"."financial_accounts" USING "btree" ("currency");



CREATE INDEX "idx_financial_accounts_type" ON "public"."financial_accounts" USING "btree" ("type");



CREATE INDEX "idx_invoices_client_id" ON "public"."invoices" USING "btree" ("client_id");



CREATE INDEX "idx_invoices_due_date" ON "public"."invoices" USING "btree" ("due_date");



CREATE INDEX "idx_invoices_project_id" ON "public"."invoices" USING "btree" ("project_id");



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "idx_milestones_project_date" ON "public"."milestones" USING "btree" ("project_id", "date");



CREATE INDEX "idx_payments_project_date" ON "public"."payments" USING "btree" ("project_id", "pay_date");



CREATE INDEX "idx_project_attributes_project_id" ON "public"."project_attributes" USING "btree" ("project_id");



CREATE INDEX "idx_project_team_members_company_member_id" ON "public"."project_team_members" USING "btree" ("company_member_id");



CREATE INDEX "idx_project_team_members_joined_project_date" ON "public"."project_team_members" USING "btree" ("joined_project_date");



CREATE INDEX "idx_project_team_members_project_id" ON "public"."project_team_members" USING "btree" ("project_id");



CREATE INDEX "idx_project_team_members_project_role" ON "public"."project_team_members" USING "btree" ("project_role");



CREATE INDEX "idx_project_team_members_project_status" ON "public"."project_team_members" USING "btree" ("project_status");



CREATE INDEX "idx_revenues_date" ON "public"."revenues" USING "btree" ("revenue_date");



CREATE INDEX "idx_revenues_source" ON "public"."revenues" USING "btree" ("source");



CREATE INDEX "idx_team_members_created_at" ON "public"."company_team_members" USING "btree" ("created_at");



CREATE INDEX "idx_team_members_email" ON "public"."company_team_members" USING "btree" ("email");



CREATE INDEX "idx_team_members_project" ON "public"."company_team_members" USING "btree" ("project_id");



CREATE INDEX "idx_team_members_role" ON "public"."company_team_members" USING "btree" ("role");



CREATE INDEX "idx_team_members_status" ON "public"."company_team_members" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trg_set_project_owner_id" BEFORE INSERT ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_owner_id"();



CREATE OR REPLACE TRIGGER "update_custom_roles_updated_at" BEFORE UPDATE ON "public"."custom_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_expenses_updated_at" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_financial_accounts_updated_at" BEFORE UPDATE ON "public"."financial_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_project_attributes_updated_at" BEFORE UPDATE ON "public"."project_attributes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_project_roles_updated_at" BEFORE UPDATE ON "public"."project_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_project_statuses_updated_at" BEFORE UPDATE ON "public"."project_statuses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_project_team_members_updated_at" BEFORE UPDATE ON "public"."project_team_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_revenues_updated_at" BEFORE UPDATE ON "public"."revenues" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_team_members_updated_at" BEFORE UPDATE ON "public"."company_team_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."account_transfers"
    ADD CONSTRAINT "account_transfers_from_account_fkey" FOREIGN KEY ("from_account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."account_transfers"
    ADD CONSTRAINT "account_transfers_to_account_fkey" FOREIGN KEY ("to_account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliverables"
    ADD CONSTRAINT "deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliverables"
    ADD CONSTRAINT "fk_deliverables_owner" FOREIGN KEY ("owner_id") REFERENCES "public"."company_team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_attributes"
    ADD CONSTRAINT "project_attributes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_team_members"
    ADD CONSTRAINT "project_team_members_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "public"."company_team_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_team_members"
    ADD CONSTRAINT "project_team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."revenues"
    ADD CONSTRAINT "revenues_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_team_members"
    ADD CONSTRAINT "team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



CREATE POLICY "Allow owner update projects" ON "public"."projects" FOR UPDATE USING (("auth"."uid"() = "owner_id")) WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Public clients are viewable by everyone." ON "public"."clients" FOR SELECT USING (true);



CREATE POLICY "Public projects are viewable by everyone." ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Users can delete project attributes" ON "public"."project_attributes" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete their own clients." ON "public"."clients" FOR DELETE USING (true);



CREATE POLICY "Users can delete their own projects" ON "public"."projects" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can insert project attributes" ON "public"."project_attributes" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert their own clients." ON "public"."clients" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can manage categories for their own projects" ON "public"."categories" TO "authenticated" USING ((( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "categories"."project_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "categories"."project_id")) = "auth"."uid"()));



CREATE POLICY "Users can update project attributes" ON "public"."project_attributes" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update their own clients." ON "public"."clients" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own projects" ON "public"."projects" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can view project attributes" ON "public"."project_attributes" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "allow_authenticated_insert_on_projects" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "allow_authenticated_inserts" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow_owner_insert_on_project_attributes" ON "public"."project_attributes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_attributes"."project_id")) = "auth"."uid"()));



CREATE POLICY "allow_owner_update_on_project_attributes" ON "public"."project_attributes" FOR UPDATE TO "authenticated" USING ((( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_attributes"."project_id")) = "auth"."uid"()));



CREATE POLICY "allow_owner_update_on_projects" ON "public"."projects" FOR UPDATE TO "authenticated" USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "cat_delete_own" ON "public"."categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "categories"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "cat_insert_own" ON "public"."categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "categories"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "cat_select_own" ON "public"."categories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "categories"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "cat_update_own" ON "public"."categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "categories"."project_id") AND ("p"."owner_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "categories"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "dev_read_categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "mile_delete_own" ON "public"."milestones" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "milestones"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "mile_insert_own" ON "public"."milestones" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "milestones"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "mile_select_own" ON "public"."milestones" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "milestones"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "mile_update_own" ON "public"."milestones" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "milestones"."project_id") AND ("p"."owner_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "milestones"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "pay_delete_own" ON "public"."payments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "payments"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "pay_insert_own" ON "public"."payments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "payments"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "pay_select_own" ON "public"."payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "payments"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



CREATE POLICY "pay_update_own" ON "public"."payments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "payments"."project_id") AND ("p"."owner_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "payments"."project_id") AND ("p"."owner_id" = "auth"."uid"())))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_attributes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read project_attributes" ON "public"."project_attributes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read_project_attributes" ON "public"."project_attributes" FOR SELECT USING (true);



CREATE POLICY "users_insert_own_projects" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_project_team_members"("project_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_team_members"("project_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_team_members"("project_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_project_owner_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_project_owner_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_project_owner_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."account_transfers" TO "anon";
GRANT ALL ON TABLE "public"."account_transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."account_transfers" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."company_team_members" TO "anon";
GRANT ALL ON TABLE "public"."company_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."company_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."custom_roles" TO "anon";
GRANT ALL ON TABLE "public"."custom_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_roles" TO "service_role";



GRANT ALL ON TABLE "public"."deliverables" TO "anon";
GRANT ALL ON TABLE "public"."deliverables" TO "authenticated";
GRANT ALL ON TABLE "public"."deliverables" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."financial_accounts" TO "anon";
GRANT ALL ON TABLE "public"."financial_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."milestones" TO "anon";
GRANT ALL ON TABLE "public"."milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."milestones" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_attributes" TO "anon";
GRANT ALL ON TABLE "public"."project_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."project_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."project_roles" TO "anon";
GRANT ALL ON TABLE "public"."project_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."project_roles" TO "service_role";



GRANT ALL ON TABLE "public"."project_statuses" TO "anon";
GRANT ALL ON TABLE "public"."project_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."project_statuses" TO "service_role";



GRANT ALL ON TABLE "public"."project_team_members" TO "anon";
GRANT ALL ON TABLE "public"."project_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."project_team_view" TO "anon";
GRANT ALL ON TABLE "public"."project_team_view" TO "authenticated";
GRANT ALL ON TABLE "public"."project_team_view" TO "service_role";



GRANT ALL ON TABLE "public"."revenues" TO "anon";
GRANT ALL ON TABLE "public"."revenues" TO "authenticated";
GRANT ALL ON TABLE "public"."revenues" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
