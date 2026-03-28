const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Ensure bills directory exists
const billsDir = path.join(__dirname, '../../Bills');
if (!fs.existsSync(billsDir)) {
    fs.mkdirSync(billsDir, { recursive: true });
}

// Helper function to create date-wise folder
const getDateFolder = (date) => {
    const folderName = format(new Date(date), 'yyyy-MM-dd');
    const folderPath = path.join(billsDir, folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
};

// Generate bill HTML for saving
const generateBillHTML = (order, restaurantInfo, billType) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWithParcel = order.isParcel ? subtotal + 10 : subtotal;
    const balanceDue = totalWithParcel - (order.prepaidAmount || 0);

    if (billType === 'thermal') {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bill - Table ${order.tableNumber}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .restaurant-details {
            font-size: 10px;
            color: #666;
        }
        .bill-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
            text-align: center;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .items {
            margin: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-weight: bold;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
        }
        .payment-details {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px dotted #000;
        }
        @media print {
            @page {
                margin: 0;
                size: 80mm auto;
            }
            body {
                margin: 0;
                padding: 5mm;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">${restaurantInfo.name}</div>
        <div class="restaurant-details">${restaurantInfo.address || ''}</div>
        <div class="restaurant-details">Ph: ${restaurantInfo.phone || ''}</div>
        ${restaurantInfo.gst ? `<div class="restaurant-details">GST: ${restaurantInfo.gst}</div>` : ''}
    </div>
    
    <div class="bill-title">TAX INVOICE</div>
    
    <div class="info-row">
        <span>Bill No: ${order._id.slice(-8)}</span>
        <span>Table: ${order.tableNumber}</span>
    </div>
    <div class="info-row">
        <span>Date: ${format(new Date(order.orderTime), 'dd/MM/yyyy')}</span>
        <span>Time: ${format(new Date(order.orderTime), 'hh:mm a')}</span>
    </div>
    ${order.customerName && order.customerName !== 'Guest' ? `
    <div class="info-row">
        <span>Customer: ${order.customerName}</span>
        <span>Guests: ${order.customerCount}</span>
    </div>
    ` : ''}
    
    <div class="items">
        ${order.items.map(item => `
            <div class="item-row">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="info-row">
        <span>Subtotal:</span>
        <span>₹${subtotal}</span>
    </div>
    ${order.isParcel ? `
    <div class="info-row">
        <span>Parcel Charge:</span>
        <span>₹10</span>
    </div>
    ` : ''}
    ${order.prepaidAmount > 0 ? `
    <div class="info-row">
        <span>Prepaid:</span>
        <span>-₹${order.prepaidAmount}</span>
    </div>
    ` : ''}
    <div class="total-row">
        <span>TOTAL:</span>
        <span>₹${balanceDue}</span>
    </div>
    
    <div class="payment-details">
        <div class="info-row">
            <span>Payment Mode:</span>
            <span>${order.paymentType}</span>
        </div>
        <div class="info-row">
            <span>Payment Status:</span>
            <span>${order.status === 'Paid' ? 'Paid' : 'Pending'}</span>
        </div>
    </div>
    
    <div class="footer">
        <div>Thank you for dining with us!</div>
        <div>Please visit again</div>
        <div>★★★★★</div>
        <div style="margin-top: 5px; font-size: 8px;">** This is a computer generated bill **</div>
    </div>
</body>
</html>`;
    } else {
        // Standard Bill
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bill - Table ${order.tableNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .restaurant-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .restaurant-details {
            font-size: 12px;
            color: #666;
        }
        .bill-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            color: #444;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 5px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .items-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .total-section {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            font-size: 16px;
        }
        .grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
            border-top: 2px solid #ddd;
            margin-top: 10px;
            padding-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">${restaurantInfo.name}</div>
        <div class="restaurant-details">${restaurantInfo.address || ''}</div>
        <div class="restaurant-details">Phone: ${restaurantInfo.phone || ''} | Email: ${restaurantInfo.email || ''}</div>
        ${restaurantInfo.gst ? `<div class="restaurant-details">GST No: ${restaurantInfo.gst}</div>` : ''}
    </div>
    
    <div class="bill-title">RESTAURANT BILL / INVOICE</div>
    
    <div class="info-grid">
        <div class="info-item">
            <span class="info-label">Bill Number:</span>
            <span>${order._id.slice(-8)}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Table Number:</span>
            <span>${order.tableNumber}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Date:</span>
            <span>${format(new Date(order.orderTime), 'dd/MM/yyyy')}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Time:</span>
            <span>${format(new Date(order.orderTime), 'hh:mm:ss a')}</span>
        </div>
        ${order.customerName && order.customerName !== 'Guest' ? `
        <div class="info-item">
            <span class="info-label">Customer Name:</span>
            <span>${order.customerName}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Number of Guests:</span>
            <span>${order.customerCount}</span>
        </div>
        ` : ''}
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Total (₹)</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map((item, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.name} ${item.isVeg ? '🟢' : '🔴'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${subtotal}</span>
        </div>
        ${order.isParcel ? `
        <div class="total-row">
            <span>Parcel Charge:</span>
            <span>₹10</span>
        </div>
        ` : ''}
        ${order.prepaidAmount > 0 ? `
        <div class="total-row">
            <span>Prepaid Amount:</span>
            <span>-₹${order.prepaidAmount}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>₹${balanceDue}</span>
        </div>
    </div>
    
    <div class="info-grid" style="margin-top: 20px;">
        <div class="info-item">
            <span class="info-label">Payment Type:</span>
            <span>${order.paymentType}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Payment Status:</span>
            <span>${order.status === 'Paid' ? 'Paid ✓' : 'Pending'}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for choosing ${restaurantInfo.name}!</p>
        <p>We hope you enjoyed your meal. Please visit again soon!</p>
        <p>** This is a computer generated invoice **</p>
        <p style="margin-top: 10px;">For feedback, please contact: ${restaurantInfo.phone || ''}</p>
    </div>
</body>
</html>`;
    }
};

// @desc    Save bill to file
// @route   POST /api/bills/save
exports.saveBill = async (req, res) => {
    try {
        const { order, billType, restaurantInfo } = req.body;
        
        if (!order || !order._id) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        // Get date folder
        const dateFolder = getDateFolder(new Date());
        
        // Create filename with timestamp
        const timestamp = format(new Date(), 'HH-mm-ss');
        const billTypeName = billType === 'thermal' ? 'Thermal' : 'Standard';
        const fileName = `${billTypeName}_Bill_Table${order.tableNumber}_${timestamp}.html`;
        const filePath = path.join(dateFolder, fileName);
        
        // Generate bill HTML
        const restaurantDefault = {
            name: 'Hotel Mitraya',
            address: restaurantInfo?.address || 'Your Restaurant Address',
            phone: restaurantInfo?.phone || '+91 XXXXXXXXXX',
            email: restaurantInfo?.email || 'info@hotelmitraya.com',
            gst: restaurantInfo?.gst || 'XXXXXXXXXXX'
        };
        
        const billHTML = generateBillHTML(order, restaurantDefault, billType);
        
        // Save file
        fs.writeFileSync(filePath, billHTML, 'utf8');
        
        console.log(`Bill saved: ${filePath}`);
        
        res.json({
            success: true,
            message: 'Bill saved successfully',
            filePath: filePath,
            fileName: fileName
        });
        
    } catch (error) {
        console.error('Error saving bill:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all saved bills
// @route   GET /api/bills/list
exports.getBills = async (req, res) => {
    try {
        const billsDir = path.join(__dirname, '../../Bills');
        
        if (!fs.existsSync(billsDir)) {
            return res.json({ success: true, bills: [] });
        }
        
        const dateFolders = fs.readdirSync(billsDir);
        const bills = [];
        
        for (const folder of dateFolders) {
            const folderPath = path.join(billsDir, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                files.forEach(file => {
                    const filePath = path.join(folder, file);
                    const stats = fs.statSync(path.join(billsDir, filePath));
                    bills.push({
                        date: folder,
                        fileName: file,
                        filePath: filePath,
                        created: stats.birthtime,
                        size: stats.size
                    });
                });
            }
        }
        
        // Sort by date descending
        bills.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        res.json({ success: true, bills });
        
    } catch (error) {
        console.error('Error getting bills:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get bill content
// @route   GET /api/bills/view/:date/:filename
exports.viewBill = async (req, res) => {
    try {
        const { date, filename } = req.params;
        const filePath = path.join(__dirname, '../../Bills', date, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ success: true, content });
        
    } catch (error) {
        console.error('Error viewing bill:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};