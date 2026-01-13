# School Fee Payment System Documentation

## Overview
This documentation covers the complete school fee payment system implemented for the School Management System (SMS). The system allows administrators to set up fees and students to make payments through Paystack integration.

## Features

### Admin Features
- **Fee Management**: Create, edit, and manage school fees by grade/class
- **Payment Records**: View all payment transactions and history
- **Payment Settings**: Configure Paystack API keys and webhook settings
- **Partial Payments**: Allow students to make partial payments with minimum amount settings
- **Receipt Generation**: Generate and manage payment receipts

### Student Features
- **Payment Dashboard**: View outstanding fees and make payments
- **Payment History**: Access complete payment transaction history
- **Receipt Downloads**: Download payment receipts
- **Partial Payment Support**: Make partial payments when allowed

## System Architecture

### Backend (Laravel)
- **Controllers**:
  - `Admin\FeeController`: Manages fee creation and administration
  - `Student\PaymentController`: Handles student payment operations
  - `SettingsController`: Manages Paystack configuration
  - `ReceiptController`: Handles receipt generation and downloads

- **Models**:
  - `Fee`: Fee structure and configurations
  - `Payment`: Payment transactions and records
  - `Settings`: System configuration storage

- **Services**:
  - `PaystackService`: Paystack payment gateway integration
  - `PaymentService`: Payment processing logic
  - `ReceiptService`: Receipt generation service

### Frontend (React/Inertia.js)
- **Admin Pages**:
  - Fee Management (`/admin/fees`)
  - Payment Records (`/admin/payments`)
  - Payment Settings (`/admin/settings/payments`)

- **Student Pages**:
  - Payment Dashboard (`/student/payments`)
  - Payment History (`/student/payments/history`)
  - Payment Success/Failed pages

## Installation & Setup

### 1. Database Migration
```bash
php artisan migrate
```

### 2. Paystack Configuration
1. Navigate to Admin → Settings → Payment Settings
2. Enter your Paystack credentials:
   - Public Key
   - Secret Key
   - Webhook Secret

### 3. Fee Setup
1. Go to Admin → Fee Management
2. Create fees with:
   - Fee name and description
   - Amount
   - Due date
   - Target classes/grades
   - Partial payment settings

## Usage Guide

### For Administrators

#### Creating Fees
1. Navigate to **Admin → Fee Management**
2. Click **"Add New Fee"**
3. Fill in fee details:
   - Name (e.g., "Tuition Fee - Term 1")
   - Amount in Naira
   - Fee type (tuition, transport, etc.)
   - Due date
   - Target classrooms
   - Partial payment options
4. Save the fee

#### Managing Payments
1. Go to **Admin → Payment Records**
2. View all payments with filtering options
3. Download payment reports
4. Generate receipts for students

#### Configuring Paystack
1. Access **Admin → Settings → Payment Settings**
2. Enter Paystack API credentials
3. Set webhook URL for payment notifications
4. Test the connection

### For Students

#### Making Payments
1. Login to student dashboard
2. Navigate to **Payments**
3. View outstanding fees
4. Click **"Pay Now"** for any fee
5. Enter payment amount (full or partial)
6. Complete payment via Paystack
7. Download receipt upon successful payment

#### Viewing Payment History
1. Go to **Payments → History**
2. View all payment transactions
3. Download receipts for completed payments
4. Check payment status and details

## API Endpoints

### Admin Routes
```
GET    /admin/fees                    - List all fees
POST   /admin/fees                    - Create new fee
GET    /admin/fees/{id}/edit         - Edit fee form
PUT    /admin/fees/{id}              - Update fee
DELETE /admin/fees/{id}              - Delete fee
GET    /admin/payments               - Payment records
GET    /admin/settings/payments      - Payment settings
POST   /admin/settings/payments      - Update settings
```

### Student Routes
```
GET    /student/payments             - Payment dashboard
GET    /student/payments/history     - Payment history
GET    /student/payments/fee/{id}    - Fee details
POST   /student/payments/initiate    - Initiate payment
GET    /student/payments/callback    - Payment callback
POST   /student/payments/verify      - Verify payment
```

### Receipt Routes
```
GET    /receipts/{id}                - View receipt
GET    /receipts/{id}/download       - Download receipt
```

## Database Schema

### Fees Table
```sql
- id (primary key)
- name (string)
- amount (decimal)
- type (enum: tuition, transport, etc.)
- description (text)
- due_date (date)
- academic_session_id (foreign key)
- term_id (foreign key)
- allow_partial_payment (boolean)
- minimum_amount (decimal, nullable)
- created_at, updated_at
```

### Payments Table
```sql
- id (primary key)
- student_id (foreign key)
- fee_id (foreign key)
- amount (decimal)
- transaction_reference (string)
- gateway_reference (string)
- status (enum: pending, completed, failed)
- payment_method (string)
- gateway_response (json)
- paid_at (timestamp, nullable)
- created_at, updated_at
```

### Fee_Classroom Pivot Table
```sql
- fee_id (foreign key)
- classroom_id (foreign key)
```

## Payment Flow

### 1. Payment Initiation
1. Student selects fee to pay
2. System generates transaction reference
3. Payment record created with 'pending' status
4. User redirected to Paystack checkout

### 2. Payment Processing
1. Student completes payment on Paystack
2. Paystack redirects to callback URL
3. System verifies payment with Paystack API
4. Payment status updated based on verification

### 3. Payment Completion
1. Successful payments marked as 'completed'
2. Receipt generated automatically
3. Student notified of successful payment
4. Admin can view payment in records

## Security Features

- **CSRF Protection**: All forms protected against CSRF attacks
- **Authorization**: Role-based access control for admin/student routes
- **Payment Verification**: Double verification with Paystack to prevent fraud
- **Secure API Keys**: Encrypted storage of Paystack credentials
- **Transaction Logging**: Complete audit trail of all payment activities

## Error Handling

### Common Errors
- **Payment Failed**: Network issues, insufficient funds, declined cards
- **Duplicate Payments**: Prevented through reference checking
- **Invalid Fees**: Validation prevents invalid fee amounts
- **Expired Sessions**: Automatic logout and re-authentication

### Error Pages
- Success page with payment confirmation
- Failed page with retry options
- 404 pages for invalid payment references
- Validation error messages

## Testing

### Running Tests
```bash
php artisan test --filter=PaymentSystemTest
```

### Test Coverage
- Fee creation and management
- Payment initiation and completion
- Receipt generation
- Access control and authorization
- API endpoint testing

## Troubleshooting

### Common Issues

1. **Paystack Connection Failed**
   - Check API keys in settings
   - Verify network connectivity
   - Ensure webhook URL is accessible

2. **Payments Not Updating**
   - Check webhook configuration
   - Verify webhook secret key
   - Review server logs for errors

3. **Receipt Generation Issues**
   - Check PDF library installation
   - Verify file permissions
   - Review storage configuration

### Support Contacts
- Technical Support: Contact your system administrator
- Payment Issues: Contact school finance office
- Paystack Issues: Contact Paystack support

## Version History

### v1.0.0 (Current)
- Complete fee management system
- Paystack payment integration
- Receipt generation
- Admin and student dashboards
- Partial payment support
- Payment history and records

## Future Enhancements

### Planned Features
- SMS notifications for payment reminders
- Email receipts
- Payment plan installments
- Multiple payment gateway support
- Mobile app integration
- Advanced reporting and analytics

### API Improvements
- RESTful API for mobile apps
- Webhook retry mechanisms
- Payment status webhooks
- Real-time payment notifications

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Author**: SMS Development Team
