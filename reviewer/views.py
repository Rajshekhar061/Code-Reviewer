import json
import os
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .utils.groq_client import analyze_code
from .utils.ast_analyzer import run_ast_analysis

def index(request):
    return render(request, 'reviewer/index.html')

@csrf_exempt
@require_http_methods(["POST"])
def review_code(request):
    try:
        data = json.loads(request.body)
        code = data.get('code', '').strip()
        filename = data.get('filename', 'code')
        
        if not code:
            return JsonResponse({
                'error': 'No code provided. Please paste or upload code to review.'
            }, status=400)
        
        detected_language = detect_language(filename, code)
        
        ai_analysis = analyze_code(code)
        
        if 'error' in ai_analysis:
            return JsonResponse(ai_analysis, status=500)
        
        if 'language' not in ai_analysis or not ai_analysis['language']:
            ai_analysis['language'] = detected_language
        
        ast_issues = run_ast_analysis(code, ai_analysis.get('language', detected_language))
        
        if 'bugs' not in ai_analysis:
            ai_analysis['bugs'] = []
        
        for issue in ast_issues:
            if issue['type'] == 'ast':
                ai_analysis['bugs'].append({
                    'line': issue['line'],
                    'issue': f"[Static Analysis] {issue['issue']}",
                    'severity': 'low',
                    'fix': 'Review and address this static analysis finding.'
                })
        
        return JsonResponse(ai_analysis, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': f'Unexpected error occurred: {str(e)}'
        }, status=500)

def detect_language(filename: str, code: str) -> str:
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.py'):
        return 'Python'
    elif filename_lower.endswith('.js'):
        return 'JavaScript'
    elif filename_lower.endswith('.ts'):
        return 'TypeScript'
    elif filename_lower.endswith('.java'):
        return 'Java'
    elif filename_lower.endswith('.cpp') or filename_lower.endswith('.cc'):
        return 'C++'
    elif filename_lower.endswith('.c'):
        return 'C'
    elif filename_lower.endswith('.go'):
        return 'Go'
    elif filename_lower.endswith('.rb'):
        return 'Ruby'
    elif filename_lower.endswith('.php'):
        return 'PHP'
    elif filename_lower.endswith('.rs'):
        return 'Rust'
    
    if 'def ' in code and 'import ' in code:
        return 'Python'
    elif 'function' in code or 'const ' in code or 'let ' in code:
        return 'JavaScript'
    elif 'class ' in code and 'public ' in code:
        return 'Java'
    elif '#include' in code:
        return 'C++'
    
    return 'Unknown'
