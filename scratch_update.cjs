const fs = require('fs');
const filePath = 'src/components/subjects/SubjectDetail.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the main container wrapper to be fluid on mobile
content = content.replace(
  '<div className="space-y-6">',
  '<div className="space-y-4 md:space-y-6 pb-6 max-md:bg-slate-50/50 min-h-screen max-md:px-4 max-md:pt-4">'
);

// Add fluid overrides to all academic cards
content = content.replace(
  /className="academic-card /g,
  'className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 '
);

fs.writeFileSync(filePath, content);
console.log("Updated SubjectDetail.tsx successfully.");
