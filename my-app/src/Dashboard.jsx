import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const CryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [newAlert, setNewAlert] = useState({
    cryptoId: '',
    type: 'above',
    price: '',
    email: ''
  });

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd', {
        headers: {
          'accept': 'application/json',
          'x-cg-demo-api-key': 'CG-kWh2m8p2ehpRbYM7o8gNPC7L'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }

      const data = await response.json();
      setCryptoData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check alerts
  useEffect(() => {
    alerts.forEach(alert => {
      const crypto = cryptoData.find(c => c.id === alert.cryptoId);
      if (crypto) {
        if (
          (alert.type === 'above' && crypto.current_price > alert.price) ||
          (alert.type === 'below' && crypto.current_price < alert.price)
        ) {
          setAlertMessage(`Alert: ${crypto.name} is ${alert.type} ${alert.price}!`);
          setShowAlert(true);
          setAlerts(prev => prev.filter(a => a !== alert));
        }
      }
    });
  }, [cryptoData, alerts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Alert:', newAlert); // Check the new alert details
    setAlerts(prev => [...prev, { ...newAlert, id: Date.now() }]);
    setNewAlert({ cryptoId: '', type: 'above', price: '', email: '' });
    setAlertMessage('Alert created successfully!');
    setShowAlert(true);
  };


  if (loading) {
    return (
      <div className="container">
        <div className="loading-message">Loading cryptocurrency data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">Crypto Price Alert System</h1>

      {showAlert && (
        <div className="alert-message">
          <p>{alertMessage}</p>
        </div>
      )}

      {/* Price Dashboard */}
      <div className="grid">
        {cryptoData.map(crypto => (
          <div key={crypto.id} className="card">
            <div className="card-header">
              <div className="crypto-info">
                <img src={crypto.image} alt={crypto.name} className="crypto-icon" />
                <h2 className="crypto-name">{crypto.name} ({crypto.symbol.toUpperCase()})</h2>
              </div>
              <span className={crypto.price_change_percentage_24h >= 0 ? 'price-change-positive' : 'price-change-negative'}>
                {crypto.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
            <p className="crypto-price">
              ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="crypto-details">
              <span>24h High: ${crypto.high_24h?.toLocaleString()}</span>
              <span>24h Low: ${crypto.low_24h?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Form */}
      <div className="form-section">
        <h2 className="section-title">Create Price Alert</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select
              value={newAlert.cryptoId}
              onChange={(e) => setNewAlert(prev => ({ ...prev, cryptoId: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">Select Cryptocurrency</option>
              {cryptoData.map(crypto => (
                <option key={crypto.id} value={crypto.id}>{crypto.name}</option>
              ))}
            </select>

            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
              className="form-input"
              required
            >
              <option value="above">Price Goes Above</option>
              <option value="below">Price Goes Below</option>
            </select>

            <input
              type="number"
              value={newAlert.price}
              onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Target Price"
              className="form-input"
              required
              step="0.01"
            />

            <input
              type="email"
              value={newAlert.email}
              onChange={(e) => setNewAlert(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email Address"
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Create Alert
          </button>
        </form>
      </div>

      {/* Active Alerts */}
      <div className="form-section">
  <h2 className="section-title">Active Alerts ({alerts.length})</h2>
  {alerts.length === 0 ? (
    <p className="empty-message">No active alerts</p>
  ) : (
    <div className="alert-list">
      {alerts.map(alert => {
        // Find the matching cryptocurrency for this alert
        const crypto = cryptoData.find(c => c.id === alert.cryptoId);

        return (
          <div key={alert.id} className="alert-item">
            <span>
              {crypto
                ? `${crypto.name} (${crypto.symbol.toUpperCase()}) - ${
                    alert.type === 'above' ? 'Above' : 'Below'
                  } $${alert.price}`
                : 'Loading...'}
            </span>
            <button
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>

    </div>
  );
};

export default CryptoDashboard;