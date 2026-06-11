// ===== AUTH MODAL INJECTOR =====
// Di-include di halaman frontend yang butuh login/register customer

function injectAuthModal() {
  // Jangan inject kalau sudah ada
  if (document.getElementById('loginModal')) return;

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-overlay" id="loginModal">
      <div class="modal-box" style="width:400px;max-width:95vw">
        <button class="modal-close" onclick="closeLoginModal()">&times;</button>

        <!-- TAB SWITCHER -->
        <div style="display:flex;gap:0;border-bottom:2px solid #f0d0dc;margin-bottom:24px">
          <button class="auth-tab-btn active" data-tab="login"
            onclick="switchAuthTab('login')"
            style="flex:1;padding:12px;border:none;background:none;font-size:0.9rem;font-weight:700;color:#e91e8c;cursor:pointer;border-bottom:2px solid #e91e8c;margin-bottom:-2px;font-family:inherit">
            Masuk
          </button>
          <button class="auth-tab-btn" data-tab="register"
            onclick="switchAuthTab('register')"
            style="flex:1;padding:12px;border:none;background:none;font-size:0.9rem;font-weight:600;color:#aaa;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;font-family:inherit">
            Daftar
          </button>
        </div>

        <!-- LOGIN FORM -->
        <div id="loginForm">
          <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:4px">Selamat Datang! 👋</h2>
          <p style="font-size:0.85rem;color:#888;margin-bottom:20px">Masuk ke akun Cnailist kamu</p>

          <div style="background:#ffebee;color:#f44336;padding:10px 14px;border-radius:10px;font-size:0.82rem;margin-bottom:14px;display:none" id="loginError"></div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" id="loginEmail" placeholder="email@example.com" onkeydown="if(event.key==='Enter')doCustomerLogin()" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div style="position:relative">
              <input type="password" id="loginPassword" placeholder="••••••••" onkeydown="if(event.key==='Enter')doCustomerLogin()" style="padding-right:40px" />
              <button type="button" onclick="togglePwVis('loginPassword',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#bbb;font-size:0.9rem">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <button id="loginBtn" class="btn-primary" style="width:100%;margin-top:8px;padding:12px" onclick="doCustomerLogin()">
            Masuk
          </button>
          <p style="text-align:center;font-size:0.82rem;color:#888;margin-top:14px">
            Belum punya akun?
            <a style="color:#e91e8c;font-weight:600;cursor:pointer" onclick="switchAuthTab('register')">Daftar sekarang</a>
          </p>
        </div>

        <!-- REGISTER FORM -->
        <div id="registerForm" style="display:none">
          <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:4px">Buat Akun Baru 💅</h2>
          <p style="font-size:0.85rem;color:#888;margin-bottom:20px">Daftar untuk belanja lebih mudah</p>

          <div style="background:#ffebee;color:#f44336;padding:10px 14px;border-radius:10px;font-size:0.82rem;margin-bottom:14px;display:none" id="registerError"></div>

          <div class="form-group">
            <label>Nama Lengkap <span style="color:#e91e8c">*</span></label>
            <input type="text" id="regName" placeholder="Nama lengkap kamu" />
          </div>
          <div class="form-group">
            <label>Email <span style="color:#e91e8c">*</span></label>
            <input type="email" id="regEmail" placeholder="email@example.com" />
          </div>
          <div class="form-group">
            <label>No. WhatsApp</label>
            <input type="tel" id="regPhone" placeholder="08xx-xxxx-xxxx" />
          </div>
          <div class="form-group">
            <label>Password <span style="color:#e91e8c">*</span></label>
            <div style="position:relative">
              <input type="password" id="regPassword" placeholder="Min. 6 karakter" style="padding-right:40px" onkeydown="if(event.key==='Enter')doCustomerRegister()" />
              <button type="button" onclick="togglePwVis('regPassword',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#bbb;font-size:0.9rem">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <button id="registerBtn" class="btn-primary" style="width:100%;margin-top:8px;padding:12px" onclick="doCustomerRegister()">
            Daftar
          </button>
          <p style="text-align:center;font-size:0.82rem;color:#888;margin-top:14px">
            Sudah punya akun?
            <a style="color:#e91e8c;font-weight:600;cursor:pointer" onclick="switchAuthTab('login')">Masuk di sini</a>
          </p>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(modal.firstElementChild);

  // Tab active styles
  document.addEventListener('click', e => {
    if (e.target.id === 'loginModal') closeLoginModal();
  });
}

function togglePwVis(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// Tab switch styling
const _origSwitchTab = window.switchAuthTab;
window.switchAuthTab = function(tab) {
  const tabs = document.querySelectorAll('.auth-tab-btn');
  tabs.forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.style.color        = isActive ? '#e91e8c' : '#aaa';
    t.style.fontWeight   = isActive ? '700' : '600';
    t.style.borderBottom = isActive ? '2px solid #e91e8c' : '2px solid transparent';
    t.classList.toggle('active', isActive);
  });
  if (typeof _origSwitchTab === 'function') _origSwitchTab(tab);
  else {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm)    loginForm.style.display    = tab === 'login'    ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
  }
};

// Auto inject on DOMContentLoaded
document.addEventListener('DOMContentLoaded', injectAuthModal);
