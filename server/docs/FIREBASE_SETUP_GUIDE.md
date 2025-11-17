# 🔥 Firebase Storage Setup Guide

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Follow the setup wizard

### 2. Enable Firebase Storage

1. In your Firebase project, go to **Build** → **Storage**
2. Click **"Get Started"**
3. Choose production mode or test mode:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /factures/{allPaths=**} {
         allow read: if true;  // Public read
         allow write: if false; // Only admin SDK can write
       }
     }
   }
   ```
4. Click **Done**

### 3. Generate Service Account Key

1. Go to **Project Settings** (⚙️ icon)
2. Navigate to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Click **"Generate Key"** → A JSON file will be downloaded

### 4. Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the **entire** JSON content
3. Update your `.env` file:

```env
# Firebase Storage (pour factures PDF)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"xxx",...}
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Important Notes:**
- Keep the JSON as a **single line** (no newlines)
- Or use escape characters for newlines: `\n`
- The `private_key` will contain `\n` characters - keep them as is
- Replace `your-project-id.appspot.com` with your actual Storage bucket name

### 5. Security Rules (Production)

Update your Storage rules for production:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read for factures folder
    match /factures/{filename} {
      allow read: if true;
      allow write: if false; // Only server (Admin SDK) can write
    }
    
    // Block all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 6. Verify Setup

Start your server and check the console:

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

### 7. Test Upload

Create a test order with a PDF facture. The file should be uploaded to:
- **Firebase Console** → **Storage** → **factures/** folder
- URL format: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/factures%2F{filename}?alt=media`

---

## Troubleshooting

### Error: "Failed to parse service account"
- Ensure the JSON is valid
- Check for missing quotes or commas
- Try using an online JSON validator

### Error: "Storage bucket not found"
- Verify `FIREBASE_STORAGE_BUCKET` matches your project
- Format: `project-id.appspot.com` (not `gs://...`)

### Error: "Permission denied"
- Check Storage Rules allow public read
- Verify Admin SDK has proper credentials

### Files not appearing in Storage
- Check Firebase Console → Storage
- Verify the upload function completed successfully
- Look for error logs in server console

---

## Migration from Cloudinary

✅ **Completed:**
- Installed `firebase-admin` SDK
- Created `config/firebase.js` configuration
- Updated `routes/commandesRoutes.js` to use Firebase middleware
- Updated `controllers/commandesController.js` to upload/delete from Firebase
- Added environment variables to `.env`

**What's different:**
- **Cloudinary:** Uses `multer-storage-cloudinary` with direct file path
- **Firebase:** Uses `multer` memory storage → uploads Buffer to Firebase
- **PDF URLs:** Now use Firebase Storage URLs instead of Cloudinary URLs

**Advantages:**
- ✅ Cheaper for document storage
- ✅ Better for PDFs (no transformations needed)
- ✅ Simpler pricing model
- ✅ 5GB free storage + 1GB/day free downloads

---

## Example `.env` Configuration

```env
# Firebase Storage
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"arseet-app","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xyz@arseet-app.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40arseet-app.iam.gserviceaccount.com"}
FIREBASE_STORAGE_BUCKET=arseet-app.appspot.com
```

---

## Testing Checklist

- [ ] Firebase project created
- [ ] Storage enabled in Firebase Console
- [ ] Service account key generated
- [ ] `.env` file updated with credentials
- [ ] Server starts without errors
- [ ] Test order creation with PDF upload
- [ ] PDF visible in Firebase Console Storage
- [ ] PDF downloadable from public URL
- [ ] Test order deletion (PDF also deleted)

---

**Status:** ✅ Ready to use (after configuring Firebase credentials)
