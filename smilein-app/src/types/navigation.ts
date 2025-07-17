import { ScheduleItem } from './schedule';
import { AttendanceStatus } from '../components/ScheduleCard';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  History: undefined
  Login: undefined
  Main: { updatedSchedule?: ScheduleItem } | undefined;
  Detail: { schedule: ScheduleItem, fromScreen: string };
  StatusPresence: {
    scheduleId: string;
    studentName: string;
    studentNIM: string;
    studentProgram: string;
    checkInTime: string;
    checkOutTime?: string; // Add this line
    status: AttendanceStatus;
    imageUrl: string;
    fromScreen: string;
    updatedSchedule?: ScheduleItem;
};
  ProfileSettings: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
  route: any; // This could be more strongly typed if needed
};
export type MainTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
};
