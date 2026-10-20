import React, { useState } from 'react';
import { supabase } from '../../config/supabase';

export default function TestSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      console.log('Testing signup with:', { email, password });
      
      // Test with minimal data
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setResult(`❌ Error: ${error.message}`);
        console.error('Error details:', error);
      } else {
        setResult(`✅ Success! User: ${data.user?.email}`);
        console.log('Success data:', data);
      }
    } catch (err) {
      setResult(`💥 Exception: ${err.message}`);
      console.error('Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Test Signup</h1>
      <form onSubmit={testSignup}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Testing...' : 'Test Signup'}
        </button>
      </form>
      {result && <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>{result}</div>}
    </div>
  );
}