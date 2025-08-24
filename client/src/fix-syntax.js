// Quick fix for instant loading optimization
const fs = require('fs');

// Fix all dashboards to use proper imports
const dashboards = [
  'client/src/components/teacher/TeacherDashboard.tsx',
  'client/src/components/parent/ParentDashboard.tsx', 
  'client/src/components/student/StudentDashboard.tsx',
  'client/src/components/director/DirectorDashboard.tsx',
  'client/src/components/commercial/CommercialDashboard.tsx'
];

dashboards.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Ensure proper imports
    content = content.replace(
      /import.*createInstantModule.*from.*fastModuleLoader.*/g,
      "import { createInstantModule } from '@/utils/instantModuleHelper';"
    );
    
    // Clean up any broken function references
    content = content.replace(/\bgetModule\b/g, 'createInstantModule');
    content = content.replace(/\bpreloadModule\b/g, '// removed old preload');
    
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('All dashboards fixed for instant loading!');