import Swal from "sweetalert2";

export async function confirmDelete(message: string, title = "Hapus data?"): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#71717a",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}
