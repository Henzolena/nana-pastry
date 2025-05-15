#!/bin/bash
# Email Monitoring Script for Nana's Pastry
# This script analyzes email sending logs and generates a simple report

# Configuration
LOG_FILE="/var/log/nodemailer.log"  # Adjust to your actual log path
EMAIL_LIMIT_HOURLY=500
EMAIL_LIMIT_DAILY=2000
REPORT_EMAIL="admin@nanapastry.com"  # Where to send the report
DATE=$(date +"%Y-%m-%d")

echo "========================================"
echo "Nana's Pastry Email Monitoring Report"
echo "Date: $DATE"
echo "========================================"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "Error: Log file not found at $LOG_FILE"
    exit 1
fi

# Get email counts
TOTAL_TODAY=$(grep -c "$(date +"%Y-%m-%d")" "$LOG_FILE")
TOTAL_HOUR=$(grep -c "$(date +"%Y-%m-%d %H:")" "$LOG_FILE")
FAILED_TODAY=$(grep "$(date +"%Y-%m-%d")" "$LOG_FILE" | grep -c "ERROR")
SUCCESS_RATE=$(echo "scale=2; (($TOTAL_TODAY-$FAILED_TODAY) / $TOTAL_TODAY) * 100" | bc)

# Get hourly breakdown
echo "Hourly Email Sending (Last 24 hours):"
for i in {23..0}; do
    HOUR=$(date -v-${i}H +"%Y-%m-%d %H")
    COUNT=$(grep -c "$HOUR" "$LOG_FILE")
    HOUR_DISPLAY=$(date -v-${i}H +"%H:00")
    echo "  $HOUR_DISPLAY: $COUNT emails"
    
    # Alert if close to hourly limit
    if [ "$COUNT" -gt $(($EMAIL_LIMIT_HOURLY * 80 / 100)) ]; then
        echo "  ⚠️ WARNING: Approaching hourly limit ($COUNT/$EMAIL_LIMIT_HOURLY)"
    fi
done

echo ""
echo "Summary:"
echo "  Total emails sent today: $TOTAL_TODAY/$EMAIL_LIMIT_DAILY"
echo "  Emails sent in the last hour: $TOTAL_HOUR/$EMAIL_LIMIT_HOURLY"
echo "  Failed emails today: $FAILED_TODAY"
echo "  Success rate: $SUCCESS_RATE%"

# Check for rate limit warnings
if [ "$TOTAL_TODAY" -gt $(($EMAIL_LIMIT_DAILY * 80 / 100)) ]; then
    echo "⚠️ WARNING: Approaching daily sending limit"
fi

if [ "$TOTAL_HOUR" -gt $(($EMAIL_LIMIT_HOURLY * 80 / 100)) ]; then
    echo "⚠️ WARNING: Approaching hourly sending limit"
fi

# Most common error types
echo ""
echo "Common Error Types:"
grep "ERROR" "$LOG_FILE" | grep "$(date +"%Y-%m-%d")" | awk -F"ERROR: " '{print $2}' | sort | uniq -c | sort -nr | head -5

# Recipient domains statistics
echo ""
echo "Top Recipient Domains:"
grep "$(date +"%Y-%m-%d")" "$LOG_FILE" | grep -o '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]\{2,\}' | awk -F@ '{print $2}' | sort | uniq -c | sort -nr | head -10

echo ""
echo "Report generated on $(date)"
echo "For detailed email deliverability guidance, see EMAIL-DELIVERABILITY.md"

# Optional: Send this report by email
# mail -s "Nana's Pastry Email Monitor Report $DATE" "$REPORT_EMAIL" < /tmp/email-report.txt

exit 0
