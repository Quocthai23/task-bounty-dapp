const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace imports with @ aliases
  content = content.replace(/import \{ Card \} from '.*?components\/atoms\/Card\/Card';/g, 'import { Card, CardHeader, CardTitle, CardContent } from \'@/components/shared/atoms/card\';');
  content = content.replace(/import \{ Badge \} from '.*?components\/atoms\/Badge\/Badge';/g, 'import { Badge } from \'@/components/shared/atoms/badge\';');
  content = content.replace(/import \{ Input \} from '.*?components\/atoms\/Input\/Input';/g, 'import { Input } from \'@/components/shared/atoms/input\';');
  content = content.replace(/import \{ Button \} from '.*?components\/atoms\/Button\/Button';/g, 'import { Button } from \'@/components/shared/atoms/button\';');
  content = content.replace(/import \{ Modal \} from '.*?components\/atoms\/Modal\/Modal';/g, 'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from \'@/components/shared/atoms/dialog\';');
  content = content.replace(/import \{ Badge \} from '\.\.\/atoms\/Badge\/Badge';/g, 'import { Badge } from \'@/components/shared/atoms/badge\';');

  // Fix custom Card props mapping to Shadcn Card
  content = content.replace(/<Card\s+className=\"(.*?)\">/g, '<Card className=\"glass-panel $1\">');
  content = content.replace(/<Card>/g, '<Card className=\"glass-panel\">');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
