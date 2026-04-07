# AI Code Reviewer

A powerful AI-powered code review system that analyzes code using advanced language models to detect bugs, suggest improvements, perform security analysis, and generate refactored versions of your code.

## Features

✨ **Core Features:**
- Multi-language code analysis (Python, JavaScript, TypeScript, Java, C++, and more)
- AI-powered bug detection with severity levels
- Automated code improvement suggestions
- Security vulnerability scanning
- AST-based static analysis
- Code quality scoring (readability, performance, best practices)
- Time & space complexity analysis
- Automatic code refactoring
- Side-by-side diff view (original vs refactored)
- Dark-themed modern UI

## Tech Stack

- **Backend:** Django 4.2
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **AI Engine:** Groq API (llama3-70b-8192)
- **Environment:** Python 3.8+

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- A Groq API key (get it from https://console.groq.com/keys)

### Installation

1. **Clone or extract the project**
   ```bash
   cd ai-code-review
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   - Open `.env` file
   - Replace `your_groq_api_key_here` with your actual Groq API key:
     ```
     GROQ_API_KEY=gsk_your_actual_key_here
     ```

6. **Run the Django development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Open your browser and navigate to: `http://127.0.0.1:8000`

## How to Use

1. **Paste or Upload Code**
   - Paste code directly into the textarea, or
   - Upload a file (.py, .js, .ts, .java, .cpp, .c, .go, .rb, .php, .rs)

2. **Language Detection**
   - Language is auto-detected from file extension or can be manually selected

3. **Click "Review Code"**
   - The AI analyzes your code and returns comprehensive results

4. **Review Results**
   - **Summary:** Overview and language detection
   - **Scores:** Readability, Performance, Best Practices ratings (0-10)
   - **Bugs Tab:** Critical issues with fixes
   - **Suggestions Tab:** Code improvement recommendations
   - **Security Tab:** Security vulnerabilities discovered
   - **Static Analysis Tab:** AST-based findings
   - **Refactored Tab:** Improved code version with complexity analysis
   - **Diff View:** Visual comparison of original vs refactored code

## API Endpoints

### Review Code
- **URL:** `/api/review/`
- **Method:** POST
- **Content-Type:** application/json
- **Request Body:**
  ```json
  {
    "code": "your code here",
    "filename": "script.py"
  }
  ```
- **Response:**
  ```json
  {
    "language": "Python",
    "summary": "...",
    "bugs": [...],
    "improvements": [...],
    "refactored_code": "...",
    "score": {"readability": 7, "performance": 8, "best_practices": 6, "overall": 7},
    "complexity": {"time": "O(n)", "space": "O(1)", "notes": "..."},
    "security": [...],
    "top_priorities": [...]
  }
  ```

## Project Structure

```
ai-code-review/
├── manage.py                          # Django management script
├── requirements.txt                   # Python dependencies
├── .env                               # Environment variables (Groq API key)
├── ai_code_reviewer/                  # Django project settings
│   ├── __init__.py
│   ├── settings.py                    # Django configuration
│   ├── urls.py                        # Root URL routing
│   └── wsgi.py                        # WSGI application
├── reviewer/                          # Main Django app
│   ├── __init__.py
│   ├── views.py                       # View handlers
│   ├── urls.py                        # App URL routing
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── groq_client.py            # Groq API integration
│   │   ├── ast_analyzer.py           # Static code analysis
│   │   └── scorer.py                 # Score calculation utilities
│   └── templates/
│       └── reviewer/
│           └── index.html             # Main UI template
├── static/
│   ├── css/
│   │   └── style.css                 # Styling (dark theme)
│   └── js/
│       └── main.js                    # Frontend logic
└── db.sqlite3                         # Database (auto-created)
```

## Key Files Overview

### `reviewer/utils/groq_client.py`
- Integrates with Groq API for AI code analysis
- Sends code to llama3-70b-8192 model
- Parses and validates JSON responses
- Handles API errors gracefully

### `reviewer/utils/ast_analyzer.py`
- Python AST-based static analysis
- JavaScript pattern-based static checks
- Detects: unused imports, bare excepts, var declarations, console.log, etc.

### `reviewer/utils/scorer.py`
- Calculates badge colors based on scores
- Severity color mapping for issues

### `static/js/main.js`
- Handles file uploads and drag-and-drop
- Fetches data from API
- Renders results dynamically
- Implements tab switching
- Generates diff view
- Copy-to-clipboard functionality

### `static/css/style.css`
- Dark-themed modern UI (#0f172a background)
- Responsive design (mobile, tablet, desktop)
- Animations and transitions
- Syntax-highlighted code blocks

## Groq API Integration

This application uses the Groq API with the `llama3-70b-8192` model for code analysis.

**What the AI Returns:**
- Language detection
- Bug analysis with severity levels
- Improvement suggestions
- Security vulnerabilities
- Complexity analysis
- Refactored code
- Overall quality scores

## Customization

### Change Groq Model
Edit `reviewer/utils/groq_client.py` line with `model="llama3-70b-8192"` to use a different Groq model.

### Modify System Prompt
Update the `system_prompt` in `reviewer/utils/groq_client.py` to change how the AI analyzes code.

### Customize Styling
Modify `static/css/style.css` to change colors, fonts, or layout.

### Add More Languages
Update `reviewer/views.py` `detect_language()` function and `reviewer/utils/ast_analyzer.py` for language-specific analysis.

## Troubleshooting

### "GROQ_API_KEY not configured"
- Ensure your `.env` file exists in the project root
- Verify the API key is correctly set
- Restart the server after updating `.env`

### Port Already in Use
```bash
python manage.py runserver 8001
```

### Dependencies Not Installing
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Static Files Not Loading
```bash
python manage.py collectstatic
```

## Performance Tips

- The Groq API response time varies based on code complexity
- Larger code submissions may take longer to analyze
- Keep the Django server running locally for fast analysis
- For production, consider using Gunicorn and Nginx

## Security Notes

- Change `SECRET_KEY` in `settings.py` for production
- Set `DEBUG = False` for production deployment
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Use CSRF protection in production templates

## License

Built as a demonstration project.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your Groq API key is valid
3. Check Django logs for errors
4. Ensure all dependencies are installed

---

**Happy Code Reviewing!** 🚀
