import "./style.css";

// 1. Definisi tipe untuk satu tugas
interface Todo {
  id: number;
  teks: string;
  selesai: boolean;
}

// Tipe data untuk filter status
type FilterStatus = "semua" | "aktif" | "selesai";

// 2. State: daftar semua tugas dan filter aktif
let todos: Todo[] = muatDariStorage();
let filterAktif: FilterStatus = "semua";

// 3. Ambil elemen DOM (dengan tipe yang tepat)
const form = document.getElementById("todo-form") as HTMLFormElement;
const input = document.getElementById("todo-input") as HTMLInputElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const tombolFilter = document.querySelectorAll<HTMLButtonElement>("#filter-bar button");

const KUNCI_STORAGE = "todos";

// Fungsi penyimpanan (localStorage) yang aman
function simpanKeStorage(): void {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(todos));
}

function muatDariStorage(): Todo[] {
  try {
    const data = localStorage.getItem(KUNCI_STORAGE);
    if (!data) return [];
    const hasil = JSON.parse(data);
    
    // Pastikan hasilnya array dengan bentuk Todo yang benar menggunakan type predicate
    if (!Array.isArray(hasil)) return [];
    return hasil.filter(
      (item): item is Todo =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.teks === "string" &&
        typeof item.selesai === "boolean"
    );
  } catch {
    // Data rusak (bukan JSON valid): mulai dari daftar kosong
    return [];
  }
}

// Logika aplikasi
function tambahTodo(teks: string): void {
  const todoBaru: Todo = {
    id: Date.now(), // id unik dari waktu sekarang
    teks: teks,
    selesai: false,
  };
  todos.push(todoBaru);
  simpanKeStorage();
  render();
}

function ubahStatus(id: number): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, selesai: !todo.selesai } : todo
  );
  simpanKeStorage();
  render();
}

function editTodo(id: number, teksBaru: string): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, teks: teksBaru } : todo
  );
  simpanKeStorage();
  render();
}

function hapusTodo(id: number): void {
  todos = todos.filter((todo) => todo.id !== id);
  simpanKeStorage();
  render();
}

// Menampilkan data ke layar dengan filter
function render(): void {
  list.innerHTML = "";

  const todosTampil = todos.filter((todo) => {
    if (filterAktif === "aktif") return !todo.selesai;
    if (filterAktif === "selesai") return todo.selesai;
    return true; // "semua"
  });

  todosTampil.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.selesai ? "todo-item selesai" : "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.selesai;
    checkbox.addEventListener("change", () => ubahStatus(todo.id));

    const span = document.createElement("span");
    span.className = "teks";
    span.textContent = todo.teks;

    const tombolEdit = document.createElement("button");
    tombolEdit.className = "edit";
    tombolEdit.textContent = "Edit";
    tombolEdit.addEventListener("click", () => {
      const teksBaru = prompt("Ubah tugas:", todo.teks);
      if (teksBaru !== null && teksBaru.trim() !== "") {
        editTodo(todo.id, teksBaru.trim());
      }
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.className = "hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.addEventListener("click", () => hapusTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(tombolEdit);
    li.appendChild(tombolHapus);
    list.appendChild(li);
  });
}

// Menghubungkan form submit
form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault(); // cegah halaman reload
  const teks = input.value.trim();
  if (teks === "") return; // abaikan input kosong
  tambahTodo(teks);
  input.value = "";
  input.focus();
});

// Menghubungkan tombol filter
tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    const filterValue = tombol.dataset.filter;
    if (filterValue) {
      filterAktif = filterValue as FilterStatus;
      render();
    }
  });
});

// Tampilkan data saat halaman pertama dibuka
render();