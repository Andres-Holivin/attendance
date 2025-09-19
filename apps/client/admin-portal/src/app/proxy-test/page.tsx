'use client';

import { useState } from 'react';
import { AttendanceService } from '@/services/attendance.service';

export default function ProxyTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testProxy = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔄 Testing proxy...');
      console.log('Current URL:', window.location.href);
      
      // Test direct fetch to proxy
      console.log('1. Testing direct fetch to /api/attendance/today');
      const directResponse = await fetch('/api/attendance/today', {
        credentials: 'include',
      });
      console.log('Direct response URL:', directResponse.url);
      console.log('Direct response status:', directResponse.status);
      
      // Test service call
      console.log('2. Testing AttendanceService.getTodayAttendance()');
      const serviceResult = await AttendanceService.getTodayAttendance();
      console.log('Service result:', serviceResult);
      
      setResult({
        directResponse: {
          url: directResponse.url,
          status: directResponse.status,
          data: await directResponse.json(),
        },
        serviceResult,
      });
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Proxy Test Page</h1>
      <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
      
      <button 
        onClick={testProxy} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Proxy'}
      </button>

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#ff6b6b', 
          color: 'white', 
          borderRadius: '5px' 
        }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#51cf66', 
          color: 'white', 
          borderRadius: '5px' 
        }}>
          <h3>Success!</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to Network tab</li>
          <li>Click "Test Proxy" button</li>
          <li>Check what URLs are actually being called</li>
        </ol>
        
        <h4>Expected behavior:</h4>
        <ul>
          <li>Request should go to: <code>http://localhost:4000/api/attendance/today</code></li>
          <li>NOT to: <code>http://localhost:3003/api/attendance/today</code></li>
        </ul>
      </div>
    </div>
  );
}