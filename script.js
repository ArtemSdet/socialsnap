const auth = firebase.auth();

function updateLoginButton() {
  const loginBtn = document.getElementById('loginBtn');
  if (auth.currentUser) {
    loginBtn.innerText = 'Logout';
    loginBtn.onclick = () => auth.signOut();
  } else {
    loginBtn.innerText = 'Login';
    loginBtn.onclick = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch((error) => alert('Login failed: ' + error.message));
    };
  }
}

auth.onAuthStateChanged((user) => {
  updateLoginButton();
  console.log(user ? `Logged in: ${user.email}` : 'Logged out');
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  const niche = document.getElementById('niche')?.value;
  const keywords = document.getElementById('keywords')?.value;
  const output = document.getElementById('output');

  if (!niche || !keywords || !output) {
    output.innerHTML = 'Error: Something went wrong. Refresh and try again.';
    return;
  }
  if (!keywords.trim()) {
    output.innerHTML = 'Please enter keywords!';
    return;
  }

  output.innerHTML = 'Generating...';
  try {
    const response = await fetch(`https://socialsnap.vercel.app/api/generate?niche=${niche}&keywords=${keywords}`);
    const posts = await response.json();
    if (posts.error) throw new Error(posts.error);

    output.innerHTML = `
      <h3>X Post:</h3><p>${posts.x}</p>
      <h3>Instagram Caption:</h3><p>${posts.instagram}</p>
      <h3>TikTok Script:</h3><p>${posts.tiktok}</p>
      ${!auth.currentUser ? '<p>Log in for more posts!</p>' : ''}
    `;
  } catch (error) {
    output.innerHTML = `Error: ${error.message}`;
  }
});