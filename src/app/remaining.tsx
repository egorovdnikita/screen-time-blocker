import { useLocalSearchParams } from 'expo-router';
import { RemainingScreen } from '@/screens/previews/RemainingScreen';
export default function RemainingRoute(){ const {id}=useLocalSearchParams<{id?:string}>();return <RemainingScreen key={id??'catalog'} id={id?Number(id):undefined}/>; }
