let currentAnalysisResult = null;

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input');
  const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
  const codeInput = document.getElementById('code-input');
  const reviewBtn = document.getElementById('review-btn');
  const clearBtn = document.getElementById('clear-btn');
  const languageSelect = document.getElementById('language-select');
  
  fileUploadWrapper.addEventListener('click', () => fileInput.click());
  fileUploadWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadWrapper.style.borderColor = '#6366f1';
    fileUploadWrapper.style.background = 'rgba(99, 102, 241, 0.05)';
  });
  
  fileUploadWrapper.addEventListener('dragleave', () => {
    fileUploadWrapper.style.borderColor = '#334155';
    fileUploadWrapper.style.background = 'transparent';
  });
  
  fileUploadWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadWrapper.style.borderColor = '#334155';
    fileUploadWrapper.style.background = 'transparent';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
  
  reviewBtn.addEventListener('click', reviewCode);
  clearBtn.addEventListener('click', clearResults);
  
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', switchTab);
  });
});

function handleFileSelect(file) {
  const allowedExtensions = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rb', '.php', '.rs'];
  const fileName = file.name.toLowerCase();
  
  const isAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isAllowedExtension) {
    alert('File type not supported. Please upload: ' + allowedExtensions.join(', '));
    return;
  }
  
  const fileNameDisplay = document.querySelector('.file-name');
  fileNameDisplay.textContent = '📄 ' + file.name;
  fileNameDisplay.style.display = 'block';
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('code-input').value = e.target.result;
    
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const languageMap = {
      '.py': 'Python',
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.go': 'Go',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.rs': 'Rust'
    };
    
    if (languageMap[extension]) {
      document.getElementById('language-select').value = languageMap[extension];
    }
  };
  
  reader.readAsText(file);
}

function reviewCode() {
  const codeInput = document.getElementById('code-input').value.trim();
  const languageSelect = document.getElementById('language-select').value;
  const reviewBtn = document.getElementById('review-btn');
  const fileNameElement = document.querySelector('.file-name');
  const fileName = fileNameElement.style.display === 'block' 
    ? fileNameElement.textContent.replace('📄 ', '')
    : 'code';
  
  if (!codeInput) {
    alert('Please paste or upload code to review.');
    return;
  }
  
  showLoadingSpinner();
  reviewBtn.disabled = true;
  
  const payload = {
    code: codeInput,
    filename: fileName || 'code'
  };
  
  fetch('/api/review/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoadingSpinner();
      reviewBtn.disabled = false;
      
      if (data.error) {
        showError(data.error);
        return;
      }
      
      currentAnalysisResult = data;
      displayResults(data);
    })
    .catch((error) => {
      hideLoadingSpinner();
      reviewBtn.disabled = false;
      showError('Network error: ' + error.message);
    });
}

function displayResults(data) {
  const resultsSection = document.getElementById('results-section');
  const errorMessage = document.querySelector('.error-message');
  errorMessage.classList.remove('show');
  
  document.getElementById('summary-language').textContent = data.language || 'Unknown';
  
  const overallScore = data.score ? data.score.overall : 0;
  const summaryBadge = document.getElementById('overall-score-badge');
  const badgeColor = getBadgeColor(overallScore);
  summaryBadge.textContent = overallScore;
  summaryBadge.className = 'badge ' + badgeColor;
  
  document.getElementById('summary-text').textContent = data.summary || 'Analysis complete.';
  
  const scoreReadability = data.score ? data.score.readability : 0;
  const scorePerformance = data.score ? data.score.performance : 0;
  const scoreBestPractices = data.score ? data.score.best_practices : 0;
  const scoreOverall = data.score ? data.score.overall : 0;
  
  animateScoreBar('readability-fill', scoreReadability * 10);
  animateScoreBar('performance-fill', scorePerformance * 10);
  animateScoreBar('best-practices-fill', scoreBestPractices * 10);
  animateScoreBar('overall-fill', scoreOverall * 10);
  
  document.getElementById('score-readability').textContent = scoreReadability;
  document.getElementById('score-performance').textContent = scorePerformance;
  document.getElementById('score-best-practices').textContent = scoreBestPractices;
  document.getElementById('score-overall').textContent = scoreOverall;
  
  renderBugs(data.bugs || []);
  renderImprovements(data.improvements || []);
  renderSecurity(data.security || []);
  renderAST(data.ast_findings || []);
  renderRefactoredCode(data.refactored_code || '');
  renderComplexity(data.complexity || {});
  renderTopPriorities(data.top_priorities || []);
  renderDiff(document.getElementById('code-input').value, data.refactored_code || '');
  
  resultsSection.classList.add('show');
  document.querySelector('html').scrollTop = resultsSection.offsetTop - 100;
}

function renderBugs(bugs) {
  const bugsList = document.getElementById('bugs-list');
  bugsList.innerHTML = '';
  
  if (bugs.length === 0) {
    bugsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No bugs detected. Great code!</div>';
    return;
  }
  
  bugs.forEach((bug) => {
    const bugItem = document.createElement('div');
    bugItem.className = 'bug-item';
    
    const severityColor = getSeverityColor(bug.severity || 'medium');
    bugItem.style.borderLeftColor = severityColor;
    
    bugItem.innerHTML = `
      <div class="bug-header">
        <div>
          <div class="bug-line">Line ${bug.line || '?'}</div>
          <span class="badge ${bug.severity || 'medium'}">${bug.severity || 'medium'}</span>
        </div>
      </div>
      <div class="bug-issue">${escape(bug.issue || 'Unknown issue')}</div>
      ${bug.fix ? `<div class="bug-fix">${escape(bug.fix)}</div>` : ''}
    `;
    
    bugsList.appendChild(bugItem);
  });
}

function renderImprovements(improvements) {
  const improvementsList = document.getElementById('improvements-list');
  improvementsList.innerHTML = '';
  
  if (improvements.length === 0) {
    improvementsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No suggestions at this time.</div>';
    return;
  }
  
  improvements.forEach((improvement) => {
    const improvementItem = document.createElement('div');
    improvementItem.className = 'improvement-item';
    
    improvementItem.innerHTML = `
      <div class="improvement-area">${escape(improvement.area || 'General')}</div>
      <div class="improvement-suggestion">${escape(improvement.suggestion || '')}</div>
      ${improvement.reason ? `<div class="improvement-reason">${escape(improvement.reason)}</div>` : ''}
    `;
    
    improvementsList.appendChild(improvementItem);
  });
}

function renderSecurity(security) {
  const securityList = document.getElementById('security-list');
  securityList.innerHTML = '';
  
  if (security.length === 0) {
    securityList.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No security issues detected.</div>';
    return;
  }
  
  security.forEach((issue) => {
    const securityItem = document.createElement('div');
    securityItem.className = 'security-item';
    
    const severityColor = getSeverityColor(issue.severity || 'medium');
    securityItem.style.borderLeftColor = severityColor;
    
    securityItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <span class="badge ${issue.severity || 'medium'}">${issue.severity || 'medium'}</span>
      </div>
      <div style="color: #cbd5e1; margin-bottom: 10px; font-weight: 500;">${escape(issue.issue || 'Security issue')}</div>
      ${issue.fix ? `<div class="bug-fix">${escape(issue.fix)}</div>` : ''}
    `;
    
    securityList.appendChild(securityItem);
  });
}

function renderAST(astFindings) {
  const astList = document.getElementById('ast-list');
  astList.innerHTML = '';
  
  if (astFindings.length === 0) {
    astList.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No static analysis findings.</div>';
    return;
  }
  
  astFindings.forEach((finding) => {
    const astItem = document.createElement('div');
    astItem.className = 'ast-item';
    
    astItem.innerHTML = `
      <div style="color: #a5b4fc; font-weight: 600; margin-bottom: 8px;">Line ${finding.line || '?'}</div>
      <div style="color: #cbd5e1;">${escape(finding.issue || '')}</div>
    `;
    
    astList.appendChild(astItem);
  });
}

function renderRefactoredCode(refactoredCode) {
  const codeBlock = document.getElementById('refactored-code-block');
  codeBlock.textContent = refactoredCode || '// No refactored code available';
}

function renderComplexity(complexity) {
  const complexitySection = document.getElementById('complexity-section');
  complexitySection.innerHTML = '';
  
  if (Object.keys(complexity).length === 0) {
    complexitySection.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No complexity analysis available.</div>';
    return;
  }
  
  if (complexity.time) {
    const timeItem = document.createElement('div');
    timeItem.className = 'complexity-item';
    timeItem.innerHTML = `
      <div class="complexity-label">Time Complexity</div>
      <div class="complexity-value">${escape(complexity.time)}</div>
    `;
    complexitySection.appendChild(timeItem);
  }
  
  if (complexity.space) {
    const spaceItem = document.createElement('div');
    spaceItem.className = 'complexity-item';
    spaceItem.innerHTML = `
      <div class="complexity-label">Space Complexity</div>
      <div class="complexity-value">${escape(complexity.space)}</div>
    `;
    complexitySection.appendChild(spaceItem);
  }
  
  if (complexity.notes) {
    const notesItem = document.createElement('div');
    notesItem.className = 'complexity-item';
    notesItem.innerHTML = `
      <div class="complexity-label">Notes</div>
      <div class="complexity-notes">${escape(complexity.notes)}</div>
    `;
    complexitySection.appendChild(notesItem);
  }
}

function renderTopPriorities(priorities) {
  const prioritiesList = document.getElementById('priorities-list');
  prioritiesList.innerHTML = '';
  
  if (priorities.length === 0) {
    prioritiesList.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No priorities identified.</div>';
    return;
  }
  
  const ol = document.createElement('ol');
  priorities.forEach((priority) => {
    const li = document.createElement('li');
    li.textContent = priority;
    ol.appendChild(li);
  });
  
  prioritiesList.appendChild(ol);
}

function renderDiff(originalCode, refactoredCode) {
  const originalDiff = document.getElementById('original-diff');
  const refactoredDiff = document.getElementById('refactored-diff');
  
  const originalLines = originalCode.split('\n');
  const refactoredLines = refactoredCode.split('\n');
  const maxLines = Math.max(originalLines.length, refactoredLines.length);
  
  let originalHTML = '';
  let refactoredHTML = '';
  
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || '';
    const refacLine = refactoredLines[i] || '';
    
    const origLineNum = `<span style="color: #64748b; margin-right: 10px;">${i + 1}</span>`;
    const refacLineNum = `<span style="color: #64748b; margin-right: 10px;">${i + 1}</span>`;
    
    if (origLine !== refacLine) {
      if (origLine) {
        originalHTML += `<div class="diff-line diff-removed">${origLineNum}<code>${escape(origLine)}</code></div>`;
      }
      if (refacLine) {
        refactoredHTML += `<div class="diff-line diff-added">${refacLineNum}<code>${escape(refacLine)}</code></div>`;
      }
    } else {
      originalHTML += `<div class="diff-line">${origLineNum}<code>${escape(origLine)}</code></div>`;
      refactoredHTML += `<div class="diff-line">${refacLineNum}<code>${escape(refacLine)}</code></div>`;
    }
  }
  
  originalDiff.innerHTML = originalHTML;
  refactoredDiff.innerHTML = refactoredHTML;
}

function switchTab(event) {
  const tabName = event.target.getAttribute('data-tab');
  
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.remove('active');
  });
  
  event.target.classList.add('active');
  document.getElementById(tabName + '-content').classList.add('active');
}

function clearResults() {
  document.getElementById('code-input').value = '';
  document.getElementById('language-select').value = 'Auto-detect';
  document.querySelector('.file-name').style.display = 'none';
  document.getElementById('results-section').classList.remove('show');
  document.querySelector('.error-message').classList.remove('show');
  currentAnalysisResult = null;
}

function showLoadingSpinner() {
  document.querySelector('.loading-spinner').classList.add('show');
}

function hideLoadingSpinner() {
  document.querySelector('.loading-spinner').classList.remove('show');
}

function showError(message) {
  const errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  document.getElementById('results-section').classList.remove('show');
}

function getBadgeColor(score) {
  if (score >= 8) return 'green';
  if (score >= 5) return 'orange';
  return 'red';
}

function getSeverityColor(severity) {
  const severityMap = {
    'critical': '#dc2626',
    'high': '#ea580c',
    'medium': '#ca8a04',
    'low': '#16a34a'
  };
  return severityMap[severity] || '#6b7280';
}

function animateScoreBar(elementId, targetWidth) {
  const element = document.getElementById(elementId);
  element.style.width = '0%';
  
  setTimeout(() => {
    element.style.width = targetWidth + '%';
  }, 100);
}

function escape(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', function () {
    const codeBlock = document.getElementById('refactored-code-block');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
      button.textContent = '✓ Copied';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = 'Copy Code';
        button.classList.remove('copied');
      }, 2000);
    });
  });
});
