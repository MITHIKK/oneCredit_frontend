// Debug script for owner login
const testOwnerLogin = async () => {
    const API_URL = 'https://onecredit-backend-8p7u.onrender.com/api';
    
    console.log('🔍 Testing owner login...');
    
    const loginData = {
        username: 'srimuruganbusowner',
        password: 'muruganbus',
        role: 'owner'
    };
    
    try {
        console.log('📤 Sending request to:', `${API_URL}/login`);
        console.log('📤 Request data:', loginData);
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📥 Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        // Test the login logic from Login.js
        if (data.success || data.user) {
            const userData = {
                ...data.user,
                _id: data.user._id || data.user.id,
                id: data.user._id || data.user.id
            };
            console.log('✅ Login should succeed with userData:', userData);
            console.log('✅ User role:', userData.role);
            console.log('✅ Should redirect to:', userData.role === 'owner' ? '/owner-dashboard' : '/dashboard');
        } else {
            console.log('❌ Login logic would fail - no success flag or user data');
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error);
    }
};

// Run the test
testOwnerLogin();

console.log('
🧪 DEBUGGING OWNER LOGIN
========================

To run this test:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy and paste this entire script
4. Check the output

Expected behavior:
- Response status should be 200
- Response should have data.success = true OR data.user exists  
- userData should have role: "owner"
- Should redirect to /owner-dashboard

If any step fails, that\'s where the issue is!
');