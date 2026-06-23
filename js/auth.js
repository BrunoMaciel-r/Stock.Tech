// auth.js - Handles login and registration logic
"use strict";

// Helper functions for user management
window.getUserByEmail = function(email) {
  const db = window.lerBanco();
  return (db.usuarios || []).find(u => u.email.toLowerCase() === email.toLowerCase());
};

window.addUser = function(user) {
  const db = window.lerBanco();
  db.usuarios = db.usuarios || [];
  db.usuarios.push(user);
  window.salvarBanco(db);
};

window.updateUser = function(updatedUser) {
  const db = window.lerBanco();
  const idx = (db.usuarios || []).findIndex(u => u.id === updatedUser.id);
  if (idx !== -1) {
    db.usuarios[idx] = updatedUser;
    window.salvarBanco(db);
  }
};

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const user = getUserByEmail(email);
    if (!user) {
      window.mostrarToast('Usuário não encontrado.', 'error');
      return;
    }
    // If password not set, force creation
    if (!user.senha) {
      // Store temporary login info and ask to set password
      sessionStorage.setItem('temp_user_id', user.id);
      window.location.href = '../set-senha/set-senha.html';
      return;
    }
    if (user.senha !== senha) {
      window.mostrarToast('Senha incorreta.', 'error');
      return;
    }
    // Successful login
    sessionStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('st_email', user.email);
    localStorage.setItem('st_nome', user.nome);
    localStorage.setItem('st_role', user.role);
    // Set plan based on role (admin gets admin, caixa basic, estoquista basic)
    const plano = user.role === 'admin' ? 'admin' : user.role === 'caixa' ? 'basic' : 'basic';
    localStorage.setItem('st_plano', plano);
    window.location.href = '../dashboard/dashboard.html';
  });
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const usuario = document.getElementById('reg-usuario').value.trim(); // not used currently
    const senha = document.getElementById('reg-senha').value.trim();
    const plano = document.getElementById('reg-plano').value; // hidden, set by plan selection
    // Role selection based on plan (basic => caixa, plus => admin, for simplicity)
    const roleMap = { basic: 'caixa', plus: 'admin' };
    const role = roleMap[plano] || 'caixa';

    if (getUserByEmail(email)) {
      window.mostrarToast('Este e‑mail já está cadastrado.', 'error');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      nome,
      email,
      usuario,
      senha,
      role,
      plano // keep original plan for future use
    };
    addUser(newUser);
    window.mostrarToast('Usuário criado com sucesso!');
    // Auto login after registration
    sessionStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('st_email', email);
    localStorage.setItem('st_nome', nome);
    localStorage.setItem('st_role', role);
    localStorage.setItem('st_plano', plano);
    window.location.href = '../dashboard/dashboard.html';
  });
}
