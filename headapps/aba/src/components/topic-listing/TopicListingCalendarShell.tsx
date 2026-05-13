'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  List,
  MapPin,
  Users,
  Video,
} from 'lucide-react';
import { Link, Text } from '@sitecore-content-sdk/nextjs';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import type { TopicListingProps } from './topic-listing.props';
import { getTopicListingDatasource } from './topic-listing-field-utils';
import {
  eventTypeBadgeClassName,
  eventsForCalendarDay,
  eventTypeCalendarBarClassName,
  formatEventDateLabel,
  formatEventTimeLabel,
  partitionFeatured,
  rowRenderable,
  sortEventsByDateAsc,
  topicRowsFromChildren,
  type TopicListingEventRow,
  type TopicListingEventTypeKey,
} from './topic-listing-event-model';

const SUBTITLE =
  'Stay informed with the latest training, conferences, and educational content from ABA.';

type ViewMode = 'list' | 'calendar';

function EventTypeIcon({ type }: { type: TopicListingEventTypeKey }) {
  const common = 'h-3 w-3 shrink-0';
  switch (type) {
    case 'webinar':
      return <Video className={common} aria-hidden />;
    case 'conference':
      return <Users className={common} aria-hidden />;
    case 'training':
      return <CalendarDays className={common} aria-hidden />;
    case 'workshop':
      return <Clock className={common} aria-hidden />;
    default:
      return <CalendarDays className={common} aria-hidden />;
  }
}

function RegisterControl({
  row,
  isPageEditing,
  variant,
}: {
  row: TopicListingEventRow;
  isPageEditing: boolean;
  variant: 'featured' | 'row';
}) {
  const field = row.cta;
  const hasHref =
    field?.value &&
    typeof field.value === 'object' &&
    typeof (field.value as { href?: string }).href === 'string' &&
    (field.value as { href: string }).href !== '' &&
    (field.value as { href: string }).href !== 'http://';

  if (!isPageEditing && !hasHref) {
    return null;
  }

  const label =
    field?.value && typeof field.value === 'object' && typeof (field.value as { text?: string }).text === 'string'
      ? (field.value as { text: string }).text?.trim() || ''
      : '';
  const text = label || (variant === 'featured' ? 'Register Now' : 'Register');

  if (variant === 'featured') {
    return (
      <Link
        field={field ?? { value: { href: '#', text } }}
        editable={isPageEditing}
        className={cn(
          'inline-flex w-full items-center justify-center gap-1 rounded-md px-4 py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)]',
          'bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)]',
        )}
      >
        {text}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      field={field ?? { value: { href: '#', text } }}
      editable={isPageEditing}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-[color:var(--color-primary)] px-3 py-1.5 text-sm font-semibold',
        'text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-primary-foreground)]',
      )}
    >
      {text}
      <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function FeaturedCard({ row, isPageEditing }: { row: TopicListingEventRow; isPageEditing: boolean }) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-[var(--radius-topic-listing-events-card)] border border-[color:var(--color-topic-listing-events-card-border)]',
        'bg-[color:var(--color-topic-listing-events-page-bg)] shadow-[var(--shadow-topic-listing-events-card)]',
      )}
    >
      <div
        className="h-1 w-full bg-[color:var(--color-topic-listing-events-card-top-accent)]"
        aria-hidden
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className={eventTypeBadgeClassName(row.eventTypeKey)}>
            <EventTypeIcon type={row.eventTypeKey} />
            {row.eventTypeLabel}
          </span>
          {row.isVirtual ? (
            <span
              className={cn(
                'rounded-[var(--radius-topic-listing-events-pill)] border px-2 py-0.5 text-xs font-medium',
                'border-[color:var(--color-topic-listing-events-virtual-outline)] text-[color:var(--color-topic-listing-events-virtual-fg)]',
              )}
            >
              Virtual
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-semibold text-[color:var(--color-topic-listing-events-heading)]">
          {row.displayTitle || (isPageEditing ? '\u00a0' : '')}
        </h3>
        {row.displayDescription ? (
          <p className="line-clamp-2 text-sm text-[color:var(--color-topic-listing-events-subtitle)]">
            {row.displayDescription}
          </p>
        ) : null}
        <div className="space-y-2 text-sm text-[color:var(--color-topic-listing-events-subtitle)]">
          {row.at ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
              <span>{formatEventDateLabel(row.at)}</span>
            </div>
          ) : null}
          {row.at ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <span>{formatEventTimeLabel(row.at)}</span>
            </div>
          ) : null}
          {row.location && !row.isVirtual ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span>{row.location}</span>
            </div>
          ) : null}
        </div>
        <RegisterControl row={row} isPageEditing={isPageEditing} variant="featured" />
      </div>
    </div>
  );
}

function ListRow({ row, isPageEditing }: { row: TopicListingEventRow; isPageEditing: boolean }) {
  return (
    <div className="flex flex-col gap-4 p-4 transition-colors hover:bg-[color:var(--color-secondary)]/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex shrink-0 flex-col gap-0 sm:w-32">
          {row.at ? (
            <>
              <span className="text-sm font-semibold text-[color:var(--color-topic-listing-events-heading)]">
                {formatEventDateLabel(row.at)}
              </span>
              <span className="text-xs text-[color:var(--color-topic-listing-events-subtitle)]">
                {formatEventTimeLabel(row.at)}
              </span>
            </>
          ) : (
            <span className="text-xs text-[color:var(--color-topic-listing-events-subtitle)]">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={cn(eventTypeBadgeClassName(row.eventTypeKey), 'text-xs')}>
              <EventTypeIcon type={row.eventTypeKey} />
              {row.eventTypeLabel}
            </span>
            {row.isVirtual ? (
              <span
                className={cn(
                  'rounded-[var(--radius-topic-listing-events-pill)] border px-2 py-0.5 text-xs',
                  'border-[color:var(--color-topic-listing-events-virtual-outline)] text-[color:var(--color-topic-listing-events-virtual-fg)]',
                )}
              >
                Virtual
              </span>
            ) : null}
            {row.location && !row.isVirtual ? (
              <span className="flex items-center gap-1 text-xs text-[color:var(--color-topic-listing-events-subtitle)]">
                <MapPin className="h-3 w-3" aria-hidden />
                {row.location}
              </span>
            ) : null}
          </div>
          <h3 className="font-medium text-[color:var(--color-topic-listing-events-heading)]">
            {row.displayTitle || (isPageEditing ? 'Event' : '')}
          </h3>
          {row.displayDescription ? (
            <p className="mt-1 hidden text-sm text-[color:var(--color-topic-listing-events-subtitle)] sm:line-clamp-1 sm:block">
              {row.displayDescription}
            </p>
          ) : null}
        </div>
      </div>
      <RegisterControl row={row} isPageEditing={isPageEditing} variant="row" />
    </div>
  );
}

function CalendarGrid({
  rows,
  monthCursor,
  onMonthChange,
}: {
  rows: TopicListingEventRow[];
  monthCursor: Date;
  onMonthChange: (d: Date) => void;
}) {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex items-center justify-between rounded-[var(--radius-topic-listing-events-card)] border border-[color:var(--color-topic-listing-events-card-border)]',
          'bg-[color:var(--color-topic-listing-events-page-bg)] p-4',
        )}
      >
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--color-topic-listing-events-subtitle)] hover:bg-[color:var(--color-secondary)]"
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <h2 className="text-lg font-semibold text-[color:var(--color-topic-listing-events-heading)]">
          {monthNames[month]} {year}
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--color-topic-listing-events-subtitle)] hover:bg-[color:var(--color-secondary)]"
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-[var(--radius-topic-listing-events-card)] border border-[color:var(--color-topic-listing-events-card-border)]',
          'bg-[color:var(--color-topic-listing-events-page-bg)]',
        )}
      >
        <div className="grid grid-cols-7 border-b border-[color:var(--color-topic-listing-events-card-border)] bg-[color:var(--color-topic-listing-events-calendar-header-bg)]">
          {dayNames.map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[color:var(--color-topic-listing-events-subtitle)]"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayEvents = day ? eventsForCalendarDay(rows, day, month, year) : [];
            const hasEvents = dayEvents.length > 0;
            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[var(--min-height-topic-listing-events-calendar-cell)] border-b border-r border-[color:var(--color-topic-listing-events-card-border)] p-1 last:border-r-0 sm:min-h-[var(--min-height-topic-listing-events-calendar-cell-sm)] sm:p-2',
                  day === null && 'bg-[color:var(--color-muted)]/40',
                  hasEvents && 'cursor-default',
                )}
              >
                {day !== null ? (
                  <>
                    <div
                      className={cn(
                        'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium sm:h-7 sm:w-7',
                        isToday(day)
                          ? 'bg-[color:var(--color-topic-listing-events-calendar-today-ring)] text-[color:var(--color-topic-listing-events-calendar-today-fg)]'
                          : 'text-[color:var(--color-topic-listing-events-heading)]',
                      )}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.key}
                          className={eventTypeCalendarBarClassName(ev.eventTypeKey)}
                          title={ev.displayTitle}
                        >
                          <span className="hidden sm:inline">{ev.displayTitle}</span>
                          <span className="sm:hidden">{ev.eventTypeLabel}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 ? (
                        <div className="px-1 text-xs text-[color:var(--color-topic-listing-events-subtitle)]">
                          +{dayEvents.length - 2} more
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const TopicListingCalendarShell: React.FC<
  Pick<TopicListingProps, 'fields' | 'page'>
> = (props) => {
  const { fields, page } = props;
  const isPageEditing = page?.mode?.isEditing ?? false;
  const ds = getTopicListingDatasource(fields);
  const { title, children } = ds;
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const allRows = useMemo(() => {
    const raw = topicRowsFromChildren(children?.results, isPageEditing);
    return raw.filter((r) => rowRenderable(r, isPageEditing));
  }, [children?.results, isPageEditing]);

  const sorted = useMemo(() => sortEventsByDateAsc(allRows), [allRows]);
  const { featured, rest } = useMemo(() => partitionFeatured(sorted), [sorted]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const first = sorted.find((r) => r.at)?.at;
    if (first) return new Date(first.getFullYear(), first.getMonth(), 1);
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  if (!fields) {
    return null;
  }

  return (
    <section
      className="w-full bg-[color:var(--color-topic-listing-events-page-bg)] py-10 text-[color:var(--color-foreground)]"
      data-component="TopicListing"
      data-variant="calendar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          {title ? (
            <Text
              tag="h2"
              field={title.jsonValue as Field<string>}
              className="text-3xl font-semibold tracking-tight text-[color:var(--color-topic-listing-events-heading)] md:text-4xl"
            />
          ) : null}
          <p className="mt-2 max-w-3xl text-[color:var(--color-topic-listing-events-subtitle)]">{SUBTITLE}</p>
        </header>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div
            className={cn(
              'flex items-center gap-1 self-end rounded-[var(--radius-topic-listing-events-toggle)] border border-[color:var(--color-topic-listing-events-card-border)]',
              'bg-[color:var(--color-card)] p-1 sm:self-auto',
            )}
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]'
                  : 'text-[color:var(--color-topic-listing-events-subtitle)] hover:text-[color:var(--color-topic-listing-events-heading)]',
              )}
            >
              <List className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'calendar'
                  ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]'
                  : 'text-[color:var(--color-topic-listing-events-subtitle)] hover:text-[color:var(--color-topic-listing-events-heading)]',
              )}
            >
              <Grid3X3 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {featured.length > 0 ? (
              <div className="mb-10">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-topic-listing-events-subtitle)]">
                  Featured
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {featured.map((row) => (
                    <FeaturedCard key={row.key} row={row} isPageEditing={isPageEditing} />
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-topic-listing-events-subtitle)]">
                All upcoming
              </h3>
              <div
                className={cn(
                  'divide-y divide-[color:var(--color-topic-listing-events-list-divider)] rounded-[var(--radius-topic-listing-events-card)] border border-[color:var(--color-topic-listing-events-card-border)]',
                  'bg-[color:var(--color-topic-listing-events-page-bg)]',
                )}
              >
                {rest.map((row) => (
                  <ListRow key={row.key} row={row} isPageEditing={isPageEditing} />
                ))}
                {rest.length === 0 && !featured.length ? (
                  <div className="p-8 text-center text-[color:var(--color-topic-listing-events-subtitle)]">
                    No events in this listing yet.
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <CalendarGrid rows={sorted} monthCursor={monthCursor} onMonthChange={setMonthCursor} />
        )}
      </div>
    </section>
  );
};
