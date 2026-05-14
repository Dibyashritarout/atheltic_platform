# ATHLETES PLATFORM - COMPREHENSIVE TEST CASES

**Project:** Athletes Platform (Full-Stack)  
**Date:** April 28, 2026  
**Version:** 1.0

---

## TABLE OF CONTENTS

1. Backend Authentication Tests
2. Backend User Model Tests
3. Backend File Upload Tests
4. Backend CRUD Operation Tests
5. Frontend Authentication Context Tests
6. Frontend Component Tests
7. Frontend Route/Page Tests
8. Frontend Form Tests
9. Integration Tests
10. Performance & Edge Case Tests

---

## SECTION 1: BACKEND AUTHENTICATION TESTS

### Test 1.1: User Registration - Valid Input
**Route:** `POST /api/auth/register`

**Input Data:**
```
{
  "name": "John Athlete",
  "email": "john@example.com",
  "password": "password123",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 201 (Created)
- Response body includes JWT token
- User object contains: id, name, email, role
- No plaintext password in response

**Acceptance Criteria:**
- ✓ User record created in MongoDB
- ✓ Password properly hashed
- ✓ Token is valid for authentication
- ✓ Token expires in 7 days

---

### Test 1.2: User Registration - Missing Name Field
**Route:** `POST /api/auth/register`

**Input Data:**
```
{
  "email": "john@example.com",
  "password": "password123",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Name, email and password are required."

**Acceptance Criteria:**
- ✓ User not created
- ✓ Clear error message provided

---

### Test 1.3: User Registration - Missing Email Field
**Route:** `POST /api/auth/register`

**Input Data:**
```
{
  "name": "John Athlete",
  "password": "password123",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Name, email and password are required."

**Acceptance Criteria:**
- ✓ Validation catches missing email
- ✓ User not created

---

### Test 1.4: User Registration - Missing Password Field
**Route:** `POST /api/auth/register`

**Input Data:**
```
{
  "name": "John Athlete",
  "email": "john@example.com",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Name, email and password are required."

**Acceptance Criteria:**
- ✓ Password required validation works
- ✓ No user created with missing password

---

### Test 1.5: User Registration - Duplicate Email
**Route:** `POST /api/auth/register`

**Precondition:** User with email "existing@example.com" already exists

**Input Data:**
```
{
  "name": "Jane Athlete",
  "email": "existing@example.com",
  "password": "newpass123",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Email already registered."

**Acceptance Criteria:**
- ✓ Duplicate email prevented
- ✓ Unique constraint enforced

---

### Test 1.6: User Registration - Email Case Insensitivity
**Route:** `POST /api/auth/register`

**Precondition:** First registration with "john@example.com"

**Input Data (Second Registration):**
```
{
  "name": "John Smith",
  "email": "JOHN@EXAMPLE.COM",
  "password": "pass123",
  "role": "athlete"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Email already registered."

**Acceptance Criteria:**
- ✓ Email comparison is case-insensitive
- ✓ Duplicate detected despite different case

---

### Test 1.7: User Login - Valid Credentials
**Route:** `POST /api/auth/login`

**Input Data:**
```
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Output:**
- HTTP Status: 200 (OK)
- Response includes JWT token
- User object with: id, name, email, role

**Acceptance Criteria:**
- ✓ Token is valid and can be used for authentication
- ✓ Token matches registered user
- ✓ Password comparison successful

---

### Test 1.8: User Login - Invalid Email (Non-existent User)
**Route:** `POST /api/auth/login`

**Input Data:**
```
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

**Expected Output:**
- HTTP Status: 401 (Unauthorized)
- Error Message: "Invalid email or password."

**Acceptance Criteria:**
- ✓ Generic error message (security best practice)
- ✓ No user enumeration vulnerability

---

### Test 1.9: User Login - Correct Email, Wrong Password
**Route:** `POST /api/auth/login`

**Precondition:** User exists with email and password

**Input Data:**
```
{
  "email": "john@example.com",
  "password": "wrongpassword"
}
```

**Expected Output:**
- HTTP Status: 401 (Unauthorized)
- Error Message: "Invalid email or password."

**Acceptance Criteria:**
- ✓ Invalid password rejected
- ✓ User account not compromised

---

### Test 1.10: User Login - Missing Email
**Route:** `POST /api/auth/login`

**Input Data:**
```
{
  "password": "password123"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Email and password required."

**Acceptance Criteria:**
- ✓ Validation catches missing email

---

### Test 1.11: User Login - Missing Password
**Route:** `POST /api/auth/login`

**Input Data:**
```
{
  "email": "john@example.com"
}
```

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Email and password required."

**Acceptance Criteria:**
- ✓ Validation catches missing password

---

### Test 1.12: Get Current User - With Valid Token
**Route:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Output:**
- HTTP Status: 200 (OK)
- Returns authenticated user object

**Acceptance Criteria:**
- ✓ Token successfully validated
- ✓ Correct user returned
- ✓ No sensitive data exposed

---

### Test 1.13: Get Current User - Missing Authorization Header
**Route:** `GET /api/auth/me`

**Headers:** (none)

**Expected Output:**
- HTTP Status: 401 (Unauthorized)
- Error Message: "No token provided" or similar

**Acceptance Criteria:**
- ✓ Missing token rejected
- ✓ Proper error response

---

### Test 1.14: Get Current User - Invalid Token
**Route:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer invalid.token.here
```

**Expected Output:**
- HTTP Status: 401 (Unauthorized)
- Error Message: "Invalid token" or similar

**Acceptance Criteria:**
- ✓ Malformed token rejected
- ✓ User not authenticated

---

### Test 1.15: Get Current User - Expired Token
**Route:** `GET /api/auth/me`

**Precondition:** Token expired (>7 days old)

**Headers:**
```
Authorization: Bearer <expired_token>
```

**Expected Output:**
- HTTP Status: 401 (Unauthorized)
- Error Message: "Token expired" or similar

**Acceptance Criteria:**
- ✓ Expired token rejected
- ✓ User forced to re-login

---

## SECTION 2: BACKEND USER MODEL TESTS

### Test 2.1: Password Hashing on Save
**Scenario:** Create a new user with plain password

**Input:**
```javascript
{
  name: "Test User",
  email: "test@example.com",
  password: "myPassword123",
  role: "athlete"
}
```

**Expected:**
- Password stored in database is hashed
- Stored password ≠ "myPassword123"
- Hash uses bcrypt algorithm
- Hash includes salt

**Acceptance Criteria:**
- ✓ Cannot reverse engineer password from hash
- ✓ Security best practices followed

---

### Test 2.2: Password Comparison - Correct Password
**Scenario:** Call comparePassword with correct password

**Code:**
```javascript
const user = await User.findOne({ email: "test@example.com" });
const isMatch = await user.comparePassword("myPassword123");
```

**Expected:**
- `isMatch` returns `true`

**Acceptance Criteria:**
- ✓ Correct password verified successfully

---

### Test 2.3: Password Comparison - Wrong Password
**Scenario:** Call comparePassword with incorrect password

**Code:**
```javascript
const user = await User.findOne({ email: "test@example.com" });
const isMatch = await user.comparePassword("wrongPassword");
```

**Expected:**
- `isMatch` returns `false`

**Acceptance Criteria:**
- ✓ Wrong password rejected

---

### Test 2.4: Email Uniqueness Constraint
**Scenario:** Try to create two users with same email

**First User:**
```
{ name: "User One", email: "duplicate@example.com", password: "pass1" }
```

**Second User:**
```
{ name: "User Two", email: "duplicate@example.com", password: "pass2" }
```

**Expected:**
- First user created successfully
- Second user creation throws error
- Error: Duplicate key error

**Acceptance Criteria:**
- ✓ Unique constraint enforced by database
- ✓ Prevents duplicate email registrations

---

### Test 2.5: Required Fields Validation - Missing Name
**Scenario:** Create user without name

**Input:**
```
{ email: "test@example.com", password: "pass123" }
```

**Expected:**
- Validation error
- User not created

**Acceptance Criteria:**
- ✓ Name field required

---

### Test 2.6: Required Fields Validation - Missing Email
**Scenario:** Create user without email

**Input:**
```
{ name: "Test User", password: "pass123" }
```

**Expected:**
- Validation error
- User not created

**Acceptance Criteria:**
- ✓ Email field required

---

### Test 2.7: Required Fields Validation - Missing Password
**Scenario:** Create user without password

**Input:**
```
{ name: "Test User", email: "test@example.com" }
```

**Expected:**
- Validation error
- User not created

**Acceptance Criteria:**
- ✓ Password field required

---

### Test 2.8: Email Normalization - Lowercase
**Scenario:** Register with uppercase email

**Input:**
```
{ name: "User", email: "JOHN@EXAMPLE.COM", password: "pass123" }
```

**Expected:**
- Email stored as: "john@example.com"
- Stored in lowercase

**Acceptance Criteria:**
- ✓ Email normalization works

---

### Test 2.9: Email Normalization - Trim Whitespace
**Scenario:** Register with email containing spaces

**Input:**
```
{ name: "User", email: "  john@example.com  ", password: "pass123" }
```

**Expected:**
- Email stored as: "john@example.com"
- Leading/trailing spaces removed

**Acceptance Criteria:**
- ✓ Whitespace trimmed

---

### Test 2.10: Name Trim Whitespace
**Scenario:** Create user with padded name

**Input:**
```
{ name: "  John Athlete  ", email: "john@example.com", password: "pass123" }
```

**Expected:**
- Name stored as: "John Athlete"
- Whitespace trimmed

**Acceptance Criteria:**
- ✓ Name trimmed properly

---

### Test 2.11: Password Minimum Length Validation
**Scenario:** Create user with password < 6 characters

**Input:**
```
{ name: "User", email: "test@example.com", password: "abc" }
```

**Expected:**
- Validation error
- User not created
- Error: Password must be at least 6 characters

**Acceptance Criteria:**
- ✓ Minimum password length enforced

---

### Test 2.12: Default Role Assignment
**Scenario:** Create user without specifying role

**Input:**
```
{ name: "User", email: "test@example.com", password: "pass123" }
```

**Expected:**
- User created with role: "athlete" (default)

**Acceptance Criteria:**
- ✓ Default role assigned correctly

---

### Test 2.13: Valid Role Values
**Scenario:** Create users with each valid role

**Test Cases:**
- role: "athlete" → ✓ Created
- role: "organization" → ✓ Created
- role: "admin" → ✓ Created
- role: "invalid" → ✗ Validation error

**Acceptance Criteria:**
- ✓ Only valid roles accepted

---

### Test 2.14: Timestamps on Creation
**Scenario:** Create user and check timestamps

**Expected:**
- `createdAt` timestamp set to current time
- `updatedAt` timestamp set to current time

**Acceptance Criteria:**
- ✓ Timestamps automatically managed

---

### Test 2.15: Timestamps on Update
**Scenario:** Modify user data and check updatedAt

**Expected:**
- `createdAt` remains unchanged
- `updatedAt` updated to current time

**Acceptance Criteria:**
- ✓ Update timestamp tracks modifications

---

## SECTION 3: BACKEND FILE UPLOAD TESTS

### Test 3.1: Valid Image Upload (JPEG)
**Route:** `POST /api/upload`

**File:** test_image.jpg (500KB)

**Expected Output:**
- HTTP Status: 200 (OK)
- Response body:
  ```json
  {
    "url": "/uploads/1682707200000-123456789.jpg",
    "filename": "1682707200000-123456789.jpg",
    "size": 512000
  }
  ```

**Acceptance Criteria:**
- ✓ File saved to /uploads directory
- ✓ Unique filename generated
- ✓ Correct file size returned
- ✓ Accessible via URL

---

### Test 3.2: Valid Image Upload (PNG)
**Route:** `POST /api/upload`

**File:** test_image.png (2MB)

**Expected Output:**
- HTTP Status: 200
- File saved successfully
- Correct MIME type validated

**Acceptance Criteria:**
- ✓ PNG format supported

---

### Test 3.3: Valid Image Upload (GIF)
**Route:** `POST /api/upload`

**File:** test_image.gif (1MB)

**Expected Output:**
- HTTP Status: 200
- File saved successfully

**Acceptance Criteria:**
- ✓ GIF format supported

---

### Test 3.4: Valid Video Upload (MP4)
**Route:** `POST /api/upload`

**File:** test_video.mp4 (50MB)

**Expected Output:**
- HTTP Status: 200
- File saved successfully
- Size metadata correct

**Acceptance Criteria:**
- ✓ MP4 format supported

---

### Test 3.5: Valid Video Upload (WebM)
**Route:** `POST /api/upload`

**File:** test_video.webm (30MB)

**Expected Output:**
- HTTP Status: 200
- File saved successfully

**Acceptance Criteria:**
- ✓ WebM format supported

---

### Test 3.6: Valid Video Upload (MOV)
**Route:** `POST /api/upload`

**File:** test_video.mov (40MB)

**Expected Output:**
- HTTP Status: 200
- File saved successfully

**Acceptance Criteria:**
- ✓ MOV format supported

---

### Test 3.7: Invalid File Type (PDF)
**Route:** `POST /api/upload`

**File:** document.pdf

**Expected Output:**
- HTTP Status: 400 (Bad Request)
- Error Message: "Only images and videos are allowed"
- File not saved

**Acceptance Criteria:**
- ✓ PDF rejected
- ✓ Clear error message

---

### Test 3.8: Invalid File Type (Word Document)
**Route:** `POST /api/upload`

**File:** document.docx

**Expected Output:**
- HTTP Status: 400
- Error Message: "Only images and videos are allowed"

**Acceptance Criteria:**
- ✓ DOCX rejected

---

### Test 3.9: Invalid File Type (Text File)
**Route:** `POST /api/upload`

**File:** notes.txt

**Expected Output:**
- HTTP Status: 400
- Error Message: "Only images and videos are allowed"

**Acceptance Criteria:**
- ✓ TXT rejected

---

### Test 3.10: File Size Exceeds Limit (101MB)
**Route:** `POST /api/upload`

**File:** large_video.mp4 (101MB)

**Expected Output:**
- HTTP Status: 413 (Payload Too Large) or 400
- Error: File size exceeds 100MB limit
- File not saved

**Acceptance Criteria:**
- ✓ Large files rejected
- ✓ Size validation enforced

---

### Test 3.11: File Size Exactly at Limit (100MB)
**Route:** `POST /api/upload`

**File:** video.mp4 (100MB)

**Expected Output:**
- HTTP Status: 200
- File uploaded successfully

**Acceptance Criteria:**
- ✓ Boundary condition handled

---

### Test 3.12: No File in Request
**Route:** `POST /api/upload`

**Body:** (no file)

**Expected Output:**
- HTTP Status: 400
- Error Message: "No file uploaded"

**Acceptance Criteria:**
- ✓ Missing file handled gracefully

---

### Test 3.13: Multiple Files (Only Single Expected)
**Route:** `POST /api/upload`

**Files:** image1.jpg, image2.jpg

**Expected Output:**
- HTTP Status: 200
- Only first file uploaded (or error for multiple)

**Acceptance Criteria:**
- ✓ Handles single file expectation

---

### Test 3.14: File with Special Characters in Name
**Route:** `POST /api/upload`

**File:** my-image_2024 (1).png

**Expected Output:**
- HTTP Status: 200
- File saved with unique name
- Original extension preserved

**Acceptance Criteria:**
- ✓ Special characters handled
- ✓ Extension preserved

---

### Test 3.15: Concurrent Upload Requests
**Scenario:** Submit 5 simultaneous upload requests

**Expected Output:**
- All 5 files uploaded
- Each gets unique filename
- No conflicts or overwrites

**Acceptance Criteria:**
- ✓ Concurrent uploads work
- ✓ Race condition prevented
- ✓ All unique filenames generated

---

### Test 3.16: File Accessible After Upload
**Scenario:** Upload file, then request via URL

**Steps:**
1. Upload image.jpg
2. Receive URL: /uploads/timestamp-random.jpg
3. GET /uploads/timestamp-random.jpg

**Expected Output:**
- HTTP Status: 200
- File content returned
- Correct MIME type

**Acceptance Criteria:**
- ✓ File accessible via static route
- ✓ MIME type correct

---

### Test 3.17: Uploads Directory Created if Missing
**Scenario:** Ensure /uploads directory exists

**Expected:**
- Directory created automatically on server start
- Directory has correct permissions
- Files can be written to it

**Acceptance Criteria:**
- ✓ Directory management automated

---

## SECTION 4: BACKEND CRUD OPERATION TESTS

### Test 4.1: Get All Athletes
**Route:** `GET /api/athletes`

**Expected Output:**
- HTTP Status: 200
- Response: Array of athlete objects
- Each object contains: id, name, bio, skills, image, etc.

**Acceptance Criteria:**
- ✓ Returns all athletes
- ✓ Correct data format

---

### Test 4.2: Get Athlete by Valid ID
**Route:** `GET /api/athletes/:id`

**Parameter:** id = valid athlete MongoDB ObjectId

**Expected Output:**
- HTTP Status: 200
- Single athlete object returned

**Acceptance Criteria:**
- ✓ Correct athlete returned

---

### Test 4.3: Get Athlete by Invalid ID
**Route:** `GET /api/athletes/:id`

**Parameter:** id = invalid/non-existent ID

**Expected Output:**
- HTTP Status: 404 (Not Found)
- Error Message: "Athlete not found"

**Acceptance Criteria:**
- ✓ 404 returned for missing athlete

---

### Test 4.4: Create Athlete (Authenticated)
**Route:** `POST /api/athletes`

**Headers:**
```
Authorization: Bearer <valid_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Alex Rodriguez",
  "bio": "Professional basketball player",
  "skills": ["basketball", "shooting", "dribbling"],
  "image": "/uploads/image123.jpg"
}
```

**Expected Output:**
- HTTP Status: 201 (Created)
- Athlete object returned with id

**Acceptance Criteria:**
- ✓ Athlete created in database
- ✓ Created by authenticated user

---

### Test 4.5: Create Athlete (Unauthenticated)
**Route:** `POST /api/athletes`

**Headers:** (no token)

**Body:** (athlete data)

**Expected Output:**
- HTTP Status: 401 (Unauthorized)

**Acceptance Criteria:**
- ✓ Unauthorized request rejected

---

### Test 4.6: Update Athlete (Authenticated)
**Route:** `PUT /api/athletes/:id`

**Headers:**
```
Authorization: Bearer <valid_token>
```

**Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio"
}
```

**Expected Output:**
- HTTP Status: 200
- Updated athlete object returned

**Acceptance Criteria:**
- ✓ Athlete updated
- ✓ Only authorized user can update

---

### Test 4.7: Delete Athlete (Authenticated)
**Route:** `DELETE /api/athletes/:id`

**Headers:**
```
Authorization: Bearer <valid_token>
```

**Expected Output:**
- HTTP Status: 200
- Confirmation message or deleted object

**Acceptance Criteria:**
- ✓ Athlete deleted from database
- ✓ Only authorized user can delete

---

### Test 4.8: Get Opportunities
**Route:** `GET /api/opportunities`

**Expected Output:**
- HTTP Status: 200
- Array of opportunity objects

**Acceptance Criteria:**
- ✓ All opportunities returned

---

### Test 4.9: Create Opportunity (Authenticated)
**Route:** `POST /api/opportunities`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "NBA Draft Scout",
  "description": "Scouting opportunity",
  "category": "professional",
  "datePosted": "2024-04-28"
}
```

**Expected Output:**
- HTTP Status: 201
- Opportunity created

**Acceptance Criteria:**
- ✓ Opportunity stored in database

---

### Test 4.10: Get Performance Data
**Route:** `GET /api/performance/:athleteId`

**Expected Output:**
- HTTP Status: 200
- Array of performance records

**Acceptance Criteria:**
- ✓ Performance data retrieved

---

---

## SECTION 5: FRONTEND AUTHENTICATION CONTEXT TESTS

### Test 5.1: AuthContext Initialization
**Component:** `AuthContext.js`

**Expected State:**
```javascript
{
  user: null,
  loading: true,
  login: function,
  logout: function,
  register: function
}
```

**Acceptance Criteria:**
- ✓ Initial state correct
- ✓ All functions available

---

### Test 5.2: useAuth Hook Returns Correct Values
**Code:**
```javascript
const { user, loading, login, logout, register } = useAuth();
```

**Expected:**
- All properties accessible
- No undefined values

**Acceptance Criteria:**
- ✓ Hook works as expected

---

### Test 5.3: Login with Valid Credentials
**Function Call:**
```javascript
await login("john@example.com", "password123");
```

**Expected:**
- User state populated with user data
- Token stored in localStorage
- loading = false
- User object contains: id, name, email, role

**Acceptance Criteria:**
- ✓ Login successful
- ✓ State updated
- ✓ Token persisted

---

### Test 5.4: Login with Invalid Email
**Function Call:**
```javascript
await login("invalid@example.com", "password123");
```

**Expected:**
- Error thrown or returned
- User state remains null
- loading = false

**Acceptance Criteria:**
- ✓ Login fails gracefully

---

### Test 5.5: Login with Invalid Password
**Function Call:**
```javascript
await login("john@example.com", "wrongpassword");
```

**Expected:**
- Error thrown
- User state remains null

**Acceptance Criteria:**
- ✓ Invalid password rejected

---

### Test 5.6: Logout Clears User State
**Function Call:**
```javascript
await logout();
```

**Expected:**
- user = null
- Token removed from localStorage
- Component re-renders

**Acceptance Criteria:**
- ✓ User logged out
- ✓ State cleared
- ✓ Token removed

---

### Test 5.7: Register New User
**Function Call:**
```javascript
await register("Jane Doe", "jane@example.com", "password123", "athlete");
```

**Expected:**
- New user created
- User state updated
- Token stored in localStorage

**Acceptance Criteria:**
- ✓ Registration successful
- ✓ User logged in after registration

---

### Test 5.8: Register with Duplicate Email
**Function Call:**
```javascript
await register("John Doe", "existing@example.com", "pass123", "athlete");
```

**Expected:**
- Error: "Email already registered"
- User not created
- User state unchanged

**Acceptance Criteria:**
- ✓ Duplicate email prevented

---

### Test 5.9: Token Persistence on Page Reload
**Scenario:** User logs in, page reloads

**Expected:**
- Token retrieved from localStorage
- User state restored
- No need to re-login

**Acceptance Criteria:**
- ✓ Session persists

---

### Test 5.10: Token Expiration Handling
**Scenario:** Token expired, user tries to access protected route

**Expected:**
- User redirected to login
- Token cleared from localStorage
- User must login again

**Acceptance Criteria:**
- ✓ Expired token handled

---

## SECTION 6: FRONTEND COMPONENT TESTS

### Test 6.1: Navbar Component Renders
**Component:** `Navbar.js`

**Expected:**
- Navbar displays
- All navigation links visible
- Logo/branding present

**Acceptance Criteria:**
- ✓ No console errors
- ✓ All elements render

---

### Test 6.2: Navbar - Authenticated User View
**Precondition:** User logged in

**Expected:**
- Welcome message with user name
- User profile link
- Logout button displayed
- Dashboard link available

**Acceptance Criteria:**
- ✓ Authenticated menu shown

---

### Test 6.3: Navbar - Unauthenticated User View
**Precondition:** No user logged in

**Expected:**
- Login link displayed
- Register link displayed
- Profile/Logout buttons hidden
- Protected routes not accessible

**Acceptance Criteria:**
- ✓ Unauthenticated menu shown

---

### Test 6.4: Navbar - Navigation Links Work
**Interaction:** Click each navigation link

**Expected:**
- Route changes correctly
- Page content updates
- URL changes

**Acceptance Criteria:**
- ✓ All links functional

---

### Test 6.5: Chatbot Component Renders
**Component:** `Chatbot.js`

**Expected:**
- Chatbot container displayed
- Input field visible
- Chat history area visible
- Send button present

**Acceptance Criteria:**
- ✓ All elements render

---

### Test 6.6: Chatbot - Send Message
**Interaction:** Type message and send

**Expected:**
- Message displayed in chat
- Input cleared
- Response from bot appears

**Acceptance Criteria:**
- ✓ Message sending works

---

### Test 6.7: AthleteCard Component - Display Data
**Component:** `AthleteCard.js`

**Props:**
```javascript
{
  name: "Alex Rodriguez",
  bio: "Basketball player",
  image: "/uploads/image.jpg",
  skills: ["basketball", "shooting"]
}
```

**Expected:**
- Athlete name displayed
- Bio text shown
- Image rendered
- Skills listed

**Acceptance Criteria:**
- ✓ All data displayed correctly

---

### Test 6.8: AthleteCard - Click to View Profile
**Interaction:** Click on athlete card

**Expected:**
- Navigate to athlete profile page
- Detailed information loads

**Acceptance Criteria:**
- ✓ Link works correctly

---

### Test 6.9: PerformanceChart Component - Render Chart
**Component:** `PerformanceChart.js`

**Props:**
```javascript
{
  data: [
    { month: "Jan", score: 85 },
    { month: "Feb", score: 88 },
    { month: "Mar", score: 92 }
  ]
}
```

**Expected:**
- Chart displays
- Data points plotted correctly
- Axes labeled
- Legend shown

**Acceptance Criteria:**
- ✓ Chart rendered correctly

---

### Test 6.10: OpportunityCard Component - Display
**Component:** `OpportunityCard.js`

**Props:**
```javascript
{
  title: "NBA Scout",
  organization: "NBA",
  category: "professional",
  description: "Scouting opportunity"
}
```

**Expected:**
- All information displayed
- Card formatted properly

**Acceptance Criteria:**
- ✓ Data displayed correctly

---

### Test 6.11: Footer Component - Renders
**Component:** `Footer.js`

**Expected:**
- Footer displays
- Links present
- Copyright information shown

**Acceptance Criteria:**
- ✓ Footer renders correctly

---

---

## SECTION 7: FRONTEND ROUTE/PAGE TESTS

### Test 7.1: PrivateRoute - Redirects Unauthenticated
**Route:** `/dashboard` (protected)

**Precondition:** User not logged in

**Expected:**
- Redirected to `/login`
- Dashboard not rendered

**Acceptance Criteria:**
- ✓ Protected route secured

---

### Test 7.2: PrivateRoute - Allows Authenticated
**Route:** `/dashboard`

**Precondition:** User logged in with valid token

**Expected:**
- Dashboard renders
- Content displays
- No redirect

**Acceptance Criteria:**
- ✓ Authenticated user can access

---

### Test 7.3: AdminRoute - Rejects Non-Admin User
**Route:** `/admin/applications`

**Precondition:** User logged in as "athlete"

**Expected:**
- Redirected to `/dashboard`
- Admin page not shown

**Acceptance Criteria:**
- ✓ Non-admin users blocked

---

### Test 7.4: AdminRoute - Allows Admin User
**Route:** `/admin/applications`

**Precondition:** User logged in as "admin"

**Expected:**
- Admin panel renders
- Admin features available

**Acceptance Criteria:**
- ✓ Admin can access admin routes

---

### Test 7.5: Home Page - Public Access
**Route:** `/`

**Precondition:** Any state (authenticated or not)

**Expected:**
- Page renders
- Public content displayed
- No authentication required

**Acceptance Criteria:**
- ✓ Public page accessible

---

### Test 7.6: Login Page - Form Submission
**Route:** `/login`

**Interaction:** Fill form with valid credentials and submit

**Expected:**
- API call made to backend
- On success: User logged in, redirected to dashboard
- On failure: Error message displayed

**Acceptance Criteria:**
- ✓ Login flow works

---

### Test 7.7: Register Page - Form Submission
**Route:** `/register`

**Interaction:** Fill form and submit

**Expected:**
- New user created
- User logged in automatically
- Redirected to dashboard

**Acceptance Criteria:**
- ✓ Registration flow works

---

### Test 7.8: Athletes Page - Fetch and Display List
**Route:** `/athletes`

**Expected:**
- Loading state displayed while fetching
- List of athletes displayed
- Each athlete clickable

**Acceptance Criteria:**
- ✓ Athletes list loads
- ✓ Data fetched from API

---

### Test 7.9: Athletes Page - Search Functionality
**Route:** `/athletes`

**Interaction:** Type search query

**Expected:**
- List filtered in real-time
- Matching athletes displayed

**Acceptance Criteria:**
- ✓ Search works

---

### Test 7.10: Athlete Profile Page - Load Details
**Route:** `/athlete/:id`

**Expected:**
- Athlete details displayed
- Bio, skills, image shown
- Performance data displayed

**Acceptance Criteria:**
- ✓ Profile loads correctly

---

### Test 7.11: Add Athlete Page - Form Present
**Route:** `/add-athlete`

**Expected:**
- Form displayed
- Input fields present
- Submit button available

**Acceptance Criteria:**
- ✓ Form renders

---

### Test 7.12: Opportunities Page - List Display
**Route:** `/opportunities`

**Expected:**
- Opportunities displayed
- Each opportunity clickable

**Acceptance Criteria:**
- ✓ Opportunities load

---

### Test 7.13: Opportunity Detail Page - Load Data
**Route:** `/opportunity/:id`

**Expected:**
- Opportunity details displayed
- Application button present

**Acceptance Criteria:**
- ✓ Details load correctly

---

### Test 7.14: Dashboard Page - User Data
**Route:** `/dashboard`

**Precondition:** Authenticated user

**Expected:**
- User statistics displayed
- Recent activities shown
- Personal information visible

**Acceptance Criteria:**
- ✓ Dashboard data loads

---

### Test 7.15: Admin Applications Page - List
**Route:** `/admin/applications`

**Precondition:** Admin user

**Expected:**
- List of applications displayed
- Approval/rejection options available

**Acceptance Criteria:**
- ✓ Admin page loads

---

### Test 7.16: About Page - Static Content
**Route:** `/about`

**Expected:**
- About information displayed
- No authentication required

**Acceptance Criteria:**
- ✓ Public page accessible

---

### Test 7.17: Injury Tracker Page - Load
**Route:** `/injury-tracker`

**Expected:**
- Injury data displayed
- Form to add injury present

**Acceptance Criteria:**
- ✓ Page loads

---

### Test 7.18: Leaderboard Page - Display Rankings
**Route:** `/leaderboard`

**Expected:**
- Athletes ranked by performance
- Rankings displayed

**Acceptance Criteria:**
- ✓ Leaderboard loads

---

### Test 7.19: Feedback Page - Submit Feedback
**Route:** `/feedback`

**Expected:**
- Feedback form present
- Can submit feedback

**Acceptance Criteria:**
- ✓ Feedback submitted

---

---

## SECTION 8: FRONTEND FORM TESTS

### Test 8.1: Add Athlete Form - Render
**Page:** `/add-athlete`

**Expected:**
- Form fields visible: name, bio, skills, image
- Submit button present
- Cancel button present

**Acceptance Criteria:**
- ✓ Form renders completely

---

### Test 8.2: Add Athlete Form - Required Field Validation
**Interaction:** Leave "name" field empty and submit

**Expected:**
- Error message: "Name is required"
- Form not submitted
- User remains on form

**Acceptance Criteria:**
- ✓ Validation works

---

### Test 8.3: Add Athlete Form - Valid Submission
**Interaction:** Fill all fields correctly and submit

**Expected:**
- Form submitted
- Loading state shown
- Success message displayed
- Redirect to Athletes page

**Acceptance Criteria:**
- ✓ Form submission successful

---

### Test 8.4: Add Athlete Form - File Upload
**Interaction:** Select image file in form

**Expected:**
- File accepted if valid image
- Error if invalid type
- Preview shown

**Acceptance Criteria:**
- ✓ File upload works

---

### Test 8.5: Add Opportunity Form - Render
**Page:** `/add-opportunity`

**Expected:**
- Form fields: title, description, category, date
- Submit button present

**Acceptance Criteria:**
- ✓ Form renders

---

### Test 8.6: Add Opportunity Form - Validation
**Interaction:** Submit with missing fields

**Expected:**
- Validation errors shown
- Form not submitted

**Acceptance Criteria:**
- ✓ Validation works

---

### Test 8.7: Add Performance Form - Render
**Page:** `/add-performance`

**Expected:**
- Form fields: metric, value, date
- Submit button present

**Acceptance Criteria:**
- ✓ Form renders

---

### Test 8.8: Add Performance Form - Submit
**Interaction:** Fill and submit form

**Expected:**
- Performance record created
- Success message shown

**Acceptance Criteria:**
- ✓ Form submission works

---

### Test 8.9: Login Form - Email Validation
**Interaction:** Enter invalid email format

**Expected:**
- Error message shown
- Cannot submit

**Acceptance Criteria:**
- ✓ Email validation works

---

### Test 8.10: Register Form - Password Confirmation
**Interaction:** Enter mismatched passwords

**Expected:**
- Error: "Passwords do not match"
- Cannot submit

**Acceptance Criteria:**
- ✓ Password confirmation works

---

---

## SECTION 9: INTEGRATION TESTS

### Test 9.1: Complete Authentication Flow
**Steps:**
1. Register new user on `/register` page
2. New user auto-logged in
3. Redirect to dashboard
4. Logout from navbar
5. Attempt to access protected page
6. Redirect to login
7. Login with registered credentials
8. Redirect back to dashboard

**Expected:**
- All steps complete successfully
- State managed correctly throughout

**Acceptance Criteria:**
- ✓ Complete auth flow works end-to-end

---

### Test 9.2: Create and Display Athlete
**Steps:**
1. Login as authenticated user
2. Navigate to `/add-athlete`
3. Fill form with athlete data
4. Submit form
5. Navigate to `/athletes`
6. Search for newly created athlete
7. Click on athlete
8. View profile details

**Expected:**
- Athlete appears in list
- Profile loads correctly
- All data persists

**Acceptance Criteria:**
- ✓ Create and display flow works

---

### Test 9.3: Upload Image and Use in Athlete
**Steps:**
1. Upload image via `/api/upload`
2. Receive image URL
3. Create athlete with image URL
4. View athlete profile
5. Verify image displays

**Expected:**
- Image uploaded successfully
- URL obtained
- Image renders on profile

**Acceptance Criteria:**
- ✓ Upload and display flow works

---

### Test 9.4: Apply for Opportunity
**Steps:**
1. Login as athlete
2. Navigate to `/opportunities`
3. Select opportunity
4. View detail page
5. Click "Apply" button
6. Application created

**Expected:**
- Application submitted successfully
- Confirmation shown

**Acceptance Criteria:**
- ✓ Application flow works

---

### Test 9.5: Admin Reviews Applications
**Steps:**
1. Login as admin
2. Navigate to `/admin/applications`
3. View pending applications
4. Approve/reject application
5. Email sent to applicant (if configured)

**Expected:**
- Admin can review applications
- Actions taken successfully
- Status updated

**Acceptance Criteria:**
- ✓ Admin workflow works

---

### Test 9.6: Chat Interaction Flow
**Steps:**
1. Any user navigates to site
2. Chatbot appears
3. Type question
4. Receive response
5. Continue conversation

**Expected:**
- Chatbot responds to queries
- Conversation flows naturally

**Acceptance Criteria:**
- ✓ Chat interaction works

---

### Test 9.7: Injury Tracking Flow
**Steps:**
1. Login as athlete
2. Navigate to `/injury-tracker`
3. Log new injury
4. View injury history
5. Update injury status

**Expected:**
- Injuries tracked properly
- History maintained

**Acceptance Criteria:**
- ✓ Injury tracking works

---

### Test 9.8: Performance Analytics Flow
**Steps:**
1. Login
2. Navigate to performance section
3. View performance chart
4. Add new performance metric
5. Chart updates

**Expected:**
- Performance data tracked
- Charts update in real-time

**Acceptance Criteria:**
- ✓ Analytics flow works

---

---

## SECTION 10: PERFORMANCE & EDGE CASE TESTS

### Test 10.1: Large Dataset Loading
**Scenario:** Athletes page with 1000+ athletes

**Expected:**
- Page loads within 3 seconds
- No memory leaks
- Pagination/virtualization implemented
- UI remains responsive

**Acceptance Criteria:**
- ✓ Performance acceptable for large datasets

---

### Test 10.2: Slow Network Conditions
**Scenario:** Simulate 3G connection speed

**Expected:**
- Loading states shown appropriately
- Timeouts handled gracefully
- User informed of delay

**Acceptance Criteria:**
- ✓ Graceful handling on slow networks

---

### Test 10.3: Network Timeout
**Scenario:** API request times out

**Expected:**
- Error message displayed
- Retry button offered
- User not blocked

**Acceptance Criteria:**
- ✓ Timeout handled gracefully

---

### Test 10.4: Concurrent API Requests
**Scenario:** Multiple simultaneous API calls

**Expected:**
- All requests handled correctly
- No race conditions
- Results merged properly
- No duplicate data

**Acceptance Criteria:**
- ✓ Concurrent requests work correctly

---

### Test 10.5: Invalid Token Refresh
**Scenario:** Expired token, user tries to access protected route

**Expected:**
- Redirected to login
- Token cleared
- User must re-authenticate

**Acceptance Criteria:**
- ✓ Token refresh/expiry handled

---

### Test 10.6: Malformed API Response
**Scenario:** Backend returns invalid JSON

**Expected:**
- Error caught gracefully
- User informed
- No app crash

**Acceptance Criteria:**
- ✓ Error handling robust

---

### Test 10.7: Multiple Rapid Submissions
**Scenario:** User double-clicks submit button quickly

**Expected:**
- Only one submission processed
- Duplicate prevented
- Button disabled during submission

**Acceptance Criteria:**
- ✓ Duplicate submissions prevented

---

### Test 10.8: Browser Back Button on Form
**Scenario:** User fills form, navigates away, clicks back button

**Expected:**
- Form data preserved (or not, depending on requirements)
- No errors

**Acceptance Criteria:**
- ✓ Browser navigation handled

---

### Test 10.9: Local Storage Corruption
**Scenario:** localStorage contains invalid token

**Expected:**
- App detects invalid token
- Clears localStorage
- User redirected to login

**Acceptance Criteria:**
- ✓ Corrupted data handled

---

### Test 10.10: Rapid Tab Switching
**Scenario:** User switches tabs rapidly

**Expected:**
- No state conflicts
- Data consistency maintained
- No memory leaks

**Acceptance Criteria:**
- ✓ Tab switching handled correctly

---

### Test 10.11: Missing API Endpoint
**Scenario:** Frontend calls non-existent API route

**Expected:**
- 404 error handled
- Meaningful error message
- App doesn't crash

**Acceptance Criteria:**
- ✓ Missing endpoints handled

---

### Test 10.12: Authorization Error (403)
**Scenario:** User tries to perform unauthorized action

**Expected:**
- 403 error returned
- User informed
- No data exposed

**Acceptance Criteria:**
- ✓ Authorization properly enforced

---

### Test 10.13: Server Error (500)
**Scenario:** Backend throws server error

**Expected:**
- 500 error handled
- User shown friendly message
- Not technical error details

**Acceptance Criteria:**
- ✓ Server errors handled gracefully

---

### Test 10.14: Connection Lost During Upload
**Scenario:** Internet disconnected while uploading file

**Expected:**
- Upload paused or failed gracefully
- User can retry
- No partial file saved

**Acceptance Criteria:**
- ✓ Upload interruption handled

---

### Test 10.15: Very Long Page Scroll
**Scenario:** Scroll through page with thousands of items

**Expected:**
- Smooth scrolling
- No lag
- Virtualization working

**Acceptance Criteria:**
- ✓ Long scroll performance acceptable

---

## SECTION 11: SECURITY TESTS

### Test 11.1: SQL Injection Prevention
**Input:** Email field: `" OR "1"="1`

**Expected:**
- Input treated as literal string
- No database compromise
- No data exposed

**Acceptance Criteria:**
- ✓ SQL injection prevented

---

### Test 11.2: XSS Prevention - Script Tag in Input
**Input:** Name field: `<script>alert('XSS')</script>`

**Expected:**
- Script not executed
- Treated as text
- Properly escaped in display

**Acceptance Criteria:**
- ✓ XSS attack prevented

---

### Test 11.3: CSRF Protection
**Scenario:** Attempt cross-site form submission

**Expected:**
- CSRF token required
- Request rejected without valid token

**Acceptance Criteria:**
- ✓ CSRF protected

---

### Test 11.4: Password Not Visible in Network Traffic
**Test:** Monitor network request in DevTools

**Expected:**
- Password sent over HTTPS only
- Password hashed before storage
- Never visible in logs

**Acceptance Criteria:**
- ✓ Passwords secured

---

### Test 11.5: JWT Token Validation
**Scenario:** Modify JWT token payload

**Expected:**
- Token signature mismatch
- Token rejected
- User redirected to login

**Acceptance Criteria:**
- ✓ JWT tampering prevented

---

---

## TEST EXECUTION SUMMARY

### Backend Tests Summary
- **Authentication Tests:** 15 test cases
- **User Model Tests:** 15 test cases
- **File Upload Tests:** 17 test cases
- **CRUD Operation Tests:** 10 test cases
- **Security Tests:** 5 test cases
- **Total Backend:** 62 test cases

### Frontend Tests Summary
- **Authentication Context Tests:** 10 test cases
- **Component Tests:** 11 test cases
- **Route/Page Tests:** 19 test cases
- **Form Tests:** 10 test cases
- **Integration Tests:** 8 test cases
- **Performance & Edge Cases:** 15 test cases
- **Total Frontend:** 73 test cases

### Grand Total: 135+ Test Cases

---

## TESTING TOOLS RECOMMENDED

### Backend Testing
- **Framework:** Jest
- **HTTP Testing:** Supertest
- **Database:** MongoDB Memory Server
- **Mocking:** Sinon or Jest mocks

### Frontend Testing
- **Framework:** Jest
- **Component Testing:** React Testing Library
- **E2E Testing:** Cypress or Playwright
- **Mocking:** MSW (Mock Service Worker)

---

## NEXT STEPS

1. Prioritize test cases by critical functionality
2. Set up testing environment with recommended tools
3. Create test files following project structure
4. Run tests in CI/CD pipeline
5. Aim for >80% code coverage
6. Update tests as features change

---

**Document Version:** 1.0  
**Last Updated:** April 28, 2026  
**Status:** Ready for Implementation
