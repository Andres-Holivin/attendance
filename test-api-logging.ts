import axios from 'axios';

const testApiLogging = async () => {
    console.log('🧪 Testing API Logging Integration...\n');

    try {
        // Test user service health endpoint
        console.log('📋 Test 1: User Service Health Check');
        try {
            const userHealthResponse = await axios.get('http://localhost:3002/health');
            console.log('✅ User service health check successful:', userHealthResponse.status);
        } catch (error: any) {
            console.log('❌ User service health check failed:', error.response?.status || error.message);
        }

        // Test attendance service health endpoint
        console.log('\n📋 Test 2: Attendance Service Health Check');
        try {
            const attendanceHealthResponse = await axios.get('http://localhost:3003/health');
            console.log('✅ Attendance service health check successful:', attendanceHealthResponse.status);
        } catch (error: any) {
            console.log('❌ Attendance service health check failed:', error.response?.status || error.message);
        }

        // Test a non-existent endpoint to generate 404 logs
        console.log('\n📋 Test 3: Non-existent endpoint (should generate 404 log)');
        try {
            const notFoundResponse = await axios.get('http://localhost:3002/api/nonexistent');
            console.log('Unexpected success:', notFoundResponse.status);
        } catch (error: any) {
            console.log('✅ Expected 404 error:', error.response?.status);
        }

        // Wait a moment for pub/sub to process
        console.log('\n⏳ Waiting 3 seconds for logs to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check the logging service for the stored logs
        console.log('\n📋 Test 4: Checking stored logs in logging service');
        try {
            const logsResponse = await axios.get('http://localhost:3004/api/logs');
            console.log('✅ Logs retrieved successfully');
            console.log('📊 Total logs found:', logsResponse.data.data?.pagination?.total || 0);

            if (logsResponse.data.data?.logs?.length > 0) {
                console.log('\n📝 Recent log entries:');
                logsResponse.data.data.logs.slice(0, 3).forEach((log: any, index: number) => {
                    console.log(`${index + 1}. ${log.method} ${log.endpoint} - ${log.status} (${log.service || 'unknown service'})`);
                });
            }
        } catch (error: any) {
            console.log('❌ Failed to retrieve logs:', error.response?.status || error.message);
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }

    console.log('\n🏁 API Logging test completed!');
};

// Run the test if this file is executed directly
if (require.main === module) {
    testApiLogging();
}

export default testApiLogging;