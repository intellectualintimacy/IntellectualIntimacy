import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, MapPin, Clock, User, Mail, Hash } from 'lucide-react';

const EventTicket = ({ event, reservation, userInfo }) => {
  const qrRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    const ticketData = JSON.stringify({
      ticketId: reservation.ticketId,
      eventId: event.id,
      eventTitle: event.title,
      userName: userInfo.name,
      userEmail: userInfo.email,
      date: event.date,
      location: event.location,
      validatedAt: null
    });

    try {
      const url = await QRCode.toDataURL(ticketData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#292524',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      ref={qrRef}
      className="bg-white p-8 max-w-2xl mx-auto"
      style={{ fontFamily: "'Crimson Pro', serif" }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-stone-200 pb-6 mb-6">
        <h1 className="text-4xl font-light text-stone-900 mb-2">
          Intellectual Intimacy
        </h1>
        <p className="text-sm text-stone-500 uppercase tracking-widest">Event Ticket</p>
      </div>

      {/* Event Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-stone-900 mb-2">
          {event.title}
        </h2>
        {event.category && (
          <span className="inline-block px-4 py-1 bg-stone-100 text-stone-700 text-sm rounded-full">
            {event.category}
          </span>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Column - Event Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Date</p>
              <p className="text-stone-900 font-light">{formatDate(event.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Time</p>
              <p className="text-stone-900 font-light">{formatTime(event.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Location</p>
              <p className="text-stone-900 font-light">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Attendee Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Attendee</p>
              <p className="text-stone-900 font-light">{userInfo.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-stone-900 font-light text-sm">{userInfo.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-stone-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Ticket ID</p>
              <p className="text-stone-900 font-mono text-sm">{reservation.ticketId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="border-t-2 border-stone-200 pt-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-light text-stone-900 mb-2">Your Entry Pass</h3>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              Present this QR code at the event entrance for quick check-in. 
              Please arrive 15 minutes before the start time.
            </p>
            {!event.is_free && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-light">
                  <strong className="font-normal">Payment Status:</strong> {reservation.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </p>
              </div>
            )}
          </div>
          
          {qrCodeUrl && (
            <div className="ml-6 text-center">
              <img 
                src={qrCodeUrl} 
                alt="Ticket QR Code"
                className="w-40 h-40 border-4 border-stone-900 rounded-lg"
              />
              <p className="text-xs text-stone-500 mt-2">Scan to verify</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-stone-200 text-center">
        <p className="text-xs text-stone-500 leading-relaxed">
          This ticket is non-transferable and valid for one person only.<br />
          For questions, contact us at events@intellectualintimacy.com
        </p>
      </div>
    </div>
  );
};

export default EventTicket;