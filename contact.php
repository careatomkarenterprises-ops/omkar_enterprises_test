<?php
/* ===========================================
   OMNIKAR ENTERPRISES - CONTACT FORM HANDLER
   Version: 2.0 | Saves to Google Sheets + Email + Backup
   =========================================== */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ========== CONFIGURATION ==========
$CONFIG = [
    // 1. EMAIL SETTINGS
    'admin_email' => 'care@omkarservices.in',
    'company_name' => 'Omkar Enterprises',
    'company_phone' => '+91 922 639 3837',
    
    // 2. GOOGLE SHEETS SETTINGS (SheetDB)
    'sheetdb_api' => 'https://sheetdb.io/api/v1/YOUR_SHEET_ID_HERE',
    'sheetdb_api_key' => '', // Optional for free tier
    
    // 3. BACKUP SETTINGS
    'backup_to_file' => true,
    'backup_folder' => 'data_backups/',
    
    // 4. SECURITY SETTINGS
    'recaptcha_secret' => '', // Get from Google reCAPTCHA
    'allowed_origins' => ['https://omkarenterprises.com', 'http://localhost'],
    
    // 5. FORM SETTINGS
    'required_fields' => ['name', 'email', 'phone', 'subject', 'message'],
    'phone_length' => 10,
    'max_message_length' => 2000,
];

// ========== SECURITY HEADERS ==========
header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN'] ?? '*');
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// ========== VALIDATION FUNCTIONS ==========
function validate_input($data) {
    global $CONFIG;
    
    $errors = [];
    $clean_data = [];
    
    // Check required fields
    foreach ($CONFIG['required_fields'] as $field) {
        if (empty($_POST[$field])) {
            $errors[] = ucfirst($field) . " is required";
        }
    }
    
    // Validate email
    if (!empty($_POST['email'])) {
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email address";
        } else {
            $clean_data['email'] = $email;
        }
    }
    
    // Validate phone
    if (!empty($_POST['phone'])) {
        $phone = preg_replace('/[^0-9]/', '', $_POST['phone']);
        if (strlen($phone) < $CONFIG['phone_length']) {
            $errors[] = "Phone number must be at least " . $CONFIG['phone_length'] . " digits";
        } else {
            $clean_data['phone'] = $phone;
        }
    }
    
    // Sanitize other inputs
    $clean_data['name'] = htmlspecialchars(strip_tags($_POST['name'] ?? ''));
    $clean_data['subject'] = htmlspecialchars(strip_tags($_POST['subject'] ?? ''));
    $clean_data['investment'] = htmlspecialchars(strip_tags($_POST['investment'] ?? ''));
    
    // Validate message length
    if (!empty($_POST['message'])) {
        $message = htmlspecialchars(strip_tags($_POST['message']));
        if (strlen($message) > $CONFIG['max_message_length']) {
            $errors[] = "Message is too long (max " . $CONFIG['max_message_length'] . " characters)";
        } else {
            $clean_data['message'] = $message;
        }
    }
    
    // Check consent
    if (empty($_POST['consent'])) {
        $errors[] = "You must agree to the terms";
    }
    
    // Add timestamp
    $clean_data['timestamp'] = date('Y-m-d H:i:s');
    $clean_data['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $clean_data['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    return ['errors' => $errors, 'data' => $clean_data];
}

// ========== GOOGLE SHEETS FUNCTION ==========
function save_to_sheets($data) {
    global $CONFIG;
    
    $sheet_data = [
        'data' => [
            [
                'Timestamp' => $data['timestamp'],
                'FullName' => $data['name'],
                'Email' => $data['email'],
                'Phone' => $data['phone'],
                'Subject' => $data['subject'],
                'InvestmentRange' => $data['investment'] ?? 'Not specified',
                'Message' => $data['message'],
                'IPAddress' => $data['ip_address'],
                'Status' => 'New',
                'FollowUpDate' => '',
                'Notes' => ''
            ]
        ]
    ];
    
    $headers = [
        'Content-Type: application/json',
    ];
    
    if (!empty($CONFIG['sheetdb_api_key'])) {
        $headers[] = 'Authorization: Bearer ' . $CONFIG['sheetdb_api_key'];
    }
    
    $ch = curl_init($CONFIG['sheetdb_api']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($sheet_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($http_code === 201) {
        return ['success' => true, 'message' => 'Saved to Google Sheets'];
    } else {
        error_log("SheetDB Error $http_code: $response");
        return ['success' => false, 'message' => "SheetDB error: $http_code"];
    }
}

// ========== EMAIL FUNCTION ==========
function send_notification_email($data) {
    global $CONFIG;
    
    $to = $CONFIG['admin_email'];
    $subject = "New Contact Form: " . $data['subject'];
    
    // HTML Email Template
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #001F3F; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #001F3F; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Contact Form Submission</h2>
                <p>" . $CONFIG['company_name'] . "</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='field-label'>Name:</span> " . $data['name'] . "
                </div>
                <div class='field'>
                    <span class='field-label'>Email:</span> " . $data['email'] . "
                </div>
                <div class='field'>
                    <span class='field-label'>Phone:</span> " . $data['phone'] . "
                </div>
                <div class='field'>
                    <span class='field-label'>Subject:</span> " . $data['subject'] . "
                </div>
                <div class='field'>
                    <span class='field-label'>Investment Interest:</span> " . ($data['investment'] ?? 'Not specified') . "
                </div>
                <div class='field'>
                    <span class='field-label'>Message:</span><br>
                    " . nl2br($data['message']) . "
                </div>
                <div class='field'>
                    <span class='field-label'>Submitted:</span> " . $data['timestamp'] . "
                </div>
                <div class='field'>
                    <span class='field-label'>IP Address:</span> " . $data['ip_address'] . "
                </div>
            </div>
            <div class='footer'>
                <p>This email was generated automatically from the contact form on " . $CONFIG['company_name'] . " website.</p>
                <p>Phone: " . $CONFIG['company_phone'] . " | Email: " . $CONFIG['admin_email'] . "</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Headers for HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=utf-8" . "\r\n";
    $headers .= "From: " . $CONFIG['company_name'] . " <noreply@" . $_SERVER['HTTP_HOST'] . ">" . "\r\n";
    $headers .= "Reply-To: " . $data['email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Send email
    if (mail($to, $subject, $message, $headers)) {
        return ['success' => true, 'message' => 'Email sent successfully'];
    } else {
        return ['success' => false, 'message' => 'Failed to send email'];
    }
}

// ========== LOCAL BACKUP FUNCTION ==========
function save_local_backup($data) {
    global $CONFIG;
    
    if (!$CONFIG['backup_to_file']) {
        return ['success' => true, 'message' => 'Local backup disabled'];
    }
    
    // Create backup directory if it doesn't exist
    if (!is_dir($CONFIG['backup_folder'])) {
        mkdir($CONFIG['backup_folder'], 0755, true);
    }
    
    // Create daily backup file
    $backup_file = $CONFIG['backup_folder'] . 'contacts_' . date('Y-m-d') . '.json';
    
    // Read existing data
    $existing_data = [];
    if (file_exists($backup_file)) {
        $existing_content = file_get_contents($backup_file);
        $existing_data = json_decode($existing_content, true) ?? [];
    }
    
    // Add new entry
    $existing_data[] = $data;
    
    // Save to file
    if (file_put_contents($backup_file, json_encode($existing_data, JSON_PRETTY_PRINT))) {
        // Create monthly archive
        create_monthly_archive();
        return ['success' => true, 'message' => 'Local backup created'];
    } else {
        return ['success' => false, 'message' => 'Failed to create local backup'];
    }
}

function create_monthly_archive() {
    global $CONFIG;
    
    $monthly_file = $CONFIG['backup_folder'] . 'archive/contacts_' . date('Y-m') . '.json';
    $daily_pattern = $CONFIG['backup_folder'] . 'contacts_' . date('Y-m') . '-*.json';
    
    // Create archive directory
    $archive_dir = $CONFIG['backup_folder'] . 'archive/';
    if (!is_dir($archive_dir)) {
        mkdir($archive_dir, 0755, true);
    }
    
    // Get all daily files for this month
    $daily_files = glob($daily_pattern);
    $monthly_data = [];
    
    foreach ($daily_files as $file) {
        if ($content = file_get_contents($file)) {
            $daily_data = json_decode($content, true) ?? [];
            $monthly_data = array_merge($monthly_data, $daily_data);
        }
    }
    
    // Save monthly archive
    if (!empty($monthly_data)) {
        file_put_contents($monthly_file, json_encode($monthly_data, JSON_PRETTY_PRINT));
    }
}

// ========== SEND AUTO-RESPONSE ==========
function send_auto_response($data) {
    global $CONFIG;
    
    $to = $data['email'];
    $subject = "Thank you for contacting " . $CONFIG['company_name'];
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #001F3F; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .highlight { color: #D4AF37; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Thank You for Contacting Us</h2>
                <p>" . $CONFIG['company_name'] . "</p>
            </div>
            <div class='content'>
                <p>Dear " . $data['name'] . ",</p>
                
                <p>Thank you for reaching out to <span class='highlight'>" . $CONFIG['company_name'] . "</span>.</p>
                
                <p>We have received your inquiry regarding <strong>" . $data['subject'] . "</strong> and one of our relationship managers will contact you within <span class='highlight'>24 hours</span>.</p>
                
                <p><strong>Your Inquiry Details:</strong></p>
                <ul>
                    <li>Reference: CONT" . date('Ymd') . rand(100, 999) . "</li>
                    <li>Submitted: " . $data['timestamp'] . "</li>
                    <li>Subject: " . $data['subject'] . "</li>
                </ul>
                
                <p><strong>What to expect next:</strong></p>
                <ol>
                    <li>Initial contact within 24 hours</li>
                    <li>Confidential discussion of your investment goals</li>
                    <li>Review of structured agreement terms</li>
                    <li>Clear explanation of our investment process</li>
                </ol>
                
                <p>If you have any urgent questions, please call us directly at <span class='highlight'>" . $CONFIG['company_phone'] . "</span>.</p>
                
                <p>Best regards,<br>
                <strong>The " . $CONFIG['company_name'] . " Team</strong></p>
            </div>
            <div class='footer'>
                <p><strong>Important Disclaimer:</strong> " . $CONFIG['company_name'] . " enters into private loan agreements with individuals. This is NOT a bank deposit, NOT insured, NOT regulated by RBI/SEBI as a deposit-taking entity, and NOT a guaranteed return scheme. Capital is at risk. Returns depend on business performance. Past returns don't indicate future results. Consult your financial and legal advisors before proceeding.</p>
                <p>" . $CONFIG['company_name'] . " | " . $CONFIG['company_phone'] . " | " . $CONFIG['admin_email'] . "</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=utf-8" . "\r\n";
    $headers .= "From: " . $CONFIG['company_name'] . " <noreply@" . $_SERVER['HTTP_HOST'] . ">" . "\r\n";
    $headers .= "Reply-To: " . $CONFIG['admin_email'] . "\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// ========== MAIN EXECUTION ==========
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Validate input
$validation = validate_input($_POST);

if (!empty($validation['errors'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $validation['errors']]);
    exit;
}

$clean_data = $validation['data'];
$results = [];

try {
    // 1. Save to Google Sheets
    $sheet_result = save_to_sheets($clean_data);
    $results['sheets'] = $sheet_result;
    
    // 2. Send notification email to admin
    $email_result = send_notification_email($clean_data);
    $results['email'] = $email_result;
    
    // 3. Send auto-response to user
    $auto_response = send_auto_response($clean_data);
    $results['auto_response'] = $auto_response ? 'Sent' : 'Failed';
    
    // 4. Local backup
    $backup_result = save_local_backup($clean_data);
    $results['backup'] = $backup_result;
    
    // Check if any critical operation failed
    $critical_failures = [
        !$sheet_result['success'],
        !$email_result['success'],
        !$backup_result['success']
    ];
    
    if (in_array(true, $critical_failures, true)) {
        // Some operations failed, but form was still processed
        http_response_code(207); // Multi-status
        echo json_encode([
            'success' => true,
            'message' => 'Form submitted with some issues',
            'results' => $results,
            'reference' => 'CONT' . date('Ymd') . rand(100, 999)
        ]);
    } else {
        // All operations successful
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Form submitted successfully',
            'reference' => 'CONT' . date('Ymd') . rand(100, 999),
            'next_steps' => 'Our team will contact you within 24 hours'
        ]);
    }
    
} catch (Exception $e) {
    // Log error
    error_log("Contact form error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => 'Please try again or contact us directly'
    ]);
}
?>
