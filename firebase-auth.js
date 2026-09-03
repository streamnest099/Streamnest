import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvdGAqQafHB3WW1dQ-D4IMf5Mf90nWcZM",
  authDomain: "streamnest-dd011.firebaseapp.com",
  projectId: "streamnest-dd011",
  storageBucket: "streamnest-dd011.firebasestorage.app",
  messagingSenderId: "1044156428651",
  appId: "1:1044156428651:web:1790764bf0ec5e9cccd2e",
  measurementId: "G-0B2LVGW80D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.streamNestFirebase = {
  app,
  auth,
  db,
  onAuthStateChanged
};

const authForm = document.getElementById("auth-form");
const authModal = document.getElementById("auth-modal");
const authName = document.getElementById("auth-name");
const authPhone = document.getElementById("auth-contact");
const authPassword = document.getElementById("auth-password");
const authNote = document.getElementById("auth-note");
const authSubmit = authForm?.querySelector(".auth-submit");

if (authPhone) {
  authPhone.type = "tel";
  authPhone.placeholder = "Enter phone number (+91...)";
  authPhone.autocomplete = "tel";
}

if (authPassword) {
  authPassword.style.display = "none";
  authPassword.required = false;

  if (authPassword.parentElement) {
    authPassword.parentElement.style.display = "none";
  }
}

if (authName) {
  authName.required = true;
}

let otpInput = document.getElementById("auth-otp");

if (!otpInput) {
  otpInput = document.createElement("input");

  otpInput.id = "auth-otp";
  otpInput.type = "text";
  otpInput.inputMode = "numeric";
  otpInput.autocomplete = "one-time-code";
  otpInput.placeholder = "Enter 6-digit OTP";
  otpInput.maxLength = 6;

  otpInput.style.display = "none";
  otpInput.style.marginTop = "10px";
  otpInput.style.width = "100%";
  otpInput.style.boxSizing = "border-box";

  authPhone?.parentElement?.after(otpInput);
}

let recaptchaVerifier = null;
let confirmationResult = null;

async function setupRecaptcha() {
  if (recaptchaVerifier) {
    return;
  }

  let container = document.getElementById("recaptcha-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "recaptcha-container";
    container.style.marginTop = "12px";

    authSubmit?.before(container);
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "normal",

      callback: () => {
        console.log("reCAPTCHA completed");
      },

      "expired-callback": () => {
        if (authNote) {
          authNote.textContent =
            "reCAPTCHA expired. Please complete it again.";
        }
      }
    }
  );

  await recaptchaVerifier.render();
}

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const phone = authPhone?.value.trim() || "";
  const name = authName?.value.trim() || "";
  const otp = otpInput?.value.trim() || "";

  if (!phone) {
    authNote.textContent = "Please enter your phone number.";
    return;
  }

  if (!phone.startsWith("+")) {
    authNote.textContent =
      "Please use country code. Example: +919876543210";
    return;
  }

  // VERIFY OTP
  if (confirmationResult) {
    if (!otp || otp.length !== 6) {
      authNote.textContent = "Please enter the 6-digit OTP.";
      return;
    }

    try {
      authSubmit.disabled = true;
      authSubmit.textContent = "Verifying...";

      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: name,
          phone: user.phoneNumber || phone,
          credits: 0,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      }

      authNote.textContent = "Login successful! 🎉";

      otpInput.style.display = "none";
      otpInput.value = "";

      confirmationResult = null;

      setTimeout(() => {
        authModal?.classList.remove("open");
        authModal?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("checkout-open");
      }, 800);

    } catch (error) {
      console.error("OTP verification error:", error);

      authNote.textContent =
        `OTP verification error: ${error.code || error.message}`;

    } finally {
      authSubmit.disabled = false;
      authSubmit.textContent = "Verify OTP";
    }

    return;
  }

  // SEND OTP
  try {
    authSubmit.disabled = true;
    authSubmit.textContent = "Sending OTP...";

    authNote.textContent =
      "Please complete the reCAPTCHA...";

    await setupRecaptcha();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      recaptchaVerifier
    );

    otpInput.style.display = "block";

    authSubmit.disabled = false;
    authSubmit.textContent = "Verify OTP";

    authNote.textContent =
      "OTP sent! Enter the 6-digit code.";

  } catch (error) {
    console.error("OTP sending error:", error);

    confirmationResult = null;

    authNote.textContent =
      `OTP error: ${error.code || error.message}`;

    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.log(e);
      }

      recaptchaVerifier = null;
    }

    const container =
      document.getElementById("recaptcha-container");

    if (container) {
      container.innerHTML = "";
    }

    authSubmit.disabled = false;
    authSubmit.textContent = "Send OTP";
  }
});

onAuthStateChanged(auth, async (user) => {
  const loginButton = document.querySelector(".login-btn");

  if (user) {
    console.log(
      "StreamNest user logged in:",
      user.phoneNumber
    );

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let data;

    if (userSnap.exists()) {
      data = userSnap.data();
    } else {
      data = {
        name: "",
        phone: user.phoneNumber || "",
        credits: 0
      };
    }

    localStorage.setItem(
      "streamnest:member",
      JSON.stringify({
        uid: user.uid,
        contact: user.phoneNumber || "",
        name: data.name || ""
      })
    );

    if (loginButton) {
      loginButton.textContent = "Account";
    }

    window.dispatchEvent(
      new CustomEvent("streamnest-auth-changed", {
        detail: {
          user,
          data
        }
      })
    );

  } else {
    localStorage.removeItem("streamnest:member");

    if (loginButton) {
      loginButton.textContent = "Login / Sign Up";
    }

    window.dispatchEvent(
      new CustomEvent("streamnest-auth-changed", {
        detail: {
          user: null,
          data: null
        }
      })
    );
  }
});

const loginButton = document.querySelector(".login-btn");

loginButton?.addEventListener(
  "click",
  async (event) => {
    if (!auth.currentUser) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      await signOut(auth);
      console.log("StreamNest user logged out.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
  true
);