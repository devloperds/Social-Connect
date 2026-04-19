const fs = require('fs');

function replaceStr(file, target, rep) {
  const path = require('path').resolve(__dirname, file);
  if (fs.existsSync(path)) {
    let c = fs.readFileSync(path, 'utf8');
    fs.writeFileSync(path, c.split(target).join(rep));
    console.log('Fixed:', file);
  } else {
    console.log('File not found:', path);
  }
}

replaceStr('./src/app/api/users/[userId]/posts/route.ts', 'author:users!posts_author_id_fkey(', 'author:users!author_id(');
replaceStr('./src/app/api/posts/[postId]/route.ts', 'author:users!posts_author_id_fkey(', 'author:users!author_id(');
replaceStr('./src/app/api/posts/route.ts', 'author:users!posts_author_id_fkey(', 'author:users!author_id(');
replaceStr('./src/app/api/feed/route.ts', 'author:users!posts_author_id_fkey(', 'author:users!author_id(');
replaceStr('./src/app/api/posts/[postId]/comments/route.ts', 'author:users!comments_author_id_fkey(', 'author:users!author_id(');
