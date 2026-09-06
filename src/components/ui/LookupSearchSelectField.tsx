"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { Lookup, LookupTipe } from "@/lib/types";
import { SearchSelectField } from "@/components/ui/SearchSelectField";
import { TambahLookupModal } from "@/components/pengaturan/TambahLookupModal";

interface LookupSearchSelectFieldProps {
  tipe: LookupTipe;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  showJatuhTempo?: boolean;
}

export function LookupSearchSelectField({
  tipe,
  label,
  value,
  onChange,
  placeholder,
  required,
  showJatuhTempo,
}: LookupSearchSelectFieldProps) {
  const [options, setOptions] = useState<Lookup[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    api.lookup(tipe).then(setOptions);
  }, [tipe]);

  return (
    <>
      <SearchSelectField
        value={value}
        onChange={onChange}
        options={options.map((o) => ({ id: o.id, label: o.nama }))}
        onAddNew={() => setAddOpen(true)}
        placeholder={placeholder}
        required={required}
        emptyLabel={`${label} tidak ditemukan, klik + untuk menambahkan`}
      />

      {addOpen &&
        createPortal(
          <TambahLookupModal
            tipe={tipe}
            label={label}
            showJatuhTempo={showJatuhTempo}
            onClose={() => setAddOpen(false)}
            onSaved={(saved) => {
              setOptions((prev) => [...prev, saved]);
              onChange(saved.nama);
            }}
          />,
          document.body
        )}
    </>
  );
}
