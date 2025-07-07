import React, { useState, useEffect } from 'react';
import './FlightCompanion.css';

const FlightCompanion = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchOffers();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/flightcompanion/requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/flightcompanion/offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const CreateRequestForm = () => {
    const [formData, setFormData] = useState({
      userId: 1, // Temporary - in real app, get from auth
      flightNumber: '',
      airline: '',
      flightDate: '',
      departureAirport: '',
      arrivalAirport: '',
      travelerName: '',
      travelerAge: 'Elderly',
      specialNeeds: '',
      offeredAmount: 0,
      additionalNotes: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/flightcompanion/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          setShowCreateForm(false);
          fetchRequests();
          alert('Request created successfully!');
        }
      } catch (error) {
        console.error('Error creating request:', error);
      }
    };

    return (
      <div className="form-container">
        <h3>Request Flight Companion Help</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Flight Number:</label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                placeholder="e.g., NZ289"
                required
              />
            </div>
            <div className="form-group">
              <label>Airline:</label>
              <input
                type="text"
                value={formData.airline}
                onChange={(e) => setFormData({...formData, airline: e.target.value})}
                placeholder="e.g., Air New Zealand"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Flight Date:</label>
              <input
                type="datetime-local"
                value={formData.flightDate}
                onChange={(e) => setFormData({...formData, flightDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Route:</label>
              <div style={{display: 'flex', gap: '10px'}}>
                <select
                  value={formData.departureAirport}
                  onChange={(e) => setFormData({...formData, departureAirport: e.target.value})}
                  required
                >
                  <option value="">From</option>
                  <option value="AKL">Auckland (AKL)</option>
                  <option value="PVG">Shanghai (PVG)</option>
                  <option value="PEK">Beijing (PEK)</option>
                  <option value="CAN">Guangzhou (CAN)</option>
                </select>
                <span>→</span>
                <select
                  value={formData.arrivalAirport}
                  onChange={(e) => setFormData({...formData, arrivalAirport: e.target.value})}
                  required
                >
                  <option value="">To</option>
                  <option value="AKL">Auckland (AKL)</option>
                  <option value="PVG">Shanghai (PVG)</option>
                  <option value="PEK">Beijing (PEK)</option>
                  <option value="CAN">Guangzhou (CAN)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Traveler Name:</label>
              <input
                type="text"
                value={formData.travelerName}
                onChange={(e) => setFormData({...formData, travelerName: e.target.value})}
                placeholder="e.g., My parents"
              />
            </div>
            <div className="form-group">
              <label>Offered Amount (NZD):</label>
              <input
                type="number"
                value={formData.offeredAmount}
                onChange={(e) => setFormData({...formData, offeredAmount: parseFloat(e.target.value)})}
                min="0"
                max="500"
                placeholder="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Special Needs/Help Required:</label>
            <textarea
              value={formData.specialNeeds}
              onChange={(e) => setFormData({...formData, specialNeeds: e.target.value})}
              placeholder="e.g., Language translation, wheelchair assistance, airport navigation..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes:</label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
              placeholder="Any other information that might be helpful..."
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            <button type="submit">Create Request</button>
          </div>
        </form>
      </div>
    );
  };

  const RequestCard = ({ request }) => (
    <div className="card">
      <div className="card-header">
        <h4>{request.flightNumber} - {request.airline}</h4>
        <span className="amount">NZD ${request.offeredAmount}</span>
      </div>
      <div className="card-body">
        <div className="flight-info">
          <span className="route">{request.departureAirport} → {request.arrivalAirport}</span>
          <span className="date">{new Date(request.flightDate).toLocaleDateString()}</span>
        </div>
        <div className="traveler-info">
          <strong>Traveler:</strong> {request.travelerName || 'Not specified'}
        </div>
        {request.specialNeeds && (
          <div className="special-needs">
            <strong>Help Needed:</strong> {request.specialNeeds}
          </div>
        )}
        {request.additionalNotes && (
          <div className="notes">
            <strong>Notes:</strong> {request.additionalNotes}
          </div>
        )}
        <div className="card-footer">
          <span className={`status ${request.isMatched ? 'matched' : 'available'}`}>
            {request.isMatched ? 'Matched' : 'Looking for Helper'}
          </span>
          <button className="btn-contact">Contact</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flight-companion">
      <div className="header">
        <h1>Flight Companion Service</h1>
        <p>Connect with fellow travelers to help each other during flights</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'requests' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('requests')}
        >
          Help Requests ({requests.length})
        </button>
        <button 
          className={activeTab === 'offers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('offers')}
        >
          Available Helpers ({offers.length})
        </button>
      </div>

      <div className="actions">
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          {activeTab === 'requests' ? 'Request Help' : 'Offer to Help'}
        </button>
      </div>

      {showCreateForm && <CreateRequestForm />}

      <div className="content">
        {activeTab === 'requests' && (
          <div className="requests-list">
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No help requests yet. Be the first to request help!</p>
              </div>
            ) : (
              requests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="offers-list">
            {offers.length === 0 ? (
              <div className="empty-state">
                <p>No helpers available yet. Be the first to offer help!</p>
              </div>
            ) : (
              offers.map(offer => (
                <div key={offer.id} className="card">
                  <div className="card-header">
                    <h4>{offer.flightNumber} - {offer.airline}</h4>
                    <span className="amount">NZD ${offer.requestedAmount}</span>
                  </div>
                  <div className="card-body">
                    <div className="flight-info">
                      <span className="route">{offer.departureAirport} → {offer.arrivalAirport}</span>
                      <span className="date">{new Date(offer.flightDate).toLocaleDateString()}</span>
                    </div>
                    <div className="services">
                      <strong>Services:</strong> {offer.availableServices || 'General assistance'}
                    </div>
                    <div className="languages">
                      <strong>Languages:</strong> {offer.languages || 'Not specified'}
                    </div>
                    <div className="experience">
                      <strong>Helped:</strong> {offer.helpedCount} travelers
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightCompanion;
