-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'income', 'expense');
CREATE TYPE transaction_type AS ENUM ('transaction', 'normal', 'cn_freight', 'cn_thella', 'cn_commission', 'detail', 'statement', 'advance', 'balance', 'cnote', 'challan');
CREATE TYPE payment_mode AS ENUM ('due', 'to_pay', 'paid');

-- Master Configuration Tables

-- Country Setup
CREATE TABLE countries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unit Setup
CREATE TABLE units (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Description/Content Setup
CREATE TABLE content_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Godown Setup
CREATE TABLE godowns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    capacity NUMERIC(10,2),
    branch_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branch Setup
CREATE TABLE branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series Setup
CREATE TABLE series_setup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    branch_id UUID NOT NULL REFERENCES branches(id),
    document_type VARCHAR(50) NOT NULL,
    prefix VARCHAR(10),
    starting_number INTEGER NOT NULL,
    current_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, document_type)
);

-- Narration Setup
CREATE TABLE narrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Setup
CREATE TABLE agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    pan_number VARCHAR(50),
    pan_type VARCHAR(20),
    credit_limit NUMERIC(15,2),
    credit_days INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounting Configuration Tables

-- Account Groups
CREATE TABLE account_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type account_type NOT NULL,
    parent_id UUID REFERENCES account_groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledger Accounts
CREATE TABLE ledger_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    group_id UUID NOT NULL REFERENCES account_groups(id),
    allow_subledger BOOLEAN DEFAULT false,
    transaction_types transaction_type[],
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country_id UUID REFERENCES countries(id),
    phone VARCHAR(20),
    email VARCHAR(100),
    mobile VARCHAR(20),
    alternate_mobile VARCHAR(20),
    pan_number VARCHAR(50),
    pan_type VARCHAR(20),
    credit_limit NUMERIC(15,2),
    credit_days INTEGER,
    contact_person VARCHAR(100),
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(50),
    opening_balance NUMERIC(15,2) DEFAULT 0,
    current_balance NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub Ledgers
CREATE TABLE sub_ledgers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ledger_id UUID NOT NULL REFERENCES ledger_accounts(id),
    opening_balance NUMERIC(15,2) DEFAULT 0,
    current_balance NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BTD Configuration Tables

-- Places
CREATE TABLE places (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    state VARCHAR(100),
    country_id UUID REFERENCES countries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Place Groups
CREATE TABLE place_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Place Group Mappings
CREATE TABLE place_group_mappings (
    place_id UUID REFERENCES places(id),
    group_id UUID REFERENCES place_groups(id),
    PRIMARY KEY (place_id, group_id)
);

-- Trucks
CREATE TABLE trucks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100),
    capacity NUMERIC(10,2),
    owner_name VARCHAR(100),
    owner_contact VARCHAR(20),
    ledger_id UUID REFERENCES ledger_accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    contact VARCHAR(20),
    address TEXT,
    ledger_id UUID REFERENCES ledger_accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operational Tables

-- Billing/Invoice (CN/Bilti)
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bilti_no VARCHAR(50) NOT NULL UNIQUE,
    bilti_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    origin_id UUID NOT NULL REFERENCES places(id),
    destination_id UUID NOT NULL REFERENCES places(id),
    consignor_id UUID NOT NULL REFERENCES ledger_accounts(id),
    consignee_id UUID NOT NULL REFERENCES ledger_accounts(id),
    bill_to_id UUID NOT NULL REFERENCES ledger_accounts(id),
    payment_mode payment_mode NOT NULL,
    goods_value NUMERIC(15,2),
    packages INTEGER,
    weight NUMERIC(10,2),
    rate NUMERIC(10,2),
    rate_type VARCHAR(20), -- per_kg, per_pkg, fixed
    freight_amount NUMERIC(15,2),
    st_charge NUMERIC(15,2),
    thela_charge NUMERIC(15,2),
    discount NUMERIC(15,2),
    taxable_amount NUMERIC(15,2),
    vat_percent NUMERIC(5,2),
    vat_amount NUMERIC(15,2),
    total_amount NUMERIC(15,2),
    remarks TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items (VCTS)
CREATE TABLE invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    serial_no INTEGER NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    doc_type VARCHAR(50),
    other_doc_type VARCHAR(50),
    custom_office VARCHAR(100),
    supplier_name VARCHAR(100),
    party_invoice_no VARCHAR(50),
    invoice_miti DATE,
    goods_description TEXT,
    quantity INTEGER,
    unit_id UUID REFERENCES units(id),
    invoice_amount NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manifest
CREATE TABLE manifests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manifest_no VARCHAR(50) NOT NULL UNIQUE,
    manifest_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    origin_id UUID NOT NULL REFERENCES places(id),
    destination_id UUID NOT NULL REFERENCES places(id),
    unloading_place VARCHAR(100),
    truck_id UUID NOT NULL REFERENCES trucks(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    agent_id UUID REFERENCES agents(id),
    remarks TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manifest Items
CREATE TABLE manifest_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manifest_id UUID NOT NULL REFERENCES manifests(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    serial_no INTEGER NOT NULL,
    packages INTEGER,
    weight NUMERIC(10,2),
    amount NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freight Challan
CREATE TABLE freight_challans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challan_no VARCHAR(50) NOT NULL UNIQUE,
    challan_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    truck_id UUID NOT NULL REFERENCES trucks(id),
    origin_id UUID NOT NULL REFERENCES places(id),
    destination_id UUID NOT NULL REFERENCES places(id),
    freight_amount NUMERIC(15,2),
    tds_rate NUMERIC(5,2),
    tds_amount NUMERIC(15,2),
    charge_amount NUMERIC(15,2),
    advance_amount NUMERIC(15,2),
    balance_amount NUMERIC(15,2),
    remarks TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freight Challan Items
CREATE TABLE freight_challan_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    freight_challan_id UUID NOT NULL REFERENCES freight_challans(id),
    manifest_id UUID NOT NULL REFERENCES manifests(id),
    serial_no INTEGER NOT NULL,
    cn_count INTEGER,
    freight_amount NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receipt
CREATE TABLE goods_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    receipt_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    manifest_id UUID NOT NULL REFERENCES manifests(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    packages_received INTEGER,
    packages_short INTEGER DEFAULT 0,
    packages_excess INTEGER DEFAULT 0,
    godown_id UUID REFERENCES godowns(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Delivery
CREATE TABLE goods_deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delivery_no VARCHAR(50) NOT NULL UNIQUE,
    delivery_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    consignee_id UUID NOT NULL REFERENCES ledger_accounts(id),
    godown_id UUID REFERENCES godowns(id),
    packages_delivered INTEGER,
    rebate_amount NUMERIC(15,2),
    other_charges NUMERIC(15,2),
    net_amount NUMERIC(15,2),
    pod_received BOOLEAN DEFAULT false,
    cc_receipt BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statement
CREATE TABLE statements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    statement_no VARCHAR(50) NOT NULL UNIQUE,
    statement_miti DATE NOT NULL,
    due_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    party_id UUID NOT NULL REFERENCES ledger_accounts(id),
    party_type VARCHAR(20) NOT NULL, -- consignor/consignee
    account_balance NUMERIC(15,2),
    allow_other_party_cn BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statement Items
CREATE TABLE statement_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    statement_id UUID NOT NULL REFERENCES statements(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    serial_no INTEGER NOT NULL,
    series VARCHAR(50),
    taxable_amount NUMERIC(15,2),
    vat_amount NUMERIC(15,2),
    total_amount NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for master tables
CREATE INDEX idx_ledger_accounts_group_id ON ledger_accounts(group_id);
CREATE INDEX idx_sub_ledgers_ledger_id ON sub_ledgers(ledger_id);
CREATE INDEX idx_places_country_id ON places(country_id);
CREATE INDEX idx_trucks_ledger_id ON trucks(ledger_id);
CREATE INDEX idx_drivers_ledger_id ON drivers(ledger_id);

-- Voucher Management Tables

-- Voucher Types
CREATE TYPE voucher_type AS ENUM ('cash', 'bank', 'journal', 'post_dated');
CREATE TYPE voucher_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Vouchers
CREATE TABLE vouchers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voucher_no VARCHAR(50) NOT NULL UNIQUE,
    voucher_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    type voucher_type NOT NULL,
    status voucher_status NOT NULL DEFAULT 'draft',
    remarks TEXT,
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voucher Items
CREATE TABLE voucher_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voucher_id UUID NOT NULL REFERENCES vouchers(id),
    ledger_id UUID NOT NULL REFERENCES ledger_accounts(id),
    type VARCHAR(10) NOT NULL, -- debit/credit
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post Dated Cheques
CREATE TABLE post_dated_cheques (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voucher_id UUID NOT NULL REFERENCES vouchers(id),
    cheque_no VARCHAR(50) NOT NULL,
    cheque_miti DATE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- pending/cleared/bounced
    cleared_miti DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Due Management Tables

-- Due Entry
CREATE TABLE due_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entry_no VARCHAR(50) NOT NULL UNIQUE,
    entry_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    party_id UUID NOT NULL REFERENCES ledger_accounts(id),
    amount NUMERIC(15,2) NOT NULL,
    due_miti DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- pending/received/overdue
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Due Entry Items
CREATE TABLE due_entry_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    due_entry_id UUID NOT NULL REFERENCES due_entries(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Due Receipt
CREATE TABLE due_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    receipt_miti DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    due_entry_id UUID NOT NULL REFERENCES due_entries(id),
    amount_received NUMERIC(15,2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    reference_no VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Tables

-- Company Settings
CREATE TABLE company_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    pan_no VARCHAR(50),
    logo_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VAT Settings
CREATE TABLE vat_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vat_percent NUMERIC(5,2) NOT NULL,
    effective_from DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Print Settings
CREATE TABLE print_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    template_path TEXT NOT NULL,
    header_text TEXT,
    footer_text TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles and Permissions
CREATE TABLE roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Create indexes for voucher tables
CREATE INDEX idx_vouchers_branch_id ON vouchers(branch_id);
CREATE INDEX idx_voucher_items_voucher_id ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_ledger_id ON voucher_items(ledger_id);
CREATE INDEX idx_post_dated_cheques_voucher_id ON post_dated_cheques(voucher_id);

-- Create indexes for due management tables
CREATE INDEX idx_due_entries_branch_id ON due_entries(branch_id);
CREATE INDEX idx_due_entries_party_id ON due_entries(party_id);
CREATE INDEX idx_due_entry_items_due_entry_id ON due_entry_items(due_entry_id);
CREATE INDEX idx_due_entry_items_invoice_id ON due_entry_items(invoice_id);
CREATE INDEX idx_due_receipts_branch_id ON due_receipts(branch_id);
CREATE INDEX idx_due_receipts_due_entry_id ON due_receipts(due_entry_id);

-- User Management Tables

-- Users
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mobile VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Branch Access
CREATE TABLE user_branch_access (
    user_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    PRIMARY KEY (user_id, branch_id)
);

-- Client Portal Users
CREATE TABLE client_portal_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Backup Logs
CREATE TABLE backup_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    backup_path TEXT NOT NULL,
    backup_size BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user management tables
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_client_portal_users_ledger_id ON client_portal_users(ledger_account_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_backup_logs_created_by ON backup_logs(created_by);

-- Create indexes for operational tables
CREATE INDEX idx_invoices_branch_id ON invoices(branch_id);
CREATE INDEX idx_invoices_consignor_id ON invoices(consignor_id);
CREATE INDEX idx_invoices_consignee_id ON invoices(consignee_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_manifests_branch_id ON manifests(branch_id);
CREATE INDEX idx_manifests_truck_id ON manifests(truck_id);
CREATE INDEX idx_manifest_items_manifest_id ON manifest_items(manifest_id);
CREATE INDEX idx_manifest_items_invoice_id ON manifest_items(invoice_id);
CREATE INDEX idx_freight_challans_branch_id ON freight_challans(branch_id);
CREATE INDEX idx_freight_challans_truck_id ON freight_challans(truck_id);
CREATE INDEX idx_freight_challan_items_challan_id ON freight_challan_items(freight_challan_id);
CREATE INDEX idx_goods_receipts_branch_id ON goods_receipts(branch_id);
CREATE INDEX idx_goods_receipts_manifest_id ON goods_receipts(manifest_id);
CREATE INDEX idx_goods_deliveries_branch_id ON goods_deliveries(branch_id);
CREATE INDEX idx_goods_deliveries_invoice_id ON goods_deliveries(invoice_id);
CREATE INDEX idx_statements_branch_id ON statements(branch_id);
CREATE INDEX idx_statements_party_id ON statements(party_id);
CREATE INDEX idx_statement_items_statement_id ON statement_items(statement_id);

-- Add foreign key constraints for created_by and approved_by in vouchers table
ALTER TABLE vouchers 
ADD CONSTRAINT fk_vouchers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
ADD CONSTRAINT fk_vouchers_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
