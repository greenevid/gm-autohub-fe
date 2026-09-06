const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function words(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${words(n - 10)} belas`;
  if (n < 100) return `${words(Math.floor(n / 10))} puluh${n % 10 ? ` ${words(n % 10)}` : ""}`;
  if (n < 200) return `seratus${n % 100 ? ` ${words(n % 100)}` : ""}`;
  if (n < 1000) return `${words(Math.floor(n / 100))} ratus${n % 100 ? ` ${words(n % 100)}` : ""}`;
  if (n < 2000) return `seribu${n % 1000 ? ` ${words(n % 1000)}` : ""}`;
  if (n < 1000000) return `${words(Math.floor(n / 1000))} ribu${n % 1000 ? ` ${words(n % 1000)}` : ""}`;
  if (n < 1000000000)
    return `${words(Math.floor(n / 1000000))} juta${n % 1000000 ? ` ${words(n % 1000000)}` : ""}`;
  return `${words(Math.floor(n / 1000000000))} milyar${n % 1000000000 ? ` ${words(n % 1000000000)}` : ""}`;
}

/** Converts a rupiah amount to its Indonesian words form, e.g. 109890 -> "Seratus sembilan ribu delapan ratus sembilan puluh rupiah". */
export function terbilang(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const text = rounded === 0 ? "nol" : words(rounded);
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return `${capitalized} rupiah`;
}
