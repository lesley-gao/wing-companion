import React, { useState, useEffect } from 'react';
import './Pickup.css';

const Pickup = () => {
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
      const response = await fetch('/api/pickup/requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/pickup/offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching pickup offers:', error);
    }
  };

  const CreatePickupRequestForm = () => {
    const [formData, setFormData] = useState({
      userId: 1, // Temporary - in real app, get from auth
      flightNumber: '',
      arrivalDate: '',
      arrivalTime: '',
      airport: 'AKL',
      destinationAddress: '',
      passengerName: '',
      passengerPhone: '',
      passengerCount: 1,
      hasLuggage: true,
      offeredAmount: 0,
      specialRequests: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/pickup/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          setShowCreateForm(false);
          fetchRequests();
          alert('Pickup request created successfully!');
        }
      } catch (error) {
        console.error('Error creating pickup request:', error);
      }
    };

    return (
      <div className="form-container">
        <h3>Request Airport Pickup</h3>
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
              <label>Airport:</label>
              <select
                value={formData.airport}
                onChange={(e) => setFormData({...formData, airport: e.target.value})}
                required
              >
                <option value="AKL">Auckland (AKL)</option>
                <option value="WLG">Wellington (WLG)</option>
                <option value="CHC">Christchurch (CHC)</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Arrival Date:</label>
              <input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Arrival Time:</label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Destination Address:</label>
            <input
              type="text"
              value={formData.destinationAddress}
              onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
              placeholder="e.g., 123 Queen Street, Auckland City"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Passenger Name:</label>
              <input
                type="text"
                value={formData.passengerName}
                onChange={(e) => setFormData({...formData, passengerName: e.target.value})}
                placeholder="Name of person being picked up"
              />
            </div>
            <div className="form-group">
              <label>Passenger Phone:</label>
              <input
                type="tel"
                value={formData.passengerPhone}
                onChange={(e) => setFormData({...formData, passengerPhone: e.target.value})}
                placeholder="+64 21 123 4567"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Passengers:</label>
              <select
                value={formData.passengerCount}
                onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value, 10)})}
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4+ people</option>
              </select>
            </div>
            <div className="form-group">
              <label>Offered Amount (NZD):</label>
              <input
                type="number"
                value={formData.offeredAmount}
                onChange={(e) => setFormData({...formData, offeredAmount: parseFloat(e.target.value)})}
                min="0"
                max="200"
                placeholder="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.hasLuggage}
                onChange={(e) => setFormData({...formData, hasLuggage: e.target.checked})}
              />
              Has luggage
            </label>
          </div>

          <div className="form-group">
            <label>Special Requests:</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              placeholder="e.g., Elderly passengers, large luggage, Chinese speaking driver preferred..."
              rows="3"
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

  const PickupRequestCard = ({ request }) => (
    <div className="pickup-card">
      <div className="pickup-card-header">
        <div className="flight-info">
          <h4>{request.flightNumber}</h4>
          <span className="airport">{request.airport}</span>
        </div>
        <span className="amount">NZD ${request.offeredAmount}</span>
      </div>
      <div className="pickup-card-body">
        <div className="timing">
          <span className="date">{new Date(request.arrivalDate).toLocaleDateString()}</span>
          <span className="time">{request.arrivalTime}</span>
        </div>
        <div className="destination">
          <strong>To:</strong> {request.destinationAddress}
        </div>
        <div className="passenger-details">
          <span><strong>Passengers:</strong> {request.passengerCount}</span>
          {request.hasLuggage && <span className="luggage-tag">Has Luggage</span>}
        </div>
        {request.passengerName && (
          <div className="passenger-name">
            <strong>Contact:</strong> {request.passengerName}
          </div>
        )}
        {request.specialRequests && (
          <div className="special-requests">
            <strong>Special Requests:</strong> {request.specialRequests}
          </div>
        )}
        <div className="pickup-card-footer">
          <span className={`status ${request.isMatched ? 'matched' : 'available'}`}>
            {request.isMatched ? 'Driver Found' : 'Looking for Driver'}
          </span>
          <button className="btn-contact">Contact</button>
        </div>
      </div>
    </div>
  );

  const PickupOfferCard = ({ offer }) => (
    <div className="pickup-card">
      <div className="pickup-card-header">
        <div className="driver-info">
          <h4>{offer.vehicleType || 'Vehicle'}</h4>
          <span className="airport">{offer.airport}</span>
        </div>
        <span className="rate">From NZD ${offer.baseRate}</span>
      </div>
      <div className="pickup-card-body">
        <div className="vehicle-details">
          <span><strong>Capacity:</strong> {offer.maxPassengers} passengers</span>
          {offer.canHandleLuggage && <span className="luggage-tag">Luggage OK</span>}
        </div>
        <div className="service-area">
          <strong>Service Area:</strong> {offer.serviceArea || 'Not specified'}
        </div>
        <div className="languages">
          <strong>Languages:</strong> {offer.languages || 'Not specified'}
        </div>
        {offer.additionalServices && (
          <div className="additional-services">
            <strong>Additional Services:</strong> {offer.additionalServices}
          </div>
        )}
        <div className="experience">
          <strong>Experience:</strong> {offer.totalPickups} pickups completed
          {offer.averageRating > 0 && (
            <span className="rating"> • <span role="img" aria-label="star rating">⭐</span> {offer.averageRating.toFixed(1)}</span>
          )}
        </div>
        <div className="pickup-card-footer">
          <span className="status available">Available</span>
          <button className="btn-contact">Contact Driver</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pickup-service">
      <div className="header">
        <h1>Airport Pickup Service</h1>
        <p>Connect with reliable drivers for airport transfers</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'requests' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('requests')}
        >
          Pickup Requests ({requests.length})
        </button>
        <button 
          className={activeTab === 'offers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('offers')}
        >
          Available Drivers ({offers.length})
        </button>
      </div>

      <div className="actions">
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          {activeTab === 'requests' ? 'Request Pickup' : 'Offer Pickup Service'}
        </button>
      </div>

      {showCreateForm && <CreatePickupRequestForm />}

      <div className="content">
        {activeTab === 'requests' && (
          <div className="pickup-list">
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No pickup requests yet. Be the first to request a pickup!</p>
              </div>
            ) : (
              requests.map(request => (
                <PickupRequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="pickup-list">
            {offers.length === 0 ? (
              <div className="empty-state">
                <p>No drivers available yet. Be the first to offer pickup services!</p>
              </div>
            ) : (
              offers.map(offer => (
                <PickupOfferCard key={offer.id} offer={offer} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pickup;
