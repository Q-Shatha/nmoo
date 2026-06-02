const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database'); // استدعاء قاعدة البيانات
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// تفعيل إعدادات البيئة (التي سنخزن فيها لاحقاً روابط قاعدة البيانات)
dotenv.config();

// إنشاء تطبيق الخادم
const app = express();

// إعدادات أساسية (Middleware)
app.use(cors()); // للسماح للواجهة الأمامية بالاتصال بهذا الخادم
app.use(express.json()); // لكي يتمكن الخادم من قراءة البيانات بصيغة JSON

// مسار تجريبي للتأكد أن النظام يعمل
app.get('/', (req, res) => {
    res.send('مرحباً بك! خادم منصة المتاجر يعمل بنجاح 🚀');
});

// تحديد المنفذ الذي سيعمل عليه الخادم
const PORT = process.env.PORT || 5000;
// ==========================================
// مسار إنشاء حساب جديد (مشتري أو متجر)
// ==========================================
app.post('/api/register', async (req, res) => {
    // استلام البيانات من الواجهة الأمامية
    const { name, email, password, role } = req.body;

    // التأكد من إدخال البيانات الأساسية
    if (!name || !email || !password) {
        return res.status(400).json({ error: "الرجاء إدخال جميع الحقول المطلوبة." });
    }

    try {
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // التأكد أن نوع الحساب إما بائع أو مشتري (وإلا يعتبر مشتري افتراضياً)
        const userRole = role === 'vendor' ? 'vendor' : 'buyer';

        // إدخال البيانات في قاعدة البيانات
        const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword, userRole], function(err) {
            if (err) {
                // إذا كان الإيميل مسجل مسبقاً
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً." });
                }
                return res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب." });
            }

            // إذا كان الحساب متجراً، ننشئ له سجلاً في جدول الاشتراكات (كغير مشترك مبدئياً)
            if (userRole === 'vendor') {
                const vendorId = this.lastID;
                db.run(`INSERT INTO VendorSubscriptions (vendor_id) VALUES (?)`, [vendorId]);
            }

            res.status(201).json({ message: "تم إنشاء الحساب بنجاح! 🎉", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في الخادم." });
    }
});

// ==========================================
// مسار تسجيل الدخول (Login)
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // التأكد من إدخال البيانات
    if (!email || !password) {
        return res.status(400).json({ error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور." });
    }

    // البحث عن المستخدم في قاعدة البيانات عبر الإيميل
    const sql = `SELECT * FROM Users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "حدث خطأ في الخادم." });

        // إذا لم يتم العثور على الإيميل
        if (!user) return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });

        // مقارنة كلمة المرور المدخلة بكلمة المرور المشفرة في قاعدة البيانات
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });

        // إنشاء "مفتاح مرور" (Token) يحمل رقم المستخدم ونوع حسابه
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'my_secret_key_123', // المفتاح السري للتشفير
            { expiresIn: '1d' } // صلاحية المفتاح يوم واحد
        );

        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح! 🔓",
            token: token,
            role: user.role
        });
    });
});

// ==========================================
// حارس الأمن (Middleware): للتحقق من التوكن واشتراك البائع
// ==========================================
const verifyVendor = (req, res, next) => {
    // 1. استلام التوكن من ترويسة الطلب
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "الرجاء تسجيل الدخول أولاً." });

    try {
        // 2. فك تشفير التوكن والتأكد من صحته
        const actualToken = token.replace('Bearer ', '');
        const verified = jwt.verify(actualToken, process.env.JWT_SECRET || 'my_secret_key_123');
        
        // 3. التأكد أن الحساب هو حساب متجر
        if (verified.role !== 'vendor') {
            return res.status(403).json({ error: "عذراً، هذه الصلاحية للمتاجر فقط." });
        }

        // 4. التحقق من حالة اشتراك المتجر من قاعدة البيانات
        db.get(`SELECT status FROM VendorSubscriptions WHERE vendor_id = ?`, [verified.id], (err, sub) => {
            if (err) return res.status(500).json({ error: "خطأ في الخادم." });
            
            if (!sub || sub.status !== 'active') {
                 return res.status(403).json({ error: "عذراً، يجب تفعيل اشتراكك لتتمكن من إضافة المنتجات." });
            }
            
            // إذا كان كل شيء سليماً، نمرر بيانات البائع للخطوة التالية
            req.user = verified;
            next();
        });

    } catch (error) {
        res.status(400).json({ error: "التوكن غير صالح أو منتهي الصلاحية." });
    }
};

// ==========================================
// مسار مؤقت: لتفعيل اشتراك المتجر (لغرض التجربة)
// ==========================================
app.put('/api/subscribe', (req, res) => {
    const { vendor_id } = req.body;
    db.run(`UPDATE VendorSubscriptions SET status = 'active' WHERE vendor_id = ?`, [vendor_id], function(err) {
        if (err) return res.status(500).json({ error: "حدث خطأ أثناء التفعيل." });
        res.status(200).json({ message: "تم تفعيل اشتراك المتجر بنجاح! ✅" });
    });
});

// ==========================================
// مسار إضافة منتج جديد (محمي بحارس الأمن verifyVendor)
// ==========================================
app.post('/api/products', verifyVendor, (req, res) => {
    const { title, description, price, stock } = req.body;
    
    if (!title || !price) {
        return res.status(400).json({ error: "الرجاء إدخال اسم وسعر المنتج." });
    }

    const sql = `INSERT INTO Products (vendor_id, title, description, price, stock) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, title, description, price, stock], function(err) {
        if (err) return res.status(500).json({ error: "حدث خطأ أثناء إضافة المنتج." });
        res.status(201).json({ message: "تم إضافة المنتج بنجاح! 🛍️", productId: this.lastID });
    });
});

// ==========================================
// مسار عرض جميع المنتجات (متاح للجميع)
// ==========================================
app.get('/api/products', (req, res) => {
    // استخدمنا JOIN لربط جدول المنتجات بجدول المستخدمين لجلب اسم المتجر
    const sql = `
        SELECT Products.id, Products.title, Products.description, Products.price, Products.stock, Users.name AS vendor_name 
        FROM Products 
        JOIN Users ON Products.vendor_id = Users.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات." });
        }
        res.status(200).json({ 
            message: "تم جلب المنتجات بنجاح!", 
            total_products: rows.length,
            products: rows 
        });
    });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل الآن على الرابط: http://localhost:${PORT}`);
});