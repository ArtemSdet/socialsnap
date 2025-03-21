document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) {
    console.error('Generate button not found!');
    return;
  }

  function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (window.auth.currentUser) {
      loginBtn.innerText = 'Logout';
      loginBtn.onclick = () => window.signOut(window.auth);
    } else {
      loginBtn.innerText = 'Login';
      loginBtn.onclick = () => {
        const provider = new window.GoogleAuthProvider();
        window.signInWithPopup(window.auth, provider).catch((error) => alert('Login failed: ' + error.message));
      };
    }
  }

  window.onAuthStateChanged(window.auth, (user) => {
    updateLoginButton();
    console.log(user ? `Logged in: ${user.email}` : 'Logged out');
  });

  async function checkPostLimit(user) {
    if (!user) return { allowed: true, count: 0 }; // No limit if not logged in (for now)
    const userDoc = await window.db.collection('users').doc(user.uid).get();
    const data = userDoc.exists ? userDoc.data() : { postCount: 0, lastReset: null };
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0);

    if (!data.lastReset || data.lastReset < weekStart) {
      await window.db.collection('users').doc(user.uid).set({ postCount: 0, lastReset: weekStart });
      return { allowed: true, count: 0 };
    }
    return { allowed: data.postCount < 3, count: data.postCount };
  }

  generateBtn.addEventListener('click', async () => {
    const niche = document.getElementById('niche')?.value;
    const keywords = document.getElementById('keywords')?.value;
    const output = document.getElementById('output');

    if (!niche || !keywords || !output) {
      output.innerHTML = 'Error: Page elements missing. Refresh and try again.';
      console.error('Missing elements:', { niche, keywords, output });
      return;
    }
    if (!keywords.trim()) {
      output.innerHTML = 'Please enter keywords!';
      return;
    }

    const user = window.auth.currentUser;
    const { allowed, count } = await checkPostLimit(user);
    if (!allowed) {
      output.innerHTML = 'Free limit reached (3 posts/week). Log in and upgrade!';
      return;
    }

    output.innerHTML = 'Generating...';
    setTimeout(() => {
      output.innerHTML = `
        <h3>X Post:</h3><p>${niche} update: ${keywords} trending now!</p>
        <h3>Instagram Caption:</h3><p>Love ${niche}? Check ${keywords}!</p>
        <h3>TikTok Script:</h3><p>"Hey, ${niche} fans, ${keywords} is wild!"</p>
        ${!user ? '<p>Log in for more posts!</p>' : ''}
      `;
      if (user) {
        window.db.collection('users').doc(user.uid).update({ postCount: count + 1 });
      }
    }, 1000);
  });
});