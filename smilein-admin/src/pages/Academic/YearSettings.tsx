import { useState } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import Swal from 'sweetalert2';

interface AcademicYear {
    id: number;
    yearId: string;
    year: string;
    semester: 'Ganjil' | 'Genap';
    isActive: boolean;
    createdAt: string;
}

const YearSettings = () => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
        {
            id: 1,
            yearId: 'TA-2024-1',
            year: '2024/2025',
            semester: 'Ganjil',
            isActive: true,
            createdAt: '2024-01-01'
        },
        {
            id: 2,
            yearId: 'TA-2024-2',
            year: '2024/2025',
            semester: 'Genap',
            isActive: false,
            createdAt: '2024-01-01'
        },
        {
            id: 3,
            yearId: 'TA-2023-2',
            year: '2023/2024',
            semester: 'Genap',
            isActive: false,
            createdAt: '2023-07-01'
        },
    ]);

    const handleAddYear = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Tahun Akademik',
            html: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                        <input id="year" class="swal2-input" placeholder="2024/2025">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select id="semester" class="swal2-select">
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Tambah',
            confirmButtonColor:'#000',
            cancelButtonText: 'Batal',
            cancelButtonColor: '#000',
            preConfirm: () => {
                const year = (document.getElementById('year') as HTMLInputElement).value;
                const semester = (document.getElementById('semester') as HTMLSelectElement).value;
                if (!year) {
                    Swal.showValidationMessage('Tahun harus diisi');
                    return false;
                }
                return { year, semester };
            }
        });

        if (formValues) {
            const newYear: AcademicYear = {
                id: academicYears.length + 1,
                yearId: `TA-${formValues.year.split('/')[0]}-${formValues.semester === 'Ganjil' ? '1' : '2'}`,
                year: formValues.year,
                semester: formValues.semester as 'Ganjil' | 'Genap',
                isActive: false,
                createdAt: new Date().toISOString()
            };

            setAcademicYears(prev => [...prev, newYear]);
            await Swal.fire('Berhasil!', 'Tahun akademik baru telah ditambahkan.', 'success');
        }
    };

    const handleDelete = async (year: AcademicYear) => {
        const result = await Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: "Apakah anda yakin ingin menghapus tahun akademik ini?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setAcademicYears((prevYears) =>
                prevYears.filter((y) => y.id !== year.id)
            );
            await Swal.fire({
                title: 'Terhapus!',
                text: 'Tahun akademik telah dihapus.',
                icon: 'success',
                confirmButtonColor: '#4CAF50'
            });
        }
    };

    const handleEdit = async (year: AcademicYear) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Tahun Akademik',
            html: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                        <input id="year" class="swal2-input" value="${year.year}" placeholder="2024/2025">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select id="semester" class="swal2-select">
                            <option value="Ganjil" ${year.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
                            <option value="Genap" ${year.semester === 'Genap' ? 'selected' : ''}>Genap</option>
                        </select>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const year = (document.getElementById('year') as HTMLInputElement).value;
                const semester = (document.getElementById('semester') as HTMLSelectElement).value;
                if (!year) {
                    Swal.showValidationMessage('Tahun harus diisi');
                    return false;
                }
                return { year, semester };
            }
        });

        if (formValues) {
            setAcademicYears(prevYears =>
                prevYears.map(y => {
                    if (y.id === year.id) {
                        return {
                            ...y,
                            year: formValues.year,
                            semester: formValues.semester as 'Ganjil' | 'Genap',
                            yearId: `TA-${formValues.year.split('/')[0]}-${formValues.semester === 'Ganjil' ? '1' : '2'}`
                        };
                    }
                    return y;
                })
            );
            await Swal.fire('Berhasil!', 'Tahun akademik telah diperbarui.', 'success');
        }
    };

    const handleToggleActive = async (year: AcademicYear) => {
        const action = year.isActive ? 'nonaktifkan' : 'aktifkan';
        const result = await Swal.fire({
            title: `Konfirmasi ${action}`,
            text: `Apakah anda yakin ingin ${action} tahun akademik ini?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: year.isActive ? '#d33' : '#4CAF50',
            cancelButtonColor: '#3085d6',
            confirmButtonText: year.isActive ? 'Nonaktifkan' : 'Aktifkan',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setAcademicYears(prevYears =>
                prevYears.map(y => {
                    if (y.id === year.id) {
                        return { ...y, isActive: !y.isActive };
                    }
                    return y;
                })
            );
            await Swal.fire({
                title: 'Berhasil!',
                text: `Tahun akademik telah di${action}.`,
                icon: 'success',
                confirmButtonColor: '#4CAF50'
            });
        }
    };

    const academicYearColumns: Column[] = [
        {
            header: 'ID Tahun Akademik',
            accessor: 'yearId',
            minWidth: '150px',
        },
        {
            header: 'Tahun',
            accessor: 'year',
            minWidth: '120px',
        },
        {
            header: 'Semester',
            accessor: 'semester',
            minWidth: '120px',
        },
        {
            header: 'Status Aktif',
            accessor: 'isActive',
            minWidth: '120px',
            cell: (item: AcademicYear) => (
                <span className={`px-3 py-1 rounded-full text-sm ${item.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {item.isActive ? 'Ya' : 'Tidak'}
                </span>
            ),
        },
        {
            header: 'Tanggal Dibuat',
            accessor: 'createdAt',
            minWidth: '150px',
            cell: (item: AcademicYear) => (
                <span>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-8 p-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Pengaturan Tahun Akademik</h2>
                    <button
                        onClick={handleAddYear}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                    >
                        Tambah Tahun Akademik
                    </button>
                </div>
                <DynamicTable
                    columns={academicYearColumns}
                    data={academicYears}
                    className="shadow-sm"
                    searchable={true}
                    filterable={true}
                    searchFields={['year']}
                    renderActions={(year: AcademicYear) => (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleToggleActive(year)}
                                className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${year.isActive
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                {year.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                                onClick={() => handleEdit(year)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(year)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Hapus
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default YearSettings;