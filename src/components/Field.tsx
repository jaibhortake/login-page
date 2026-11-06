import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: ReactNode;
};

/** Input with a floating label and an accessible inline error. */
export function Field({ label, error, trailing, className = "", ...input }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={className}>
      <div className="group relative">
        <input
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`peer h-14 w-full rounded-2xl border bg-white/60 px-4 pt-5 pr-12 text-[15px] outline-none transition-all duration-200
            placeholder-transparent backdrop-blur dark:bg-white/[0.06]
            ${error
              ? "border-[#ff453a] ring-4 ring-[#ff453a]/15"
              : "border-black/10 focus:border-accent focus:ring-4 focus:ring-accent/20 dark:border-white/10"}`}
          {...input}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-neutral-500 transition-all duration-200
            peer-focus:top-4 peer-focus:text-[11px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-accent
            peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium"
        >
          {label}
        </label>
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={errId} className="mt-1.5 pl-1 text-xs text-[#ff453a]">
          {error}
        </p>
      )}
    </div>
  );
}
