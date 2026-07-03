import { useState, useEffect, FormEvent } from 'react';
import { Table, Reservation } from '../types';
import TableLayout from './TableLayout';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  CalendarCheck,
  Plus,
  Compass,
} from 'lucide-react';

interface CustomerDashboardProps {
  isMockMode?: boolean;
}

export default function CustomerDashboard({ isMockMode }: CustomerDashboardProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);

  // Form states
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookingSlot, setBookingSlot] = useState<string>('18:00 - 20:00');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Computed availability state
  const [bookedTableIds, setBookedTableIds] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const timeSlots = [
    '12:00 - 14:00',
    '14:00 - 16:00',
    '18:00 - 20:00',
    '20:00 - 22:00',
  ];

  // Fetch Tables
  useEffect(() => {
    const loadTablesMock = () => {
      const storedTables = localStorage.getItem('bistro_booking_tables');
      if (storedTables) {
        const all: Table[] = JSON.parse(storedTables);
        setTables(all.filter(t => t.isActive));
      } else {
        const defaultTables = [
          { id: 'table_1', number: 1, capacity: 2, isActive: true },
          { id: 'table_2', number: 2, capacity: 2, isActive: true },
          { id: 'table_3', number: 3, capacity: 4, isActive: true },
          { id: 'table_4', number: 4, capacity: 4, isActive: true },
          { id: 'table_5', number: 5, capacity: 6, isActive: true },
          { id: 'table_6', number: 6, capacity: 8, isActive: true },
        ];
        localStorage.setItem('bistro_booking_tables', JSON.stringify(defaultTables));
        setTables(defaultTables);
      }
      setLoadingTables(false);
    };
    loadTablesMock();
    const interval = setInterval(loadTablesMock, 1500);
    return () => clearInterval(interval);
  }, []);

  // Fetch own reservations
  useEffect(() => {
    const loadResMock = () => {
      const storedReservations = localStorage.getItem('bistro_booking_reservations');
      const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
      const myRes = allRes.filter((r) => r.userId === 'mock_sandbox_user_123');
      myRes.sort((a, b) => b.date.localeCompare(a.date));
      setReservations(myRes);
      setLoadingReservations(false);
    };
    loadResMock();
    const interval = setInterval(loadResMock, 1500);
    return () => clearInterval(interval);
  }, []);

  // Check table bookings for selected date and slot
  useEffect(() => {
    if (!bookingDate || !bookingSlot) return;

    const checkAvailabilityMock = () => {
      setLoadingAvailability(true);
      const storedReservations = localStorage.getItem('bistro_booking_reservations');
      const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
      const bookedIds = allRes
        .filter((r) => r.date === bookingDate && r.timeSlot === bookingSlot && (r.status === 'pending' || r.status === 'confirmed'))
        .map((r) => r.tableId);
      setBookedTableIds(bookedIds);

      if (selectedTable) {
        const isNowBooked = bookedIds.includes(selectedTable.id);
        const fitsCapacity = selectedTable.capacity >= guestsCount;
        if (isNowBooked || !fitsCapacity) {
          setSelectedTable(null);
        }
      }
      setLoadingAvailability(false);
    };
    checkAvailabilityMock();
  }, [bookingDate, bookingSlot, guestsCount, selectedTable]);

  const handleCreateReservation = async (e: FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(false);

    if (!selectedTable) {
      setBookingError('Please choose an available table from the floor plan.');
      return;
    }
    if (guestsCount > selectedTable.capacity) {
      setBookingError(
        `Selected Table ${selectedTable.number} cannot fit ${guestsCount} guests (Max Capacity: ${selectedTable.capacity}).`
      );
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (bookingDate < todayStr) {
      setBookingError('You cannot make a reservation for a past date.');
      return;
    }

    setSubmitLoading(true);
    const storedReservations = localStorage.getItem('bistro_booking_reservations');
    const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];

    const isDoubleBooked = allRes.some(
      (r) =>
        r.date === bookingDate &&
        r.timeSlot === bookingSlot &&
        r.tableId === selectedTable.id &&
        (r.status === 'pending' || r.status === 'confirmed')
    );

    if (isDoubleBooked) {
      setBookingError('This table was just booked by another user. Please select another table.');
      setSubmitLoading(false);
      return;
    }

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      userId: 'mock_sandbox_user_123',
      userEmail: 'demo_customer@restaurant.com',
      userName: 'Demo Customer',
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      date: bookingDate,
      timeSlot: bookingSlot,
      guests: guestsCount,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allRes.push(newRes);
    localStorage.setItem('bistro_booking_reservations', JSON.stringify(allRes));
    setBookingSuccess(true);
    setSelectedTable(null);
    setSubmitLoading(false);
  };

  const handleCancelReservation = async (resId: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    const storedReservations = localStorage.getItem('bistro_booking_reservations');
    const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
    const updated = allRes.map((r) => {
      if (r.id === resId) {
        return { ...r, status: 'cancelled' as const, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    localStorage.setItem('bistro_booking_reservations', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Reserve Your Table
          </h1>
          <p className="text-slate-500 mt-1">
            Pick a time slot, select your guests, and choose your perfect spot.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Compass className="w-5 h-5 text-indigo-500" />
          <span>Customer Portal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reservation Form (6 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            New Reservation Details
          </h2>

          <form onSubmit={handleCreateReservation} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium appearance-none"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Guests Count
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={guestsCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setGuestsCount(val);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Visual Seating Layout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Choose a Table
                </label>
                {loadingAvailability && (
                  <span className="text-xs text-indigo-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking slot occupancy...
                  </span>
                )}
              </div>

              {loadingTables ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  <p className="text-xs text-slate-500">Loading seating floor plan...</p>
                </div>
              ) : tables.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-sm text-slate-500">
                  No tables configured yet.
                </div>
              ) : (
                <TableLayout
                  tables={tables}
                  selectedTableId={selectedTable?.id || null}
                  onSelectTable={(table) => {
                    if (table.capacity < guestsCount) {
                      setBookingError(
                        `Warning: Table ${table.number} holds only ${table.capacity} guests (you requested ${guestsCount}).`
                      );
                    } else {
                      setBookingError(null);
                    }
                    setSelectedTable(table);
                  }}
                  bookedTableIds={bookedTableIds}
                  guestsCount={guestsCount}
                />
              )}
            </div>

            {/* Notifications & Error Handling */}
            {bookingError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-2.5 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <span>Success! Your table reservation has been booked.</span>
              </div>
            )}

            {/* Booking confirmation panel */}
            {selectedTable && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-800 font-medium">
                    You selected: <span className="text-indigo-600 font-semibold">Table {selectedTable.number}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Sufficient for {selectedTable.capacity} guests. Booking for {guestsCount} guests.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-4 h-4" />
                  )}
                  <span>Book This Table</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Existing Reservations (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Your Reservations
          </h2>

          {loadingReservations ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-xs text-slate-500">Fetching bookings...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-sm text-slate-400 space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p>You have no active reservations.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    res.status === 'cancelled'
                      ? 'bg-slate-50/50 border-slate-100 opacity-60'
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-indigo-600">
                          T{res.tableNumber}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-600">
                          {res.guests} {res.guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{res.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{res.timeSlot}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {res.status}
                      </span>

                      {res.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 ml-auto"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
