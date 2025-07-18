import { useState } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ReactDOM from 'react-dom';

interface Course {
    id: number;
    code: string;
    name: string;
    credits: number;
    semester: number;
}

interface Major {
    id: number;
    majorId: string;
    name: string;
    createdAt: string;
    courses: Course[];
    activeStudents: number;
    statistics: {
        yearlyStudents: { year: string; count: number; }[];
        graduationRate: number;
        averageGPA: number;
    };
}

const MajorSettings = () => {
    const [majors, setMajors] = useState<Major[]>([
        {
            id: 1,
            majorId: 'TI-001',
            name: 'Teknik Informatika',
            createdAt: '2024-01-01',
            courses: [
                { id: 1, code: 'TI101', name: 'Algoritma dan Pemrograman', credits: 3, semester: 1 },
                { id: 2, code: 'TI102', name: 'Basis Data', credits: 3, semester: 2 },
                { id: 3, code: 'TI103', name: 'Pemrograman Web', credits: 3, semester: 3 }
            ],
            activeStudents: 250,
            statistics: {
                yearlyStudents: [
                    { year: '2020', count: 200 },
                    { year: '2021', count: 220 },
                    { year: '2022', count: 235 },
                    { year: '2023', count: 250 }
                ],
                graduationRate: 85.5,
                averageGPA: 3.45
            }
        },
        {
            id: 2,
            majorId: 'SI-001',
            name: 'Sistem Informasi',
            createdAt: '2024-01-01',
            courses: [
                { id: 1, code: 'SI101', name: 'Analisis Sistem', credits: 3, semester: 1 },
                { id: 2, code: 'SI102', name: 'Manajemen Basis Data', credits: 3, semester: 2 }
            ],
            activeStudents: 180,
            statistics: {
                yearlyStudents: [
                    { year: '2020', count: 150 },
                    { year: '2021', count: 165 },
                    { year: '2022', count: 175 },
                    { year: '2023', count: 180 }
                ],
                graduationRate: 88.2,
                averageGPA: 3.52
            }
        }
    ]);

    const handleAddMajor = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Program Studi',
            html: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ID Program Studi</label>
                        <input id="majorId" class="swal2-input" placeholder="TI-001">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Program Studi</label>
                        <input id="name" class="swal2-input" placeholder="Teknik Informatika">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Tambah',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const majorId = (document.getElementById('majorId') as HTMLInputElement).value;
                const name = (document.getElementById('name') as HTMLInputElement).value;
                if (!majorId || !name) {
                    Swal.showValidationMessage('Semua field harus diisi');
                    return false;
                }
                return { majorId, name };
            }
        });

        if (formValues) {
            const newMajor: Major = {
                id: majors.length + 1,
                majorId: formValues.majorId,
                name: formValues.name,
                createdAt: new Date().toISOString(),
                courses: [],
                activeStudents: 0,
                statistics: {
                    yearlyStudents: [
                        { year: '2023', count: 0 },
                    ],
                    graduationRate: 0,
                    averageGPA: 0
                }
            };

            setMajors(prev => [...prev, newMajor]);
            await Swal.fire('Berhasil!', 'Program studi baru telah ditambahkan.', 'success');
        }
    };

    const handleEdit = async (major: Major) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Program Studi',
            html: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ID Program Studi</label>
                        <input id="majorId" class="swal2-input" value="${major.majorId}" placeholder="TI-001">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Program Studi</label>
                        <input id="name" class="swal2-input" value="${major.name}" placeholder="Teknik Informatika">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const majorId = (document.getElementById('majorId') as HTMLInputElement).value;
                const name = (document.getElementById('name') as HTMLInputElement).value;
                if (!majorId || !name) {
                    Swal.showValidationMessage('Semua field harus diisi');
                    return false;
                }
                return { majorId, name };
            }
        });

        if (formValues) {
            setMajors(prevMajors =>
                prevMajors.map(m => {
                    if (m.id === major.id) {
                        return { ...m, majorId: formValues.majorId, name: formValues.name };
                    }
                    return m;
                })
            );
            await Swal.fire('Berhasil!', 'Program studi telah diperbarui.', 'success');
        }
    };

    const handleDelete = async (major: Major) => {
        const result = await Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: "Apakah anda yakin ingin menghapus program studi ini?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setMajors((prevMajors) => prevMajors.filter((m) => m.id !== major.id));
            await Swal.fire({
                title: 'Terhapus!',
                text: 'Program studi telah dihapus.',
                icon: 'success',
                confirmButtonColor: '#4CAF50'
            });
        }
    };

    const showDetails = async (major: Major) => {
        await Swal.fire({
            title: `Detail Program Studi - ${major.name}`,
            html: `
                <div class="space-y-6 text-left">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Statistik Program Studi</h3>
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <div class="text-sm text-blue-600">Mahasiswa Aktif</div>
                                <div class="text-xl font-bold">${major.activeStudents}</div>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <div class="text-sm text-green-600">Tingkat Kelulusan</div>
                                <div class="text-xl font-bold">${major.statistics.graduationRate}%</div>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <div class="text-sm text-purple-600">IPK Rata-rata</div>
                                <div class="text-xl font-bold">${major.statistics.averageGPA}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Daftar Mata Kuliah</h3>
                        <div class="max-h-60 overflow-y-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKS</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${major.courses.map(course => `
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.code}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.name}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.credits}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${course.semester}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Tren Mahasiswa per Tahun</h3>
                        <div class="w-full" style="height: 300px;">
                            <div id="studentTrendChart"></div>
                        </div>
                    </div>
                </div>
            `,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false,
            didRender: () => {
                const chartContainer = document.getElementById('studentTrendChart');
                if (chartContainer) {
                    const ChartComponent = () => (
                        <LineChart width={700} height={300} data={major.statistics.yearlyStudents}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                name="Jumlah Mahasiswa"
                                stroke="#8884d8" 
                                activeDot={{ r: 8 }} 
                            />
                        </LineChart>
                    );
    
                    // Render the chart using ReactDOM
                    ReactDOM.render(<ChartComponent />, chartContainer);
                }
            },
            willClose: () => {
                // Clean up React component when modal closes
                const chartContainer = document.getElementById('studentTrendChart');
                if (chartContainer) {
                    ReactDOM.unmountComponentAtNode(chartContainer);
                }
            }
        });
    };

    const majorColumns: Column[] = [
        {
            header: 'ID Program Studi',
            accessor: 'majorId',
            minWidth: '150px',
        },
        {
            header: 'Nama Program Studi',
            accessor: 'name',
            minWidth: '200px',
        },
        {
            header: 'Tanggal Dibuat',
            accessor: 'createdAt',
            minWidth: '150px',
            cell: (item: Major) => (
                <span>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            ),
        }
    ];

    return (
        <div className="space-y-8 p-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Pengaturan Program Studi</h2>
                    <button
                        onClick={handleAddMajor}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                    >
                        Tambah Program Studi
                    </button>
                </div>
                <DynamicTable
                    columns={majorColumns}
                    data={majors}
                    className="shadow-sm"
                    searchable={true}
                    searchFields={['name']}
                    renderActions={(major: Major) => (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => showDetails(major)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Detail
                            </button>
                            <button
                                onClick={() => handleEdit(major)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(major)}
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

export default MajorSettings;