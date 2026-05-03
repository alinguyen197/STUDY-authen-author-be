https://sequelize.org/docs/v6/other-topics/migrations/

# Setup cài sequelize và cấu hình database

👉 1. Cài đặt các thư viện: sequlize-cli, sequelize và mysql2
npm install --save-dev sequelize-cli@6.2.0
npm install --save mysql2@2.2.5
npm install --save sequelize@6.6.2

👉 2. Thêm file .sequelizerc tại thư mục root
Nội dung file .sequelizerc
const path = require('path');
module.exports = {
'config': path.resolve('./src/config', 'config.json'),
'migrations-path': path.resolve('./src', 'migrations'),
'models-path': path.resolve('./src', 'models'),
'seeders-path': path.resolve('./src', 'seeders')
}

👉 Tại thư mục root, sử dụng câu lệnh: node_modules/.bin/sequelize init
=> npx sequelize-cli init

👉 3. Tạo model - tương đương tạo table:

<pre><code>
// khi tạo model sẽ sinh ra file migrate
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
</code></pre>

<pre><code>
// tạo ra file thủ công
npx sequelize-cli migration:generate --name add-isactive-to-user 
</code></pre>

👉 4: Tạo migrations: để tự động map table vào database
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo

// chạy 1 file : npx sequelize-cli db:migrate --name <tên_file_migration_của_bạn.js>

👉5. Tạo Seeder (tạo data) : npx sequelize-cli seed:generate --name demo-user

- Run các seeder : npx sequelize-cli db:seed:all
- Undo : npx sequelize-cli db:seed:undo:all

👉6. tạo file connectDB.js để dùng sequelize để kết nối DB (https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database)

---

# Authentication & Authorization

###### 🔄 Login flow

1. User login → Tạo access + refresh token
2. Hash refresh token → Lưu vào DB
3. Set refresh token vào httpOnly cookie
4. Trả access token về client

###### 🔄 Refresh Flow

1. Client gửi refresh token (từ cookie)
2. Verify token → Hash → Tìm trong DB
3. Kiểm tra revoked/expired
4. Tạo cặp token mới
5. Revoke token cũ, lưu replacedBy
6. Lưu token mới vào DB
7. Set cookie mới, trả access token

###### 🔄 Reuse Detection Flow

1. Token không tìm thấy HOẶC đã revoked
2. Kiểm tra có token nào có replacedBy = token này không
3. Nếu có → Token đã được dùng trước đó
4. Revoke TẤT CẢ tokens của user
5. Throw error "Token reuse detected"

### Advance login with OTP (xác thực 2 bước) and Redis

###### 🔄 Luồng OTP Login

1. User request OTP → POST /api/auth/otp/request
2. System generate 6-digit OTP
3. Hash OTP → Save to DB & Redis
4. Send OTP via email
5. User nhập OTP → POST /api/auth/otp/login
6. Verify OTP (check Redis first, fallback to DB)
7. Generate access + refresh tokens
8. Return tokens to client

<b>📊 Tính năng đã triển khai </b>

<pre>
✅ OTP Login:
1 Đăng nhập bằng mã OTP qua email
2 Rate Limiting: Giới hạn OTP requests (5/15 phút)
3 OTP Expiry: OTP hết hạn sau 5 phút
4 Max Attempts: Tối đa 3 lần nhập sai OTP
✅ Redis Caching: Cache refresh tokens để lookup nhanh hơn
✅ Cron Job Cleanup: Tự động xóa expired tokens & OTPs
✅ Email Notifications:OTP login codes ,Security alerts (token reuse) ,Token cleanup notifications
✅ Token Rotation: Mỗi lần refresh tạo token mới, revoke token cũ
✅ Reuse Detection: Phát hiện token bị dùng lại → revoke tất cả sessions
✅ TTL Management: Access token 15 phút, Refresh token 7 ngày
✅ Multi-device Support: Lưu nhiều refresh tokens per user
✅ Secure Logout: Revoke specific token hoặc tất cả tokens
✅ Transaction Safety: Dùng Sequelize transactions tránh race conditions
✅ Rate Limiting: Giới hạn 10 requests/15 phút cho /auth/refresh
✅ Auto Cleanup: Giới hạn 5 tokens active, tự động xóa token cũ
✅ Database Indexes: Index tokenHash, userId để lookup nhanh
✅ Secure Cookies: httpOnly, SameSite, secure trên production
✅ Token Hashing: Hash SHA-256 trước khi lưu DB
✅ Audit trail với trường replacedBy
</pre>

---

## 🚨 Error Handling Architecture

### Cũ vs Mới

#### ❌ OLD Pattern (Promise Constructor)

```typescript
login(payload: any) {
  return new Promise(async (resolve, reject) => {
    try {
      // ...
      reject({ type: 'ValidationError', message: '...' })
    } catch (error) {
      reject(parseError(error))
    }
  })
}
```

**Vấn đề:**

- ❌ Code phức tạp, nested, khó bảo trì
- ❌ `reject()` không flow vào Express middleware
- ❌ Error handling không centralized
- ❌ Khó debug, không consistent

#### ✅ NEW Pattern (Async/Await)

```typescript
async login(payload: any) {
  // ...
  if (!user) {
    throw {
      type: 'ValidationError',
      message: 'Email is required'
    }
  }
  // ...
}
```

**Lợi ích:**

- ✅ Code sạch, dễ đọc, dễ maintain
- ✅ Errors flow lên middleware → centralized handling
- ✅ Structured error format: `{ type, message, details }`
- ✅ Consistent error handling across codebase

### Error Flow

```
Service (async/await)
  └─ throw { type, message }
     └─ OR throw Sequelize/JWT instance errors

        ↓ (bubble up)

Controller (try/catch)
  └─ catch (error) → next(error)

        ↓

Express Middleware (errorHandler.ts)
  ├─ Detect library errors (Sequelize, JWT)
  ├─ parseError() → structured format
  └─ switch(err.type) → ApiResponder

        ↓

HTTP Response
  └─ 400/401/500 + error details
```

### Error Types & HTTP Status

| Error Type              | HTTP Status      | Handler             | From                                   |
| ----------------------- | ---------------- | ------------------- | -------------------------------------- |
| `ValidationError`       | 400 Bad Request  | `validationError()` | Input validation, Sequelize validation |
| `NotFoundError`         | 404 Not Found    | `notFound()`        | Resource not found                     |
| `AuthError`             | 401 Unauthorized | `unauthorized()`    | Login failed, invalid credentials      |
| `TokenExpiredError`     | 401 Unauthorized | `error()`           | JWT token expired                      |
| `DatabaseError`         | 500 Server Error | `dbError()`         | Database connection, query errors      |
| `UniqueConstraintError` | 400 Bad Request  | `validationError()` | Duplicate key, unique constraint       |
| `UnknownError`          | 500 Server Error | `error()`           | Unexpected errors                      |

### When to use `parseError()`

**✅ Dùng khi:**

- Bắt được `SequelizeValidationError` instance
- Bắt được `SequelizeUniqueConstraintError` instance
- Bắt được `TokenExpiredError` (JWT)
- Bắt được `SequelizeDatabaseError` instance

**❌ Không dùng khi:**

- Throw custom business logic errors
- Throw application-level errors (OTP validation, login failed, etc)
- Các error này nên throw trực tiếp: `throw { type, message }`

### Middleware Auto-Parsing

```typescript
// errorHandler.ts automatically detects and parses:
if (err instanceof SequelizeValidationError) {
  err = parseError(err) // ← Auto parse library errors
}

// Then switch by type:
switch (err.type) {
  case 'ValidationError':
    return ApiResponder.validationError(res, err)
  // ...
}
```

### Best Practices

1. **Service Layer** (authService.ts):
   - ✅ Use `async/await`
   - ✅ Throw `{ type, message }` for business logic
   - ✅ Let library errors bubble up (middleware will parse)

2. **Controller Layer** (authController.ts):
   - ✅ Use `try/catch`
   - ✅ Pass error to middleware: `next(error)`
   - ❌ Don't parse or transform errors here

3. **Error Handler** (errorHandler.ts):
   - ✅ Parse library errors first
   - ✅ Use switch/case for routing
   - ✅ Call appropriate ApiResponder methods

### Example: OTP Verification

```typescript
// Service: throw structured errors
async verifyLoginOTP(otpId: string, otp: string) {
  const otpRecord = await db.Otp.findByPk(otpId)
  if (!otpRecord) {
    throw {
      type: 'ValidationError',
      message: 'Invalid OTP session'
    }
  }

  if (otpRecord.codeHash !== TokenUtils.hashOTP(otp)) {
    throw {
      type: 'ValidationError',
      message: 'Invalid OTP'
    }
  }
  // ...
}

// Controller: pass to middleware
const verifyOTPFromUser = async (req, res, next) => {
  try {
    const result = await authServices.verifyLoginOTP(...)
    return ApiResponder.success(res, result)
  } catch (error) {
    next(error)  // ← Middleware will handle
  }
}

// Middleware: centralized handling
export const errorHandler = (err, req, res, next) => {
  // If Sequelize error, parse it
  if (err instanceof SequelizeError) {
    err = parseError(err)
  }

  // Route by type
  switch (err.type) {
    case 'ValidationError':
      return ApiResponder.validationError(res, err)
    case 'NotFoundError':
      return ApiResponder.notFound(res, err.message)
    // ...
  }
}
```
