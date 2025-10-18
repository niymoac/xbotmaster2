
-- ============================================================================
-- XBotMaster: Twitter/X Bot Otomasyon Platformu - Veritabanı Şeması
-- ============================================================================

-- 1. TWITTER_ACCOUNTS - X Hesap Yönetimi
CREATE TABLE twitter_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    encrypted_session_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_twitter_accounts_user_id ON twitter_accounts(user_id);
CREATE INDEX idx_twitter_accounts_username ON twitter_accounts(username);
CREATE INDEX idx_twitter_accounts_is_active ON twitter_accounts(is_active);

ALTER TABLE twitter_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY twitter_accounts_select_policy ON twitter_accounts
    FOR SELECT USING (user_id = uid());

CREATE POLICY twitter_accounts_insert_policy ON twitter_accounts
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY twitter_accounts_update_policy ON twitter_accounts
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY twitter_accounts_delete_policy ON twitter_accounts
    FOR DELETE USING (user_id = uid());

-- 2. SUBSCRIPTIONS - Abonelik Planları
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50),
    daily_limit INTEGER DEFAULT 100,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_policy ON subscriptions
    FOR SELECT USING (user_id = uid());

CREATE POLICY subscriptions_insert_policy ON subscriptions
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY subscriptions_update_policy ON subscriptions
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY subscriptions_delete_policy ON subscriptions
    FOR DELETE USING (user_id = uid());

-- 3. BOT_JOBS - Bot İşlem Yönetimi
CREATE TABLE bot_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('like_posts', 'follow_users', 'ai_comment', 'mutual_follow_report', 'like_comments', 'ai_reply_comments')),
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'completed_with_failures', 'retrying', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    results JSONB DEFAULT '{"successful_links": [], "failed_links": [], "retry_results": []}',
    error_details JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    retry_enabled BOOLEAN DEFAULT true,
    device_id VARCHAR(255),
    session_id BIGINT,
    credit_used INTEGER DEFAULT 0,
    celery_task_id VARCHAR(255),
    admin_retry_initiated_by BIGINT,
    admin_retry_initiated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bot_jobs_user_id ON bot_jobs(user_id);
CREATE INDEX idx_bot_jobs_account_id ON bot_jobs(account_id);
CREATE INDEX idx_bot_jobs_status ON bot_jobs(status);
CREATE INDEX idx_bot_jobs_created_at ON bot_jobs(created_at);
CREATE INDEX idx_bot_jobs_device_id ON bot_jobs(device_id);
CREATE INDEX idx_bot_jobs_session_id ON bot_jobs(session_id);

ALTER TABLE bot_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY bot_jobs_select_policy ON bot_jobs
    FOR SELECT USING (user_id = uid());

CREATE POLICY bot_jobs_insert_policy ON bot_jobs
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY bot_jobs_update_policy ON bot_jobs
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY bot_jobs_delete_policy ON bot_jobs
    FOR DELETE USING (user_id = uid());

-- 4. FAILED_LINKS - Başarısız Linkler
CREATE TABLE failed_links (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    url TEXT NOT NULL,
    error_type VARCHAR(100),
    error_category VARCHAR(50) CHECK (error_category IN ('rate_limit', 'network_error', 'invalid_url', 'no_permission', 'deleted', 'other')),
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    admin_retry_requested BOOLEAN DEFAULT false,
    admin_retry_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_failed_links_job_id ON failed_links(job_id);
CREATE INDEX idx_failed_links_user_id ON failed_links(user_id);
CREATE INDEX idx_failed_links_error_category ON failed_links(error_category);
CREATE INDEX idx_failed_links_created_at ON failed_links(created_at);

ALTER TABLE failed_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY failed_links_select_policy ON failed_links
    FOR SELECT USING (user_id = uid());

CREATE POLICY failed_links_insert_policy ON failed_links
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY failed_links_update_policy ON failed_links
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY failed_links_delete_policy ON failed_links
    FOR DELETE USING (user_id = uid());

-- 5. ACTIVITIES - Kullanıcı Aktiviteleri
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT,
    activity_type VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50),
    device_id VARCHAR(255),
    session_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_job_id ON activities(job_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_device_id ON activities(device_id);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY activities_select_policy ON activities
    FOR SELECT USING (user_id = uid());

CREATE POLICY activities_insert_policy ON activities
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY activities_update_policy ON activities
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY activities_delete_policy ON activities
    FOR DELETE USING (user_id = uid());

-- 6. ACTIVITY_LOGS - Detaylı İşlem Logları (60 Gün Retention)
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT,
    log_level VARCHAR(20) CHECK (log_level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    message TEXT,
    error_type VARCHAR(100),
    error_category VARCHAR(50) CHECK (error_category IN ('rate_limit', 'network_error', 'invalid_url', 'no_permission', 'deleted', 'other')),
    stack_trace TEXT,
    retry_attempt INTEGER DEFAULT 0,
    retry_success BOOLEAN,
    device_id VARCHAR(255),
    session_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_job_id ON activity_logs(job_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_error_category ON activity_logs(error_category);
CREATE INDEX idx_activity_logs_device_id ON activity_logs(device_id);

-- 60 gün sonra otomatik silme için trigger
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM activity_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_logs_select_policy ON activity_logs
    FOR SELECT USING (user_id = uid());

CREATE POLICY activity_logs_insert_policy ON activity_logs
    FOR INSERT WITH CHECK (user_id = uid());

-- 7. TELEGRAM_CHANNELS - Telegram Kanal Yönetimi
CREATE TABLE telegram_channels (
    id BIGSERIAL PRIMARY KEY,
    channel_name VARCHAR(255) NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    time_start TIME,
    time_end TIME,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT NOT NULL,
    is_admin_channel BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_channels_created_by ON telegram_channels(created_by);
CREATE INDEX idx_telegram_channels_is_admin_channel ON telegram_channels(is_admin_channel);
CREATE INDEX idx_telegram_channels_is_active ON telegram_channels(is_active);

ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY telegram_channels_select_policy ON telegram_channels
    FOR SELECT USING (created_by = uid() OR is_admin_channel = true);

CREATE POLICY telegram_channels_insert_policy ON telegram_channels
    FOR INSERT WITH CHECK (created_by = uid());

CREATE POLICY telegram_channels_update_policy ON telegram_channels
    FOR UPDATE USING (created_by = uid()) WITH CHECK (created_by = uid());

CREATE POLICY telegram_channels_delete_policy ON telegram_channels
    FOR DELETE USING (created_by = uid());

-- 8. COLLECTED_LINKS - Telegram'dan Toplanan Linkler
CREATE TABLE collected_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'skipped')),
    job_id BIGINT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collected_links_user_id ON collected_links(user_id);
CREATE INDEX idx_collected_links_channel_id ON collected_links(channel_id);
CREATE INDEX idx_collected_links_job_id ON collected_links(job_id);
CREATE INDEX idx_collected_links_status ON collected_links(status);
CREATE INDEX idx_collected_links_created_at ON collected_links(created_at);

ALTER TABLE collected_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY collected_links_select_policy ON collected_links
    FOR SELECT USING (user_id = uid());

CREATE POLICY collected_links_insert_policy ON collected_links
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY collected_links_update_policy ON collected_links
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY collected_links_delete_policy ON collected_links
    FOR DELETE USING (user_id = uid());

-- 9. PAYMENTS - Kripto Ödeme Geçmişi
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('nowpayments', 'web3_ethereum', 'web3_bsc', 'web3_base')),
    tx_hash VARCHAR(255),
    blockchain_network VARCHAR(50),
    session_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_select_policy ON payments
    FOR SELECT USING (user_id = uid());

CREATE POLICY payments_insert_policy ON payments
    FOR INSERT WITH CHECK (user_id = uid());

-- 10. DEVICE_TRACKING - Cihaz Takibi
CREATE TABLE device_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    last_ip VARCHAR(45),
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tracking_user_id ON device_tracking(user_id);
CREATE INDEX idx_device_tracking_device_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX idx_device_tracking_last_activity ON device_tracking(last_activity);

ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY device_tracking_select_policy ON device_tracking
    FOR SELECT USING (user_id = uid());

CREATE POLICY device_tracking_insert_policy ON device_tracking
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY device_tracking_update_policy ON device_tracking
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY device_tracking_delete_policy ON device_tracking
    FOR DELETE USING (user_id = uid());

-- 11. SESSION_AUDIT - Session Audit Logları
CREATE TABLE session_audit (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) CHECK (action IN ('login', 'logout', 'refresh', 'revoke')),
    ip_address VARCHAR(45),
    device_info JSONB DEFAULT '{}',
    reason VARCHAR(255),
    refresh_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_audit_session_id ON session_audit(session_id);
CREATE INDEX idx_session_audit_user_id ON session_audit(user_id);
CREATE INDEX idx_session_audit_created_at ON session_audit(created_at);

ALTER TABLE session_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY session_audit_select_policy ON session_audit
    FOR SELECT USING (user_id = uid());

CREATE POLICY session_audit_insert_policy ON session_audit
    FOR INSERT WITH CHECK (user_id = uid());

-- 12. ADMIN_MESSAGES - Admin Mesajları
CREATE TABLE admin_messages (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_messages_admin_id ON admin_messages(admin_id);
CREATE INDEX idx_admin_messages_user_id ON admin_messages(user_id);
CREATE INDEX idx_admin_messages_is_read ON admin_messages(is_read);
CREATE INDEX idx_admin_messages_created_at ON admin_messages(created_at);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_messages_select_policy ON admin_messages
    FOR SELECT USING (user_id = uid() OR admin_id = uid());

CREATE POLICY admin_messages_insert_policy ON admin_messages
    FOR INSERT WITH CHECK (admin_id = uid());

CREATE POLICY admin_messages_update_policy ON admin_messages
    FOR UPDATE USING (user_id = uid() OR admin_id = uid()) WITH CHECK (user_id = uid() OR admin_id = uid());

-- 13. ADMIN_RETRY_QUEUE - Admin Retry Workflow
CREATE TABLE admin_retry_queue (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    failed_links JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    results JSONB DEFAULT '{"successful_count": 0, "failed_count": 0, "retry_successful_count": 0}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_retry_queue_admin_id ON admin_retry_queue(admin_id);
CREATE INDEX idx_admin_retry_queue_user_id ON admin_retry_queue(user_id);
CREATE INDEX idx_admin_retry_queue_job_id ON admin_retry_queue(job_id);
CREATE INDEX idx_admin_retry_queue_status ON admin_retry_queue(status);
CREATE INDEX idx_admin_retry_queue_created_at ON admin_retry_queue(created_at);

ALTER TABLE admin_retry_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_retry_queue_select_policy ON admin_retry_queue
    FOR SELECT USING (admin_id = uid() OR user_id = uid());

CREATE POLICY admin_retry_queue_insert_policy ON admin_retry_queue
    FOR INSERT WITH CHECK (admin_id = uid());

CREATE POLICY admin_retry_queue_update_policy ON admin_retry_queue
    FOR UPDATE USING (admin_id = uid()) WITH CHECK (admin_id = uid());

-- 14. SYSTEM_ALERTS - Sistem Uyarıları
CREATE TABLE system_alerts (
    id BIGSERIAL PRIMARY KEY,
    severity VARCHAR(50) CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    title VARCHAR(255),
    message TEXT,
    user_id BIGINT,
    is_resolved BOOLEAN DEFAULT false,
    alert_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_alerts_user_id ON system_alerts(user_id);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_is_resolved ON system_alerts(is_resolved);
CREATE INDEX idx_system_alerts_created_at ON system_alerts(created_at);

ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_alerts_select_policy ON system_alerts
    FOR SELECT USING (user_id = uid() OR user_id IS NULL);

CREATE POLICY system_alerts_insert_policy ON system_alerts
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app20251017062718kefdhxwfol_v1_admin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app20251017062718kefdhxwfol_v1_admin_user;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE twitter_accounts IS 'X hesap yönetimi ve session depolama';
COMMENT ON TABLE subscriptions IS 'Kullanıcı abonelik planları ve limitleri';
COMMENT ON TABLE bot_jobs IS 'Bot işlem yönetimi, status tracking, retry mekanizması';
COMMENT ON TABLE failed_links IS 'Başarısız linkler, hata kategorilendirmesi, retry history';
COMMENT ON TABLE activities IS 'Kullanıcı aktiviteleri ve işlem geçmişi';
COMMENT ON TABLE activity_logs IS 'Detaylı işlem logları (60 gün retention)';
COMMENT ON TABLE telegram_channels IS 'Telegram kanal yönetimi (admin ve user channels)';
COMMENT ON TABLE collected_links IS 'Telegram\'dan toplanan linkler';
COMMENT ON TABLE payments IS 'Kripto ödeme geçmişi (NOWPayments, Web3)';
COMMENT ON TABLE device_tracking IS 'Cihaz takibi ve fingerprinting';
COMMENT ON TABLE session_audit IS 'Session audit logları (login, logout, refresh, revoke)';
COMMENT ON TABLE admin_messages IS 'Admin-user iletişimi';
COMMENT ON TABLE admin_retry_queue IS 'Admin retry workflow (job continuation)';
COMMENT ON TABLE system_alerts IS 'Sistem uyarıları ve notifications';
