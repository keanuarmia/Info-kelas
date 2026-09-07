// =========================
// PENGATURAN SUPABASE
// =========================

const SUPABASE_URL =
    'https://ofikhymoplfgahogmeml.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_j0DKnHBNpb6HCHW7aal3oA_KaLCTTwZ';

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// TUNGGU HTML SELESAI DIMUAT
// =========================

document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // ELEMENT HTML
    // =========================

    const todoForm =
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
    // CEK ELEMENT HTML
    // =========================

    if (!todoForm) {
        console.error('Element #todo-form tidak ditemukan.');
        return;
    }

    if (!tableBody) {
        console.error('Element #table-body tidak ditemukan.');
        return;
    }


    // =========================
    // CUSTOM MAPEL
    // =========================

    if (mapelSelect && mapelCustom) {

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
    }


    // =========================
    // KLIK RAHASIA 5X PADA "NO"
    // =========================

    let clickCount = 0;
    let firstClickTime = 0;

    if (secretTitle) {

        secretTitle.addEventListener('click', () => {

            const currentTime =
                new Date().getTime();


            if (clickCount === 0) {
                firstClickTime = currentTime;
            }


            if (
                currentTime - firstClickTime > 3000
            ) {

                clickCount = 1;
                firstClickTime = currentTime;

            } else {

                clickCount++;
            }


            if (clickCount === 5) {

                clickCount = 0;

                const password =
                    prompt('Masukkan Password Admin:');


                if (password === '404') {

                    aktifkanModeAdmin();

                } else {

                    alert('Password salah!');
                }
            }
        });
    }


    // =========================
    // AKTIFKAN MODE ADMIN
    // =========================

    function aktifkanModeAdmin() {

        isAdmin = true;


        const adminForm =
            document.getElementById('admin-form');

        const adminStatus =
            document.getElementById('admin-status');


        if (adminForm) {
            adminForm.style.display = 'block';
        }


        if (adminStatus) {
            adminStatus.style.display = 'block';
        }


        document.querySelectorAll('.col-aksi')
            .forEach(el => {
                el.style.display = 'table-cell';
            });


        tampilkanTugas();
        tampilkanHistory();
    }

    // =========================
// TAMPILKAN HISTORY
// =========================

async function tampilkanHistory() {

    const historySection =
        document.getElementById('history-section');

    const historyBody =
        document.getElementById('history-body');

    if (!historySection || !historyBody) {
        return;
    }

    historySection.style.display = 'block';

    const { data, error } =
        await supabaseClient
            .from('history')
            .select('*')
            .order('created_at', {
                ascending: false
            });

    if (error) {

        console.error(
            'Gagal mengambil history:',
            error
        );

        historyBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Gagal memuat history.
                </td>
            </tr>
        `;

        return;
    }

    historyBody.innerHTML = '';

    if (!data || data.length === 0) {

        historyBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Belum ada aktivitas.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((item, index) => {

        const tr =
            document.createElement('tr');

        tr.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${item.aktivitas}
            </td>

            <td>
                ${item.mapel || '-'}
            </td>

            <td>
                ${item.tugas || '-'}
            </td>

            <td>
                ${item.deadline || '-'}
            </td>
            
            <td>
                ${item.keterangan || '-'}
            </td>
            
            <td>
                ${new Date(item.created_at)
                    .toLocaleString('id-ID')}
            </td>

            <td>

                <button
                    class="btn-delete"
                    onclick="hapusHistory(${item.id})"
                >
                    Hapus
                </button>

            </td>
        `;

        historyBody.appendChild(tr);
    });
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

            alert('Gagal memuat data tugas.');

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

todoForm.addEventListener(
    'submit',
    async function(e) {

        e.preventDefault();


        let mapel =
            mapelSelect.value;


        // Jika memilih Custom
        if (mapel === 'Custom') {

            mapel =
                mapelCustom.value.trim();


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


        // =========================
        // SIMPAN TUGAS
        // =========================

        const { data, error } =
            await supabaseClient
                .from('tugas')
                .insert([
                    {
                        mapel: mapel,
                        tugas: tugas,
                        deadline: deadline,
                        keterangan: keterangan
                    }
                ])
                .select();


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


        // =========================
        // SIMPAN HISTORY
        // =========================

        const { error: historyError } =
            await supabaseClient
                .from('history')
                .insert([
                    {
                        aktivitas: 'Tambah',
                        mapel: mapel,
                        tugas: tugas,
                        deadline: deadline,
                        keterangan: keterangan
                    }
                ]);


        if (historyError) {

            console.error(
                'Gagal menyimpan history:',
                historyError
            );
        }


        // =========================
        // PERBARUI TABEL
        // =========================

        await tampilkanTugas();
        await tampilkanHistory();

        // =========================
        // RESET FORM
        // =========================

        todoForm.reset();


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
            !confirm(
                'Apakah Anda yakin ingin menghapus tugas ini?'
            )
        ) {
            return;
        }

        // =========================
        // CARI DATA TUGAS
        // =========================

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

        // =========================
        // HAPUS TUGAS
        // =========================

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

        // =========================
        // SIMPAN HISTORY
        // =========================

        const { error: historyError } =
            await supabaseClient
                .from('history')
                .insert([
                    {
                        aktivitas: 'Hapus',
                        mapel: tugas.mapel,
                        tugas: tugas.tugas,
                        deadline: tugas.deadline,
                        keterangan: tugas.keterangan
                    }
                ]);

        if (historyError) {

            console.error(
                'Gagal menyimpan history:',
                historyError
            );
        }

        // =========================
        // PERBARUI TABEL
        // =========================

        await tampilkanTugas();
        await tampilkanHistory();
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

        // =========================
        // UPDATE TUGAS
        // =========================

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

        // =========================
        // SIMPAN HISTORY
        // =========================

        const { error: historyError } =
            await supabaseClient
                .from('history')
                .insert([
                    {
                        aktivitas: 'Edit',
                        mapel: mapel,
                        tugas: namaTugas,
                        keterangan: keterangan
                    }
                ]);

        if (historyError) {

            console.error(
                'Gagal menyimpan history:',
                historyError
            );
        }

        // =========================
        // PERBARUI TABEL
        // =========================

        await tampilkanTugas();

        await tampilkanHistory();
    };


    // =========================
    // JALANKAN SAAT HALAMAN DIBUKA
    // =========================

    tampilkanTugas();

});
