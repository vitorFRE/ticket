import { gateResultCopy } from "@/features/gate/gate-result-copy";
import type { GateValidateResponse } from "@/features/gate/types";
import { cn } from "@/lib/utils";

export function GateResult({
  data,
  onNext,
}: {
  data: GateValidateResponse;
  onNext: () => void;
}) {
  const copy = gateResultCopy(data.result, data.ticket);
  const ok = data.result === "VALID";

  return (
    <div className="max-w-xl">
      <h2
        className={cn(
          "text-4xl font-semibold tracking-[-0.04em] md:text-6xl",
          ok && "text-emerald-300",
        )}
      >
        {copy.title}
      </h2>
      <p className="mt-4 max-w-[36ch] text-lg leading-relaxed text-white/55">
        {copy.body}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="mt-10 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
      >
        Próximo
      </button>
    </div>
  );
}
