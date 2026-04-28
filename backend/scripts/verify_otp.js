import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function verifyOtpFlow() {
  const testUser = {
    username: 'testotp_' + Date.now(),
    password: 'Password123!',
    roleId: 5,
    fullName: 'Test OTP User',
    phone: '0987654321',
    email: 'testotp@example.com'
  };

  try {
    console.log('--- Step 1: Register Unverified ---');
    const registerRes = await axios.post(`${API_URL}/auth/register-unverified`, testUser);
    const otp = registerRes.data.data.otp;
    console.log('Registration Success, OTP:', otp);

    console.log('\n--- Step 2: Verify OTP ---');
    const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
      username: testUser.username,
      otp: otp
    });
    console.log('Verification Result:', verifyRes.data);

    console.log('\n--- Step 3: Try Login ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('Login Result:', loginRes.data.message);

    console.log('\n✅ OTP FLOW VERIFIED SUCCESSFULLY!');
  } catch (error) {
    console.error('Error during verification:', error.response ? error.response.data : error.message);
  }
}

verifyOtpFlow();
