import { useState, useEffect, FormEvent } from 'react';
import { Table, Reservation } from '../types';
import {
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Wrench,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface AdminDashboardProps {
  isMockMode?: boolean;
}

export default function AdminDashboard({ isMockMode }: AdminDashboardProps) {
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Table creation states
  const [newTableNumber, setNewTableNumber] = useState<string>('');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);
  const [tableActionLoading, setTableActionLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Fetch all reservations
  useEffect(() => {
    const loadResMock = () => {
      const storedReservations = localStorage.getItem('bistro_booking_reservations');
      const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
      allRes.sort((a, b) => b.date.localeCompare(a.date));
      setAllReservations(allRes);
      setLoadingReservations(false);
    };
    loadResMock();
    const interval = setInterval(loadResMock, 1500);
    return () => clearInterval(interval);
  }, []);

  // Fetch all tables
  useEffect(() => {
    const loadTablesMock = () => {
      const storedTables = localStorage.getItem('bistro_booking_tables');
      if (storedTables) {
        setAllTables(JSON.parse(storedTables));
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
        setAllTables(defaultTables);
      }
      setLoadingTables(false);
    };
    loadTablesMock();
    const interval = setInterval(loadTablesMock, 1500);
    return () => clearInterval(interval);
  }, []);

  // Filter reservations based on date & status
  const filteredReservations = allReservations.filter((res) => {
    const dateMatch = filterDate === '' || res.date === filterDate;
    const statusMatch = filterStatus === 'all' || res.status === filterStatus;
    return dateMatch && statusMatch;
  });

  const handleUpdateStatus = async (resId: string, nextStatus: 'pending' | 'confirmed' | 'cancelled') => {
    const storedReservations = localStorage.getItem('bistro_booking_reservations');
    const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
    const updated = allRes.map((r) => {
      if (r.id === resId) {
        return { ...r, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    localStorage.setItem('bistro_booking_reservations', JSON.stringify(updated));
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!window.confirm('Permanently delete this reservation document?')) return;

    const storedReservations = localStorage.getItem('bistro_booking_reservations');
    const allRes: Reservation[] = storedReservations ? JSON.parse(storedReservations) : [];
    const filtered = allRes.filter((r) => r.id !== resId);
    localStorage.setItem('bistro_booking_reservations', JSON.stringify(filtered));
  };

  const handleCreateTable = async (e: FormEvent) => {
    e.preventDefault();
    setTableError(null);

    const num = parseInt(newTableNumber);
    if (!num || num <= 0) {
      setTableError('Please specify a valid table number.');
      return;
    }

    // Check if table number already exists
    if (allTables.some((t) => t.number === num)) {
      setTableError(`Table number ${num} is already configured.`);
      return;
    }

    setTableActionLoading(true);

    const storedTables = localStorage.getItem('bistro_booking_tables');
    const allTabs: Table[] = storedTables ? JSON.parse(storedTables) : [];
    const newTab: Table = {
      id: `table_${num}`,
      number: num,
      capacity: newTableCapacity,
      isActive: true,
    };
    allTabs.push(newTab);
    // Sort tables by table number asc
    allTabs.sort((a, b) => a.number - b.number);
    localStorage.setItem('bistro_booking_tables', JSON.stringify(allTabs));
    setNewTableNumber('');
    setTableActionLoading(false);
  };

  const handleToggleTableActive = async (tableId: string, currentActive: boolean) => {
    const storedTables = localStorage.getItem('bistro_booking_tables');
    const allTabs: Table[] = storedTables ? JSON.parse(storedTables) : [];
    const updated = allTabs.map((t) => {
      if (t.id === tableId) {
        return { ...t, isActive: !currentActive };
      }
      return t;
    });
    localStorage.setItem('bistro_booking_tables', JSON.stringify(updated));
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Delete this table configuration? Existing bookings may lose physical association.')) return;

    const storedTables = localStorage.getItem('bistro_booking_tables');
    const allTabs: Table[] = storedTables ? JSON.parse(storedTables) : [];
    const filtered = allTabs.filter((t) => t.id !== tableId);
    localStorage.setItem('bistro_booking_tables', JSON.stringify(filtered));
  };

  // Pre-seed tables
  const handleSeedTables = async () => {
    if (allTables.length > 0 && !window.confirm('Tables are already configured. Setup additional default tables?')) {
      return;
    }

    setTableActionLoading(true);

    const defaultTables = [
      { id: 'table_1', number: 1, capacity: 2, isActive: true },
      { id: 'table_2', number: 2, capacity: 2, isActive: true },
      { id: 'table_3', number: 3, capacity: 4, isActive: true },
      { id: 'table_4', number: 4, capacity: 4, isActive: true },
      { id: 'table_5', number: 5, capacity: 6, isActive: true },
      { id: 'table_6', number: 6, capacity: 8, isActive: true },
    ];
    const storedTables = localStorage.getItem('bistro_booking_tables');
    const allTabs: Table[] = storedTables ? JSON.parse(storedTables) : [];
    const merged = [...allTabs];
    for (const t of defaultTables) {
      if (!merged.some((m) => m.number === t.number)) {
        merged.push(t);
      }
    }
    merged.sort((a, b) => a.number - b.number);
    localStorage.setItem('bistro_booking_tables', JSON.stringify(merged));
    setTableActionLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Introduction Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Administration Console
          </h1>
          <p className="text-slate-400 mt-1">
            Oversee restaurant capacity, manage schedules, and coordinate table layouts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-full">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Administrator Access</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Total Reservations</span>
          <span className="text-3xl font-bold font-display text-slate-800">{allReservations.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Active Bookings</span>
          <span className="text-3xl font-bold font-display text-emerald-600">
            {allReservations.filter((r) => r.status !== 'cancelled').length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Restaurant Tables</span>
          <span className="text-3xl font-bold font-display text-slate-800">{allTables.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Active Tables</span>
          <span className="text-3xl font-bold font-display text-indigo-600">
            {allTables.filter((t) => t.isActive).length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reservations Manager (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Manage Reservations
            </h2>

            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-3 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-2.5 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {(filterDate !== '' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterStatus('all');
                  }}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {loadingReservations ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-xs text-slate-500">Loading master bookings list...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="border border-dashed border-slate-200 p-12 rounded-2xl text-center text-sm text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p>No reservations match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredReservations.map((res) => (
                <div
                  key={res.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    res.status === 'cancelled'
                      ? 'bg-slate-50/50 border-slate-100 opacity-60'
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg text-slate-800">
                          Table {res.tableNumber}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                          Cap: {allTables.find((t) => t.id === res.tableId)?.capacity || '?'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-600 bg-indigo-50/60 text-indigo-700 px-2 py-0.5 rounded-full">
                          {res.guests} Guests
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{res.date}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.timeSlot}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Reserved by:{' '}
                        <span className="font-semibold text-slate-700">{res.userName}</span>{' '}
                        <span className="text-slate-400 font-mono">({res.userEmail})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {/* Action controllers */}
                      <select
                        value={res.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            res.id,
                            e.target.value as 'pending' | 'confirmed' | 'cancelled'
                          )
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : res.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => handleDeleteReservation(res.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Reservation document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Management (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Create table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Restaurant Table
            </h2>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Table Number
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {tableError && <p className="text-xs text-amber-600 font-medium">{tableError}</p>}

              <button
                type="submit"
                disabled={tableActionLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {tableActionLoading ? (
                  <Loader2 className="w-3 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Configure Table</span>
              </button>
            </form>
          </div>

          {/* Setup / Tables configuration layout */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Manage Layout
              </h2>
              <button
                onClick={handleSeedTables}
                disabled={tableActionLoading}
                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2 py-1 rounded border border-indigo-100 flex items-center gap-1 transition-all"
                title="Populate 6 standard tables"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Auto-Seed Defaults</span>
              </button>
            </div>

            {loadingTables ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-1">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                <p className="text-[11px] text-slate-400">Loading layout...</p>
              </div>
            ) : allTables.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No tables configured. Click "Auto-Seed Defaults" to quickly initialize.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {allTables.map((table) => (
                  <div
                    key={table.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">Table {table.number}</span>
                      <span className="text-slate-400 font-mono ml-2">({table.capacity} seats)</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleTableActive(table.id, table.isActive)}
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider transition-all ${
                          table.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {table.isActive ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-rose-500 hover:text-rose-600 transition-all"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
