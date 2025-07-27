# N8N Advanced Automation Setup Guide

## Environment Variables Required

### Supabase Configuration
```
SUPABASE_URL=https://vwhwufnckpqirxptwncw.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### N8N Webhook URLs (Set in Supabase Secrets)
```
N8N_CRM_AUTOMATION_WEBHOOK=https://your-n8n.app/webhook/crm-automation
N8N_EINVOICE_AUTOMATION_WEBHOOK=https://your-n8n.app/webhook/einvoice-automation
N8N_FINANCIAL_REPORTING_WEBHOOK=https://your-n8n.app/webhook/financial-reporting
N8N_TASK_MANAGEMENT_WEBHOOK=https://your-n8n.app/webhook/task-management
N8N_DATA_SYNC_WEBHOOK=https://your-n8n.app/webhook/data-sync
```

### External API Integration
```
SLACK_WEBHOOK_PATH=T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
VERIBAN_USERNAME=your_veriban_username
VERIBAN_PASSWORD=your_veriban_password
VERIBAN_SOAP_ENDPOINT=https://efaturatest.veriban.com.tr/EInvoiceService/EInvoice.svc
GOOGLE_DRIVE_INVOICE_FOLDER_ID=your_folder_id
WHATSAPP_API_TOKEN=your_whatsapp_business_token
ACCOUNTING_API_TOKEN=your_accounting_software_token
```

## Quick Setup Steps

1. **Import Workflows**: Import all 5 JSON files into n8n
2. **Configure Webhooks**: Set webhook URLs in Supabase secrets
3. **Set Environment Variables**: Add all required API tokens
4. **Enable Database Triggers**: Run the provided SQL migration
5. **Test Workflows**: Use the enhanced useN8nTrigger hook

## Workflow Triggers

- **CRM Automation**: Triggered on opportunity status changes
- **E-Invoice**: Triggered when proposals are accepted
- **Financial Reporting**: Daily at 8AM + manual triggers
- **Task Management**: Hourly checks + manual triggers
- **Data Sync**: Daily at 6AM + manual triggers

## Monitoring

All workflows log execution results to the `n8n_workflow_logs` table for monitoring and debugging.