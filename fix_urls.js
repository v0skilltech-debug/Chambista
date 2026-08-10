const fs = require('fs');
const path = require('path');

const API_FALLBACK = "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'";

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const files = walkSync(path.join(__dirname, 'components')).concat(walkSync(path.join(__dirname, 'app')));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace fetch/axios calls
  // we want to replace 'http://localhost:8000/api...' with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}...`
  // so we find all "http://localhost:8000/api" and 'http://localhost:8000/api' and `http://localhost:8000/api`
  
  const regexDouble = /"http:\/\/localhost:8000\/api([^"]*)"/g;
  const regexSingle = /'http:\/\/localhost:8000\/api([^']*)'/g;
  const regexBack = /`http:\/\/localhost:8000\/api([^`]*)`/g;

  content = content.replace(regexDouble, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}$1`');
  content = content.replace(regexSingle, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}$1`');
  content = content.replace(regexBack, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}$1`');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
