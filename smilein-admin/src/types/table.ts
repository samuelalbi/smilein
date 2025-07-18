export interface Column {
  header: string;
  accessor: string;
  minWidth?: string;
  cell?: (item: any) => React.ReactNode;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  className?: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}