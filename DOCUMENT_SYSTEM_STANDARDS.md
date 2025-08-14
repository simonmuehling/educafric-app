# EDUCAFRIC Document System Standards

## 📁 Directory Structure Requirements

### MANDATORY Location
```
✅ CORRECT: /public/documents/
❌ WRONG: /documents/
❌ WRONG: /client/documents/
❌ WRONG: /server/documents/
```

### File Naming Convention
```
✅ CORRECT: kebab-case-lowercase.md
Example: educafric-contrat-partenariat-etablissements-freelancers-2025.md

❌ WRONG: UPPERCASE_WITH_UNDERSCORES.md
❌ WRONG: CamelCaseNaming.md
❌ WRONG: spaces in filename.md
```

### URL Pattern
```
✅ CORRECT: /documents/filename.md
Example: /documents/educafric-contrat-partenariat-etablissements-freelancers-2025.md

❌ WRONG: /public/documents/filename.md
❌ WRONG: /documents/UPPERCASE_FILENAME.md
```

## 🔄 Working Reference Example

**"Kit de Prospection Educafric Complet" (WORKING DOCUMENT)**
```
File Location: /public/documents/kit-prospection-educafric-complet.md
URL in Code: /documents/kit-prospection-educafric-complet.md
Access Result: ✅ PDF conversion working, no 404 errors
```

## 📋 Document Integration Checklist

When adding new documents to the commercial system:

### 1. File Placement
- [ ] File placed in `/public/documents/` directory
- [ ] Filename uses lowercase kebab-case
- [ ] No special characters or spaces in filename

### 2. Code Integration
- [ ] URL path starts with `/documents/` (not `/public/documents/`)
- [ ] Entry added to DocumentsContracts.tsx documents array
- [ ] Proper category assignment (marketing, contracts, templates, etc.)
- [ ] Correct file format specified (MD, PDF, XLSX, etc.)

### 3. Testing Verification
- [ ] Document opens without 404 errors
- [ ] PDF conversion works for MD files
- [ ] Download functionality operational
- [ ] Mobile responsive layout maintained

## 🚨 Common Mistakes to Avoid

### Wrong Directory Usage
```
❌ Creating files in /documents/ instead of /public/documents/
❌ Using absolute paths like /repo/documents/
❌ Creating separate document directories
```

### Naming Inconsistencies
```
❌ EDUCAFRIC_CONTRAT_PARTENARIAT_2025.md (uppercase)
❌ Educafric Contrat Partenariat 2025.md (spaces)
❌ educafricContratPartenariat2025.md (camelCase)
```

### URL Configuration Errors
```
❌ url: '/public/documents/filename.md'
❌ url: 'filename.md'
❌ url: './documents/filename.md'
```

## 📊 Document Categories

### Marketing Documents
- Location: `/public/documents/`
- Category: `'marketing'`
- Type: `'guide'`, `'brochure'`, `'presentation'`

### Contract Documents
- Location: `/public/documents/`
- Category: `'contracts'`
- Type: `'contract'`, `'legal'`

### Template Documents
- Location: API endpoint `/api/bulk/template/`
- Category: `'templates'`
- Type: `'template'`
- Format: `'XLSX'`

### Technical Documentation
- Location: `/public/documents/`
- Category: `'technical'`
- Type: `'guide'`

## ⚡ Quick Implementation Guide

### Adding a New Document
1. **Create file:** Place in `/public/documents/` with kebab-case name
2. **Update code:** Add entry to DocumentsContracts.tsx
3. **Set URL:** Use `/documents/filename.md` pattern
4. **Test access:** Verify no 404 errors and PDF conversion works

### Document Entry Template
```javascript
{
  id: [NEXT_AVAILABLE_ID],
  name: 'Human-Readable Document Title',
  type: 'contract|guide|brochure|template|presentation',
  category: 'marketing|contracts|templates|technical|legal',
  school: 'Target Audience',
  date: '2025-MM-DD',
  status: 'finalized',
  size: 'XX.X KB',
  format: 'MD|PDF|XLSX|HTML',
  url: '/documents/kebab-case-filename.md',
  description: 'Brief description of document content and purpose'
}
```

## 🎯 Enforcement Policy

**ALL FUTURE DOCUMENTS MUST:**
- Follow `/public/documents/` directory structure
- Use lowercase kebab-case naming
- Follow existing URL patterns
- Be tested for 404 errors before integration
- Maintain mobile responsive functionality

**NO EXCEPTIONS** - This prevents 404 errors and maintains system consistency.

## 📱 Mobile Considerations

### Commercial Dashboard Optimization
- Document titles must wrap properly on mobile (2-line limit)
- Touch-friendly button layouts required
- Responsive grid: 1 column mobile → 2 tablet → 3 desktop
- Compact padding for smartphone usage

### Template Access Permissions
- Commercial role: Template download access
- Admin roles: Full bulk import + template access
- Security: Bulk operations restricted to schools only

---

**Last Updated:** August 14, 2025
**Status:** MANDATORY STANDARD - All documents must follow this structure