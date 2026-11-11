import { execSync } from 'child_process';

const INTERVAL_MS = 15000; // Check every 15 seconds

console.log('🔄 Auto-push watcher started. Monitoring for changes every 15 seconds...');
console.log('Press Ctrl + C to stop.');

let isSyncing = false;

function checkAndPush() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (status) {
      console.log(`\n[${new Date().toLocaleTimeString()}] 📝 Changes detected:\n${status}`);
      console.log('⏳ Staging changes...');
      execSync('git add .', { stdio: 'inherit' });

      const timestamp = new Date().toLocaleString();
      console.log('💾 Committing changes...');
      execSync(`git commit -m "Auto-commit: ${timestamp}"`, { stdio: 'inherit' });

      console.log('🚀 Pushing to GitHub...');
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Changes successfully pushed to GitHub!\n');
    }
  } catch (err) {
    console.error('⚠️ Auto-push notice/error:', err.message);
  } finally {
    isSyncing = false;
  }
}

// Initial check
checkAndPush();

// Polling interval
setInterval(checkAndPush, INTERVAL_MS);
