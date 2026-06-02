const sqlite3 = require('sqlite3').verbose();

// إنشاء أو الاتصال بملف قاعدة البيانات (سيتم إنشاء هذا الملف تلقائياً)
const db = new sqlite3.Database('./ecommerce.db', (err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('تم الاتصال بقاعدة بيانات SQLite بنجاح 🗄️');
    }
});

// إنشاء الجداول الأساسية إذا لم تكن موجودة
db.serialize(() => {
    
    // 1. جدول المستخدمين (المشترين والمتاجر)
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('buyer', 'vendor')) DEFAULT 'buyer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. جدول اشتراكات المتاجر (للتحقق من صلاحية البائع)
    db.run(`CREATE TABLE IF NOT EXISTS VendorSubscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('active', 'expired', 'none')) DEFAULT 'none',
        expires_at DATETIME,
        FOREIGN KEY (vendor_id) REFERENCES Users(id)
    )`);

    // 3. جدول المنتجات
    db.run(`CREATE TABLE IF NOT EXISTS Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        FOREIGN KEY (vendor_id) REFERENCES Users(id)
    )`);
    
    console.log('تم التأكد من جاهزية جداول قاعدة البيانات ✅');
});

// تصدير قاعدة البيانات لاستخدامها في باقي المشروع
module.exports = db;