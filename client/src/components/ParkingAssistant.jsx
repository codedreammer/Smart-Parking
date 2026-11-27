import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { IconCar, IconMapPin, IconSparkles } from './Icons';

const initialMessage = {
  role: 'assistant',
  intro: true,
  text: 'Hi, I am ParkPilot. Tell me where you are going and I will compare live spaces, price, ratings, and facilities for you.',
};

const quickPrompts = [
  'Find the best available parking for me',
  'I need an EV charging spot',
  'Show me a covered budget option',
];

export default function ParkingAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [area, setArea] = useState('');
  const [vehicle, setVehicle] = useState('CAR');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([initialMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const conversationRef = useRef(null);

  const selectedArea = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    if (selectedArea) setArea(selectedArea);
  }, [selectedArea]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  const ask = async (question) => {
    const text = question.trim();
    if (!text || isSending) return;

    const history = messages
      .filter((item) => !item.intro)
      .slice(-6)
      .map((item) => ({ role: item.role, text: item.text }));

    setMessages((current) => [...current, { role: 'user', text }]);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const result = await api.askParkingAssistant({
        message: text,
        area,
        vehicle,
        history,
      });
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: result.answer, recommendations: result.recommendations || [] },
      ]);
    } catch (requestError) {
      setError(requestError.message || 'ParkPilot could not respond just now. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ask(draft);
  };

  return (
    <section className={'parking-assistant' + (isOpen ? ' is-open' : '')} aria-label="Parking assistant">
      {isOpen && (
        <div className="parking-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="parking-assistant-title">
          <header className="parking-assistant-header">
            <div className="row gap-sm">
              <span className="parking-assistant-orb"><IconSparkles size={17} /></span>
              <div>
                <strong id="parking-assistant-title">ParkPilot</strong>
                <span className="parking-assistant-status"><i></i> Parking guide online</span>
              </div>
            </div>
            <button className="parking-assistant-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close parking assistant">
              ×
            </button>
          </header>

          <div className="parking-assistant-settings">
            <label>
              <IconMapPin size={14} />
              <input
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="Area or landmark"
                aria-label="Selected parking area"
              />
            </label>
            <label>
              <IconCar size={14} />
              <select value={vehicle} onChange={(event) => setVehicle(event.target.value)} aria-label="Vehicle type">
                <option value="CAR">Car</option>
                <option value="SUV">SUV</option>
                <option value="BIKE">Bike</option>
                <option value="AUTO">Auto</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </label>
          </div>

          <div className="parking-assistant-messages" ref={conversationRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={'parking-assistant-message ' + message.role} key={index}>
                <p>{message.text}</p>
                {message.recommendations?.length > 0 && (
                  <div className="parking-assistant-recommendations">
                    {message.recommendations.map((parking) => (
                      <Link to={'/parking/' + parking.id} key={parking.id} className="parking-assistant-place">
                        <span>
                          <strong>{parking.name}</strong>
                          <small>{parking.available} spaces · {parking.rating || 'New'}★ · {parking.hourlyRate ? 'Rs. ' + parking.hourlyRate + '/hr' : 'View rates'}</small>
                        </span>
                        <b>View</b>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="parking-assistant-message assistant parking-assistant-thinking">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>

          {messages.length === 1 && !isSending && (
            <div className="parking-assistant-prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>
              ))}
            </div>
          )}

          {error && <p className="parking-assistant-error">{error}</p>}

          <form className="parking-assistant-composer" onSubmit={handleSubmit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={area ? 'Ask about parking in ' + area : 'Which area are you visiting?'}
              aria-label="Ask ParkPilot"
              maxLength="600"
              disabled={isSending}
            />
            <button type="submit" disabled={!draft.trim() || isSending} aria-label="Send message">
              <span>Send</span>
              <span aria-hidden="true">↑</span>
            </button>
          </form>
          <p className="parking-assistant-note">Recommendations use live availability snapshots and approved parking listings.</p>
        </div>
      )}

      <button
        type="button"
        className="parking-assistant-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="parking-assistant-title"
      >
        <IconSparkles size={20} />
        <span>{isOpen ? 'Close guide' : 'Find parking with AI'}</span>
      </button>
    </section>
  );
}
