import {  } from 'axios';
import { FC, useEffect, useState, useMemo } from 'react';
import { httpFactoryService } from '../../../shared/services/http-factory.service';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import './calendar.page.scss';
import useAuthStore from '../../../store/auth.store';

interface IEvent {
  id: string;
  title: string;
  description: string;
  targetUsername?: string;
  type?: 'election' | 'resignation' | 'citizenship' | 'diplomacy' | 'other';
  stateId?: string;
  settlementId?: string;
  createdAt: string;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
};

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CalendarPage: FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadEvents = async () => {
      try {
        const api = httpFactoryService.createAuthHttpService();
        const res = await api.get('/events');
        setEvents(res as IEvent[]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [isAuthenticated]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const getEventIcon = (type?: string) => {
    switch (type) {
      case 'election': return '🗳️';
      case 'resignation': return '🚪';
      case 'citizenship': return '📜';
      case 'diplomacy': return '🤝';
      default: return '📅';
    }
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, IEvent[]>();
    events.forEach(ev => {
      const d = new Date(ev.createdAt);
      // Local date string format YYYY-MM-DD
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(ev);
    });
    return map;
  }, [events]);

  const generateGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const grid = [];

    // Empty slots before the first day
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="calendar-grid__cell calendar-grid__cell--empty" />);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = eventsByDate.get(dateKey) || [];
      const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === i;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;

      grid.push(
        <div
          key={`day-${i}`}
          className={`calendar-grid__cell ${isSelected ? 'calendar-grid__cell--selected' : ''} ${isToday ? 'calendar-grid__cell--today' : ''}`}
          onClick={() => handleDayClick(i)}
        >
          <span className="calendar-grid__day-num">{i}</span>
          {dayEvents.length > 0 && (
            <div className="calendar-grid__dots">
              {dayEvents.slice(0, 3).map((e, idx) => (
                <span key={idx} className="calendar-grid__dot" title={e.title} />
              ))}
              {dayEvents.length > 3 && <span className="calendar-grid__dot-more">+</span>}
            </div>
          )}
        </div>
      );
    }
    return grid;
  };

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayEvents = eventsByDate.get(selectedDateKey) || [];

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="calendar-page-new">
          <div className="calendar-page-new__header">
            <div>
              <h1 className="calendar-page-new__title">Календарь событий</h1>
              <p className="calendar-page-new__subtitle">Следите за политической жизнью и своими уведомлениями</p>
            </div>
          </div>

          <div className="calendar-layout">
            {/* Left side: Calendar Grid */}
            <div className="calendar-container">
              <div className="calendar-controls">
                <button onClick={prevMonth} className="calendar-controls__btn">◀</button>
                <div className="calendar-controls__current">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={nextMonth} className="calendar-controls__btn">▶</button>
              </div>

              <div className="calendar-grid">
                {dayNames.map(day => (
                  <div key={day} className="calendar-grid__day-name">{day}</div>
                ))}
                {generateGrid()}
              </div>
            </div>

            {/* Right side: Daily Events */}
            <div className="calendar-sidebar">
              <div className="calendar-sidebar__header">
                <h3>{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h3>
                <span className="calendar-sidebar__count">Событий: {selectedDayEvents.length}</span>
              </div>
              
              <div className="calendar-sidebar__content">
                {loading ? (
                  <div className="calendar-sidebar__loading">Загрузка...</div>
                ) : selectedDayEvents.length > 0 ? (
                  <div className="event-list">
                    {selectedDayEvents.map(event => (
                      <div key={event.id} className="event-card">
                        <div className="event-card__icon">{getEventIcon(event.type)}</div>
                        <div className="event-card__body">
                          <h4 className="event-card__title">{event.title}</h4>
                          <p className="event-card__desc">{event.description}</p>
                          <div className="event-card__time">
                            {new Date(event.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="calendar-sidebar__empty">
                    <div className="empty-icon">🍃</div>
                    <p>В этот день ничего интересного не произошло.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
