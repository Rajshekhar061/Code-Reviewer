import ast
import re

def run_ast_analysis(code: str, language: str) -> list:
    issues = []
    
    if language.lower() == 'python':
        issues.extend(_analyze_python(code))
    elif language.lower() == 'javascript':
        issues.extend(_analyze_javascript(code))
    
    return issues

def _analyze_python(code: str) -> list:
    issues = []
    
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return [{
            'issue': f'Syntax error: {e.msg}',
            'line': str(e.lineno) if e.lineno else 'unknown',
            'type': 'ast'
        }]
    
    imported_names = set()
    used_names = set()
    assigned_names = {}
    function_returns = {}
    bare_excepts = []
    deep_nesting_issues = []
    
    class ASTVisitor(ast.NodeVisitor):
        def visit_Import(self, node):
            for alias in node.names:
                name = alias.asname if alias.asname else alias.name
                imported_names.add(name)
                imported_names.add(alias.name)
            self.generic_visit(node)
        
        def visit_ImportFrom(self, node):
            for alias in node.names:
                name = alias.asname if alias.asname else alias.name
                imported_names.add(name)
            self.generic_visit(node)
        
        def visit_Name(self, node):
            if isinstance(node.ctx, (ast.Load, ast.Del)):
                used_names.add(node.id)
            elif isinstance(node.ctx, ast.Store):
                assigned_names[node.id] = node.lineno
            self.generic_visit(node)
        
        def visit_FunctionDef(self, node):
            has_return = any(
                isinstance(n, ast.Return)
                for n in ast.walk(node)
            )
            if not has_return and len(node.body) > 0:
                function_returns[node.name] = node.lineno
            
            self._check_nesting(node, 0, node.lineno)
            self.generic_visit(node)
        
        def visit_ExceptHandler(self, node):
            if node.type is None and node.name is None:
                bare_excepts.append(node.lineno)
            self.generic_visit(node)
        
        def _check_nesting(self, node, depth, lineno):
            max_depth = 0
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.For, ast.While, ast.If, ast.With)):
                    child_depth = self._calculate_depth(child, 1)
                    if child_depth > 3:
                        deep_nesting_issues.append((child.lineno, child_depth))
        
        def _calculate_depth(self, node, current_depth):
            if isinstance(node, (ast.For, ast.While, ast.If, ast.With)):
                max_child_depth = current_depth
                for child in ast.iter_child_nodes(node):
                    if isinstance(child, (ast.For, ast.While, ast.If, ast.With)):
                        child_depth = self._calculate_depth(child, current_depth + 1)
                        max_child_depth = max(max_child_depth, child_depth)
                return max_child_depth
            return current_depth
    
    visitor = ASTVisitor()
    visitor.visit(tree)
    
    unused_imports = imported_names - used_names
    for unused in unused_imports:
        if unused not in ('__all__', '__name__', '__doc__'):
            issues.append({
                'issue': f'Unused import: {unused}',
                'line': 'top',
                'type': 'ast'
            })
    
    unused_variables = set(assigned_names.keys()) - used_names
    for unused_var in unused_variables:
        if not unused_var.startswith('_'):
            try:
                line_num = assigned_names[unused_var]
                issues.append({
                    'issue': f'Variable "{unused_var}" assigned but never used',
                    'line': str(line_num),
                    'type': 'ast'
                })
            except:
                pass
    
    for func_name, line_num in function_returns.items():
        if not func_name.startswith('_'):
            issues.append({
                'issue': f'Function "{func_name}" has no return statement',
                'line': str(line_num),
                'type': 'ast'
            })
    
    for line_num in bare_excepts:
        issues.append({
            'issue': 'Bare except clause - should specify exception type',
            'line': str(line_num),
            'type': 'ast'
        })
    
    for line_num, depth in deep_nesting_issues:
        issues.append({
            'issue': f'Deep nesting detected ({depth} levels) - consider refactoring',
            'line': str(line_num),
            'type': 'ast'
        })
    
    return issues

def _analyze_javascript(code: str) -> list:
    issues = []
    lines = code.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        if re.match(r'\bvar\s+\w+', stripped):
            if not stripped.startswith('//'):
                issues.append({
                    'issue': 'Use "let" or "const" instead of "var"',
                    'line': str(line_num),
                    'type': 'ast'
                })
        
        if re.search(r'console\.log\s*\(', stripped):
            if not stripped.startswith('//'):
                issues.append({
                    'issue': 'Remove console.log statement before production',
                    'line': str(line_num),
                    'type': 'ast'
                })
        
        if re.search(r'==\s*(?!=)', stripped) and '===' not in stripped:
            if not stripped.startswith('//'):
                issues.append({
                    'issue': 'Use "===" for comparison instead of "=="',
                    'line': str(line_num),
                    'type': 'ast'
                })
        
        if re.search(r'\w+\s*\)', stripped) and not stripped.endswith(';') and not stripped.endswith('{') and not stripped.endswith(',') and not stripped.startswith('//'):
            if re.search(r'[a-zA-Z0-9_]\)\s*$', stripped):
                if 'function' not in stripped and '=>' not in stripped:
                    issues.append({
                        'issue': 'Missing semicolon at end of statement',
                        'line': str(line_num),
                        'type': 'ast'
                    })
    
    return issues
