// =========================
// PENGATURAN SUPABASE
// =========================

const SUPABASE_URL =
    'https://ofikhymoplfgahogmeml.supabase.co';

const SUPABASE_KEY =
    'ISI_PUBLISHABLE_KEY_KAMU_DI_SINI';

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// ELEMENT HTML
// =========================

const form =
    document.getElementById('todo-form');

const tableBody =
    document.getElementById('table-body');

const secretTitle =
    document.getElementById('secret-title');

const mapelSelect =
    document.getElementById('mapel');

const mapelCustom =
    document.getElementById('mapel-custom');

let isAdmin = false;


// =========================
// CUSTOM MAPEL
// =========================

mapelSelect.addEventListener('change', () => {

    if (mapelSelect.value === 'Custom') {

        mapelCustom.style.display = 'block';
        mapelCustom.required = true;

    } else {

        mapelCustom.style.display = 'none';
        mapelCustom.required = false;
        mapelCustom.value = '';
    }
});


// =========================
// KLIK RAHASIA 5X PADA "NO"
// =========================

let clickCount = 0;
let firstClickTime = 0;

secretTitle.addEventListener('click', () => {

    const currentTime =
        new Date().getTime();

    if (clickCount === 0) {
        firstClickTime = currentTime;
    }

    if (currentTime - firstClickTime > 3000) {

        clickCount = 1;
        firstClickTime = currentTime;

    } else {

        clickCount++;
    }

    if (clickCount === 5) {

        clickCount = 0;

        const password =
            prompt("Masukkan Password Admin:");

        if (password === "404") {

            aktifkanModeAdmin();

        } else {

            alert("Password salah!");
        }
    }
});


// =========================
// AKTIFKAN MODE ADMIN
// =========================

function aktifkanModeAdmin() {

    isAdmin = true;

    document.getElementById('admin-form')
        .style.display = 'block';

    document.getElementById('admin-status')
        .style.display = 'block';

    document.querySelectorAll('.col-aksi')
        .forEach(el => {
            el.style.display = 'table-cell';
        });

    tampilkanTugas();
}


// =========================
// AMBIL DATA DARI SUPABASE
// =========================

async function dapatkanTugas() {

    const { data, error } =
        await supabaseClient
            .from('tugas')
            .select('*')
            .order('created_at', {
                ascending: false
            });

    if (error) {

        console.error(
            'Gagal mengambil tugas:',
            error
        );

        alert(
            'Gagal memuat data tugas.'
        );

        return [];
    }

    return data || [];
}


// =========================
// WARNA MAPEL
// =========================

function warnaMapel(mapel) {

    const nama =
        mapel.trim().toLowerCase();

    const warna = {

        'b. arab': 'mapel-arab',

        'b. indo': 'mapel-indo',

        'b. inggris': 'mapel-inggris',

        'biologi': 'mapel-biologi',

        'fisika': 'mapel-fisika',

        'kimia': 'mapel-kimia',

        'matlan': 'mapel-matlan',

        'matwa': 'mapel-matwa',

        'pai': 'mapel-pai',

        'ppkn': 'mapel-ppkn',

        'sejarah': 'mapel-sejarah',

        'tik': 'mapel-tik'
    };

    return warna[nama] || '';
}


// =========================
// TAMPILKAN DATA TUGAS
// =========================

async function tampilkanTugas() {

    const daftarTugas =
        await dapatkanTugas();

    tableBody.innerHTML = '';


    if (daftarTugas.length === 0) {

        const totalKolom =
            isAdmin ? 6 : 5;

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="${totalKolom}"
                    class="no-data"
                >
                    Belum ada agenda atau tugas kelas saat ini.
                </td>
            </tr>
        `;

        return;
    }


    daftarTugas.forEach(
        (item, index) => {

            const tr =
                document.createElement('tr');

            let isiBaris = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <span class="mapel-badge ${warnaMapel(item.mapel)}">
                        ${item.mapel}
                    </span>
                </td>

                <td>
                    ${item.tugas}
                </td>

                <td>
                    ${item.deadline}
                </td>

                <td>
                    ${item.keterangan || '-'}
                </td>
            `;


            if (isAdmin) {

                isiBaris += `

                    <td class="col-aksi">

                        <button
                            class="btn-edit"
                            onclick="editTugas(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-delete"
                            onclick="hapusTugas(${item.id})"
                        >
                            Hapus
                        </button>

                    </td>
                `;
            }


            tr.innerHTML =
                isiBaris;

            tableBody.appendChild(tr);
        }
    );


    document.querySelectorAll('.col-aksi')
        .forEach(el => {

            el.style.display =
                isAdmin
                    ? 'table-cell'
                    : 'none';
        });
}


// =========================
// TAMBAH TUGAS
// =========================

form.addEventListener(
    'submit',
    async function(e) {

        e.preventDefault();


        let mapel =
            document.getElementById('mapel').value;


        // Jika memilih Custom,
        // gunakan nama yang diketik
        if (mapel === 'Custom') {

            mapel =
                document.getElementById('mapel-custom').value.trim();

            if (!mapel) {

                alert(
                    'Silakan masukkan nama mata pelajaran.'
                );

                return;
            }
        }


        const tugas =
            document.getElementById('tugas').value;


        const deadline =
            document.getElementById('deadline').value;


        const keterangan =
            document.getElementById('keterangan').value;


        const { error } =
            await supabaseClient
                .from('tugas')
                .insert([
                    {
                        mapel: mapel,
                        tugas: tugas,
                        deadline: deadline,
                        keterangan: keterangan
                    }
                ]);


        if (error) {

            console.error(
                'Gagal menambahkan tugas:',
                error
            );

            alert(
                'Gagal menambahkan tugas.'
            );

            return;
        }


        await tampilkanTugas();


        form.reset();


        mapelCustom.style.display = 'none';
        mapelCustom.required = false;
        mapelCustom.value = '';
    }
);


// =========================
// HAPUS TUGAS
// =========================

window.hapusTugas =
    async function(id) {

        if (
            confirm(
                "Apakah Anda yakin ingin menghapus tugas ini?"
            )
        ) {

            const { error } =
                await supabaseClient
                    .from('tugas')
                    .delete()
                    .eq('id', id);


            if (error) {

                console.error(
                    'Gagal menghapus tugas:',
                    error
                );

                alert(
                    'Gagal menghapus tugas.'
                );

                return;
            }


            await tampilkanTugas();
        }
    };


// =========================
// EDIT TUGAS
// =========================

window.editTugas =
    async function(id) {

        const daftarTugas =
            await dapatkanTugas();


        const tugas =
            daftarTugas.find(
                item => item.id === id
            );


        if (!tugas) {

            alert(
                'Tugas tidak ditemukan.'
            );

            return;
        }


        const mapel =
            prompt(
                'Mata Pelajaran:',
                tugas.mapel
            );

        if (mapel === null) return;


        const namaTugas =
            prompt(
                'Nama Tugas / Agenda:',
                tugas.tugas
            );

        if (namaTugas === null) return;


        const deadline =
            prompt(
                'Deadline:',
                tugas.deadline
            );

        if (deadline === null) return;


        const keterangan =
            prompt(
                'Keterangan:',
                tugas.keterangan || ''
            );

        if (keterangan === null) return;


        const { error } =
            await supabaseClient
                .from('tugas')
                .update({
                    mapel: mapel,
                    tugas: namaTugas,
                    deadline: deadline,
                    keterangan: keterangan
                })
                .eq('id', id);


        if (error) {

            console.error(
                'Gagal mengedit tugas:',
                error
            );

            alert(
                'Gagal mengedit tugas.'
            );

            return;
        }


        await tampilkanTugas();
    };


// =========================
// JALANKAN SAAT HALAMAN DIBUKA
// =========================

tampilkanTugas();
