import {
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { GateTicketRecord } from "@/features/gate/components/gate-ticket-record";
import {
  gatePlace,
  gateResultCopy,
  gateResultTone,
} from "@/features/gate/gate-result-copy";
import type { GateValidateResponse } from "@/features/gate/types";
import { cn } from "@/lib/utils";

const toneClass = {
  ok: "text-emerald-300",
  used: "text-primary",
  wrong: "text-foreground",
  invalid: "text-destructive",
  closed: "text-amber-300",
} as const;

export function GateResult({
  data,
  onNext,
}: {
  data: GateValidateResponse;
  onNext: () => void;
}) {
  const copy = gateResultCopy(
    data.result,
    data.ticket?.event?.gateOpensHoursBefore ?? undefined,
  );
  const tone = gateResultTone(data.result);
  const place = gatePlace(data.ticket);
  const Icon = resultIcon(tone);

  return (
    <div className="max-w-xl">
      {place ? (
        <>
          <p className={cn("flex items-center gap-2 text-sm", toneClass[tone])}>
            <Icon size={18} weight="fill" />
            {copy.title}
          </p>
          <h2
            className={cn(
              "mt-3 text-5xl font-semibold tracking-[-0.04em] md:text-7xl",
              toneClass[tone],
            )}
          >
            {place}
          </h2>
        </>
      ) : (
        <h2
          className={cn(
            "flex items-center gap-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl",
            toneClass[tone],
          )}
        >
          <Icon size={36} weight="fill" />
          {copy.title}
        </h2>
      )}
      <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      {data.ticket ? (
        <GateTicketRecord
          ticket={data.ticket}
          showEvent={data.result === "WRONG_EVENT"}
          highlightValidatedAt={data.result === "ALREADY_USED"}
        />
      ) : null}
      <button
        type="button"
        onClick={onNext}
        className="mt-10 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] sm:w-auto"
      >
        Próximo
      </button>
    </div>
  );
}

function resultIcon(tone: keyof typeof toneClass) {
  if (tone === "ok") return CheckCircleIcon;
  if (tone === "used") return ClockCounterClockwiseIcon;
  if (tone === "wrong") return WarningCircleIcon;
  if (tone === "closed") return ClockIcon;
  return XCircleIcon;
}
