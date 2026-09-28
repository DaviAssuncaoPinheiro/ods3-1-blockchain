import { HISTORY_EVENT_LABELS, PRODUCT_STATUS_LABELS } from "@/constants/product";
import { formatDateTime } from "@/lib/utils/format";
import type { HistoryEventType, ProductHistoryEvent } from "@/types/product";
import { ParticipantValue } from "@/components/participants/ParticipantValue";
import { MonoValue } from "@/components/ui/MonoValue";
import { Panel } from "@/components/ui/Panel";
import { PackageIcon, TagIcon, WrenchIcon } from "@/components/ui/icons";

const EVENT_ICONS: Record<HistoryEventType, typeof PackageIcon> = {
  Registered: PackageIcon,
  Sold: TagIcon,
  Maintenance: WrenchIcon,
};

export function ProductTimeline({ events }: { events: ProductHistoryEvent[] }) {
  return (
    <Panel
      title="Histórico do produto"
      description="Cada evento abaixo foi gravado por uma transação na blockchain e não pode ser alterado."
    >
      <ol>
        {events.map((event, index) => (
          <TimelineItem
            key={`${event.type}-${index}`}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </ol>
    </Panel>
  );
}

function TimelineItem({ event, isLast }: { event: ProductHistoryEvent; isLast: boolean }) {
  const EventIcon = EVENT_ICONS[event.type];
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <EventIcon />
        </span>
        {!isLast && <span className="my-2 w-px flex-1 bg-line" aria-hidden="true" />}
      </div>

      <div className={`min-w-0 flex-1 pt-2 ${isLast ? "" : "pb-8"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-base font-medium">{HISTORY_EVENT_LABELS[event.type]}</h3>
          <time dateTime={event.timestamp.toISOString()} className="text-sm text-ink-muted">
            {formatDateTime(event.timestamp)}
          </time>
        </div>
        {event.details && <p className="mt-1 text-sm">{event.details}</p>}
        <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
          <dt className="text-ink-muted">Status</dt>
          <dd>{PRODUCT_STATUS_LABELS[event.status]}</dd>
          <dt className="text-ink-muted">Responsável</dt>
          <dd>
            <ParticipantValue address={event.actor} />
          </dd>
          <dt className="text-ink-muted">Transação</dt>
          <dd>
            {event.transactionHash ? (
              <MonoValue value={event.transactionHash} format="hash" />
            ) : (
              <span className="text-ink-muted">Não disponível</span>
            )}
          </dd>
        </dl>
      </div>
    </li>
  );
}
