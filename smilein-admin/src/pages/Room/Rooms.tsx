import { useState, useEffect, useRef } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import * as roomApi from '../../api/roomApi';
import { Room, RoomCreate, RoomUpdate } from '../../types/room';
import Swal from 'sweetalert2';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    onConfirm,
    confirmText = "Simpan",
    cancelText = "Batal"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">{title}</h2>
                </div>

                <div className="px-6 py-4 dark:text-gray-200">{children}</div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoomList: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

    const createNameRef = useRef<HTMLInputElement>(null);
    const createLatitudeRef = useRef<HTMLInputElement>(null);
    const createLongitudeRef = useRef<HTMLInputElement>(null);
    const createRadiusRef = useRef<HTMLInputElement>(null);

    const updateNameRef = useRef<HTMLInputElement>(null);
    const updateLatitudeRef = useRef<HTMLInputElement>(null);
    const updateLongitudeRef = useRef<HTMLInputElement>(null);
    const updateRadiusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await roomApi.getRooms();
            setRooms(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            setError('Failed to load rooms. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (title: string, message: string, icon: 'success' | 'error' | 'warning'): void => {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            customClass: {
                container: 'font-sans'
            }
        });
    };

    const handleCreateClick = (): void => {
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = async (): Promise<void> => {
        const name = createNameRef.current?.value;
        const latitude = createLatitudeRef.current?.value;
        const longitude = createLongitudeRef.current?.value;
        const radius = createRadiusRef.current?.value;

        if (!name || !latitude || !longitude || !radius) {
            showAlert('Error', 'Semua field harus diisi', 'error');
            return;
        }

        try {
            const newRoom = await roomApi.createRoom({
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: parseFloat(radius)
            } as RoomCreate);

            setRooms([...rooms, newRoom]);
            setCreateModalOpen(false);
            showAlert('Berhasil!', 'Ruangan baru telah ditambahkan', 'success');
        } catch (err) {
            console.error('Failed to create room:', err);
            showAlert('Error!', 'Gagal menambahkan ruangan', 'error');
        }
    };

    const handleUpdateClick = (room: Room): void => {
        setCurrentRoom(room);
        setUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (): Promise<void> => {
        const name = updateNameRef.current?.value;
        const latitude = updateLatitudeRef.current?.value;
        const longitude = updateLongitudeRef.current?.value;
        const radius = updateRadiusRef.current?.value;

        if (!name || !latitude || !longitude || !radius || !currentRoom) {
            showAlert('Error', 'Semua field harus diisi', 'error');
            return;
        }

        try {
            const updatedRoom = await roomApi.updateRoom(
                currentRoom.room_id,
                {
                    name,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    radius: parseFloat(radius)
                } as RoomUpdate
            );

            setRooms(rooms.map(r =>
                r.room_id === currentRoom.room_id ? updatedRoom : r
            ));
            setUpdateModalOpen(false);
            showAlert('Berhasil!', 'Ruangan telah diperbarui', 'success');
        } catch (err) {
            console.error('Failed to update room:', err);
            showAlert('Error!', 'Gagal memperbarui ruangan', 'error');
        }
    };

    const handleDeleteClick = (room: Room): void => {
        setCurrentRoom(room);
        // Using SweetAlert for delete confirmation
        Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: 'Apakah anda yakin ingin menghapus ruangan ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteConfirm();
            }
        });
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!currentRoom) return;

        try {
            await roomApi.deleteRoom(currentRoom.room_id);
            setRooms(rooms.filter(r => r.room_id !== currentRoom.room_id));
            showAlert('Terhapus!', 'Ruangan telah dihapus.', 'success');
        } catch (err: any) {
            console.error('Failed to delete room:', err);

            // Check if the error is due to room being in use (has schedules or other dependencies)
            if (err.response && err.response.status === 400 &&
                err.response.data && err.response.data.detail &&
                err.response.data.detail.includes('cannot be deleted because it is currently in use')) {
                showAlert(
                    'Gagal Menghapus!',
                    'Ruangan ini tidak dapat dihapus karena sedang digunakan dalam jadwal kuliah.',
                    'error'
                );
            } else {
                showAlert('Error!', 'Gagal menghapus ruangan.', 'error');
            }
        }
    };

    const roomColumns: Column[] = [
        {
            header: 'ID Ruangan',
            accessor: 'room_id',
            minWidth: '100px',
        },
        {
            header: 'Nama Ruangan',
            accessor: 'name',
            minWidth: '200px',
        },
        {
            header: 'Koordinat',
            accessor: 'coordinates',
            minWidth: '200px',
            cell: (item: Room) => (
                <span>
                    {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </span>
            ),
        },
        {
            header: 'Radius (m)',
            accessor: 'radius',
            minWidth: '100px',
            cell: (item: Room) => (
                <span>{item.radius} m</span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Daftar Ruangan</h2>
                <button
                    onClick={handleCreateClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700"

                >
                    Tambah Ruangan
                </button>
            </div>

            <DynamicTable
                columns={roomColumns}
                data={rooms}
                className="shadow-sm"
                searchable
                filterable
                searchFields={['name']}
                renderActions={(room: Room) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleUpdateClick(room)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteClick(room)}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                        >
                            Hapus
                        </button>
                    </div>
                )}
            />

            {/* Create Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Tambah Ruangan Baru"
                onConfirm={handleCreateSubmit}
            >
                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Ruangan</label>
                        <input
                            ref={createNameRef}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Masukkan nama ruangan"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                        <input
                            ref={createLatitudeRef}
                            type="number"
                            step="0.000001"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Contoh: -6.175540"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                        <input
                            ref={createLongitudeRef}
                            type="number"
                            step="0.000001"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Contoh: 106.827194"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Radius (meter)</label>
                        <input
                            ref={createRadiusRef}
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Contoh: 50"
                            required
                        />
                    </div>
                </div>
            </Modal>

            {/* Update Modal */}
            <Modal
                isOpen={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                title="Edit Ruangan"
                onConfirm={handleUpdateSubmit}
            >
                {currentRoom && (
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Ruangan</label>
                            <input
                                ref={updateNameRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentRoom.name}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                            <input
                                ref={updateLatitudeRef}
                                type="number"
                                step="0.000001"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentRoom.latitude}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                            <input
                                ref={updateLongitudeRef}
                                type="number"
                                step="0.000001"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentRoom.longitude}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Radius (meter)</label>
                            <input
                                ref={updateRadiusRef}
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentRoom.radius}
                                required
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RoomList;