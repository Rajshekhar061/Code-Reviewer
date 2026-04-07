# Quick Start Guide - AI Code Reviewer

## 5-Minute Setup

### Step 1: Get a Groq API Key (1 min)
1. Go to https://console.groq.com/keys
2. Sign up or login to your account
3. Create a new API key
4. Copy the key

### Step 2: Set Up Environment (2 min)
```bash
# Navigate to project directory
cd ai-code-review

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Or (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure API Key (1 min)
1. Open `.env` file in the project root
2. Replace `your_groq_api_key_here` with your actual key
3. Save the file

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Run the Server (1 min)
```bash
python manage.py runserver
```

### Step 5: Open in Browser
- Go to: http://127.0.0.1:8000
- Start reviewing code!

---

## Usage Examples

### Example 1: Python Code
```python
def calculate_factorial(n):
    if n == 0:
        return 1
    else:
        return n * calculate_factorial(n-1)
```
- Paste this into the textarea
- Click "Review Code"
- Get analysis on recursion, complexity, and potential issues

### Example 2: JavaScript Code
```javascript
var x = 5;
if (x == 5) {
    console.log("x is 5")
}
```
- Upload or paste this code
- Click "Review Code"
- See suggestions to use `const`, use `===`, and remove console.log

---

## What Each Tab Shows

| Tab | Shows |
|-----|-------|
| 🐛 Bugs | Critical, high, medium, low severity issues |
| 💡 Suggestions | Code improvements and best practices |
| 🔒 Security | Security vulnerabilities found |
| 🔍 Static Analysis | AST-based analysis findings |
| ✨ Refactored | Improved code + complexity analysis |

---

## Features Checklist

✅ Multi-language support (10+ languages)
✅ AI-powered bug detection
✅ Code quality scoring
✅ Security analysis
✅ AST-based static analysis
✅ Automatic refactoring
✅ Complexity analysis
✅ Side-by-side diff view
✅ Dark theme UI
✅ Mobile responsive
✅ Drag-and-drop file upload
✅ Copy to clipboard

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Review code (when focused on textarea)

---

## File Upload Supported Formats

- `.py` - Python
- `.js` - JavaScript
- `.ts` - TypeScript
- `.java` - Java
- `.cpp` / `.cc` - C++
- `.c` - C
- `.go` - Go
- `.rb` - Ruby
- `.php` - PHP
- `.rs` - Rust

---

## Common Issues & Solutions

### Issue: "GROQ_API_KEY not configured"
**Solution:** 
- Check `.env` file exists
- Verify API key is in `.env`
- Restart server after adding key

### Issue: "Module 'groq' not found"
**Solution:**
```bash
pip install groq
```

### Issue: Port 8000 already in use
**Solution:**
```bash
python manage.py runserver 8001
```

### Issue: Static files not loading
**Solution:**
```bash
python manage.py collectstatic --noinput
```

---

## Environment Variables

Only one environment variable is required:

```
GROQ_API_KEY=your_api_key_here
```

This is read from the `.env` file in the project root.

---

## Project URLs

| URL | Purpose |
|-----|---------|
| `/` | Main UI |
| `/api/review/` | API endpoint for code analysis |

---

## Production Deployment

For production use:

1. **Update SECRET_KEY** in `settings.py`
2. **Set DEBUG = False** in `settings.py`
3. **Use Gunicorn:**
   ```bash
   pip install gunicorn
   gunicorn ai_code_reviewer.wsgi:application
   ```
4. **Set allowed hosts:**
   ```python
   ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']
   ```
5. **Use environment variables for all secrets**
6. **Enable HTTPS**
7. **Use a production database** (PostgreSQL recommended)

---

## Getting Help

1. Check README.md for detailed documentation
2. Review the code comments in each file
3. Check Groq API documentation: https://console.groq.com/docs
4. Verify your API key is valid

---

## What You Can Do Now

✨ **Review your code with AI**
- Paste any code snippet
- Get instant analysis
- Learn from suggestions
- Refactor automatically

🐛 **Find bugs before production**
- Static analysis
- Logic errors
- Best practice violations
- Security issues

🚀 **Improve your skills**
- See AI-powered refactoring
- Learn complexity analysis
- Understand best practices
- Get security tips

---

**Happy Coding!** 🎉
