export type DocumentTemplate = 
  | 'markdown'
  | 'html'
  | 'pdf'
  | 'docx'
  | 'presentation'
  | 'spreadsheet'
  | 'technical-report'
  | 'business-proposal'
  | 'contract'
  | 'research-paper'
  | 'cv'
  | 'invoice';

export interface DocumentConfig {
  title: string;
  content: string;
  template: DocumentTemplate;
  author?: string;
  date?: Date;
  metadata?: Record<string, any>;
}

export interface GeneratedDocument {
  content: string;
  mimeType: string;
  filename: string;
}

/**
 * Generate documents in various formats with customizable templates
 */
export function generateDocument(config: DocumentConfig): GeneratedDocument {
  switch (config.template) {
    case 'markdown':
      return generateMarkdown(config);
    case 'html':
      return generateHTML(config);
    case 'technical-report':
      return generateTechnicalReport(config);
    case 'business-proposal':
      return generateBusinessProposal(config);
    case 'contract':
      return generateContract(config);
    case 'research-paper':
      return generateResearchPaper(config);
    case 'cv':
      return generateCV(config);
    case 'invoice':
      return generateInvoice(config);
    case 'presentation':
      return generatePresentation(config);
    case 'spreadsheet':
      return generateSpreadsheet(config);
    default:
      return generateMarkdown(config);
  }
}

function generateMarkdown(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  const header = `# ${config.title}\n\n${config.author ? `**Author:** ${config.author}\n\n` : ''}${config.date ? `**Date:** ${date.toLocaleDateString()}\n\n` : ''}---\n\n`;
  
  const content = `${header}${config.content}\n\n---\n_Generated on ${date.toISOString()}_`;
  
  return {
    content,
    mimeType: 'text/markdown',
    filename: `${sanitizeFilename(config.title)}.md`,
  };
}

function generateHTML(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.title)}</title>
  <style>
    body { font-family: 'Georgia', 'Newsreader', serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #333; background: #f9f3d7; }
    h1 { color: #20221d; border-bottom: 3px solid #d4a574; padding-bottom: 10px; }
    .metadata { font-size: 0.9em; color: #666; margin-bottom: 30px; }
    .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f0f0f0; padding: 15px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #d4a574; padding-left: 15px; margin-left: 0; color: #666; }
  </style>
</head>
<body>
  <h1>${escapeHtml(config.title)}</h1>
  <div class="metadata">
    ${config.author ? `<p><strong>Author:</strong> ${escapeHtml(config.author)}</p>` : ''}
    <p><strong>Date:</strong> ${date.toLocaleDateString()}</p>
  </div>
  <div class="content">
    ${markdownToHtml(config.content)}
  </div>
</body>
</html>`;

  return {
    content: html,
    mimeType: 'text/html',
    filename: `${sanitizeFilename(config.title)}.html`,
  };
}

function generateTechnicalReport(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  const sections = config.content.split('\n\n');
  
  const markdown = `# Technical Report: ${config.title}

**Prepared by:** ${config.author || 'Anonymous'}  
**Date:** ${date.toLocaleDateString()}  
**Classification:** Standard

## Executive Summary

${sections[0] || 'No summary provided'}

## Detailed Analysis

${sections.slice(1, -1).join('\n\n## ')}

## Conclusion

${sections[sections.length - 1] || 'N/A'}

## Metadata

- **Document Type:** Technical Report
- **Generated:** ${date.toISOString()}
- **Format:** ${config.template}

---

_This document was automatically generated._`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `technical-report-${sanitizeFilename(config.title)}.md`,
  };
}

function generateBusinessProposal(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  
  const markdown = `# Business Proposal

## ${config.title}

**Prepared for:** Client Name  
**Prepared by:** ${config.author || 'Your Organization'}  
**Date:** ${date.toLocaleDateString()}  
**Valid Until:** ${new Date(date.getTime() + 30*24*60*60*1000).toLocaleDateString()}

---

## Executive Summary

${config.content}

## Solution Overview

Detailed solution and implementation approach will be provided upon request.

## Investment & ROI

- **Estimated Investment:** TBD
- **Expected ROI:** TBD
- **Timeline:** TBD

## Next Steps

1. Review proposal
2. Schedule discovery call
3. Finalize terms
4. Execute agreement

---

**Contact Information**

Name: ${config.author || 'Your Name'}  
Email: contact@example.com  
Phone: +1 (555) 000-0000

_This proposal is confidential and proprietary._`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `proposal-${sanitizeFilename(config.title)}.md`,
  };
}

function generateContract(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  
  const markdown = `# CONTRACT AGREEMENT

**Effective Date:** ${date.toLocaleDateString()}

## ${config.title}

This Agreement ("Agreement") is entered into as of the date first written above, by and between the parties identified below.

### WHEREAS

WHEREAS, the parties desire to enter into a contractual agreement under the terms and conditions set forth herein.

### AGREEMENT

The parties hereby agree as follows:

${config.content}

### TERMS & CONDITIONS

1. **Entire Agreement** - This Agreement constitutes the entire agreement between the parties.
2. **Governing Law** - This Agreement shall be governed by applicable laws.
3. **Confidentiality** - Both parties agree to maintain confidentiality of proprietary information.

### SIGNATURES

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

**Party A:** _________________________ Date: _________

**Party B:** _________________________ Date: _________

---

_Document generated on ${date.toISOString()}_`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `contract-${sanitizeFilename(config.title)}.md`,
  };
}

function generateResearchPaper(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  
  const markdown = `# ${config.title}

**Author:** ${config.author || 'Anonymous'}  
**Date:** ${date.toLocaleDateString()}

## Abstract

${config.content.split('\n')[0] || 'Abstract pending'}

## Introduction

${config.content}

## Literature Review

Existing research in this domain covers multiple perspectives and methodologies.

## Methodology

Systematic approach to data collection and analysis.

## Results & Discussion

Key findings and implications for the field.

## Conclusion

Summary of contributions and future directions.

## References

- Reference 1
- Reference 2
- Reference 3

---

**Keywords:** research, analysis, scientific study

_Peer review status: Submitted_`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `research-${sanitizeFilename(config.title)}.md`,
  };
}

function generateCV(config: DocumentConfig): GeneratedDocument {
  const markdown = `# ${config.author || config.title}

## Professional Summary

${config.content}

## Experience

### Role Title
Company Name | 2023 – Present
- Achievement 1
- Achievement 2
- Achievement 3

### Previous Role
Previous Company | 2021 – 2023
- Responsibility 1
- Responsibility 2

## Education

**Degree Name**  
Institution Name | Graduation Year

## Skills

- Leadership
- Technical Writing
- Strategic Planning
- Problem Solving
- Communication

## Certifications

- Certification Name (Issuing Organization, Year)

---

_References available upon request_`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `cv-${sanitizeFilename(config.author || config.title)}.md`,
  };
}

function generateInvoice(config: DocumentConfig): GeneratedDocument {
  const date = config.date || new Date();
  const dueDate = new Date(date.getTime() + 30*24*60*60*1000);
  
  const markdown = `# INVOICE

**Invoice #:** INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-001

## FROM

${config.author || 'Your Company'}  
123 Business Street  
City, State 12345  
contact@company.com

## BILL TO

Client Name  
Client Address

---

## Invoice Details

| Item | Description | Qty | Rate | Amount |
|------|-------------|-----|------|--------|
| ${config.title} | ${config.content.split('\n')[0]} | 1 | $0.00 | $0.00 |

---

## Summary

- **Subtotal:** $0.00
- **Tax (0%):** $0.00
- **TOTAL DUE:** $0.00

**Payment Due:** ${dueDate.toLocaleDateString()}

## Payment Terms

Net 30 days from invoice date.

---

_Thank you for your business!_`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `invoice-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}.md`,
  };
}

function generatePresentation(config: DocumentConfig): GeneratedDocument {
  const markdown = `# ${config.title}

## Slide 1: Title Slide

**${config.title}**

Presented by: ${config.author || 'Presenter'}  
Date: ${new Date().toLocaleDateString()}

---

## Slide 2: Overview

${config.content.split('\n')[0] || 'Topic overview'}

---

## Slide 3: Key Points

- Point 1
- Point 2
- Point 3

---

## Slide 4: Analysis

${config.content}

---

## Slide 5: Conclusions

Summary of key takeaways and next steps.

---

## Slide 6: Q&A

Questions?

Contact: ${config.author || 'Contact information'}`;

  return {
    content: markdown,
    mimeType: 'text/markdown',
    filename: `presentation-${sanitizeFilename(config.title)}.md`,
  };
}

function generateSpreadsheet(config: DocumentConfig): GeneratedDocument {
  const lines = config.content.split('\n').filter(l => l.trim());
  const csv = ['Title,Content,Date,Author'].concat(
    lines.map(line => `"${line.replace(/"/g, '""')}","Data","${new Date().toISOString().split('T')[0]}","${config.author || 'N/A'}"`)
  ).join('\n');

  return {
    content: csv,
    mimeType: 'text/csv',
    filename: `spreadsheet-${sanitizeFilename(config.title)}.csv`,
  };
}

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export const AVAILABLE_TEMPLATES: Array<{ value: DocumentTemplate; label: string }> = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML Document' },
  { value: 'technical-report', label: 'Technical Report' },
  { value: 'business-proposal', label: 'Business Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'research-paper', label: 'Research Paper' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'spreadsheet', label: 'Spreadsheet (CSV)' },
];
