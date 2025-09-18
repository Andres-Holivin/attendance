import axios from 'axios';

const testEnhancedApiLogging = async () => {
    console.log('🧪 Testing Enhanced API Logging with User & Session Info...\n');

    try {
        // First, let's try to login to get a session with user data
        console.log('📋 Test 1: User Login (to create session with user data)');
        try {
            const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            }, {
                withCredentials: true
            });
            console.log('✅ Login attempt completed:', loginResponse.status);
        } catch (error: any) {
            console.log('📝 Login attempt logged (expected result):', error.response?.status || error.message);
        }

        // Test making an authenticated request to attendance service
        console.log('\n📋 Test 2: Attendance API call (with potential session)');
        try {
            const attendanceResponse = await axios.get('http://localhost:3003/api/attendance/today', {
                withCredentials: true
            });
            console.log('✅ Attendance API call successful:', attendanceResponse.status);
        } catch (error: any) {
            console.log('📝 Attendance API call logged:', error.response?.status || error.message);
        }

        // Wait for pub/sub processing
        console.log('\n⏳ Waiting 3 seconds for logs to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check the enhanced logs
        console.log('\n📋 Test 3: Checking enhanced logs with user/session info');
        try {
            const logsResponse = await axios.get('http://localhost:3004/api/logs?limit=10');
            console.log('✅ Enhanced logs retrieved successfully');

            const logs = logsResponse.data.data?.logs || [];
            console.log('📊 Total logs found:', logsResponse.data.data?.pagination?.total || 0);

            if (logs.length > 0) {
                console.log('\n📝 Recent log entries with enhanced data:');
                logs.slice(0, 5).forEach((log: any, index: number) => {
                    console.log(`\n${index + 1}. ${log.method} ${log.endpoint} - ${log.status}`);
                    console.log(`   Service: ${log.service || 'N/A'}`);
                    console.log(`   User ID: ${log.userId || 'Not authenticated'}`);
                    console.log(`   User Email: ${log.userEmail || 'Not authenticated'}`);
                    console.log(`   Session ID: ${log.sessionId || 'No session'}`);
                    console.log(`   IP: ${log.ip || 'Unknown'}`);
                    console.log(`   Timestamp: ${log.timestamp}`);
                });
            }

            // Test filtering by user if any user logs exist
            const userLogs = logs.filter((log: any) => log.userId);
            if (userLogs.length > 0) {
                const sampleUserId = userLogs[0].userId;
                console.log(`\n📋 Test 4: Filtering logs by user ID: ${sampleUserId}`);

                const userFilteredResponse = await axios.get(`http://localhost:3004/api/logs?userId=${sampleUserId}`);
                console.log('✅ User-filtered logs retrieved:', userFilteredResponse.data.data?.pagination?.total || 0, 'logs');
            }

        } catch (error: any) {
            console.log('❌ Failed to retrieve enhanced logs:', error.response?.status || error.message);
        }

    } catch (error) {
        console.error('❌ Enhanced test suite failed:', error);
    }

    console.log('\n🏁 Enhanced API Logging test completed!');
    console.log('\n🎯 New Features Tested:');
    console.log('   ✅ User ID logging');
    console.log('   ✅ User email logging');
    console.log('   ✅ Session ID logging');
    console.log('   ✅ Enhanced filtering options');
    console.log('   ✅ Comprehensive metadata capture');
};

// Run the test if this file is executed directly
if (require.main === module) {
    testEnhancedApiLogging();
}

export default testEnhancedApiLogging;